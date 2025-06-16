/**
 * Application Configuration
 * Environment variables are injected at build time by Vite
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  
  map: {
    defaultCenter: [39, -98], // Continental US center
    defaultZoom: 4,
    tileLayer: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  
  ui: {
    poiListWidth: 400, // pixels
    mobileBreakpoint: 768 // pixels
  }
};

// Validate required environment variables
if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('Missing required Supabase configuration. Please check your environment variables.');
} 