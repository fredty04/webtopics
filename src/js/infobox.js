class InfoSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const title = this.getAttribute('title');
        const imageUrl = this.getAttribute('image');
        const imageAlt = this.getAttribute('imageAlt');
        const align = this.getAttribute('align') || 'left';
        const content = this.innerHTML;

        this.shadowRoot.innerHTML = `
            <section>
                ${imageUrl ? `<img src="${imageUrl}" alt="${imageAlt}" loading="lazy">` : ''}
                <h2>${title}</h2>
                <div>${content}</div>
            </section>
        `;
    }
}

// Register the custom element
customElements.define('info-section', InfoSection);
