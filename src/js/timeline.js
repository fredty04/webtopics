import * as d3 from 'd3';
import { gsap } from 'gsap';
import { updateMap } from './map.js';

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function initTimeline() {
    const query = `
        SELECT DISTINCT ?battle ?battleLabel (STR(?startDate) AS ?formattedStartDate) (STR(?endDate) AS ?formattedEndDate) WHERE {
            ?battle wdt:P31/wdt:P279* wd:Q178561;  
                   wdt:P361 wd:Q362;               
                   wdt:P585 ?startDate;           
                   wdt:P580 ?endDate;             
                   wdt:P625 ?coord.                
            OPTIONAL { ?battle schema:description ?description FILTER(LANG(?description) = "en"). }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            FILTER(?startDate >= "1939-08-01T00:00:00Z"^^xsd:dateTime && ?endDate <= "1945-12-31T23:59:59Z"^^xsd:dateTime)
        }
        ORDER BY ?startDate
    `;

    const encodedQuery = encodeURIComponent(query);
    const url = `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const timelineData = data.results.bindings.map(battle => ({
                startDate: new Date(battle.formattedStartDate.value),
                endDate: new Date(battle.formattedEndDate.value),
                event: battle.battleLabel.value
            }));

            const margin = {top: 20, right: 20, bottom: 30, left: 20};
            const width = document.getElementById('timeline').clientWidth - margin.left - margin.right;
            const height = 80 - margin.top - margin.bottom;

            const svg = d3.select("#timeline")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain([new Date(1939, 7, 1), new Date(1945, 11, 31)])
                .range([0, width]);

            const xAxis = d3.axisBottom(x)
                .ticks(d3.timeYear.every(1))
                .tickFormat(d3.timeFormat("%Y"));

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "middle")
                .attr("dy", "1em");

            const sliderGroup = svg.append("g")
                .attr("class", "slider")
                .attr("transform", `translate(0,${height / 2})`);

            sliderGroup.append("line")
                .attr("class", "track")
                .attr("x1", x.range()[0])
                .attr("x2", x.range()[1])
                .attr("stroke-width", 8)
                .attr("stroke-linecap", "round");

            const handle = sliderGroup.insert("circle", ".track-overlay")
                .attr("class", "handle")
                .attr("r", 8)
                .attr("cx", x(new Date(1939, 7, 1)))
                .attr("cursor", "pointer");

            const label = sliderGroup.append("text")
                .attr("class", "label")
                .attr("text-anchor", "middle")
                .attr("y", -15)
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .attr("x", x(new Date(1939, 7, 1)))
                .text(new Date(1939, 7, 1).toDateString());

            const debouncedUpdateMap = debounce(updateMap, 100);

            function updateSlider(date) {
                const xPos = Math.max(0, Math.min(width, x(date)));
                handle.attr("cx", xPos);
                label.attr("x", xPos).text(date.toDateString());
                debouncedUpdateMap(date);
            }

            const drag = d3.drag()
                .on("start.interrupt", () => sliderGroup.interrupt())
                .on("start drag", (event) => {
                    const xPos = Math.max(0, Math.min(width, event.x));
                    const date = x.invert(xPos);
                    updateSlider(date);
                });

            sliderGroup.call(drag);

            let isPlaying = false;
            let interval;

            function togglePlay() {
                if (isPlaying) {
                    clearInterval(interval);
                    d3.select("#playButton").text("Play");
                    isPlaying = false;
                    return;
                }

                interval = setInterval(() => {
                    const currentDate = x.invert(parseFloat(handle.attr("cx")));
                    const newDate = new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000);
                    if (newDate > x.domain()[1]) {
                        clearInterval(interval);
                        d3.select("#playButton").text("Play");
                        isPlaying = false;
                    } else {
                        updateSlider(newDate);
                    }
                }, 500);

                d3.select("#playButton").text("Pause");
                isPlaying = true;
            }

            d3.select("#timeline")
              .append("button")
              .attr("id", "playButton")
              .text("Play")
              .on("click", togglePlay);

            updateMap(new Date(1939, 7, 1));
        })
        .catch(error => console.error('Error laden battles data from Wikidata:', error));
}
