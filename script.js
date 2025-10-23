const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const cityNameEl = document.getElementById('cityName');
const temperatureEl = document.getElementById('temperature');
const conditionEl = document.getElementById('condition');
const windspeedEl = document.getElementById('windspeed');
const weatherIconEl = document.getElementById('weatherIcon');
const timeEl = document.getElementById('time');
const backgroundLayer = document.getElementById('backgroundLayer');
const cloudLayer = document.getElementById('cloudLayer');
const hourlyForecastEl = document.getElementById('hourlyForecast');
const toggleUnitBtn = document.getElementById('toggleUnit');

let isCelsius = true;
let lastTemp = 0;

// Weather mappings
const weatherIconMapping = {0:"wi-day-sunny",1:"wi-day-sunny-overcast",2:"wi-day-cloudy",3:"wi-cloudy",
45:"wi-fog",48:"wi-fog",51:"wi-sprinkle",53:"wi-sprinkle",55:"wi-rain",56:"wi-rain-mix",57:"wi-rain-mix",
61:"wi-rain",63:"wi-rain",65:"wi-rain",66:"wi-rain-mix",67:"wi-rain-mix",71:"wi-snow",73:"wi-snow",
75:"wi-snow-wind",77:"wi-snow-wind",80:"wi-showers",81:"wi-showers",82:"wi-rain",85:"wi-snow",86:"wi-snow",
95:"wi-thunderstorm",96:"wi-thunderstorm",99:"wi-thunderstorm"};

const weatherDescMapping = {0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Depositing rime fog",
51:"Light drizzle",53:"Moderate drizzle",55:"Dense drizzle",56:"Light freezing drizzle",57:"Dense freezing drizzle",
61:"Light rain",63:"Moderate rain",65:"Heavy rain",66:"Light freezing rain",67:"Heavy freezing rain",
71:"Light snow",73:"Moderate snow",75:"Heavy snow",77:"Snow grains",80:"Light rain showers",81:"Moderate rain showers",
82:"Heavy rain showers",85:"Light snow showers",86:"Heavy snow showers",95:"Thunderstorm",96:"Thunderstorm with slight hail",
99:"Thunderstorm with heavy hail"};

// Geocoding
async function getCoordinates(city){
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
  const data = await response.json();
  if(!data.results || data.results.length===0) return null;
  return {latitude:data.results[0].latitude,longitude:data.results[0].longitude,name:data.results[0].name};
}

// Fetch weather
async function getWeather(city){
  clearAnimations();
  hourlyForecastEl.innerHTML='';
  const coords = await getCoordinates(city);
  if(!coords){
    cityNameEl.textContent='City not found'; 
    temperatureEl.textContent=''; 
    conditionEl.textContent=''; 
    windspeedEl.textContent=''; 
    weatherIconEl.style.display='none'; 
    return;
  }
  const {latitude, longitude, name} = coords;

  const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m`);
  const weatherData = await weatherResponse.json();
  const current = weatherData.current_weather;
  const hourly = weatherData.hourly;

  cityNameEl.textContent=name;
  lastTemp=current.temperature;
  temperatureEl.textContent=`Temperature: ${current.temperature}°C`;
  conditionEl.textContent=weatherDescMapping[current.weathercode] || 'Unknown';
  windspeedEl.textContent=`Wind Speed: ${current.windspeed} km/h`;
  weatherIconEl.className=`wi ${weatherIconMapping[current.weathercode]||'wi-na'}`;
  weatherIconEl.style.display='block';

  updateTime();
  animateWeather(current.weathercode);
  generateHourly(hourly);
  updateBackgroundByTime();
}

// Hourly forecast
function generateHourly(hourly){
  if(!hourly || !hourly.time || !hourly.temperature_2m) return;
  for(let i=0;i<24;i++){
    const div=document.createElement('div');
    div.className='forecast-hour';
    const hour=new Date(hourly.time[i]).getHours();
    div.innerHTML=`<p>${hour}:00</p><p>${hourly.temperature_2m[i]}°C</p>`;
    hourlyForecastEl.appendChild(div);
  }
}

// Temperature toggle
toggleUnitBtn.addEventListener('click', () => {
  if (isCelsius) {
    const f = (lastTemp * 9/5) + 32;
    temperatureEl.textContent = `Temperature: ${f.toFixed(1)}°F`;
    toggleUnitBtn.textContent = "Switch to °C";
    isCelsius = false;
  } else {
    temperatureEl.textContent = `Temperature: ${lastTemp}°C`;
    toggleUnitBtn.textContent = "Switch to °F";
    isCelsius = true;
  }
});

// Update current time
function updateTime(){
  const now = new Date();
  timeEl.textContent = `Local Time: ${now.toLocaleTimeString()}`;
}

// Clear previous animations
function clearAnimations(){
  backgroundLayer.innerHTML='';
  cloudLayer.innerHTML='';
}

// Animate weather
function animateWeather(code){
  if([51,53,55,61,63,65,80,81,82].includes(code)){
    rainAnimation();
  } else if([71,73,75,77,85,86].includes(code)){
    snowAnimation();
  } else if([95,96,99].includes(code)){
    thunderAnimation();
  }
  createClouds();
}

// Clouds
function createClouds(){
  const cloudCount = 5 + Math.floor(Math.random()*5);
  for(let i=0;i<cloudCount;i++){
    const cloud=document.createElement('div');
    cloud.className='cloud';
    cloud.style.top = Math.random()*50 + 'vh';
    const width = 100 + Math.random()*100;
    const height = width * 0.5;
    cloud.style.width = width + 'px';
    cloud.style.height = height + 'px';
    cloud.style.opacity = 0.5 + Math.random()*0.5;
    cloud.style.animationDuration = 20 + Math.random()*20 + 's';
    cloudLayer.appendChild(cloud);
  }
}

// Rain
function rainAnimation(){
  for(let i=0;i<120;i++){
    const drop=document.createElement('div');
    drop.className='rain-drop';
    drop.style.left=Math.random()*100+'%';
    drop.style.animationDuration=0.5 + Math.random()*0.5+'s';
    backgroundLayer.appendChild(drop);
  }
}

// Snow
function snowAnimation(){
  for(let i=0;i<70;i++){
    const flake=document.createElement('div');
    flake.className='snowflake';
    flake.style.left=Math.random()*100+'%';
    const size = 4 + Math.random()*6;
    flake.style.width = size + 'px';
    flake.style.height = size + 'px';
    flake.style.animationDuration = 3 + Math.random()*3+'s';
    backgroundLayer.appendChild(flake);
  }
}

// Thunder
function thunderAnimation(){
  const flash=document.createElement('div');
  flash.className='thunder-flash';
  backgroundLayer.appendChild(flash);
  let flashes=0;
  const interval=setInterval(()=>{
    flash.style.opacity=Math.random()>0.5?1:0;
    flashes++;
    if(flashes>6){clearInterval(interval); backgroundLayer.removeChild(flash);}
  },200);
}

// Day/Night background
function updateBackgroundByTime(){
  const now = new Date();
  const hours = now.getHours();
  if(hours >= 6 && hours < 18){
    document.body.style.background = 'linear-gradient(to top, #87ceeb, #b0e0e6)';
  } else if(hours >=18 && hours <20){
    document.body.style.background = 'linear-gradient(to top, #ff9966, #ff5e62)';
  } else {
    document.body.style.background = 'linear-gradient(to top, #0b3d91, #1e3c72)';
  }
}

// Search button
searchBtn.addEventListener('click', ()=>{
  const city = cityInput.value.trim();
  if(city) getWeather(city);
});
