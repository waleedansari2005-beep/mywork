script.js
document.getElementById("searchBtn").addEventListener("click", getForecast);

async function getForecast() {
  const city = document.getElementById("city").value.trim();
  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  try {
    // 1️⃣ Get latitude & longitude using OpenStreetMap Nominatim
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json&limit=1`);
    const geoData = await geoRes.json();
    if (geoData.length === 0) {
      document.getElementById("forecast").innerHTML = `<p>City not found!</p>`;
      return;
    }

    const { lat, lon, display_name } = geoData[0];

    // 2️⃣ Fetch 15-day forecast from Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=15&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    // 3️⃣ Display results
    const days = weatherData.daily.time;
    const maxTemps = weatherData.daily.temperature_2m_max;
    const minTemps = weatherData.daily.temperature_2m_min;
    const codes = weatherData.daily.weathercode;

    let html = `<h2>${display_name}</h2><div class="forecast-grid">`;

    for (let i = 0; i < days.length; i++) {
      html += `
        <div class="day-card">
          <h3>${formatDate(days[i])}</h3>
          <p><b>Max:</b> ${maxTemps[i]}°C</p>
          <p><b>Min:</b> ${minTemps[i]}°C</p>
          <p>${getWeatherDescription(codes[i])}</p>
        </div>
      `;
    }
    html += "</div>";
    document.getElementById("forecast").innerHTML = html;

  } catch (error) {
    console.error("Error fetching forecast:", error);
    document.getElementById("forecast").innerHTML = `<p>Unable to fetch forecast data.</p>`;
  }
}

// Helper to make date look nicer (e.g., "2025-11-09" → "Nov 9")
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Weather code → description mapping

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
    body.className = ""; // Reset previous background
  
    if ([0, 1].includes(code)) body.classList.add("sunny");
    else if ([2, 3].includes(code)) body.classList.add("cloudy");
    else if ([45, 48].includes(code)) body.classList.add("foggy");
    else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) body.classList.add("rainy");
    else if ([71, 73, 75, 77, 85, 86].includes(code)) body.classList.add("snowy");
    else if ([95, 96, 99].includes(code)) body.classList.add("stormy");
    else body.classList.add("default");
  }
setDynamicBackground(data.daily.weathercode[0]);
  









//style.css
/* 🌈 Background & Global Style */
body {
    font-family: "Poppins", sans-serif;
    background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
    min-height: 100vh;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    color: #fff;
  }
  
  /* 🧭 Main Container */
  .container {
    margin-top: 60px;
    text-align: center;
    width: 100%;
    max-width: 1200px;
  }
  
  h1 {
    font-size: 2.2rem;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
    margin-bottom: 20px;
  }
  
  /* 🔍 Search Bar */
  input {
    padding: 12px 15px;
    width: 250px;
    border-radius: 10px;
    border: none;
    outline: none;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 1rem;
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }
  
  input::placeholder {
    color: #e0e0e0;
  }
  
  button {
    padding: 12px 20px;
    margin-left: 10px;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.3s;
  }
  
  button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(37, 117, 252, 0.4);
  }
  
  /* 🌤️ Forecast Grid */
  .forecast-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    justify-items: center;
    align-items: stretch;
    margin-top: 40px;
    padding: 0 40px;
    perspective: 1000px; /* 3D depth */
  }
  
  /* 🧊 Weather Cards */
  .day-card {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    color: #fff;
    width: 180px;
    height: 160px;
    padding: 15px;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
    transform-style: preserve-3d;
  }
  
  .day-card:hover {
    transform: rotateY(10deg) rotateX(5deg) scale(1.07);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  }
  
  /* 🕓 Card Content */
  .day-card h3 {
    margin: 5px 0 10px;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .day-card p {
    margin: 4px 0;
    font-size: 0.95rem;
  }
  
  /* 💫 “Today” Highlight (first card) */
  .day-card:first-child {
    border: 2px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 5px 25px rgba(0, 0, 0, 0.3);
    transform: scale(1.05);
  }
  
  /* 📱 Responsive */
  @media (max-width: 900px) {
    .forecast-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 600px) {
    .forecast-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  
    .day-card {
      width: 140px;
      height: 140px;
    }
  }
  
/* 🌤️ Dynamic Backgrounds */

body.sunny {
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    animation: sunnyMove 15s ease infinite alternate;
  }
  
  @keyframes sunnyMove {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  
  body.cloudy {
    background: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
    background-size: 200% 200%;
    animation: cloudDrift 20s ease infinite alternate;
  }
  
  @keyframes cloudDrift {
    0% { background-position: left top; }
    100% { background-position: right bottom; }
  }
  
  body.rainy {
    background: linear-gradient(160deg, #283e51 0%, #485563 100%);
    overflow: hidden;
  }
  
  body.rainy::before {
    content: "";
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-image: url('https://i.imgur.com/n6vR9iV.png'); /* Transparent rain texture */
    animation: rainFall 1s linear infinite;
    opacity: 0.3;
  }
  
  @keyframes rainFall {
    0% { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }
  
  body.snowy {
    background: linear-gradient(180deg, #e0eafc 0%, #cfdef3 100%);
    overflow: hidden;
  }
  
  body.snowy::before {
    content: "";
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-image: url('https://i.imgur.com/WFz4JfG.png'); /* snow particles */
    animation: snowFall 10s linear infinite;
    opacity: 0.4;
  }
  
  @keyframes snowFall {
    0% { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }
  
  body.foggy {
    background: linear-gradient(180deg, #bdc3c7 0%, #2c3e50 100%);
    animation: fogMove 20s ease-in-out infinite alternate;
  }
  
  @keyframes fogMove {
    0% { filter: brightness(0.9); }
    100% { filter: brightness(1.1); }
  }
  
  body.stormy {
    background: linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
    animation: lightning 6s infinite;
  }
  
  @keyframes lightning {
    0%, 97%, 100% { filter: brightness(1); }
    98% { filter: brightness(2); }
    99% { filter: brightness(0.6); }
  }
  
  body.default {
    background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
  }
  


//index
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>16-Day Weather Forecast</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>🌤️ 16-Day Weather Forecast</h1>
    <input type="text" id="city" placeholder="Enter city name">
    <button id="searchBtn">Get Forecast</button>

    <div id="forecast"></div>
  </div>

  <script src="script.js"></script>
</body>
</html>
