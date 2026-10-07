//=====================
//WEATHER APPLICATION
//====================

// Get elements from the HTML document

const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const refreshButton = document.getElementById('refresh-button');
const locationButton = document.getElementById('location-button');

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const weatherContent = document.getElementById('weather-content');

const locationName = document.getElementById('location-name');
const currentDate = document.getElementById('current-date');

const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');

const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const rain = document.getElementById('rain');
const pressure = document.getElementById('pressure');

const hourlyForecast = document.getElementById('hourly-forecast');
const dailyForecast = document.getElementById('daily-forecast');

const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');

// WEATHER CODE INFO

function getWeatherInfo(code){
    const weatherCodes = {
        0:{
            description:'Clear sky',
            icon: '☀️'
        },
        1:{
            description: 'Mainly clear',
            icon: '🌤️'
        },
        2:{
            description: 'Partly cloudy',
            icon: '⛅'
        },
        3:{
            description: 'Overcast',
            icon: '☁️'
        },
        45:{
            description: 'Fog',
            icon: '🌫️'
        },
        48:{
            description: 'Deposing rime fog',
            icon: '🌫️'
        },
        51:{
            description: 'Light drizzle',
            icon: '🌦️'
        },
        53:{
            description: 'Moderate drizzle',
            icon: '🌦️'
        },
        55:{
            description: 'Dense drizzle',
            icon: '🌧️'
        },
        56:{
            description: 'Light freezing drizzle',
            icon: '🌧️'
        },
        57:{
            description: 'Dense freezing drizzle',
            icon: '🌧️'
        },
        61:{
            description: 'Light rain',
            icon: '🌧️'
        },
        63:{
            description: 'Moderate rain',
            icon: '🌧️'
        },
        65:{
            description: 'Heavy rain',
            icon: '🌧️'
        },
        66:{
            description: 'Light freezing rain',
            icon: '🌧️'
        },
        67:{
            description: 'Heavy freezing rain',
            icon: '🌧️'
        },
        71:{
            description: 'Light snow',
            icon: '🌨️'
        },
        73:{
            description: 'Moderate snow',
            icon: '🌨️'
        },
        75:{
            description: 'Heavy snow',
            icon: '❄️'
        },
        77:{
            description: 'Snow grains',
            icon: '❄️'
        },
        80:{
            description: 'Light rain showers',
            icon: '🌦️'
        },
        81:{
            description: 'Moderate rain showers',
            icon: '🌧️'
        },
        82:{
            description: 'Violent rain showers',
            icon: '⛈️'
        },
        85:{
            description: 'Light snow showers',
            icon: '🌨️'
        },
        86:{
            description: 'Heavy snow showers',
            icon: '❄️'
        },
        95:{
            description: 'Thunderstorm',
            icon: '⛈️'
        },
        96:{
            description: 'Thunderstorm with hail',
            icon: '⛈️'
        },
        99:{
            description: 'Thunderstrom with heavy hail',
            icon: '⛈️'
        }
    };

    return weatherCodes(code) || {
        description: 'Unknown weather',
        icon: '🌤️'
    };
}

//SHOW LOADING STATE

function showLoading(){
    loadingElement.classList.remove('hidden');

    weatherContent.classList.add('loading-content');
}

//HIDE LOADING CONTENT

function hideLoading(){
    loadingElement.classList.add('hidden');

    weatherContent.classList.remove('loading-content');
}

//SHOW ERROR MESSAGE

