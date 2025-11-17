document.getElementById("searchBtn").addEventListener("click", getForecast);

async function getForecast() {
  const city = document.getElementById("city").value.trim();
  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  try {
    // 1️⃣ Get latitude & longitude using OpenStreetMap Nominatim
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${city}&format=json&limit=1`
    );
    const geoData = await geoRes.json();
    if (geoData.length === 0) {
      document.getElementById("forecast").innerHTML = `<p>City not found!</p>`;
      document.getElementById("cropAdvice").innerHTML = "";
      return;
    }

    const { lat, lon, display_name } = geoData[0];

    // 2️⃣ Fetch 15-day forecast from Open-Meteo (with precipitation_sum)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&forecast_days=15&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    // 3️⃣ Extract data
    const days = weatherData.daily.time;
    const maxTemps = weatherData.daily.temperature_2m_max;
    const minTemps = weatherData.daily.temperature_2m_min;
    const codes = weatherData.daily.weathercode;
    const rain = weatherData.daily.precipitation_sum;

    // 🌈 Change background based on today's weather
    const todayCode = codes[0];
    setDynamicBackground(todayCode);

    // 4️⃣ Build forecast cards
    let html = `<h2>${display_name}</h2><div class="forecast-grid">`;
    for (let i = 0; i < days.length; i++) {
      html += `
        <div class="day-card">
          <h3>${formatDate(days[i])}</h3>
          <p><b>Max:</b> ${maxTemps[i]}°C</p>
          <p><b>Min:</b> ${minTemps[i]}°C</p>
          <p><b>Rain:</b> ${rain[i]} mm</p>
          <p>${getWeatherDescription(codes[i])}</p>
        </div>
      `;
    }
    html += "</div>";
    document.getElementById("forecast").innerHTML = html;

    // 5️⃣ Multi-crop + fruit recommendation logic
    const avgTemp = maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length;
    const totalRain = rain.reduce((a, b) => a + b, 0);

    let recommendations = [];

    // ==== CROPS ====
    if (avgTemp >= 24 && totalRain >= 150) {
      recommendations.push({
        name: "Rice 🌾",
        reason: "Hot temperature + heavy rainfall supports rice growth."
      });
    }

    if (avgTemp >= 20 && avgTemp <= 32 && totalRain >= 60) {
      recommendations.push({
        name: "Corn 🌽",
        reason: "Warm climate and moderate rainfall."
      });
    }

    if (avgTemp >= 10 && avgTemp <= 25 && totalRain <= 60) {
      recommendations.push({
        name: "Wheat 🌾",
        reason: "Mild temperature and low rainfall."
      });
    }

    if (avgTemp >= 15 && avgTemp <= 20 && totalRain >= 50 && totalRain <= 100) {
      recommendations.push({
        name: "Potato 🥔",
        reason: "Cool temperature + moderate rainfall."
      });
    }

    if (avgTemp >= 20 && avgTemp <= 30 && totalRain >= 30 && totalRain <= 60) {
      recommendations.push({
        name: "Sunflower 🌻",
        reason: "Can tolerate heat and requires low–medium rain."
      });
    }

    // ==== FRUITS ====
    if (avgTemp >= 20 && avgTemp <= 35 && totalRain >= 100) {
      recommendations.push({
        name: "Mango 🥭",
        reason: "Thrives in hot temperature with good rainfall."
      });
    }

    if (avgTemp >= 15 && avgTemp <= 25 && totalRain >= 70) {
      recommendations.push({
        name: "Banana 🍌",
        reason: "Prefers warm temperature and humid climate."
      });
    }

    if (avgTemp >= 10 && avgTemp <= 20 && totalRain <= 50) {
      recommendations.push({
        name: "Apple 🍎",
        reason: "Cool temperature and low rainfall."
      });
    }

    if (avgTemp >= 18 && avgTemp <= 28 && totalRain >= 50 && totalRain <= 120) {
      recommendations.push({
        name: "Orange 🍊",
        reason: "Warm climate with moderate rainfall."
      });
    }

    // If NOTHING matched
    if (recommendations.length === 0) {
      recommendations.push({
        name: "No strong recommendation",
        reason: "Weather is not strongly suitable for common crops or fruits."
      });
    }

    // Render all recommendations safely (NO let-html errors)
    renderRecommendations(recommendations, avgTemp, totalRain);

  } catch (error) {
    console.error("Error fetching forecast:", error);
    document.getElementById("forecast").innerHTML = `<p>Unable to fetch forecast data.</p>`;
    document.getElementById("cropAdvice").innerHTML = "";
  }
}

// ======================
// Helper renderer (NO CSS CHANGE)
// ======================
function renderRecommendations(recommendations, avgTemp, totalRain) {
  const container = document.getElementById("cropAdvice");
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "crop-card";

  const h2 = document.createElement("h2");
  h2.textContent = "Recommended Crops & Fruits:";
  card.appendChild(h2);

  const p1 = document.createElement("p");
  p1.innerHTML = `<b>Avg Temp:</b> ${avgTemp.toFixed(1)}°C`;
  card.appendChild(p1);

  const p2 = document.createElement("p");
  p2.innerHTML = `<b>Total Rain:</b> ${totalRain.toFixed(1)} mm`;
  card.appendChild(p2);

  card.appendChild(document.createElement("hr"));

  recommendations.forEach(item => {
    const cropName = document.createElement("p");
    cropName.innerHTML = `<b>${item.name}</b>`;
    card.appendChild(cropName);

    const reason = document.createElement("p");
    reason.textContent = item.reason;
    card.appendChild(reason);

    card.appendChild(document.createElement("br"));
  });

  container.appendChild(card);
}

// ======================
// OTHER HELPERS
// ======================

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getWeatherDescription(code) {
  const map = {
    0: "☀️ Clear sky",
    1: "🌤️ Mainly clear",
    2: "⛅ Partly cloudy",
    3: "☁️ Overcast",
    45: "🌫️ Fog",
    48: "🌫️ Depositing rime fog",
    51: "🌦️ Light drizzle",
    53: "🌦️ Moderate drizzle",
    55: "🌧️ Dense drizzle",
    56: "🌧️ Light freezing drizzle",
    57: "🌧️ Dense freezing drizzle",
    61: "🌧️ Slight rain",
    63: "🌧️ Moderate rain",
    65: "🌧️ Heavy rain",
    66: "🌨️ Light freezing rain",
    67: "🌨️ Heavy freezing rain",
    71: "🌨️ Slight snow",
    73: "🌨️ Moderate snow",
    75: "❄️ Heavy snow",
    77: "🌨️ Snow grains",
    80: "🌦️ Slight rain showers",
    81: "🌧️ Moderate rain showers",
    82: "🌧️ Violent rain showers",
    85: "🌨️ Slight snow showers",
    86: "🌨️ Heavy snow showers",
    95: "⛈️ Thunderstorm",
    96: "⛈️ Thunderstorm with hail",
    99: "🌩️ Severe thunderstorm with hail"
  };
  return map[code] || "🌈 Unknown";
}

function setDynamicBackground(code) {
  const body = document.body;
  body.removeAttribute("class");

  if ([0, 1].includes(code)) body.classList.add("sunny");
  else if ([2, 3].includes(code)) body.classList.add("cloudy");
  else if ([45, 48].includes(code)) body.classList.add("foggy");
  else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) body.classList.add("rainy");
  else if ([71, 73, 75, 77, 85, 86].includes(code)) body.classList.add("snowy");
  else if ([95, 96, 99].includes(code)) body.classList.add("stormy");
  else body.classList.add("default");
}
