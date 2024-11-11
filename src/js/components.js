class TooltipComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.setAttribute('class', 'tooltip');
        this.tooltipElement.style.position = 'absolute';
        this.tooltipElement.style.display = 'none';
        this.tooltipElement.style.backgroundColor = '#d4dbad';
        this.tooltipElement.style.color = 'white';
        this.tooltipElement.style.borderRadius = '5px';
        this.tooltipElement.style.padding = '10px';
        this.tooltipElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        this.tooltipElement.style.zIndex = '1000';
  
        const style = document.createElement('style');
        style.textContent = `
            .tooltip {
                transition: opacity 0.2s ease;
            }
        `;
        
        this.shadowRoot.append(style, this.tooltipElement);
    }
  
    show(content, x, y) {
        this.tooltipElement.innerHTML = content;
        this.tooltipElement.style.left = `${x}px`;
        this.tooltipElement.style.top = `${y}px`;
        this.tooltipElement.style.display = 'block';
    }
  
    hide() {
        this.tooltipElement.style.display = 'none';
    }
  }
  
  customElements.define('tooltip-component', TooltipComponent);
  