function showError(message){
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

//HIDE ERROR MESSAGE

function hideError(){
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
}

//FORMAT CURRENT DATE

function displayCurrentDate(){
    const date = new Date();
    const formattedDate = dateLocalDateString(
        undefined,
        {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    );

    currentDate.textContent = formattedDate;
}

//FORMAT TIME

function formatTime(dateTime){
    const date = new Date(dateTime);

    return dateLocalTimeString(
        undefined,
        {
            hour: 'numeric',
            minute: '2-digit'
        }
    );
}

//FORMAT DAY

function formatDay(dateString, index){
    if(index===0){
        return 'Today';
    }

    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString(
        undefined,
        {
            weekday: 'short'
        }
    );
}

//FETCH WEATHER FROM FLASK
async function fetchWeather(city){
    if (!city || city.trim()===''){
        showError('Please enter a city name.');

        return;
    }

    showLoading();

    hideError();

    try{
        const response = await fetch(
            `/api/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        //Check if Flask returned an error

        if (!response.ok){
            throw new Error(
                data.error || 'Unable to retrieve weather information.'
            );
        }

        //Display weather information

        displayWeather(data);
    }catch (error){
        console.error('Weather error', error);

        showError(
            error.message || 'Something went wrong while retrieving the weather.'
        );
    }finally{
       hideLoading(); 
    }
}

//DISPLAY WEATHER

function displayWeather(data){
    const current = data.current;
    const location = data.location;

    //LOCATION

    locationName.textContent = `${location.city}, ${location.country}`;

    //CURRENT DATE

    displayCurrentDate();

    //CURRENT WEATHER

    const weatherInfo = getWeatherInfo(current.weather_code);
    temperature.textContent = Math.round(current.temperature_2m);

    feelsLike.textContent = Math.round(current.apparent_temperature);

    weatherDescription.textContent = weatherInfo.description;

    weatherIcon.textContent = weatherInfo.icon;

    //WEATHER STATS

    humidity.textContent = current.relative_humidity_2m;

    windSpeed.textContent = Math.round(current.wind_speed_10m);

    rain.textContent = current.precipitation;

    pressure.textContent = Math.round(current.surface_pressure);

    //HOURLY FORECAST 

    displayHourlyForecast(data.hourly);

    //DAILY FORECAST

    displayDailyForecast(data.daily);
    
    //SUNRISE AND SUNSET

    sunrise.textContent = formatTime(data.daily.sunrise[0]);

    sunset.textContent = formatTime(data.daily.sunset[0]);
}

//HOURLY FORECAST

function displayHourlyForecast(hourly){
    hourlyForecast.innerHTML = '';

    const currentTime = new Date();

    let displayedHours = 0;

    for (let i = 0; i < hourly.time.length; i++){
        const forecastTime = new Date(hourly.time[i]);

        //Only show future hours

        if (forecastTime < currentTime){
            continue;
        }

        if (displayedHours >= 12){
            break;
        }

        const weatherInfo = getWeatherInfo(hourly.weather_code[i]);
        const hourCard = document.createElement('div');

        hourCard.className = 'hour-card';

        hourCard.innerHTML =`<p class='hour-time'>${displayedHours === 0
            ? 'Now' : formatTime(hourly.time[i])}</p><div class='hour-icon'>${weatherInfo.icon}</div></><p class='hour-temperature'>${Math.round(hourly.temperature_2m[i])}°C</p><p class='rain-probability'>💧 ${hourly.precipitation_probability[i] ?? 0}%</p>`;

            hourlyForecast.appendChild(hourCard);

            displayedHours++;
    }
}

//DAILY FORECAST

function displayDailyForecast(daily){
    dailyForecast.innerHTML = '';

    for (let i = 0; i < daily.time.length; i++){
        const weatherInfo = getWeatherInfo(daily.weather_code[i]);

        const dayCard = document.createElement('div');

        dayCard.className = 'day-card';

        dayCard.innerHTML = `
            <div class = 'day-name'>${formatDay(daily.time[i], i)}</div>
            <div class = 'day-icon'>${weatherInfo.icon}</div>
            <div class = 'day-description'>${weatherInfo.description}</div>
            <div class = 'day-temperatures'>
                <strong>${Math.round(
                    daily.temperature_2m_max[i]
                )}°C</strong>

                <span>${Math.round(
                    daily.temperature_2m_min[i]
                )}°C </span>
            </div>

            <div class = 'day-rain'>💧 ${daily.precipitation_probability_max[i] ?? 0}%</div>
        `;

        dailyForecast.appendChild(dayCard);
    }
}

//SEARCH FORM

weatherForm.addEventListener(
    'submit',
    function (event){
        event.preventDefault();

        const city = cityInput.ariaValueMax.trim();

        if (!city){
            showError('Please enter a city name.');

            return;
        }
        fetchWeather(city);
    }
);

//REFRESH WEATHER

refreshButton.addEventListener(
    'click',
    function(){
        const city = locationName.textContent.split(',')[0].trim();

        if (city && city !=='Loading...'){
            fetchWeather(city);
        }else{
            fetchWeather('Koster');
        }
    }
);

//USE CURRENT LOCATION

locationButton.addEventListener(
    'click',
    function (){
        hideError();

        if (!navigator.geolocation){
            showError('Geolocation is not supported by your browser.');

            return;
        }

        showLoading();

        navigator.geolocation.getCurrentPosition(
            async function (position){
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                try{
                  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`);

                  if (!response.ok){
                    throw new Error(
                        'Unable to determine your location.'
                    );
                  }

                  const locationData = await response.json();

                  if(
                    !locationData.results || locationData.results.length === 0
                  ){
                    throw new Error(
                        'Could not determine your city.'
                    );
                  }

                  const city = locationData.results[0].name;

                  cityInput.value = city;

                  await fetchWeather(city);
                }catch (error){
                    showError(error.message);

                    hideLoading();
                }
            },

            function (error){
                hideLoading();

                if(error.code === 1){
                    showError(
                        'Location permission was denied.'
                    );
                }else if (error.code === 2){
                    showError(
                        'Your location could not be determined.'
                    );
                }else{
                    showError('Unable to retrieve your location.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }
);

//START APPLICATION

document.addEventListener(
    'DOMContentLoaded',

    function (){
        displayCurrentDate();

        fetchWeather('Koster');
    }
);