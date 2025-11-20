// API service for backend communication
const api = {
    baseURL: 'http://localhost:8000/api',

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Auth endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async verifyOTP(otpData) {
        return this.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify(otpData)
        });
    },

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async getProfile() {
        return this.request('/auth/profile');
    },

    async resendOTP(otpData) {
        return this.request('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify(otpData)
        });
    },

    // Property endpoints
    async getProperties(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        let response = null;
        try {
            response = await this.request(`/properties?${queryParams}`);
        } catch (error) {
            console.log('Backend unavailable, using sample properties');
        }
        // If backend returns empty, few results, or failed, use sample data
        if (!response || !Array.isArray(response) || response.length < 1) {
            return this.getSampleProperties(filters);
        }
        return response;
    },

    getSampleProperties(filters = {}) {
        // Sample properties with your downloaded images
        const sampleProperties = [
            {
                property_id: 1,
                title: "Oceanfront Paradise Villa",
                location: "Maldives Beach, Maldives",
                description: "Luxury beachfront villa with private beach access, stunning ocean views, and premium amenities. Perfect for romantic getaways and family vacations.",
                price_per_night: 599.99,
                property_type: "villa",
                bedrooms: 3,
                bathrooms: 2,
                max_guests: 6,
                image_url: "../assets/images/beaches/beach 1.jpg",
                is_popular: true,
                is_available: true,
                created_at: "2024-01-15",
                highlights: ["Private Beach Access", "Infinity Pool", "Ocean Views", "Luxury Amenities"]
            },
            {
                property_id: 2,
                title: "Sunset Bay Luxury Condo",
                location: "Santa Monica, California",
                description: "Stunning sunset views from this premium condo with yacht club access. Perfect for evening relaxation and coastal living.",
                price_per_night: 389.99,
                property_type: "condo",
                bedrooms: 2,
                bathrooms: 2,
                max_guests: 4,
                image_url: "../assets/images/beaches/beach 2 .jpg",
                is_popular: true,
                is_available: true,
                created_at: "2024-01-20",
                highlights: ["Sunset Views", "Yacht Club Access", "Coastal Living", "Premium Location"]
            },
            {
                property_id: 3,
                title: "Riverside Retreat House",
                location: "Aspen, Colorado",
                description: "Beautiful riverside property with stunning midday views. Perfect for nature lovers and peaceful getaways.",
                price_per_night: 329.99,
                property_type: "house",
                bedrooms: 3,
                bathrooms: 2,
                max_guests: 6,
                image_url: "../assets/images/beaches/beach 3 sideview.jpg",
                is_popular: false,
                is_available: true,
                created_at: "2024-01-10",
                highlights: ["Riverside Location", "Nature Views", "Peaceful Setting", "Mountain Access"]
            },
            {
                property_id: 4,
                title: "Modern Riverside Apartment",
                location: "Aspen, Colorado",
                description: "Contemporary apartment with front-facing river views. Modern amenities in a serene natural setting.",
                price_per_night: 279.99,
                property_type: "apartment",
                bedrooms: 2,
                bathrooms: 1,
                max_guests: 4,
                image_url: "../assets/images/beaches/beach 3.jpg",
                is_popular: true,
                is_available: true,
                created_at: "2024-01-25",
                highlights: ["Modern Design", "River Views", "Serene Location", "Updated Amenities"]
            },
            {
                property_id: 5,
                title: "Night Harbor Luxury Condo",
                location: "Miami Beach, Florida",
                description: "Exclusive waterfront condo with night harbor views. Perfect for entertaining and enjoying the vibrant nightlife.",
                price_per_night: 459.99,
                property_type: "condo",
                bedrooms: 2,
                bathrooms: 2,
                max_guests: 4,
                image_url: "../assets/images/beaches/beach 4.jpg",
                is_popular: true,
                is_available: true,
                created_at: "2024-01-18",
                highlights: ["Harbor Views", "Nightlife Access", "Entertainment Ready", "Waterfront"]
            },
            {
                property_id: 6,
                title: "Tropical Bungalow Retreat",
                location: "Bali, Indonesia",
                description: "Charming bungalow with beautiful resting areas and tropical surroundings. Perfect for relaxation and meditation.",
                price_per_night: 199.99,
                property_type: "bungalow",
                bedrooms: 1,
                bathrooms: 1,
                max_guests: 2,
                image_url: "../assets/images/beaches/beach bungalow 1.jpg",
                is_popular: false,
                is_available: true,
                created_at: "2024-01-30",
                highlights: ["Tropical Setting", "Relaxation Focus", "Meditation Space", "Affordable Luxury"]
            },
            {
                property_id: 7,
                title: "Beach Club Luxury Villa",
                location: "Cancun, Mexico",
                description: "Premium beach club villa with exclusive amenities and stunning oceanfront location. Perfect for luxury vacations.",
                price_per_night: 699.99,
                property_type: "villa",
                bedrooms: 4,
                bathrooms: 3,
                max_guests: 8,
                image_url: "assets/images/beaches/beach 1.jpg",
                is_popular: true,
                is_available: true,
                created_at: "2024-01-05",
                highlights: ["Beach Club Access", "Luxury Amenities", "Oceanfront", "Family Friendly"]
            },
            {
                property_id: 8,
                title: "Sunset View Apartment",
                location: "Malibu, California",
                description: "Beautiful apartment with panoramic sunset views over the Pacific Ocean. Ideal for romantic evenings.",
                price_per_night: 429.99,
                property_type: "apartment",
                bedrooms: 1,
                bathrooms: 1,
                max_guests: 2,
                image_url: "assets/images/beaches/beach 2 .jpg",
                is_popular: true,
                is_available: true,
                created_at: "2024-01-22",
                highlights: ["Panoramic Views", "Romantic Setting", "Pacific Ocean", "Sunset Spot"]
            },
            {
                property_id: 9,
                title: "Mountain River House",
                location: "Swiss Alps, Switzerland",
                description: "Charming house nestled by a mountain river with breathtaking natural scenery. Perfect for outdoor enthusiasts.",
                price_per_night: 359.99,
                property_type: "house",
                bedrooms: 2,
                bathrooms: 1,
                max_guests: 4,
                image_url: "assets/images/beaches/beach 3 sideview.jpg",
                is_popular: false,
                is_available: true,
                created_at: "2024-01-08",
                highlights: ["Mountain Location", "River Access", "Outdoor Activities", "Natural Scenery"]
            },
            {
                property_id: 10,
                title: "Contemporary River Studio",
                location: "Aspen, Colorado",
                description: "Modern studio apartment with direct river access and contemporary design. Perfect for solo travelers or couples.",
                price_per_night: 219.99,
                property_type: "studio",
                bedrooms: 1,
                bathrooms: 1,
                max_guests: 2,
                image_url: "assets/images/beaches/beach 3.jpg",
                is_popular: false,
                is_available: true,
                created_at: "2024-01-28",
                highlights: ["Contemporary Design", "River Access", "Modern Amenities", "Solo Traveler Friendly"]
            },
            {
                property_id: 11,
                title: "Harbor Night Luxury Apartment",
                location: "Monaco, French Riviera",
                description: "Luxurious apartment overlooking the famous Monaco harbor. Perfect for experiencing the high-life.",
                price_per_night: 799.99,
                property_type: "apartment",
                bedrooms: 2,
                bathrooms: 2,
                max_guests: 4,
                image_url: "assets/images/beaches/beach 4.jpg",
                is_popular: true,
                is_available: true,
                created_at: "2024-01-12",
                highlights: ["Harbor Views", "Luxury Living", "Prime Location", "Entertainment Hub"]
            },
            {
                property_id: 12,
                title: "Island Bungalow Escape",
                location: "Phuket, Thailand",
                description: "Traditional Thai bungalow with modern comforts in a tropical paradise. Perfect for cultural immersion.",
                price_per_night: 149.99,
                property_type: "bungalow",
                bedrooms: 1,
                bathrooms: 1,
                max_guests: 2,
                image_url: "assets/images/beaches/beach bungalow 1.jpg",
                is_popular: false,
                is_available: true,
                created_at: "2024-01-17",
                highlights: ["Traditional Design", "Cultural Experience", "Tropical Paradise", "Affordable Escape"]
            }
        ]; // <-- Close the sampleProperties array
    }, // <-- Close getSampleProperties method
}; // <-- Close the api object

// Error handling for API calls
window.addEventListener('unhandledrejection', event => {
    if (event.reason.message && event.reason.message.includes('Failed to fetch')) {
        utils.showNotification('Unable to connect to server. Please check if the backend is running.', 'error');
    }
});
