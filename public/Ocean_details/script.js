// Set default date to today
document.addEventListener('DOMContentLoaded', function() {
  const dateInput1 = document.getElementById('date1');
  const dateInput2 = document.getElementById('date2');
  const today = new Date().toISOString().split('T')[0];
  if (dateInput1) dateInput1.value = today;
  if (dateInput2) dateInput2.value = today;
  
  // Load popular places
  loadPopularPlaces();
  
  // Add click outside handler to hide suggestions
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-container')) {
      hideSuggestions();
    }
  });
});

// Tab switching functionality
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab content
  document.getElementById(tabName + '-tab').classList.add('active');
  
  // Add active class to clicked button
  event.target.classList.add('active');
  
  // Clear suggestions when switching tabs
  hideSuggestions();
}

// Place search functionality
let searchTimeout;
let currentSuggestions = [];

async function searchPlaces() {
  const query = document.getElementById('placeName').value.trim();
  
  if (query.length < 2) {
    hideSuggestions();
    return;
  }
  
  // Clear previous timeout
  clearTimeout(searchTimeout);
  
  // Set new timeout to avoid too many requests
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/search-places?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        currentSuggestions = data.places;
        showSuggestions(data.places);
      } else {
        hideSuggestions();
      }
    } catch (error) {
      console.error('Search error:', error);
      hideSuggestions();
    }
  }, 300);
}

function showSuggestions(places) {
  const suggestionsDiv = document.getElementById('placeSuggestions');
  
  if (places.length === 0) {
    hideSuggestions();
    return;
  }
  
  suggestionsDiv.innerHTML = places.map(place => `
    <div class="suggestion-item" onclick="selectPlace('${place.name}', ${place.lat}, ${place.lon})">
      <div class="suggestion-name">${place.name}</div>
      <div class="suggestion-coords">${place.lat.toFixed(4)}, ${place.lon.toFixed(4)}</div>
    </div>
  `).join('');
  
  suggestionsDiv.style.display = 'block';
}

function hideSuggestions() {
  document.getElementById('placeSuggestions').style.display = 'none';
}

function selectPlace(name, lat, lon) {
  document.getElementById('placeName').value = name;
  hideSuggestions();
}

function handlePlaceKeydown(event) {
  if (event.key === 'Escape') {
    hideSuggestions();
  }
}

