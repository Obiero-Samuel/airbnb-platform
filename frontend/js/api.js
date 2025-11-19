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
        return this.request(`/properties?${queryParams}`);
    },

    async getPropertyById(id) {
        return this.request(`/properties/${id}`);
    },

    async getPopularStays() {
        return this.request('/properties/popular');
    },

    async checkAvailability(propertyId, checkIn, checkOut) {
        return this.request(`/properties/${propertyId}/availability?check_in=${checkIn}&check_out=${checkOut}`);
    },

    async createProperty(propertyData) {
        return this.request('/properties', {
            method: 'POST',
            body: JSON.stringify(propertyData)
        });
    },

    // Reservation endpoints
    async createReservation(reservationData) {
        return this.request('/reservations', {
            method: 'POST',
            body: JSON.stringify(reservationData)
        });
    },

    async getUserReservations() {
        return this.request('/reservations');
    },

    async getReservationById(id) {
        return this.request(`/reservations/${id}`);
    },

    async calculatePrice(priceData) {
        return this.request('/reservations/calculate-price', {
            method: 'POST',
            body: JSON.stringify(priceData)
        });
    },

    async updateReservationStatus(id, status) {
        return this.request(`/reservations/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
};

// Error handling for API calls
window.addEventListener('unhandledrejection', event => {
    if (event.reason.message.includes('Failed to fetch')) {
        utils.showNotification('Unable to connect to server. Please check if the backend is running.', 'error');
    }
});
