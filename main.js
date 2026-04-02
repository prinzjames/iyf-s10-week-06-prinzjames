const API_KEY = "6746d9575901ed7f7b4cb9ef8269720c";

let currentUnit = "metric";

const form = document.getElementById("searchForm");
const input = document.getElementById("cityInput");
const historyList = document.getElementById("history");

const weatherDiv = document.getElementById("weather");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");

// Toggle °C / °F
document.getElementById("toggleUnit").onclick = () => {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
};

// Location button
document.getElementById("locationBtn").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  });
};

// Form submit
form.addEventListener("submit", e => {
  e.preventDefault();
  const city = input.value;
  saveHistory(city);
  fetchWeather(city);
});

// Fetch by city
async function fetchWeather(city) {
  showLoading();

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`
    );

    const data = await res.json();

    if (!res.ok) throw new Error("City not found");

    const forecast = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`
    ).then(r => r.json());

    displayWeather(data);
    displayForecast(forecast);
    drawChart(forecast);
    aiAdvice(data);

  } catch (err) {
    showError(err.message);
  }
}

// Fetch by coordinates
async function fetchWeatherByCoords(lat, lon) {
  showLoading();

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
  );

  const data = await res.json();

  displayWeather(data);
}

// Display current weather
function displayWeather(data) {
  loading.classList.add("hidden");
  weatherDiv.classList.remove("hidden");

  document.getElementById("cityName").textContent = data.name;

  document.getElementById("temp").textContent =
    `${data.main.temp} ${currentUnit === "metric" ? "°C" : "°F"}`;

  document.getElementById("description").textContent =
    data.weather[0].description;

  document.getElementById("details").innerHTML = `
    Humidity: ${data.main.humidity}% |
    Wind: ${data.wind.speed} m/s <br>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
  `;
}

// Display forecast
function displayForecast(data) {
  const forecastDiv = document.getElementById("forecast");

  const next = data.list.slice(0, 5)
    .map(item =>
      `${new Date(item.dt_txt).getHours()}h → ${item.main.temp}°`
    )
    .join("<br>");

  forecastDiv.innerHTML = next;
}

// Draw chart
function drawChart(data) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const temps = data.list.slice(0, 10).map(i => i.main.temp);

  temps.forEach((temp, i) => {
    ctx.fillRect(i * 25, 150 - temp * 2, 15, temp * 2);
  });
}

// AI advice
function aiAdvice(data) {
  let msg = "";

  if (data.main.temp > 30) msg = "🔥 Very hot! Stay hydrated.";
  else if (data.main.temp < 15) msg = "🥶 Cold! Wear warm clothes.";
  else msg = "🌤 Comfortable weather.";

  if (data.wind.speed > 8) msg += " 💨 Windy!";
  if (data.weather[0].main === "Rain") msg += " ☔ Rain expected!";

  document.getElementById("aiAdvice").textContent = msg;
}

// Loading
function showLoading() {
  loading.classList.remove("hidden");
  weatherDiv.classList.add("hidden");
  errorDiv.classList.add("hidden");
}

// Error
function showError(msg) {
  loading.classList.add("hidden");
  errorDiv.textContent = msg;
  errorDiv.classList.remove("hidden");
}

// History
function saveHistory(city) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  historyList.innerHTML = history
    .map(city => `<li onclick="fetchWeather('${city}')">${city}</li>`)
    .join("");
}

renderHistory();