/**
 * Filtering functionality for POIs
 */
import { supabase } from './supabase.js';

export class FilterManager {
  constructor() {
    this.filterData = {
      cities: new Set(),
      states: new Set(),
      subregions: new Set(),
      regions: new Set(),
      tags: new Set()
    };
  }

  /**
   * Load and populate filter options
   */
  async loadFilterOptions() {
    try {
      const { data, error } = await supabase
        .from('enriched_pois')
        .select('city,state,subregion,region,tags');

      if (error) {
        console.error('Error loading filter options:', error);
        return;
      }

      // Clear existing data
      Object.keys(this.filterData).forEach(key => {
        this.filterData[key].clear();
      });

      // Build unique value sets
      data.forEach(poi => {
        if (poi.city) this.filterData.cities.add(poi.city);
        if (poi.state) this.filterData.states.add(poi.state);
        if (poi.subregion) this.filterData.subregions.add(poi.subregion);
        if (poi.region) this.filterData.regions.add(poi.region);
        
        if (poi.tags && Array.isArray(poi.tags)) {
          poi.tags.forEach(tag => this.filterData.tags.add(tag));
        }
      });

      this.populateFilterUI();
    } catch (error) {
      console.error('Error in loadFilterOptions:', error);
    }
  }

  /**
   * Populate the filter UI elements
   */
  populateFilterUI() {
    // Populate select dropdowns
    this.populateSelect('city-select', Array.from(this.filterData.cities).sort());
    this.populateSelect('state-select', Array.from(this.filterData.states).sort());
    this.populateSelect('subregion-select', Array.from(this.filterData.subregions).sort());
    this.populateSelect('region-select', Array.from(this.filterData.regions).sort());

    // Populate tag checkboxes
    this.populateTagCheckboxes();

    // Refresh bootstrap-select if available
    if (window.$ && window.$('.selectpicker').length) {
      window.$('.selectpicker').selectpicker('refresh');
    }
  }

  /**
   * Populate a select element with options
   * @param {string} selectId - ID of the select element
   * @param {Array} items - Array of option values
   */
  populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Clear existing options (except placeholder)
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = '';
    
    if (placeholder) {
      select.appendChild(placeholder);
    }

    // Add new options
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      select.appendChild(option);
    });
  }

  /**
   * Populate tag checkboxes
   */
  populateTagCheckboxes() {
    const container = document.getElementById('tag-checkboxes');
    if (!container) return;

    container.innerHTML = '';
    
    Array.from(this.filterData.tags).sort().forEach(tag => {
      const div = document.createElement('div');
      div.className = 'form-check form-check-inline';
      
      const checkboxId = `tag-${tag.replace(/\s+/g, '-').toLowerCase()}`;
      
      div.innerHTML = `
        <input class="form-check-input" type="checkbox" name="tag" value="${tag}" id="${checkboxId}">
        <label class="form-check-label" for="${checkboxId}">${tag}</label>
      `;
      
      container.appendChild(div);
    });
  }

  /**
   * Build Supabase query parameters from current filter state
   * @returns {string} Query string for Supabase API
   */
  buildQueryString() {
    const params = new URLSearchParams();
    const form = document.getElementById('filter-form');
    
    if (!form) return '';

    // Handle tag filters (array contains)
    const selectedTags = Array.from(form.querySelectorAll('input[name="tag"]:checked'))
      .map(input => input.value);
    
    if (selectedTags.length > 0) {
      params.append('tags', `cs.{${selectedTags.join(',')}}`);
    }

    // Handle other filters (equality/in)
    ['city', 'state', 'subregion', 'region'].forEach(field => {
      const select = form.elements[field];
      if (!select) return;

      const selectedOptions = Array.from(select.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== '');

      if (selectedOptions.length === 1) {
        params.append(field, `eq.${selectedOptions[0]}`);
      } else if (selectedOptions.length > 1) {
        params.append(field, `in.(${selectedOptions.join(',')})`);
      }
    });

    return params.toString();
  }

  /**
   * Get selected filter values
   * @returns {Object} Selected filter values
   */
  getSelectedFilters() {
    const form = document.getElementById('filter-form');
    if (!form) return {};

    return {
      tags: Array.from(form.querySelectorAll('input[name="tag"]:checked'))
        .map(input => input.value),
      city: this.getSelectValues(form.elements.city),
      state: this.getSelectValues(form.elements.state),
      subregion: this.getSelectValues(form.elements.subregion),
      region: this.getSelectValues(form.elements.region)
    };
  }

  /**
   * Get selected values from a select element
   * @param {HTMLSelectElement} select - Select element
   * @returns {Array} Selected values
   */
  getSelectValues(select) {
    if (!select) return [];
    
    return Array.from(select.selectedOptions)
      .map(option => option.value)
      .filter(value => value !== '');
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    const form = document.getElementById('filter-form');
    if (!form) return;

    // Clear checkboxes
    form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    // Clear selects
    form.querySelectorAll('select').forEach(select => {
      select.selectedIndex = 0;
    });

    // Refresh bootstrap-select if available
    if (window.$ && window.$('.selectpicker').length) {
      window.$('.selectpicker').selectpicker('refresh');
    }
  }
} 