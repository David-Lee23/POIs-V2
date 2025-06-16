/**
 * POI (Points of Interest) data management
 */
import { supabase } from './supabase.js';
import { config } from './config.js';

export class POIManager {
  constructor() {
    this.pois = [];
    this.currentFilters = null;
  }

  /**
   * Load POIs from the database with optional filters
   * @param {string} queryString - Filter query string
   * @returns {Array} Array of POI objects
   */
  async loadPOIs(queryString = '') {
    try {
      const url = `${config.supabase.url}/rest/v1/enriched_pois?select=*${queryString ? '&' + queryString : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': config.supabase.anonKey,
          'Authorization': `Bearer ${config.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pois = await response.json();
      this.pois = pois;
      return pois;
    } catch (error) {
      console.error('Error loading POIs:', error);
      throw error;
    }
  }

  /**
   * Load POIs using Supabase client (alternative method)
   * @param {Object} filters - Filter object
   * @returns {Array} Array of POI objects
   */
  async loadPOIsWithClient(filters = {}) {
    try {
      let query = supabase.from('enriched_pois').select('*');

      // Apply filters
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters.city && filters.city.length > 0) {
        if (filters.city.length === 1) {
          query = query.eq('city', filters.city[0]);
        } else {
          query = query.in('city', filters.city);
        }
      }

      if (filters.state && filters.state.length > 0) {
        if (filters.state.length === 1) {
          query = query.eq('state', filters.state[0]);
        } else {
          query = query.in('state', filters.state);
        }
      }

      if (filters.subregion && filters.subregion.length > 0) {
        if (filters.subregion.length === 1) {
          query = query.eq('subregion', filters.subregion[0]);
        } else {
          query = query.in('subregion', filters.subregion);
        }
      }

      if (filters.region && filters.region.length > 0) {
        if (filters.region.length === 1) {
          query = query.eq('region', filters.region[0]);
        } else {
          query = query.in('region', filters.region);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      this.pois = data;
      return data;
    } catch (error) {
      console.error('Error loading POIs with client:', error);
      throw error;
    }
  }

  /**
   * Create a POI card element
   * @param {Object} poi - POI object
   * @param {Function} onCardClick - Click handler for the card
   * @returns {HTMLElement} POI card element
   */
  createPOICard(poi, onCardClick) {
    const card = document.createElement('div');
    card.className = 'poi-card card mb-2 shadow-sm';
    card.style.cursor = 'pointer';

    const tags = (poi.tags || [])
      .map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`)
      .join('');

    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title mb-1">${poi.place_name || 'Unnamed Location'}</h5>
        <small class="text-muted">${poi.city || ''}, ${poi.state || ''}</small>
        ${poi.description ? `<p class="card-text mb-2">${poi.description}</p>` : ''}
        ${tags ? `<div class="mb-0">${tags}</div>` : ''}
      </div>
    `;

    if (onCardClick) {
      card.addEventListener('click', () => onCardClick(poi));
    }

    return card;
  }

  /**
   * Render POIs to the list container
   * @param {string} containerId - ID of the container element
   * @param {Function} onCardClick - Click handler for cards
   */
  renderPOIList(containerId, onCardClick) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID '${containerId}' not found`);
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Show message if no POIs
    if (this.pois.length === 0) {
      this.showNoResultsMessage();
      return;
    }

    // Hide no results message
    this.hideNoResultsMessage();

    // Create and append POI cards
    this.pois.forEach(poi => {
      const card = this.createPOICard(poi, onCardClick);
      container.appendChild(card);
    });
  }

  /**
   * Show no results message
   */
  showNoResultsMessage() {
    const messageElement = document.getElementById('no-results-msg');
    if (messageElement) {
      messageElement.textContent = '😔 No POIs matched your filters.';
      messageElement.classList.remove('d-none');
    }
  }

  /**
   * Hide no results message
   */
  hideNoResultsMessage() {
    const messageElement = document.getElementById('no-results-msg');
    if (messageElement) {
      messageElement.classList.add('d-none');
    }
  }

  /**
   * Get current POIs
   * @returns {Array} Current POI array
   */
  getPOIs() {
    return this.pois;
  }

  /**
   * Get POI by ID
   * @param {string|number} id - POI ID
   * @returns {Object|null} POI object or null if not found
   */
  getPOIById(id) {
    return this.pois.find(poi => poi.id === id) || null;
  }

  /**
   * Get POIs by tag
   * @param {string} tag - Tag to filter by
   * @returns {Array} Array of POIs with the specified tag
   */
  getPOIsByTag(tag) {
    return this.pois.filter(poi => 
      poi.tags && poi.tags.includes(tag)
    );
  }

  /**
   * Get POIs within bounds
   * @param {Object} bounds - Leaflet bounds object
   * @returns {Array} Array of POIs within bounds
   */
  getPOIsInBounds(bounds) {
    return this.pois.filter(poi => {
      if (!poi.lat || !poi.lng) return false;
      return bounds.contains([poi.lat, poi.lng]);
    });
  }

  /**
   * Clear current POI data
   */
  clear() {
    this.pois = [];
  }
} 