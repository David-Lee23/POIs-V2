/**
 * Authentication management
 */
import { auth } from './supabase.js';

export class AuthManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.authCallbacks = [];
    this.init();
  }

  /**
   * Initialize authentication
   */
  async init() {
    // Get current session
    this.session = await auth.getSession();
    this.user = this.session?.user || null;

    // Set up auth state listener
    auth.onAuthStateChange((event, session) => {
      this.session = session;
      this.user = session?.user || null;
      
      this.updateAuthUI();
      this.notifyAuthCallbacks(event, session);
    });

    // Update initial UI state
    this.updateAuthUI();
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for auth buttons
   */
  setupEventListeners() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.signIn());
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.signOut());
    }
  }

  /**
   * Sign in with Google
   */
  async signIn() {
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      this.showAuthError('Failed to sign in. Please try again.');
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      this.showAuthError('Failed to sign out. Please try again.');
    }
  }

  /**
   * Update authentication UI elements
   */
  updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn && logoutBtn) {
      if (this.isAuthenticated()) {
        loginBtn.classList.add('d-none');
        logoutBtn.classList.remove('d-none');
        
        // Update logout button text with user info
        if (this.user?.user_metadata?.full_name) {
          logoutBtn.innerHTML = `🚪 ${this.user.user_metadata.full_name}`;
          logoutBtn.title = 'Click to log out';
        }
      } else {
        loginBtn.classList.remove('d-none');
        logoutBtn.classList.add('d-none');
      }
    }

    // Update any user-specific UI elements
    this.updateUserProfile();
  }

  /**
   * Update user profile information in the UI
   */
  updateUserProfile() {
    const userProfileElements = document.querySelectorAll('[data-user-profile]');
    
    userProfileElements.forEach(element => {
      if (this.isAuthenticated()) {
        const field = element.dataset.userProfile;
        const value = this.getUserData(field);
        
        if (value) {
          element.textContent = value;
          element.style.display = '';
        } else {
          element.style.display = 'none';
        }
      } else {
        element.style.display = 'none';
      }
    });
  }

  /**
   * Get user data by field
   * @param {string} field - Field name
   * @returns {string|null} Field value
   */
  getUserData(field) {
    if (!this.user) return null;

    switch (field) {
      case 'name':
        return this.user.user_metadata?.full_name || this.user.email;
      case 'email':
        return this.user.email;
      case 'avatar':
        return this.user.user_metadata?.avatar_url;
      default:
        return this.user.user_metadata?.[field] || this.user[field];
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!this.session && !!this.user;
  }

  /**
   * Get current user
   * @returns {Object|null} User object or null
   */
  getUser() {
    return this.user;
  }

  /**
   * Get current session
   * @returns {Object|null} Session object or null
   */
  getSession() {
    return this.session;
  }

  /**
   * Get user ID
   * @returns {string|null} User ID or null
   */
  getUserId() {
    return this.user?.id || null;
  }

  /**
   * Add callback for auth state changes
   * @param {Function} callback - Callback function
   */
  onAuthStateChange(callback) {
    this.authCallbacks.push(callback);
  }

  /**
   * Remove auth state change callback
   * @param {Function} callback - Callback function to remove
   */
  removeAuthStateChange(callback) {
    const index = this.authCallbacks.indexOf(callback);
    if (index > -1) {
      this.authCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all auth callbacks
   * @param {string} event - Auth event type
   * @param {Object} session - Session object
   */
  notifyAuthCallbacks(event, session) {
    this.authCallbacks.forEach(callback => {
      try {
        callback(event, session);
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    });
  }

  /**
   * Show authentication error message
   * @param {string} message - Error message
   */
  showAuthError(message) {
    // You can customize this to show errors in your UI
    console.error('Auth Error:', message);
    
    // Example: Show toast notification or modal
    // This could be integrated with a notification system
    alert(message);
  }

  /**
   * Require authentication for a function
   * @param {Function} fn - Function to execute if authenticated
   * @param {string} message - Message to show if not authenticated
   */
  requireAuth(fn, message = 'Please sign in to continue.') {
    if (this.isAuthenticated()) {
      return fn();
    } else {
      this.showAuthError(message);
      return null;
    }
  }
} 