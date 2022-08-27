const config = {
    cUrl:"https://api.countrystatecity.in/v1/countries",
    cKey:"eGhrQlhjYTRKTUFUaVc1Y21ubWFPWjZ1QVBIbm8yaVFBWlhLVmhUZg==",
    wUrl:"http://api.openweathermap.org/data/2.5/",
    wKey:"16b73456a6c08ba540712c8836265fd3",
};

// get countries

const getCountries = async (fieldName,...args) => {
    let apiEndPoint;
//find state name

switch(fieldName){
    case "countries":
        apiEndPoint = config.cUrl;
        break;
        case "states":
            apiEndPoint = `${config.cUrl}/${args[0]}/states`;
            break;
            case "cities":
                apiEndPoint = `${config.cUrl}/${args[0]}/states/${args[1]}/cities`;
                default:
}

    const response = await fetch(apiEndPoint,{headers:{"X-CSCAPI-KEY": config.cKey }});
if(response.status !=200){
    throw new Error(`Something went wrong,status code:${response.status}`);
}
const countries =await response.json();
return countries;
};

//time
const getdateTime= (unixTimeStamp) =>{
    const milliseconds = unixTimeStamp*1000;
    const dateObject =new Date(milliseconds);
    const options ={
        weekday:"long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }
    const humandateformate = dateObject.toLocaleTimeString("en-US",options);
    return humandateformate;
};

const tempCard = (val,unit="cel") =>{
    const flag = unit == "far" ? "°F" : "°C";
    return `<div id="Tempcard">
    <h6 class="card-subtitle mb2 ${unit}">${val.temp}</h6> 
    <p class="card-text">feels Like: ${val.temp} ${flag} </p>
    <p class="card-text">Max:${val.temp_max} ${flag}
     , Min: ${val.temp_min} ${flag}
 </p>
 </div>`;
}

//get weather info

const getWeather= async (cityName, ccode,units="metric") =>{


const apiEndPoint = `${config.wUrl}weather?q=${cityName},${ccode.toLowerCase()}&APPID=${config.wKey}&units=${units}`

try{
    const response = await fetch(apiEndPoint);
if(response.status !=200){
    if(response.status==404){
        weatherDiv.innerHTML =`<div class="alert-danger"><h3>Oops! No data available...</h3> </div>`
    }else{
        throw new Error (`something went worong,status code:${response.status}`);
    }
   
}
const weather = await response.json();
return weather;

} catch (error){ console.log(error);
}
};
const displayWeather =(data)=>{
const wheatherwidget =`  <div class="card">
<div class="card-body">
    <h5 class="card-title">${data.name},${data.sys.country} <span class="float-end units"><a href="#" class="unitlink active" data-unit="cel">°C</a> | <a href="#" class="unitlink" data-unit="far">°F</a><span>
        
    </h5>
    <p>${getdateTime(data.dt)}</p>
    <div id="Tempcard"> ${tempCard(data.main)}
    </div>
    ${data.weather.map((w) =>`<div class="img-container">
    ${w.main}  <span id="photo"> <img src="Image/weather01.png" alt="Weather Icon Error"></span>
    </div>
     <p> ${w.description}</p>`).join("\n")}
    
</div>
</div>`;
weatherDiv.innerHTML = wheatherwidget;
};

const getLoader = ()=>{
    return `<div class="spinner-grow text-info" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>`;
}

const countriesListDropDown = document.querySelector("#countrylist");
const StatelistDropDown = document.querySelector("#Statelist");
const citylistDropDown = document.querySelector("#citylist");
const weatherDiv = document.querySelector("#weatherwidget")

document.addEventListener("DOMContentLoaded", async () => {
    const countries =await getCountries("countries");
    //console.log(countries)
    let countriesOptions = "";
    if(countries){
        countriesOptions+=` <option value="">Country</option>`;
        countries.forEach((coutry) => {
            countriesOptions+=` <option value="${coutry.iso2}">${coutry.name}</option>`;
        });
        countriesListDropDown.innerHTML= countriesOptions;
    }
// States List
countriesListDropDown.addEventListener("change", async function(){
    const selectedCountryCode = this.value;
    const states = await getCountries("states",selectedCountryCode);
    //console.log(states);
    
    let statesOptions = "";
    if(states){
        statesOptions+=` <option value="">Select State</option>`;
        states.forEach((state) => {
            statesOptions+=` <option value="${state.iso2}">${state.name}</option>`;
        });
        StatelistDropDown.innerHTML= statesOptions;
        StatelistDropDown.disabled= false;
    }
    
});

//List Cities

StatelistDropDown.addEventListener("change", async function(){
    const selectedCountryCode = countriesListDropDown.value;
    const selectedstateCode = this.value;
    const cities = await getCountries("cities",selectedCountryCode,selectedstateCode);
    //console.log(cities);
    let citiesOptions = "";
    if(cities){
        citiesOptions+=` <option value="">Select City</option>`;
        cities.forEach((City) => {
            citiesOptions+=` <option value="${City.name}">${City.name}</option>`;
        });
        citylistDropDown.innerHTML= citiesOptions;
        citylistDropDown.disabled= false;
    }
});
citylistDropDown.addEventListener("change", async function(){
    const selectedCountryCode = citylistDropDown.value;
    const selectedCity = this.value;
       weatherDiv.innerHTML= getLoader();
    const weatherInfo = await getWeather(selectedCity,selectedCountryCode);
    displayWeather(weatherInfo)
});
// change unit

document.addEventListener("click", async (e)=>{
if(e.target.classList.contains("unitlink")){
const unitValue = e.target.getAttribute("data-unit");
const selectedCountryCode = countriesListDropDown.value;
const selectedCity = citylistDropDown.value;

const unitFlag = unitValue == "far" ? "imperial" : "metric";
const weatherInfo = await getWeather(selectedCity,selectedCountryCode,unitFlag);


const weatherTemp =tempCard(weatherInfo.main,unitFlag);
document.querySelector("#Tempcard").innerHTML = weatherTemp;
// active unite
document.querySelectorAll(".unitlink").forEach((link)=>{
    link.classList.remove("active");
})
e.target.classList.add("active");

}
})

});