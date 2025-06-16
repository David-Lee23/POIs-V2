/**
 * POI Tracker - Main Application
 * Entry point that coordinates all application modules
 */

import { MapManager } from './map.js';
import { FilterManager } from './filters.js';
import { POIManager } from './poi.js';
import { AuthManager } from './auth.js';

class POITrackerApp {
  constructor() {
    this.mapManager = null;
    this.filterManager = null;
    this.poiManager = null;
    this.authManager = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing POI Tracker...');

      // Initialize managers
      this.mapManager = new MapManager('map');
      this.filterManager = new FilterManager();
      this.poiManager = new POIManager();
      this.authManager = new AuthManager();

      // Set up event listeners
      this.setupEventListeners();

      // Load initial data
      await this.loadInitialData();

      // Set up responsive behavior
      this.setupResponsiveBehavior();

      this.isInitialized = true;
      console.log('✅ POI Tracker initialized successfully');

      // Development message
      console.log('💡 My first project! Learning everything from scratch so errors might take a while to fix, but I will fix them eventually. :)');

    } catch (error) {
      console.error('❌ Failed to initialize POI Tracker:', error);
      this.showErrorMessage('Failed to initialize the application. Please refresh the page.');
    }
  }

  /**
   * Load initial application data
   */
  async loadInitialData() {
    try {
      // Load filter options first
      await this.filterManager.loadFilterOptions();

      // Load initial POIs (all POIs)
      await this.loadAndRenderPOIs();

    } catch (error) {
      console.error('Error loading initial data:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Filter form submission
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
    }

    // Window resize handler for responsive layout
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Authentication state changes
    if (this.authManager) {
      this.authManager.onAuthStateChange((event, session) => {
        this.handleAuthStateChange(event, session);
      });
    }
  }

  /**
   * Apply filters and reload POIs
   */
  async applyFilters() {
    try {
      const queryString = this.filterManager.buildQueryString();
      await this.loadAndRenderPOIs(queryString);
      
      // Close sidebar on mobile after applying filters
      if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
          const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(sidebar);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      this.showErrorMessage('Failed to apply filters. Please try again.');
    }
  }

  /**
   * Load and render POIs with optional filters
   * @param {string} queryString - Filter query string
   */
  async loadAndRenderPOIs(queryString = '') {
    try {
      // Load POIs from database
      const pois = await this.poiManager.loadPOIs(queryString);

      // Render POIs on map
      this.mapManager.addPOIs(pois);

      // Render POI list
      this.poiManager.renderPOIList('poi-list', (poi) => {
        this.handlePOICardClick(poi);
      });

    } catch (error) {
      console.error('Error loading POIs:', error);
      this.showErrorMessage('Failed to load POIs. Please check your connection.');
    }
  }

  /**
   * Handle POI card click
   * @param {Object} poi - POI object
   */
  handlePOICardClick(poi) {
    if (poi.lat && poi.lng) {
      this.mapManager.setView([poi.lat, poi.lng], 12);
      
      // Find and open the corresponding marker popup
      const markers = this.mapManager.markers.getLayers();
      const marker = markers.find(m => {
        const latLng = m.getLatLng();
        return latLng.lat === poi.lat && latLng.lng === poi.lng;
      });
      
      if (marker) {
        marker.openPopup();
      }
    }
  }

  /**
   * Handle authentication state changes
   * @param {string} event - Auth event
   * @param {Object} session - Session object
   */
  handleAuthStateChange(event, session) {
    console.log('Auth state changed:', event, session ? 'signed in' : 'signed out');
    
    // Reload POIs when auth state changes (in case of private POIs)
    if (this.isInitialized) {
      this.loadAndRenderPOIs();
    }
  }

  /**
   * Handle window resize for responsive behavior
   */
  handleResize() {
    if (this.mapManager) {
      this.mapManager.resize();
    }
  }

  /**
   * Set up responsive behavior
   */
  setupResponsiveBehavior() {
    // Handle mobile/desktop layout differences
    const handleResponsiveLayout = () => {
      const isMobile = window.innerWidth <= 768;
      const mapElement = document.getElementById('map');
      const poiList = document.getElementById('poi-list');

      if (mapElement && poiList) {
        if (isMobile) {
          mapElement.style.marginRight = '0';
          poiList.style.width = '100%';
          poiList.style.height = '50vh';
          poiList.style.bottom = '0';
          poiList.style.top = 'auto';
        } else {
          mapElement.style.marginRight = '400px';
          poiList.style.width = '400px';
          poiList.style.height = '100vh';
          poiList.style.bottom = 'auto';
          poiList.style.top = '0';
        }
      }
    };

    // Initial setup
    handleResponsiveLayout();

    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResponsiveLayout, 100);
    });
  }

  /**
   * Show error message to user
   * @param {string} message - Error message
   */
  showErrorMessage(message) {
    // Simple alert for now - could be enhanced with a toast system
    console.error(message);
    alert(message);
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    if (this.filterManager) {
      this.filterManager.clearFilters();
      this.loadAndRenderPOIs();
    }
  }

  /**
   * Get application state for debugging
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      poisCount: this.poiManager?.getPOIs()?.length || 0,
      isAuthenticated: this.authManager?.isAuthenticated() || false,
      currentFilters: this.filterManager?.getSelectedFilters() || {},
      mapCenter: this.mapManager?.getMap()?.getCenter()
    };
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  window.poiApp = new POITrackerApp();
  await window.poiApp.init();
});

// Export for potential external usage
export default POITrackerApp; 