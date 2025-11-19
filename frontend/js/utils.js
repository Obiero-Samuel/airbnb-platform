// Utility functions
const utils = {
    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Add to top of body
        document.body.insertBefore(notification, document.body.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    },

    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate: function(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    // Calculate days between dates
    calculateDays: function(checkIn, checkOut) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(checkIn);
        const secondDate = new Date(checkOut);
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    },

    // Get query parameters
    getQueryParam: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // Set loading state for button
    setLoading: function(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="loading-spinner"></span> Loading...';
        } else {
            button.disabled = false;
            button.innerHTML = button.getAttribute('data-original-text') || button.innerHTML;
        }
    },

    // Validate email
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return localStorage.getItem('token') !== null;
    },

    // Get user data from localStorage
    getUser: function() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    // Redirect if not logged in
    requireAuth: function() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Logout user
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    },

    // Debounce function for search
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add logout functionality if user is logged in
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            utils.logout();
        });
    });

    // Update navigation based on auth status
    const updateNavigation = function() {
        const user = utils.getUser();
        const authLinks = document.querySelector('.auth-links');
        const userLinks = document.querySelector('.user-links');

        if (authLinks && userLinks) {
            if (user) {
                authLinks.style.display = 'none';
                userLinks.style.display = 'block';
                document.querySelector('.user-name').textContent = user.first_name || user.username;
            } else {
                authLinks.style.display = 'block';
                userLinks.style.display = 'none';
            }
        }
    };

    updateNavigation();
});