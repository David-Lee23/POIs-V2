/** ------------------------------------------------------------------
 * 1️⃣  CONFIG
 * -----------------------------------------------------------------*/
const SUPABASE_URL = "https://qeokcdjnqfladegcnext.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb2tjZGpucWZsYWRlZ2NuZXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDg5MDYsImV4cCI6MjA2MzU4NDkwNn0.NL_K6y7zyMsJwj7YW6kn07jFn6Lc0Dw0qDxIzlPGUPY";

/** ------------------------------------------------------------------
 * 2️⃣  INIT SUPABASE  (ES module import)
 * -----------------------------------------------------------------*/
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

/** ------------------------------------------------------------------
 * 3️⃣  MAP + UI BOOTSTRAP
 * -----------------------------------------------------------------*/
const map     = L.map("map").setView([39, -98], 4);
const markers = L.markerClusterGroup();
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

/** ------------------------------------------------------------------
 * 4️⃣  AUTH BUTTONS (same as before)
 * -----------------------------------------------------------------*/
document.getElementById("login-btn").onclick  = () => sb.auth.signInWithOAuth({ provider: "google" });
document.getElementById("logout-btn").onclick = () => sb.auth.signOut();

sb.auth.onAuthStateChange((_, session) => {
  document.getElementById("login-btn").classList.toggle("d-none", !!session);
  document.getElementById("logout-btn").classList.toggle("d-none", !session);
});

/** ------------------------------------------------------------------
 * 5️⃣  LOAD FILTER LISTS  (single query ➜ dedupe in JS)
 * -----------------------------------------------------------------*/
async function loadFilters() {
  const { data, error } = await sb
    .from("enriched_pois")
    .select("city,state,subregion,region,tags");

  if (error) {
    console.error("Filter load error:", error);
    return;
  }

  // Build unique value sets
  const uniq = { city: new Set(), state: new Set(),
                 subregion: new Set(), region: new Set(), tags: new Set() };

  data.forEach(poi => {
    if (poi.city)       uniq.city.add(poi.city);
    if (poi.state)      uniq.state.add(poi.state);
    if (poi.subregion)  uniq.subregion.add(poi.subregion);
    if (poi.region)     uniq.region.add(poi.region);
    (poi.tags || []).forEach(t => uniq.tags.add(t));
  });

  // Populate selects / check-boxes
  populateSelect("city-select",      [...uniq.city].sort());
  populateSelect("state-select",     [...uniq.state].sort());
  populateSelect("subregion-select", [...uniq.subregion].sort());
  populateSelect("region-select",    [...uniq.region].sort());

  const tagBox = document.getElementById("tag-checkboxes");
  [...uniq.tags].sort().forEach(tag => {
    const div = document.createElement("div");
    div.className = "form-check form-check-inline";
    div.innerHTML = `
      <input class="form-check-input" type="checkbox" name="tag" value="${tag}" id="tag-${tag}">
      <label class="form-check-label" for="tag-${tag}">${tag}</label>`;
    tagBox.appendChild(div);
  });

  $(".selectpicker").selectpicker("refresh");
}

function populateSelect(id, items) {
  const sel = document.getElementById(id);
  sel.innerHTML = "";                         // clear any placeholder
  items.forEach(v => {
    const opt   = document.createElement("option");
    opt.value   = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

/** ------------------------------------------------------------------
 * 6️⃣  BUILD QUERY STRING  (Supabase/PostgREST syntax)
 * -----------------------------------------------------------------*/
function buildQueryString() {
  const params = new URLSearchParams();
  const form   = document.getElementById("filter-form");

  // tags (array contains) -> tags=cs.{tag1,tag2}
  const tagVals = [...form.querySelectorAll('input[name="tag"]:checked')].map(el => el.value);
  if (tagVals.length) params.append("tags", `cs.{${tagVals.join(",")}}`);

  // Equality / IN filters
  ["city","state","subregion","region"].forEach(field => {
     const chosen = [...form.elements[field].selectedOptions].map(o => o.value).filter(Boolean);
     if (chosen.length === 1)        params.append(field, `eq.${chosen[0]}`);
     else if (chosen.length > 1)     params.append(field, `in.(${chosen.join(",")})`);
  });

  return params.toString();
}

/** ------------------------------------------------------------------
 * 7️⃣  LOAD & RENDER POIs
 * -----------------------------------------------------------------*/
async function loadPOIs() {
  const qs = buildQueryString();
  
  const { data: pois, error } = await sb
    .from('enriched_pois')
    .select('*')
    .or(qs);

  if (error) {
    console.error("Supabase error:", error);
    alert("Could not load POIs – see console.");
    return;
  }

  markers.clearLayers();
  map.removeLayer(markers);

  const msg  = document.getElementById("no-results-msg");
  const list = document.getElementById("poi-list");
  list.innerHTML = "";

  if (pois.length === 0) {
    msg.classList.remove("d-none");
    msg.innerText = "😔 No POIs matched your filters.";
    return;
  }
  msg.classList.add("d-none");

  pois.forEach(poi => {
    /* ---------- map marker ---------- */
    const m = L.marker([poi.lat, poi.lng]).bindPopup(`
        <strong>${poi.place_name}</strong><br/>
        ${poi.city}, ${poi.state}<br/>
        ${poi.description || ""}<br/>
        ${(poi.tags || []).map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join("")}
    `);
    markers.addLayer(m);

    /* ---------- card list ------------ */
    const card = document.createElement("div");
    card.className = "card mb-2 shadow-sm";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title mb-1">${poi.place_name}</h5>
        <small class="text-muted">${poi.city}, ${poi.state}</small>
        <p class="mb-1">${poi.description || ""}</p>
        ${(poi.tags || []).map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join("")}
      </div>`;
    card.onclick = () => { map.setView([poi.lat, poi.lng], 12); m.openPopup(); };
    list.appendChild(card);
  });

  map.addLayer(markers);
}

/** ------------------------------------------------------------------
 * 8️⃣  EVENT WIRING & PAGE INIT
 * -----------------------------------------------------------------*/
document.getElementById("filter-form").onsubmit = e => { e.preventDefault(); loadPOIs(); };

await loadFilters();
await loadPOIs();
