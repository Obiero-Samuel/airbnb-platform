// Properties page specific functionality
const propertiesModule = {
    // Initialize properties page
    init: function () {
        this.setupFilters();
        this.loadProperties();
    },

    // Setup filter functionality
    setupFilters: function () {
        // Debounced search
        const searchInput = document.getElementById('searchLocation');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(() => {
                this.loadProperties();
            }, 500));
        }

        // Price filters
        ['minPrice', 'maxPrice'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', utils.debounce(() => {
                    this.loadProperties();
                }, 500));
            }
        });

        // Property type filter
        const propertyType = document.getElementById('propertyType');
        if (propertyType) {
            propertyType.addEventListener('change', () => {
                this.loadProperties();
            });
        }
    },

    // Load properties with current filters
    loadProperties: async function () {
        const filters = this.getCurrentFilters();
        await this.fetchAndDisplayProperties(filters);
    },

    // Get current filter values
    getCurrentFilters: function () {
        return {
            location: document.getElementById('searchLocation')?.value || '',
            property_type: document.getElementById('propertyType')?.value || '',
            min_price: document.getElementById('minPrice')?.value || '',
            max_price: document.getElementById('maxPrice')?.value || '',
            is_available: true
        };
    },

    // Fetch and display properties
    fetchAndDisplayProperties: async function (filters) {
        try {
            this.showLoading(true);

            const properties = await api.getProperties(filters);
            this.displayProperties(properties);

        } catch (error) {
            console.error('Error loading properties:', error);
            utils.showNotification('Error loading properties', 'error');
        } finally {
            this.showLoading(false);
        }
    },

    // Display properties in the grid
    displayProperties: function (properties) {
        const container = document.getElementById('propertiesGrid');
        const countElement = document.getElementById('propertiesCount');

        if (!container || !countElement) return;

        // Update count
        countElement.textContent = `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`;

        if (properties.length === 0) {
            container.innerHTML = this.getNoPropertiesHTML();
            return;
        }

        // Display properties
        container.innerHTML = properties.map(property => this.createPropertyCardHTML(property)).join('');
    },

    // Create property card HTML
    createPropertyCardHTML: function (property) {

        // Choose a default image based on property type or other criteria
        let defaultImage = 'assets/images/beaches/grant-durr-F6ZuUpb-BZY-unsplash.jpg';
        const title = property.title ? property.title.toLowerCase() : '';
        const type = property.type ? property.type.toLowerCase() : '';

        if (type === 'villa' && title.includes('beach')) {
            defaultImage = 'assets/images/beaches/grant-durr-F6ZuUpb-BZY-unsplash.jpg';
        } else if (type === 'apartment' && title.includes('city')) {
            defaultImage = 'assets/images/cities/city1.jpg';
        } else if (type === 'house' && title.includes('pool')) {
            defaultImage = 'assets/images/properties/pools/pool1.jpg';
        } else if (type === 'studio' && title.includes('street')) {
            defaultImage = 'assets/images/streets/street1.jpg';
        } else if (type === 'condo' && title.includes('skyscraper')) {
            defaultImage = 'assets/images/skyscrapers/skyscraper1.jpg';
        } else if (title.includes('balcony')) {
            defaultImage = 'assets/images/properties/balconies/balcony1.jpg';
        } else if (title.includes('bedroom')) {
            defaultImage = 'assets/images/properties/bedrooms/bedroom1.jpg';
        } else if (title.includes('kitchen')) {
            defaultImage = 'assets/images/properties/kitchens/kitchen1.jpg';
        } else if (title.includes('holiday') || title.includes('christmas')) {
            defaultImage = 'assets/images/holidays/christmas1.jpg';
        }

        const imageUrl = property.image_url && property.image_url.trim() !== ''
            ? property.image_url
            : defaultImage;

        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100 property-card">
                    <img src="${imageUrl}" class="card-img-top property-image" alt="${property.title}">
                    ${property.is_popular ? '<span class="position-absolute top-0 end-0 badge bg-warning m-2">Popular</span>' : ''}
                    <div class="card-body">
                        <h5 class="card-title">${property.title}</h5>
                        <p class="card-text text-muted">
                            <i class="fas fa-map-marker-alt"></i> ${property.location}
                        </p>
                        <p class="card-text">${property.description ? property.description.substring(0, 100) + '...' : 'No description available'}</p>
                        
                        <div class="property-features mb-3">
                            <small class="text-muted">
                                <i class="fas fa-bed"></i> ${property.bedrooms} bed • 
                                <i class="fas fa-bath"></i> ${property.bathrooms} bath • 
                                <i class="fas fa-users"></i> ${property.max_guests} guests
                            </small>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="price h5">${utils.formatCurrency(property.price_per_night)}</span>
                                <small class="text-muted">/night</small>
                            </div>
                            <span class="badge bg-primary">${property.property_type}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="d-grid gap-2">
                            <a href="reservation.html?propertyId=${property.property_id}" class="btn btn-primary">
                                <i class="fas fa-calendar-plus"></i> Book Now
                            </a>
                            <a href="property-details.html?id=${property.property_id}" class="btn btn-outline-primary">
                                <i class="fas fa-info-circle"></i> View Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // No properties HTML
    getNoPropertiesHTML: function () {
        return `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No properties found</h4>
                <p class="text-muted">Try adjusting your search filters or browse all properties.</p>
                <button class="btn btn-primary" onclick="propertiesModule.clearFilters()">
                    Clear Filters
                </button>
            </div>
        `;
    },

    // Clear all filters
    clearFilters: function () {
        document.getElementById('searchLocation').value = '';
        document.getElementById('propertyType').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        this.loadProperties();
    },

    // Show/hide loading state
    showLoading: function (show) {
        const loadingElement = document.getElementById('loadingSpinner');
        const gridElement = document.getElementById('propertiesGrid');

        if (loadingElement) loadingElement.style.display = show ? 'block' : 'none';
        if (gridElement) gridElement.style.display = show ? 'none' : 'flex';
    }
};

// Initialize when DOM is loaded
if (document.getElementById('propertiesGrid')) {
    document.addEventListener('DOMContentLoaded', function () {
        propertiesModule.init();
    });
}