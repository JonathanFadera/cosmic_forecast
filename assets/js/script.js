// API key to use openweathermap.org free weather data
let apiKey = "8d2daaec25d63d5e600a3c8c7569e546";
let urlGeocoding = `https://api.openweathermap.org/data/2.5/forecast?lat=47.823952&lon=-122.292419&appid=8d2daaec25d63d5e600a3c8c7569e546&units=imperial`;
let urlForecast5 = `https://api.openweathermap.org/data/2.5/forecast?q=Lynnwood&appid=8d2daaec25d63d5e600a3c8c7569e546&units=imperial`;

// Select html elements with document.querySelector
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const searchResults = document.querySelector("#search-results");
const searchResultList = document.querySelector("#search-results-list");
const formSelect = document.querySelector(".form-select");
const historyEl = document.querySelector("#history");
const today = document.querySelector("#today");
const forecast = document.querySelector(".forecast");
const fiveDay = document.querySelector("#five-day");
const currentLocationEl = document.querySelector("#current-location");

// Start with asking the user for their location
currentLocation();

// event listeners on search form and current location button
searchForm.addEventListener("submit", fetchGeocoding);
currentLocationEl.addEventListener("click", currentLocation);

// Function that get user input, and search the API data for the term, generate list of found locations
function fetchGeocoding(event) {
  event.preventDefault();
  clearResults();
  let searchWord = searchInput.value.trim();
  searchInput.value = "";
  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${searchWord}&limit=10&appid=${apiKey}&units=imperial`)
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        let name = data[i].name;
        let country = data[i].country;
        let state = data[i].state;
        let lat = data[i].lat;
        let lon = data[i].lon;
        let li = document.createElement("li");
        if (state) {
          li.innerHTML = `<li role="button" class="list-group-item text-bg-danger text-light fw-bold fs-5 rounded" lat="${lat}" lon="${lon}" title="lat:${lat} lon:${lon}">${name}, ${country}, ${state}</li>`;
        } else {
          li.innerHTML = `<li role="button" class="list-group-item text-bg-danger text-light fw-bold fs-5 rounded" lat="${lat}" lon="${lon}" title="lat:${lat} lon:${lon}">${name}, ${country}</li>`;
        }
        // searchResultEl.innerHTML +=  li;
        searchResultList.appendChild(li);
      }
      searchResults.innerHTML = `<h3>Results: ${data.length}</h3>`;
    });
}

// Event listener on the list items and after push the item in array; calls other functions
searchResultList.addEventListener("click", (event) => {
  if (event.target.matches("li")) {
    let location = {
      name: event.target.textContent,
      lat: event.target.getAttribute("lat"),
      lon: event.target.getAttribute("lon"),
    };

    if (
      !historyLocations.some(function (item) {
        return item.name === event.target.textContent;
      })
    ) {
      historyLocations.unshift(location);
      storeLocation();
    }
    clearResults();
    renderHistory();
    fetchCurrentWeather(location.lat, location.lon);
    fetchForecast(location.lat, location.lon);
  }
});

// Clear the search results div
function clearResults() {
  searchResults.innerHTML = "";
  searchResultList.innerHTML = "";
}

// Store the object to local storage
function storeLocation() {
  localStorage.setItem("weatherLocations", JSON.stringify(historyLocations));
}

// Remove object from array and call function to store the new array
function removeLocation(location) {
  historyLocations = historyLocations.filter((e) => e.name !== location);
  storeLocation();
}

// Render history of the searches
function renderHistory() {
  let html = "";
  for (let i = 0; i < historyLocations.length; i++) {
    const element = historyLocations[i];
    // let btn = document.createElement("button");
    // btn.textContent = element.name;
    // historyEl.appendChild(btn);
    html += `<div role="button" class="text-start bg-warning rounded position-relative p-2 w-100 mt-1" lat="${element.lat}" lon="${element.lon}">${element.name}<button type="button" class="position-absolute top-0 end-0 btn-close" aria-label="Close"></button></div>`;
  }
  historyEl.innerHTML = html;
}

// Get history of location
let historyLocations =
  JSON.parse(localStorage.getItem("weatherLocations")) || [];
renderHistory();

// Fetch current weather
function fetchCurrentWeather(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      renderCurrentWeather(data);
    });
}

// Fetch weather for next 5 days
function fetchForecast(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      renderForecast(data);
    });
}

// Create  html from the API data of the day
function renderCurrentWeather(data) {
  let name = data.name;
  let date = moment(data.dt, "X").format("MM/DD/YYYY");
  let time = moment(data.dt, "X").format("HH:mm:ss");
  let { temp, feels_like, temp_min, temp_max, pressure, humidity } = data.main;
  let sunrise = moment(data.sys.sunrise, "X").format("HH:mm:ss");
  let sunset = moment(data.sys.sunset, "X").format("HH:mm:ss");
  let { main, description, icon } = data.weather[0];
  let wind = data.wind.speed;

  let html = `
  <row><div class="card-header text-light bg-transparent"><h2>${name} (${date})</h2>Current Weather conditions updated on ${time}</div></row>
  <div id="today-cards" class="d-flex flex-wrap text-light bg-transparent">

  <div class="card text-light border-0 bg-transparent" style="max-width: 18rem;">
  <div class="card-body">
    <h2>${temp} &#8457</h2>
    <p class="card-text"><img class="mw-100" src="https://openweathermap.org/img/wn/${icon}@2x.png"></p>
    <h4 class="card-title">${main}</h4>
  </div>
  </div>

  <div class="card text-light border-0 bg-transparent" style="max-width: 18rem;">
  <div class="card-body">
    <h5 class="card-text my-4">Feels Like: ${feels_like} &#8457</h5>
    <h5 class="card-text mb-4">Max temp: ${temp_max} &#8457</h5>
    <h5 class="card-text mb-4">Min temp: ${temp_min} &#8457</h5>
    <h5 class="card-text mb-4">Sunrise: ${sunrise}</h5>
  </div>
  </div>
  <div class="card text-light border-0 bg-transparent" style="max-width: 18rem;">
  <div class="card-body">
    <h5 class="card-text my-4">Wind: ${wind} meter/sec.</h5>
    <h5 class="card-text mb-4">Humidity: ${humidity} %</h5>
    <h5 class="card-text mb-4">Pressure: ${pressure} inHg</h5>
    <h5 class="card-text mb-4">Sunset: ${sunset}</h5>
  </div>
  </div>
</div>
  `;
  today.innerHTML = html;
}

// Create the html from the API data for the next 5 days
function renderForecast(data) {
  let html = "";
  for (let i = 5; i < data.list.length; i = i + 8) {
    let { dt } = data.list[i];
    let { temp, humidity } = data.list[i].main;
    let { speed } = data.list[i].wind;
    let { icon } = data.list[i].weather[0];
    html += `
    <div class="card text-light border-0 bg-transparent col-sm-5 col-md-2 mb-3" >
    <div class="card-body">
    <p class="card-text">${moment(dt, "X").format("MM/DD/YYYY")}</p>
    <p class="card-text"><img src="https://openweathermap.org/img/wn/${icon}.png"></p>
    <p class="card-text">Temp: ${temp} &#8457</p>
    <p class="card-text">Wind: ${speed} m/s</p>
    <p class="card-text">Humidity: ${humidity} %</p>
    </div>
    </div>
    `;
  }
  forecast.innerHTML = html;
  fiveDay.textContent = "5-Day Forecast:";
}

// Event listener to delete the item or to render the weather
historyEl.addEventListener("click", (event) => {
  if (event.target.matches(".btn-close")) {
    let textToDelete = event.target.parentElement.textContent;
    console.log(textToDelete);
    removeLocation(textToDelete);
    renderHistory();
  } else {
    let lat = event.target.getAttribute("lat");
    let lon = event.target.getAttribute("lon");
    fetchCurrentWeather(lat, lon);
    fetchForecast(lat, lon);
  }
});

// Fetch the weather for next 5 days
function fetchForecast(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      renderForecast(data);
    });
}

// Get current location of the user
function currentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  fetchCurrentWeather(lat, lon);
  fetchForecast(lat, lon);
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}