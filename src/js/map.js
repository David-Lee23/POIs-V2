/**
 * Map functionality using Leaflet
 */
import { config } from './config.js';

// Use Leaflet from CDN (loaded globally)
const L = window.L;

// Fix for default markers in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export class MapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markers = null;
    this.init();
  }

  /**
   * Initialize the map
   */
  init() {
    // Create map instance
    this.map = L.map(this.containerId).setView(
      config.map.defaultCenter,
      config.map.defaultZoom
    );

    // Add tile layer
    L.tileLayer(config.map.tileLayer.url, {
      attribution: config.map.tileLayer.attribution
    }).addTo(this.map);

    // Initialize marker cluster group
    this.markers = L.markerClusterGroup();
  }

  /**
   * Add POIs to the map
   * @param {Array} pois - Array of POI objects
   */
  addPOIs(pois) {
    this.clearMarkers();

    pois.forEach(poi => {
      if (poi.lat && poi.lng) {
        const marker = this.createMarker(poi);
        this.markers.addLayer(marker);
      }
    });

    this.map.addLayer(this.markers);
  }

  /**
   * Create a marker for a POI
   * @param {Object} poi - POI object
   * @returns {L.Marker} Leaflet marker
   */
  createMarker(poi) {
    const marker = L.marker([poi.lat, poi.lng]);
    
    const popupContent = this.createPopupContent(poi);
    marker.bindPopup(popupContent);

    return marker;
  }

  /**
   * Create popup content for a POI
   * @param {Object} poi - POI object
   * @returns {string} HTML content for popup
   */
  createPopupContent(poi) {
    const tags = (poi.tags || [])
      .map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`)
      .join('');

    return `
      <div class="poi-popup">
        <h6 class="mb-2">${poi.place_name || 'Unnamed Location'}</h6>
        <p class="mb-1 text-muted">${poi.city || ''}, ${poi.state || ''}</p>
        ${poi.description ? `<p class="mb-2">${poi.description}</p>` : ''}
        ${tags ? `<div class="mb-0">${tags}</div>` : ''}
      </div>
    `;
  }

  /**
   * Clear all markers from the map
   */
  clearMarkers() {
    if (this.markers) {
      this.map.removeLayer(this.markers);
      this.markers.clearLayers();
    }
  }

  /**
   * Set view to specific coordinates
   * @param {Array} latlng - [lat, lng] coordinates
   * @param {number} zoom - Zoom level (optional)
   */
  setView(latlng, zoom = 12) {
    this.map.setView(latlng, zoom);
  }

  /**
   * Get the map instance
   * @returns {L.Map} Leaflet map instance
   */
  getMap() {
    return this.map;
  }

  /**
   * Resize map (useful for responsive layouts)
   */
  resize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }
} 