// Load popular places
async function loadPopularPlaces() {
  try {
    const response = await fetch('http://127.0.0.1:5000/popular-places');
    const data = await response.json();
    
    if (data.success) {
      const placesGrid = document.getElementById('popularPlaces');
      placesGrid.innerHTML = data.places.map(place => `
        <div class="popular-place-item" onclick="selectPopularPlace('${place.name}', ${place.lat}, ${place.lon})">
          <div class="popular-place-name">${place.name}</div>
          <div class="popular-place-coords">${place.lat.toFixed(2)}, ${place.lon.toFixed(2)}</div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading popular places:', error);
  }
}

function selectPopularPlace(name, lat, lon) {
  // Switch to place tab
  switchTab('place');
  
  // Fill in the place name
  document.getElementById('placeName').value = name;
  
  // Hide suggestions
  hideSuggestions();
}

// Fetch data by place name
async function fetchDataByPlace() {
  const placeName = document.getElementById('placeName').value.trim();
  const date = document.getElementById('date1').value;
  
  if (!placeName) {
    showError("Please enter a place name.");
    return;
  }
  
  if (!date) {
    showError("Please select a date.");
    return;
  }
  
  showLoading();
  
  try {
    // First geocode the place name
    const geocodeResponse = await fetch(`http://127.0.0.1:5000/geocode?place=${encodeURIComponent(placeName)}`);
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.success) {
      showError(geocodeData.message || "Could not find the specified place.");
      return;
    }
    
    // Now fetch ocean data using the coordinates
    const response = await fetch(`http://127.0.0.1:5000/ocean-data?lat=${geocodeData.latitude}&lon=${geocodeData.longitude}&date=${date}`);
    const data = await response.json();
    
    if (data.error) {
      showError(data.error);
      return;
    }
    
    // Add place information to the data
    data.place_info = {
      name: geocodeData.place_name,
      country: geocodeData.country,
      region: geocodeData.region,
      city: geocodeData.city
    };
    
    displayResults(data);
  } catch (err) {
    showError(`Network error: ${err.message}`);
  }
}

async function fetchData() {
  const lat = document.getElementById("lat").value;
  const lon = document.getElementById("lon").value;
  const date = document.getElementById("date2").value;

  if (!lat || !lon || !date) {
    showError("Please enter latitude, longitude, and date.");
    return;
  }

  // Validate coordinates
  if (lat < -90 || lat > 90) {
    showError("Latitude must be between -90 and 90 degrees.");
    return;
  }
  if (lon < -180 || lon > 180) {
    showError("Longitude must be between -180 and 180 degrees.");
    return;
  }

  showLoading();
  
  try {
    const response = await fetch(`http://127.0.0.1:5000/ocean-data?lat=${lat}&lon=${lon}&date=${date}`);
    const data = await response.json();
    
    if (data.error) {
      showError(data.error);
      return;
    }
    
    displayResults(data);
  } catch (err) {
    showError(`Network error: ${err.message}`);
  }
}

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("result").innerHTML = "";
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

function showError(message) {
  hideLoading();
  document.getElementById("result").innerHTML = `
    <div class="error">
      <i class="fas fa-exclamation-triangle"></i> ${message}
    </div>
  `;
}

function displayResults(data) {
  hideLoading();
  
  const coordinates = data.coordinates;
  const temperature = data.temperature;
  const salinity = data.salinity;
  const currents = data.ocean_currents;
  const waves = data.wave_data;
  const bathymetry = data.bathymetry;
  const placeInfo = data.place_info;

  // Create location header
  let locationHeader = `<h2><i class="fas fa-map-marker-alt"></i> Ocean Data for (${coordinates.latitude}, ${coordinates.longitude}) on ${coordinates.date}</h2>`;
  
  if (placeInfo) {
    locationHeader = `<h2><i class="fas fa-map-marker-alt"></i> Ocean Data for ${placeInfo.name}</h2>`;
    if (placeInfo.country || placeInfo.region || placeInfo.city) {
      const locationParts = [placeInfo.city, placeInfo.region, placeInfo.country].filter(Boolean);
      locationHeader += `<p class="location-details"><i class="fas fa-globe"></i> ${locationParts.join(', ')}</p>`;
    }
    locationHeader += `<p class="coordinates-info"><i class="fas fa-crosshairs"></i> Coordinates: ${coordinates.latitude}, ${coordinates.longitude} | Date: ${coordinates.date}</p>`;
  }

  document.getElementById("result").innerHTML = `
    <div class="result-container">
      ${locationHeader}
      
      <div class="data-status-notice" style="padding-bottom: 4px;">
        <div class="notice-content">
          <i class="fas fa-info-circle"></i>
          <div>
            <small style="font-size: 0.95rem;"><span style="color: #1e88e5;">Data Status</span>: This system attempts to fetch real ocean data from NOAA CoastWatch, OpenWeatherMap, Meteomatics and World Ocean Database. 
            When real data is unavailable, it could be because geo coordinates are on land or latest data are yet to be updated.</small>
            <br><small></small>
          </div>
        </div>
      </div>
      
      <div class="data-section">
        <h3><i class="fas fa-thermometer-half"></i> Temperature</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Sea Surface Temperature</h4>
            <div class="value">${formatValue(temperature.sea_surface_temperature)}</div>
            <div class="unit">${temperature.unit || 'N/A'}</div>
            <div class="source">${temperature.source === 'Probable' ? 'Probable' : `Source: ${temperature.source || 'N/A'}`} ${temperature.real_data ? ' Real' : ' Simulated'}</div>
          </div>
        </div>
      </div>

      <div class="data-section">
        <h3><i class="fas fa-tint"></i> Salinity</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Ocean Salinity</h4>
            <div class="value">${formatValue(salinity.salinity)}</div>
            <div class="unit">${salinity.unit || 'N/A'}</div>
            <div class="source">${salinity.source === 'Probable' ? 'Probable' : `Source: ${salinity.source || 'N/A'}`} ${salinity.real_data ? ' Real' : ' Simulated'}</div>
          </div>
        </div>
      </div>

      
      
      <div id="extrasSection"></div>

      <div class="data-section">
        <h3><i class="fas fa-wind"></i> Ocean Currents</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Current Speed</h4>
            <div class="value">${formatValue(currents.speed)}</div>
            <div class="unit">${currents.unit || 'm/s'}</div>
            <div class="source">${currents.source === 'Probable' ? 'Probable' : `Source: ${currents.source || 'N/A'}`}</div>
          </div>
          <div class="data-card">
            <h4>Current Direction</h4>
            <div class="value">${formatAngle(currents.direction)}</div>
            <div class="unit">Degrees from North</div>
            <div class="source">${currents.source === 'Probable' ? 'Probable' : `Source: ${currents.source || 'N/A'}`}</div>
          </div>
          <div class="data-card">
            <h4>Westward Velocity</h4>
            <div class="value">${formatValue(currents.eastward_velocity)}</div>
            <div class="unit">m/s</div>
            <div class="source">${currents.source === 'Probable' ? 'Probable' : `Source: ${currents.source || 'N/A'}`}</div>
          </div>
          <div class="data-card">
            <h4>Northward Velocity</h4>
            <div class="value">${formatValue(currents.northward_velocity)}</div>
            <div class="unit">m/s</div>
            <div class="source">${currents.source === 'Probable' ? 'Probable' : `Source: ${currents.source || 'N/A'}`}</div>
          </div>
        </div>
      </div>

      

      <div class="data-section">
        <h3><i class="fas fa-wave-square"></i> Wave Data</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Significant Wave Height</h4>
            <div class="value">${formatValue(waves.significant_wave_height)}</div>
            <div class="unit">meters</div>
            <div class="source">${waves.source === 'Probable' ? 'Probable' : `Source: ${waves.source || 'N/A'}`} ${waves.real_data ? 'Real' : 'Simulated'}</div>
          </div>
          <div class="data-card">
            <h4>Wave Period</h4>
            <div class="value">${formatValue(waves.wave_period)}</div>
            <div class="unit">seconds</div>
            <div class="source">${waves.source === 'Probable' ? 'Probable' : `Source: ${waves.source || 'N/A'}`} ${waves.real_data ? 'Real' : 'Simulated'}</div>
          </div>
          <div class="data-card">
            <h4>Wave Direction</h4>
            <div class="value">${formatAngle(waves.wave_direction)}</div>
            <div class="unit">degrees</div>
            <div class="source">${waves.source === 'Probable' ? 'Probable' : `Source: ${waves.source || 'N/A'}`} ${waves.real_data ? 'Real' : 'Simulated'}</div>
          </div>
        </div>
        ${waves.note ? `<p style="margin-top: 15px; padding: 10px; background: #e8f4fd; border-radius: 8px; color: #2c3e50;"><i class="fas fa-info-circle"></i> ${waves.note}</p>` : ''}
      </div>

      <div class="data-section">
        <h3><i class="fas fa-mountain"></i> Bathymetry</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Sea Floor Depth</h4>
            <div class="value">${formatValue(bathymetry.depth)}</div>
            <div class="unit">${bathymetry.unit || 'meters'}</div>
            <div class="source">${bathymetry.source === 'Probable' ? 'Probable' : `Source: ${bathymetry.source || 'N/A'}`} ${bathymetry.real_data ? 'Real' : 'Simulated'}</div>
          </div>
        </div>
        ${bathymetry.note ? `<p style="margin-top: 15px; padding: 10px; background: #e8f4fd; border-radius: 8px; color: #2c3e50;"><i class="fas fa-info-circle"></i> ${bathymetry.note}</p>` : ''}
      </div>
    </div>
  `;

  // After rendering base results, fetch extras and render
  fetchExtrasAndRender(coordinates.latitude, coordinates.longitude, coordinates.date);
}

async function fetchExtrasAndRender(lat, lon, date) {
  try {
    const resp = await fetch(`http://127.0.0.1:5000/extras?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&date=${encodeURIComponent(date)}`);
    const j = await resp.json();
    const section = document.getElementById('extrasSection');
    if (!j || j.success === false) {
      section.innerHTML = '';
      return;
    }
    section.innerHTML = `
      <div class="data-section">
        <h3><i class="fas fa-sun"></i> Atmosphere & Radiation</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Precipitation (24h)</h4>
            <div class="value">${formatValue(j.precipitation)}</div>
            <div class="unit">${j.precipitation_unit || 'mm'}</div>
            <div class="source">Source: ${j.precipitation_source || 'N/A'}</div>
          </div>
          <div class="data-card">
            <h4>Mean Sea Level Pressure</h4>
            <div class="value">${formatValue(j.pressure)}</div>
            <div class="unit">${j.pressure_unit || 'hPa'}</div>
            <div class="source">Source: ${j.pressure_source || 'N/A'}</div>
          </div>
          <div class="data-card">
            <h4>UV Index</h4>
            <div class="value">${formatValue(j.uv_index)} ${j.uv_index === 0 ? '<small style="color:#7f8c8d;">night time</small>' : ''}</div>
            <div class="unit">index</div>
            <div class="source">Source: ${j.uv_index_source || 'N/A'}</div>
          </div>
          <div class="data-card">
            <h4>Global Radiation</h4>
            <div class="value">${formatValue(j.global_radiation)} ${j.global_radiation === 0 ? '<small style="color:#7f8c8d;">night time</small>' : ''}</div>
            <div class="unit">${j.global_radiation_unit || 'W/m²'}</div>
            <div class="source">Source: ${j.global_radiation_source || 'N/A'}</div>
          </div>
          <div class="data-card">
            <h4>Satellite RGB Index</h4>
            <div class="value">${formatValue(j.satellite_rgb_index)} ${j.satellite_rgb_index === 0 ? '<small style="color:#7f8c8d;">night time</small>' : ''}</div>
            <div class="unit">index</div>
            <div class="source">Source: ${j.satellite_rgb_index_source || 'N/A'}</div>
          </div>
          <div class="data-card">
            <h4>PM10 Particulate Matter</h4>
            <div class="value">${formatValue(j.pm10)}</div>
            <div class="unit">${j.pm10_unit || 'µg/m³'}</div>
            <div class="source">Source: ${j.pm10_source || 'N/A'}</div>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    // Fail silently; extras are optional
  }
}

const LAND_TEXT = 'Coordinates on land';

function isUnavailableValue(value) {
  if (value === null || value === undefined) return false; // keep null/undefined handling separate if needed
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value === -666 || value === -666.0;
  }
  const str = String(value).trim();
  return str === 'N/A' || str === '-666' || str === '-666.00' || str === '-666.0';
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return `<small style="color:#94a3b8; font-size:0.75rem;">not available, coordinated maybe on land</small>`;
  }
  if (isUnavailableValue(value)) {
    return `<small style=\"color:#94a3b8; font-size:0.75rem;\">not available, coordinated maybe on land</small>`;
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return value;
}

function formatAngle(value) {
  if (value === null || value === undefined || isUnavailableValue(value)) {
    return `<small style="color:#94a3b8; font-size:0.75rem;">not available, coordinated maybe on land</small>`;
  }
  const v = typeof value === 'number' ? value.toFixed(2) : String(value);
  return `${v}°`;
}
  