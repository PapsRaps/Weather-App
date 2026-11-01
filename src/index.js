import "./reset.css";
import "./styles.css";

const weather = (()=>{
    let weatherData = {}

    async function getWeather(location){
        try{
            const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&include=current`);

            if(!response.ok){
                const error = new Error('HTTP error: ' + response.status);
                error.status = response.status;
                throw error;
            }

            const data = await response.json();
            return putDataInObject(
                data.resolvedAddress, 
                data.currentConditions.conditions,
                data.currentConditions.icon,
                data.currentConditions.temp,
                data.currentConditions.feelslike,
                data.days[0].tempmin,
                data.days[0].tempmax,
                data.currentConditions.humidity,
                data.currentConditions.visibility,
                data.currentConditions.windspeed,
                data.currentConditions.uvindex,
                data.currentConditions.pressure,
                data.currentConditions.dew,
                data.currentConditions.precipprob,
                data.currentConditions.cloudcover,
            )
        }catch(error){
            console.error(error);
            throw error;
        }
        
    };

    function putDataInObject(location, weatherCondition, weatherIcon, currentTemp, feelsLikeTemp, tempMin, tempMax, humidity, visibility, windSpeed, uvindex, pressure, dew, precipprob,cloudcover){
        return {
            'location':`${location}`,
            'weatherCondition':`${weatherCondition.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
            'weatherIcon':`${weatherIcon}`,
            'currentTemp': currentTemp,
            'feelsLikeTemp': feelsLikeTemp,
            'tempMax': tempMax,
            'tempMin': tempMin,
            'humidity': humidity,
            'windSpeed': windSpeed,
            'visibility': visibility,
            'uvindex': uvindex,
            'pressure': pressure,
            'dew': dew,
            'chanceOfRain': precipprob,
            'cloudcover': cloudcover
        }
    }

    async function searchWeather(location){
        weatherData = await getWeather(location);
        console.log(weatherData)
    }

    function getWeatherData(){
        return {...weatherData}
    }

    function isWeatherDataEmpty(){
        return Object.keys(weatherData).length === 0;
    }

    return{
        searchWeather,
        getWeatherData,
        isWeatherDataEmpty,
    }
})();

const domController = (()=>{
    const welcomeMessage = document.querySelector('.welcomeMessage');

    const infoContainer = document.querySelector('.infoContainer');
    const bottomPart = document.querySelector('.bottomPart');

    const locationInput = document.getElementById('locationInput');
    const validationMessage = document.querySelector('.validationMessage');

    let tempDisplay = 'C';

    const weatherTheme = {
        clear:{
            '--background-color1': '#F9D976',
            '--background-color2': '#8CB9D5',
        },
        partlyCloudy:{
            '--background-color1': '#B9D9E9',
            '--background-color2': '#789DBB',
        },
        cloudy:{
            '--background-color1': '#B8C8D4',
            '--background-color2': '#829BAB',
        },
        rain:{
            '--background-color1': '#526D82',
            '--background-color2': '#263B50',
        },
        thunderstorm:{
            '--background-color1': '#39465E',
            '--background-color2': '#171F32',
        },
        other:{
            '--background-color1': '#9cccf1',
            '--background-color2': '#8CB9D5',
        }
    }

    function getWeatherTheme(weatherIcon) {
        switch (weatherIcon) {
            case 'clear-day':
            case 'clear-night':
                return weatherTheme.clear;

            case 'partly-cloudy-day':
            case 'partly-cloudy-night':
                return weatherTheme.partlyCloudy;

            case 'cloudy':
                return weatherTheme.cloudy;

            case 'rain':
            case 'showers-day':
            case 'showers-night':
                return weatherTheme.rain;

            case 'thunder-rain':
            case 'thunder-showers-day':
            case 'thunder-showers-night':
                return weatherTheme.thunderstorm;

            default:
                return weatherTheme.other;
        }
    }

    function changeDisplay(){
        const showEmpty = !weather.isWeatherDataEmpty();

        welcomeMessage.classList.toggle('is-hidden', showEmpty);

        infoContainer.classList.toggle('is-hidden', !showEmpty);
        bottomPart.classList.toggle('is-hidden', !showEmpty);
        if(showEmpty)changeInfoDisplay();
    }

    function changeInfoDisplay(){
        const weatherData = weather.getWeatherData();

        const location = document.getElementById('location');
        const currentTemp = document.getElementById('currentTemp');
        const weatherCondition = document.getElementById('weatherCondition');
        const feelsLikeTemp = document.getElementById('feelsLikeTemp');
        const tempMax = document.getElementById('tempMax');
        const tempMin = document.getElementById('tempMin');
        const windSpeed = document.getElementById('windSpeed');
        const humidity = document.getElementById('humidity');
        const uvIndex = document.getElementById('uvIndex');
        const visibility = document.getElementById('visibility');
        const pressure = document.getElementById('pressure');
        const dew = document.getElementById('dew');
        const chanceOfRain = document.getElementById('chanceOfRain');
        const cloudcover = document.getElementById('cloudcover');

        location.innerText = weatherData.location
        currentTemp.innerText = calculateTemp(weatherData.currentTemp).toFixed(1) + `°${tempDisplay}`;
        weatherCondition.innerText = weatherData.weatherCondition
        feelsLikeTemp.innerText = `Feels Like ${calculateTemp(weatherData.feelsLikeTemp).toFixed(1)}°${tempDisplay}`;
        tempMax.innerText = calculateTemp(weatherData.tempMax).toFixed(1) + `°${tempDisplay}`;
        tempMin.innerText = calculateTemp(weatherData.tempMin).toFixed(1) + `°${tempDisplay}`;
        windSpeed.innerText = weatherData.windSpeed + ` km/h`
        humidity.innerText = weatherData.humidity + ` %`
        uvIndex.innerText = weatherData.uvindex
        visibility.innerText = weatherData.visibility + ` km`
        pressure.innerText = weatherData.pressure + ` hPa`
        dew.innerText = calculateTemp(weatherData.dew).toFixed(1) + `°${tempDisplay}`;
        chanceOfRain.innerText = weatherData.chanceOfRain + ` %`
        cloudcover.innerText = weatherData.cloudcover + ` %`

        const theme = getWeatherTheme(weatherData.weatherIcon);
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
    }

    function toggleTempDisplay(){
        if(tempDisplay === 'C'){
            tempDisplay = 'F'
        }else if(tempDisplay === 'F'){
            tempDisplay = 'C'
        }
        changeDisplay();
    }

    function calculateTemp(temperature){
        if(tempDisplay === 'C'){
            return temperature;
        }else if(tempDisplay === 'F'){
            return (temperature * 9 / 5) + 32;
        }
    }

    async function searchLocation(event){
        event.preventDefault();

        if(!validateSearch())return;

        const location = document.getElementById('locationInput').value;
        try{
            await weather.searchWeather(location);
            changeDisplay();
        }catch(error){
            if (error.status === 400 || error.status === 404) {
                validationMessage.textContent = 'Unable to find this location. Please check your search';
                validationMessage.classList.add('shake');
            }
        }

        event.target.reset();
    }

    function validateSearch(){
        if(locationInput.validity.valueMissing){
            validationMessage.classList.toggle('shake', true);

            return false
        }else{
            return true
        }
    }

    function userTyping(){
        validationMessage.classList.toggle('shake', false);
    }

    return{
        changeDisplay,
        searchLocation,
        userTyping,
        toggleTempDisplay,
    }
})();

(()=>{
    domController.changeDisplay();

    const searching = document.getElementById('searching')
    searching.addEventListener('submit',(event)=>domController.searchLocation(event))
    searching.addEventListener('input', domController.userTyping)

    const unitButtons = document.querySelectorAll(".unitButton");

    unitButtons.forEach(button => {
        button.addEventListener("click", () => {
            domController.toggleTempDisplay();
            unitButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
})()