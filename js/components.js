// Web Components for reusable UI elements

// Navbar Component
class BarnehageNavbar extends HTMLElement {
    connectedCallback() {
        const activePage = this.getAttribute('active') || 'hjem';
        this.innerHTML = `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="index.html" class="navbar-brand">Nesttun Indremisjons Barnehage</a>
                    <button class="navbar-toggle" onclick="toggleMenu()">☰</button>
                    <ul class="navbar-menu" id="navMenu">
                        <li><a href="index.html" class="${activePage === 'hjem' ? 'active' : ''}">Hjem</a></li>
                        <li><a href="sok-barnehageplass.html" class="${activePage === 'sok' ? 'active' : ''}">Søk Barnehageplass</a></li>
                        <li><a href="om-oss.html" class="${activePage === 'om' ? 'active' : ''}">Om oss</a></li>
                    </ul>
                </div>
            </nav>
        `;
    }
}

// Footer Component
class BarnehageFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer">
                <p>&copy; 2026 Copyright Nesttun Indremisjon</p>
            </footer>
        `;
    }
}

// Info Box Component
class InfoBox extends HTMLElement {
    connectedCallback() {
        const icon = this.getAttribute('icon') || '📍';
        const title = this.getAttribute('title') || '';
        const content = this.innerHTML;

        this.innerHTML = `
            <div class="info-box">
                <h3>${icon} ${title}</h3>
                ${content}
            </div>
        `;
    }
}

// Card Component
class BarnehageCard extends HTMLElement {
    connectedCallback() {
        const icon = this.getAttribute('icon') || '';
        const title = this.getAttribute('title') || '';
        const content = this.innerHTML;

        this.innerHTML = `
            <div class="card fade-in">
                ${icon ? `<div class="card-icon">${icon}</div>` : ''}
                ${title ? `<h3>${title}</h3>` : ''}
                ${content}
            </div>
        `;
    }
}

// Section Header Component
class SectionHeader extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || '';
        const subtitle = this.getAttribute('subtitle') || '';
        const centered = this.hasAttribute('center');

        this.innerHTML = `
            <div class="${centered ? 'section-center' : ''}">
                ${title ? `<h2>${title}</h2>` : ''}
                <div class="divider"></div>
                ${subtitle ? `<p style="max-width: 700px; margin: 1rem auto;">${subtitle}</p>` : ''}
            </div>
        `;
    }
}

// Image Box Component
class ImageBox extends HTMLElement {
    connectedCallback() {
        const src = this.getAttribute('src') || '';
        const alt = this.getAttribute('alt') || '';

        this.innerHTML = `
            <div class="image-box">
                <img src="${src}" alt="${alt}">
            </div>
        `;
    }
}

// Register components
customElements.define('barnehage-navbar', BarnehageNavbar);
customElements.define('barnehage-footer', BarnehageFooter);
customElements.define('info-box', InfoBox);
customElements.define('barnehage-card', BarnehageCard);
customElements.define('section-header', SectionHeader);
customElements.define('image-box', ImageBox);
