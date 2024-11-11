import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import {Circle as CircleStyle, RegularShape, Fill, Stroke, Style} from 'ol/style';

const COLORS = {
    notStarted: 'gray',
    ongoing: 'red',
    ended: 'blue'
};

let map, vectorSource, vectorLayer;
let tooltip;

function getBattleType(typeLabel) {
    if (!typeLabel) return 'unknown';
    const label = typeLabel.toLowerCase();
    //console.log("Processing typeLabel:", label);
    if (label.includes('siege')) {
        return 'siege';
    }
    if (label.includes('battle')) {
        if (label.includes('air')) return 'air battle';
        if (label.includes('naval') || label.includes('sea')) return 'naval battle';
        return 'battle';
    }
    if (label.includes('conflict')) return 'conflict';
    return 'unknown';
}

export function initMap() {
    vectorSource = new VectorSource();
    vectorLayer = new VectorLayer({
        source: vectorSource
    });

    map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
                source: new OSM()
            }),
            vectorLayer
        ],
        view: new View({
            center: fromLonLat([0, 0]),
            zoom: 2
        })
    });

    tooltip = document.createElement('tooltip-component');
    document.body.appendChild(tooltip);

    map.on('pointermove', function(evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });

        if (feature) {
            const name = feature.get('name');
            const description = feature.get('description');
            const startDate = feature.get('endDate');
            const endDate = feature.get('startDate');

            const content = `
                <h3>${name}</h3>
                <p>${description}</p>
                <p><strong>Start:</strong> ${new Date(startDate).toLocaleDateString()}</p>
                <p><strong>Einde:</strong> ${new Date(endDate).toLocaleDateString()}</p>
            `;
            
            const tooltipX = window.innerWidth - 500;
            const tooltipY = 700;

            tooltip.show(content, tooltipX, tooltipY);
        } else {
            tooltip.hide();
        }
    });
}

export function updateMap(selectedDate) {
    vectorSource.clear();
    
    const query = `
        SELECT DISTINCT ?battle ?battleLabel ?type ?typeLabel (STR(?startDate) AS ?formattedStartDate) (STR(?endDate) AS ?formattedEndDate) ?description ?coord WHERE {
            ?battle wdt:P31/wdt:P279* wd:Q178561;  # Instance of battle or subclass
                   wdt:P361 wd:Q362;               # Part of World War II
                   wdt:P585 ?startDate;            # Start date
                   wdt:P580 ?endDate;              # End date
                   wdt:P625 ?coord.                # Coordinate location
            OPTIONAL { ?battle wdt:P31 ?type. }
            OPTIONAL { ?battle schema:description ?description FILTER(LANG(?description) = "en"). }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            FILTER(?startDate >= "1938-01-01T00:00:00Z"^^xsd:dateTime)
        }
        ORDER BY ?startDate
    `;

    const encodedQuery = encodeURIComponent(query);
    const url = `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const battles = data.results.bindings;

            console.log(`Total battles found: ${battles.length}`);
            console.log(`Selected Date: ${selectedDate}`);

            battles.forEach(battle => {
                const battleStartDate = new Date(battle.formattedStartDate.value);
                const battleEndDate = new Date(battle.formattedEndDate.value);

                let status;
                if (selectedDate < battleStartDate) {
                    status = 'not-started';
                } else if (selectedDate >= battleStartDate && selectedDate <= battleEndDate) {
                    status = 'ongoing';
                } else {
                    status = 'ended';
                }

                const coords = battle.coord.value.replace('Point(', '').replace(')', '').split(' ');
                const longitude = parseFloat(coords[0]);
                const latitude = parseFloat(coords[1]);

                if (!isNaN(longitude) && !isNaN(latitude)) {
                    const feature = new Feature({
                        geometry: new Point(fromLonLat([longitude, latitude])),
                        name: battle.battleLabel.value,
                        description: battle.description ? battle.description.value : "No description available",
                        startDate: battle.formattedStartDate.value,
                        endDate: battle.formattedEndDate.value,
                        status: status,
                        typeLabel: battle.typeLabel ? battle.typeLabel.value : null
                    });
                    vectorSource.addFeature(feature);
                } else {
                    console.warn(`Invalid coordinates for battle: ${battle.battleLabel.value}`);
                }
            });

            vectorLayer.setStyle(function(feature) {
                const status = feature.get('status');
                const typeLabel = feature.get('typeLabel');
                const battleType = getBattleType(typeLabel);
                
                let color;
                switch(status) {
                    case 'not-started': color = COLORS.notStarted; break;
                    case 'ongoing': color = COLORS.ongoing; break;
                    case 'ended': color = COLORS.ended; break;
                }

                let shapeStyle;
                switch(battleType) {
                    case 'battle':
                        shapeStyle = new CircleStyle({
                            radius: 6,
                            fill: new Fill({color}),
                            stroke: new Stroke({color: 'white', width: 2})
                        });
                        break;
                    case 'siege':
                        shapeStyle = new RegularShape({
                            points: 3,
                            radius: 8,
                            fill: new Fill({color}),
                            stroke: new Stroke({color: 'white', width: 2}),
                            rotation: Math.PI / 4
                        });
                        break;
                    case 'air battle':
                        shapeStyle = new RegularShape({
                            points: 5,
                            radius: 8,
                            radius2: 4,
                            fill: new Fill({color}),
                            stroke: new Stroke({color: 'white', width: 2})
                        });
                        break;
                    case 'naval battle':
                        shapeStyle = new RegularShape({
                            points: 6,
                            radius: 8,
                            fill: new Fill({color}),
                            stroke:new Stroke({color:'white',width :2})
                        });
                        break;
                    default:
                        shapeStyle = new RegularShape({
                            points : 4, 
                            radius : 6,
                            angle : Math.PI / 4, 
                            fill : new Fill({color}),
                            stroke:new Stroke({color:'white',width :2})
                        });
                }
                
                return new Style({image : shapeStyle});
            });

            console.log(`Features added to map: ${vectorSource.getFeatures().length}`);
        })
        .catch(error => console.error('Error loading battles data from Wikidata:', error));
}
