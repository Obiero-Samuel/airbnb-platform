// Authentication specific functionality
const authModule = {
    // Check authentication status and update UI
    init: function() {
        this.updateAuthUI();
        this.setupAuthListeners();
    },

    // Update UI based on authentication status
    updateAuthUI: function() {
        const user = utils.getUser();
        const authLinks = document.querySelector('.auth-links');
        const userLinks = document.querySelector('.user-links');
        const userName = document.querySelector('.user-name');

        if (user && authLinks && userLinks) {
            authLinks.style.display = 'none';
            userLinks.style.display = 'flex';
            if (userName) {
                userName.textContent = user.first_name || user.username;
            }
        } else if (authLinks && userLinks) {
            authLinks.style.display = 'flex';
            userLinks.style.display = 'none';
        }
    },

    // Setup authentication event listeners
    setupAuthListeners: function() {
        // Logout functionality
        document.querySelectorAll('.logout-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Protect authenticated routes
        this.protectRoutes();
    },

    // Logout user
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        utils.showNotification('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    },

    // Protect routes that require authentication
    protectRoutes: function() {
        const protectedRoutes = ['homepage.html', 'reservations.html', 'profile.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedRoutes.includes(currentPage) && !utils.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        // Redirect authenticated users away from auth pages
        const authPages = ['login.html', 'register.html'];
        if (authPages.includes(currentPage) && utils.isLoggedIn()) {
            window.location.href = 'homepage.html';
            return;
        }
    },

    // Validate registration form
    validateRegistration: function(formData) {
        const errors = [];

        if (!formData.first_name || formData.first_name.length < 2) {
            errors.push('First name must be at least 2 characters long');
        }

        if (!formData.last_name || formData.last_name.length < 2) {
            errors.push('Last name must be at least 2 characters long');
        }

        if (!formData.username || formData.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        if (!utils.isValidEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!formData.password || formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        return errors;
    },

    // Handle login
    handleLogin: async function(credentials) {
        try {
            const result = await api.login(credentials);
            
            // Store authentication data
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            utils.showNotification('Login successful!', 'success');
            
            // Redirect to appropriate page
            setTimeout(() => {
                window.location.href = 'homepage.html';
            }, 1000);
            
            return { success: true };
            
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                needsVerification: error.message.includes('verify your email')
            };
        }
    }
};

// Initialize auth module on pages that need it
if (document.querySelector('.auth-links') || document.querySelector('.user-links')) {
    document.addEventListener('DOMContentLoaded', function() {
        authModule.init();
    });
}