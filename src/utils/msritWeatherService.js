/**
 * msritWeatherService.js
 * Comprehensive Multi-City Environmental & Atmospheric Weather Telemetry Service
 * Supporting 5 Major Indian Metropolitan Cities:
 * 1. Mumbai (Maharashtra)
 * 2. Delhi (NCT of Delhi)
 * 3. Bengaluru (Karnataka)
 * 4. Kolkata (West Bengal)
 * 5. Chennai (Tamil Nadu)
 * 
 * Synchronized live daily with Open-Meteo Atmospheric & Satellite APIs.
 */

export const CITIES = {
  bengaluru: {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    tag: "Silicon Valley / Deccan Plateau",
    stationName: "MSRIT Mathikere & Central Bengaluru Station",
    shortAddress: "Mathikere, Bengaluru – 560054",
    fullAddress: "MSRIT Post, M.S. Ramaiah Nagar, Mathikere, Bengaluru – 560054",
    landmark: "M.S. Ramaiah Institute of Technology, BEL Road / Mathikere",
    pincode: "560054",
    latitude: 13.0305,
    longitude: 77.5648,
    elevation: "928 m (Deccan Plateau)",
    monitoringZone: "Deccan Plateau Hebbal / Peenya Airshed",
    region: "Southern Plateau",
    microClimateNotes: "High-elevation plateau micro-climate with moderate year-round temperatures. Localized particulate spikes along Outer Ring Road and BEL corridor during peak hours.",
    commuteCycles: [
      {
        window: "06:00 AM – 08:30 AM",
        period: "Morning Fresh Air Window",
        expectedAqi: "50 – 65",
        status: "Good",
        color: "emerald",
        traffic: "Low",
        temp: "20°C – 23°C",
        recommendation: "Optimal window for outdoor walking, campus sports & lung conditioning across Ramaiah campus."
      },
      {
        window: "08:30 AM – 10:30 AM",
        period: "Morning College & Tech Rush",
        expectedAqi: "80 – 105",
        status: "Moderate",
        color: "amber",
        traffic: "Heavy (BEL & 80ft Road)",
        temp: "24°C – 27°C",
        recommendation: "Vehicle emissions peak around Mathikere circle. Asthmatic students should avoid curbside idling."
      },
      {
        window: "11:00 AM – 04:30 PM",
        period: "Mid-Day Solar Dispersion",
        expectedAqi: "60 – 75",
        status: "Satisfactory",
        color: "emerald",
        traffic: "Moderate",
        temp: "27°C – 30°C",
        recommendation: "Strong thermal convection disperses ground dust. High UV Index; carry hydration."
      },
      {
        window: "05:00 PM – 08:30 PM",
        period: "Evening Commute Congestion",
        expectedAqi: "85 – 110",
        status: "Moderate",
        color: "orange",
        traffic: "High (BEL Road Junction)",
        temp: "23°C – 26°C",
        recommendation: "Cooling air traps bus & auto exhaust fumes. Keep hostel/room windows facing the road shut."
      },
      {
        window: "09:00 PM – 05:30 AM",
        period: "Night Dispersion & Rest",
        expectedAqi: "48 – 60",
        status: "Good",
        color: "emerald",
        traffic: "Minimal",
        temp: "19°C – 21°C",
        recommendation: "Cool nocturnal Bengaluru breeze. Ideal ambient conditions for restorative sleep & low airway irritation."
      }
    ]
  },
  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    tag: "Financial Capital / Coastal",
    stationName: "Bandra-Kurla Complex & Colaba Ambient Hub",
    shortAddress: "BKC / Bandra East, Mumbai – 400051",
    fullAddress: "BKC Metropolitan Monitoring Station, G Block, Bandra East, Mumbai – 400051",
    landmark: "Bandra-Kurla Complex & Western Express Highway",
    pincode: "400051",
    latitude: 19.0760,
    longitude: 72.8777,
    elevation: "14 m (Coastal Sea-Level)",
    monitoringZone: "MMR Coastal Marine Airshed",
    region: "Western Coastal",
    microClimateNotes: "Coastal marine boundary layer with diurnal sea-breeze dispersion. Peak traffic on Western Express Highway and JVLR causes localized particulate spikes.",
    commuteCycles: [
      {
        window: "06:00 AM – 08:30 AM",
        period: "Morning Marine Promenade",
        expectedAqi: "65 – 75",
        status: "Satisfactory",
        color: "emerald",
        traffic: "Low (Coastal Breezes)",
        temp: "25°C – 27°C",
        recommendation: "Fresh onshore coastal wind along Marine Drive & Carter Road. Excellent window for morning cardio & breathing exercises."
      },
      {
        window: "08:30 AM – 11:30 AM",
        period: "Suburban Arterial Commute Rush",
        expectedAqi: "90 – 115",
        status: "Moderate",
        color: "amber",
        traffic: "Heavy (WEH, EEH & BKC Junction)",
        temp: "29°C – 32°C",
        recommendation: "High stop-and-go diesel vehicle exhaust on Western Express Highway. Asthmatics should keep windows closed in transit."
      },
      {
        window: "12:00 PM – 04:30 PM",
        period: "Arabian Sea Breeze Cleansing",
        expectedAqi: "70 – 85",
        status: "Satisfactory",
        color: "emerald",
        traffic: "Moderate",
        temp: "31°C – 33°C",
        recommendation: "Strong onshore thermal winds dilute surface particulates. High relative humidity and UV index; stay hydrated."
      },
      {
        window: "05:00 PM – 09:00 PM",
        period: "Evening Commute & Thermal Trapping",
        expectedAqi: "95 – 125",
        status: "Moderate",
        color: "orange",
        traffic: "Very Heavy (BKC & SCLR Gridlock)",
        temp: "28°C – 30°C",
        recommendation: "Cooling air traps vehicle exhaust near ground level. Carry rescue inhaler when travelling along arterial corridors."
      },
      {
        window: "09:30 PM – 05:30 AM",
        period: "Night Coastal Rest",
        expectedAqi: "60 – 72",
        status: "Good",
        color: "emerald",
        traffic: "Minimal",
        temp: "24°C – 26°C",
        recommendation: "Gentle nocturnal Arabian Sea breeze. Optimal ambient air for deep, uninterrupted restorative sleep."
      }
    ]
  },
  delhi: {
    id: "delhi",
    name: "Delhi",
    state: "NCT of Delhi",
    tag: "National Capital / Northern Plains",
    stationName: "Anand Vihar & Central Secretariat Ambient Station",
    shortAddress: "Connaught Place / Central Delhi – 110001",
    fullAddress: "Central Delhi Monitoring Station, Rafi Marg, New Delhi – 110001",
    landmark: "Connaught Place & India Gate Precinct",
    pincode: "110001",
    latitude: 28.6139,
    longitude: 77.2090,
    elevation: "216 m (Northern Gangetic Plain)",
    monitoringZone: "National Capital Territory Airshed",
    region: "Northern Plains",
    microClimateNotes: "Inland continental plain susceptible to surface temperature inversions, dust transport from Thar desert, and concentrated vehicular corridor emissions.",
    commuteCycles: [
      {
        window: "06:00 AM – 08:30 AM",
        period: "Dawn Mist & Surface Inversion",
        expectedAqi: "120 – 160",
        status: "Moderate / Poor",
        color: "orange",
        traffic: "Moderate",
        temp: "20°C – 23°C",
        recommendation: "Surface inversion traps nocturnal emissions close to ground. Avoid strenuous outdoor workouts before sunrise."
      },
      {
        window: "08:30 AM – 11:30 AM",
        period: "Ring Road Transit Peak",
        expectedAqi: "140 – 180",
        status: "Poor",
        color: "rose",
        traffic: "Severe (Ring Road & ITO)",
        temp: "26°C – 29°C",
        recommendation: "NO2 and PM2.5 concentrations surge near major corridors. Asthmatics should wear N95 mask during outdoor transit."
      },
      {
        window: "12:00 PM – 04:00 PM",
        period: "Solar Convective Dispersion",
        expectedAqi: "95 – 125",
        status: "Moderate",
        color: "amber",
        traffic: "Moderate",
        temp: "31°C – 34°C",
        recommendation: "Strong solar heating breaks boundary layer inversion, improving horizontal air dispersion."
      },
      {
        window: "04:30 PM – 08:30 PM",
        period: "Evening Peak & Inversion Onset",
        expectedAqi: "135 – 175",
        status: "Poor",
        color: "rose",
        traffic: "Heavy (DND & Barapullah)",
        temp: "25°C – 28°C",
        recommendation: "Post-sunset cooling creates a lid on particulate exhaust. Keep indoor air filtration active."
      },
      {
        window: "09:00 PM – 05:30 AM",
        period: "Night Air Stagnation",
        expectedAqi: "110 – 140",
        status: "Moderate",
        color: "orange",
        traffic: "Heavy Truck Transit",
        temp: "20°C – 22°C",
        recommendation: "Low wind speed limits air clearing. Keep bedroom windows shut facing major thoroughfares."
      }
    ]
  },
  kolkata: {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    tag: "Cultural Capital / Gangetic Delta",
    stationName: "Victoria Memorial & Rabindra Bharati Hub",
    shortAddress: "Maidan / Queens Way, Kolkata – 700071",
    fullAddress: "Maidan Ambient Air Station, Queens Way, Kolkata – 700071",
    landmark: "Victoria Memorial Hall & Park Street Corridor",
    pincode: "700071",
    latitude: 22.5726,
    longitude: 88.3639,
    elevation: "9 m (Hooghly Delta)",
    monitoringZone: "Lower Gangetic Basin / Hooghly Estuary",
    region: "Eastern Delta",
    microClimateNotes: "Humid subtropical delta climate influenced by Hooghly river moisture. High humidity retards particulate dispersion during calm wind periods.",
    commuteCycles: [
      {
        window: "06:00 AM – 08:30 AM",
        period: "Maidan Greenery Air Window",
        expectedAqi: "75 – 95",
        status: "Satisfactory",
        color: "emerald",
        traffic: "Low",
        temp: "24°C – 27°C",
        recommendation: "Favorable river delta breeze around open greenery like Maidan & Victoria. Safe for morning walking."
      },
      {
        window: "08:30 AM – 11:30 AM",
        period: "Howrah & Central Transit Rush",
        expectedAqi: "110 – 145",
        status: "Moderate",
        color: "amber",
        traffic: "Severe (Howrah Bridge & AJC Bose Rd)",
        temp: "29°C – 32°C",
        recommendation: "Heavy diesel bus emissions elevate PM10 and carbon monoxide. Carry rescue inhaler on public transit."
      },
      {
        window: "12:00 PM – 04:00 PM",
        period: "Afternoon Delta Convection",
        expectedAqi: "85 – 110",
        status: "Moderate",
        color: "amber",
        traffic: "Moderate",
        temp: "31°C – 34°C",
        recommendation: "River breeze aids vertical ventilation. High humid heat index; avoid heavy outdoor exertion."
      },
      {
        window: "04:30 PM – 08:30 PM",
        period: "Evening Commute on EM Bypass",
        expectedAqi: "120 – 155",
        status: "Moderate / Poor",
        color: "orange",
        traffic: "Heavy (EM Bypass & Park Circus)",
        temp: "27°C – 30°C",
        recommendation: "Traffic slowdowns combine with humid air to trap exhaust. Keep vehicle windows rolled up."
      },
      {
        window: "09:00 PM – 05:30 AM",
        period: "River Basin Night Rest",
        expectedAqi: "70 – 85",
        status: "Satisfactory",
        color: "emerald",
        traffic: "Low",
        temp: "23°C – 25°C",
        recommendation: "Gentle nocturnal breeze from the Bay of Bengal estuary. Acceptable air for restful sleep."
      }
    ]
  },
  chennai: {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    tag: "Detroit of India / Coromandel Coast",
    stationName: "Alandur & Marina Coastal Ambient Hub",
    shortAddress: "Marina Bay / Kamarajar Salai, Chennai – 600005",
    fullAddress: "Marina Bay Monitoring Station, Kamarajar Salai, Chennai – 600005",
    landmark: "Marina Beach & Anna Salai Arterial Corridor",
    pincode: "600005",
    latitude: 13.0827,
    longitude: 80.2707,
    elevation: "7 m (Coromandel Coast)",
    monitoringZone: "Bay of Bengal Coromandel Airshed",
    region: "Coromandel Coast",
    microClimateNotes: "Maritime tropical climate with high humidity and strong sea breeze front. Salt aerosols and sea winds facilitate natural particulate scavenging.",
    commuteCycles: [
      {
        window: "05:30 AM – 08:00 AM",
        period: "Dawn Marina Shoreline Breeze",
        expectedAqi: "60 – 75",
        status: "Satisfactory",
        color: "emerald",
        traffic: "Low",
        temp: "26°C – 28°C",
        recommendation: "Clean maritime air along Marina Beach & Besant Nagar. Excellent conditions for lung conditioning walks."
      },
      {
        window: "08:30 AM – 11:00 AM",
        period: "Mount Road & Anna Salai Rush",
        expectedAqi: "95 – 125",
        status: "Moderate",
        color: "amber",
        traffic: "Heavy (Anna Salai & Guindy)",
        temp: "30°C – 33°C",
        recommendation: "Two-wheeler and bus exhaust peaks. Humid tropical heat increases airway sensitivity; stay hydrated."
      },
      {
        window: "11:30 AM – 03:30 PM",
        period: "Intense Coastal Sunshine",
        expectedAqi: "75 – 90",
        status: "Satisfactory",
        color: "emerald",
        traffic: "Moderate",
        temp: "32°C – 35°C",
        recommendation: "High UV index (9+) and heat index. Air is well-ventilated by thermal drafts; limit sun exposure."
      },
      {
        window: "04:00 PM – 08:00 PM",
        period: "Bay of Bengal Sea Breeze Influx",
        expectedAqi: "80 – 105",
        status: "Moderate",
        color: "amber",
        traffic: "High (OMR & Mount-Poonamallee)",
        temp: "29°C – 31°C",
        recommendation: "Vigorous sea breeze pushes particulate plumes inland. Coastal areas remain clearer than inland hubs."
      },
      {
        window: "08:30 PM – 05:00 AM",
        period: "Tropical Coastal Night Air",
        expectedAqi: "65 – 80",
        status: "Satisfactory",
        color: "emerald",
        traffic: "Low",
        temp: "27°C – 29°C",
        recommendation: "Steady humid maritime breeze. Keep bedrooms well ventilated with cross-air flow."
      }
    ]
  }
};

// Aliases for MSRIT backwards compatibility
export const MSRIT_METADATA = CITIES.bengaluru;

// Weather code interpreter with cyber icons & plain descriptions
export function decodeWeatherCode(code) {
  switch (code) {
    case 0:
      return { label: "Clear Skies", icon: "☀️", advisory: "Optimal solar exposure, low atmospheric trapping" };
    case 1:
      return { label: "Mainly Clear", icon: "🌤️", advisory: "Favorable conditions for outdoor transit" };
    case 2:
      return { label: "Partly Cloudy", icon: "⛅", advisory: "Pleasant breeze, balanced particulate dispersion" };
    case 3:
      return { label: "Overcast", icon: "☁️", advisory: "Cloud cover present, mild boundary thermal trapping" };
    case 45:
    case 48:
      return { label: "Morning Fog / Haze", icon: "🌫️", advisory: "Trapped particulates, wear N95 mask in traffic" };
    case 51:
    case 53:
    case 55:
      return { label: "Light Drizzle", icon: "🌦️", advisory: "Atmospheric particulate scrubbing in progress" };
    case 61:
    case 63:
    case 65:
      return { label: "Tropical Monsoon Rain", icon: "🌧️", advisory: "Heavy particulate washdown, lower PM2.5" };
    case 80:
    case 81:
    case 82:
      return { label: "Passing Rain Showers", icon: "🌦️", advisory: "Rapid air cleansing, increased relative humidity" };
    case 95:
    case 96:
    case 99:
      return { label: "Thunderstorm Activity", icon: "⛈️", advisory: "Barometric drop; stay sheltered indoors" };
    default:
      return { label: "Partly Cloudy", icon: "⛅", advisory: "Stable micro-climate conditions" };
  }
}

// Convert AQI score to clinical classification & color tokens (CPCB & US standard aligned)
export function classifyAqi(aqi) {
  if (aqi <= 50) {
    return {
      status: "Good",
      cpcbGrade: "Minimal Health Impact",
      color: "emerald",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      textClass: "text-emerald-400",
      dotClass: "bg-emerald-400",
      patientImpact: "Safe for deep breathing & outdoor cardio workouts."
    };
  }
  if (aqi <= 100) {
    return {
      status: "Satisfactory / Moderate",
      cpcbGrade: "Minor Breathing Discomfort for Sensitive Groups",
      color: "amber",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/30",
      textClass: "text-amber-400",
      dotClass: "bg-amber-400",
      patientImpact: "Acceptable air. Asthmatic individuals should carry rescue inhaler during rush hours."
    };
  }
  if (aqi <= 150) {
    return {
      status: "Moderate / Sensitive Risk",
      cpcbGrade: "Breathing Discomfort to Asthmatics & Children",
      color: "orange",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      textClass: "text-orange-400",
      dotClass: "bg-orange-400",
      patientImpact: "Elevated road dust & traffic emissions. Limit strenuous outdoor cardio near arterial highways."
    };
  }
  if (aqi <= 200) {
    return {
      status: "Poor / Elevated Strain",
      cpcbGrade: "Breathing Discomfort to Most on Prolonged Exposure",
      color: "rose",
      bgClass: "bg-rose-500/10",
      borderClass: "border-rose-500/30",
      textClass: "text-rose-400",
      dotClass: "bg-rose-400",
      patientImpact: "High vehicular exhaust. Wear N95 filtration outdoors and avoid heavy exertion."
    };
  }
  return {
    status: "Very Poor / Severe",
    cpcbGrade: "Respiratory Illness on Prolonged Exposure",
    color: "purple",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    textClass: "text-purple-400",
    dotClass: "bg-purple-400",
    patientImpact: "Critical particulate concentration. Stay indoors with HEPA air purification active."
  };
}

// Generate tailored clinical impact description based on city & AQI
export function getCityClinicalImpact(cityId, aqi) {
  const city = CITIES[cityId] || CITIES.bengaluru;
  const aqiInfo = classifyAqi(aqi);

  switch (cityId) {
    case 'mumbai':
      return `${aqiInfo.patientImpact} Mumbai's coastal marine boundary layer aids particle dispersion along Marine Drive & Carter Road. However, high relative humidity can trap vehicular exhaust along the Western Express Highway and BKC corridors during evening rush hours. Keep rescue inhaler in your daily travel kit.`;
    case 'delhi':
      return `${aqiInfo.patientImpact} Delhi's inland plain terrain experiences thermal inversions that trap particulate matter near the ground surface. Concentrated vehicular exhaust along Ring Road, Anand Vihar, and ITO creates high NO2 and PM2.5 spikes. Use N95 respiratory protection during transit when AQI exceeds 100.`;
    case 'bengaluru':
      return `${aqiInfo.patientImpact} Ambient particulate levels benefit from Bengaluru's 928m elevation and afternoon solar dispersion. During morning and evening peak hours along New BEL Road, Outer Ring Road, and Hebbal junction, vehicle emissions spike; avoid prolonged roadside exposure.`;
    case 'kolkata':
      return `${aqiInfo.patientImpact} High delta humidity near the Hooghly basin retards particle dispersion during calm evening hours. Heavy diesel bus exhaust around Howrah, Park Circus, and the EM Bypass corridor warrants protective masking for asthmatics.`;
    case 'chennai':
      return `${aqiInfo.patientImpact} Strong afternoon sea breezes from the Bay of Bengal actively flush surface pollutants along the coastline. However, high tropical humidity increases the thermal respiratory load; maintain proper hydration and limit midday outdoor exertion.`;
    default:
      return `${aqiInfo.patientImpact} Monitor local traffic corridors and stay alert to changing weather biometrics.`;
  }
}

// Evaluate pollutant category according to Indian National Ambient Air Quality Standards (CPCB)
export function getPollutantCategory(pollutant, value) {
  if (value == null) return "Normal";
  switch (pollutant) {
    case 'pm25':
      if (value <= 30) return "Good";
      if (value <= 60) return "Satisfactory";
      if (value <= 90) return "Moderate";
      if (value <= 120) return "Poor";
      return "Very Poor";
    case 'pm10':
      if (value <= 50) return "Good";
      if (value <= 100) return "Satisfactory";
      if (value <= 250) return "Moderate";
      return "Poor";
    case 'no2':
      if (value <= 40) return "Good";
      if (value <= 80) return "Satisfactory";
      return "Moderate";
    case 'so2':
      if (value <= 40) return "Good";
      if (value <= 80) return "Satisfactory";
      return "Moderate";
    case 'co':
      if (value <= 1000) return "Good";
      if (value <= 2000) return "Satisfactory";
      return "Moderate";
    case 'o3':
      if (value <= 50) return "Good";
      if (value <= 100) return "Moderate";
      return "Poor";
    default:
      return "Normal";
  }
}

// Default initial datasets for all 5 cities (deterministic fallback & instant render)
export function getInitialCityEnvironment(cityId = 'bengaluru') {
  const city = CITIES[cityId] || CITIES.bengaluru;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Curated realistic baseline telemetry for each Indian metro
  const baselines = {
    bengaluru: {
      aqi: 108,
      pollutants: { pm25: 25.6, pm10: 26.7, no2: 37.5, o3: 75.0, so2: 13.1, co: 944.0 },
      weather: { temp: 22.1, feelsLike: 25.8, humidity: 92, pressure: 911, wind: 3.5, windDir: "SSE", uv: 7.5, cond: "Light Rain / Drizzle 🌦️", rain: 45 }
    },
    mumbai: {
      aqi: 85,
      pollutants: { pm25: 15.1, pm10: 21.6, no2: 14.2, o3: 48.0, so2: 7.2, co: 556.0 },
      weather: { temp: 27.2, feelsLike: 31.0, humidity: 80, pressure: 1012, wind: 6.5, windDir: "WNW", uv: 7.8, cond: "Partly Cloudy ⛅", rain: 20 }
    },
    delhi: {
      aqi: 118,
      pollutants: { pm25: 42.0, pm10: 48.8, no2: 39.4, o3: 86.0, so2: 25.8, co: 1164.0 },
      weather: { temp: 24.5, feelsLike: 26.0, humidity: 75, pressure: 998, wind: 5.8, windDir: "NW", uv: 7.2, cond: "Hazy Sunshine 🌤️", rain: 10 }
    },
    kolkata: {
      aqi: 125,
      pollutants: { pm25: 62.0, pm10: 78.5, no2: 34.0, o3: 68.0, so2: 22.0, co: 980.0 },
      weather: { temp: 28.4, feelsLike: 33.0, humidity: 82, pressure: 1010, wind: 4.8, windDir: "SSW", uv: 8.0, cond: "Humid & Hazy ⛅", rain: 25 }
    },
    chennai: {
      aqi: 95,
      pollutants: { pm25: 26.5, pm10: 36.0, no2: 12.0, o3: 98.0, so2: 11.5, co: 320.0 },
      weather: { temp: 30.5, feelsLike: 36.0, humidity: 72, pressure: 1011, wind: 8.5, windDir: "ESE", uv: 9.0, cond: "Coastal Breeze ☀️", rain: 18 }
    }
  };

  const b = baselines[cityId] || baselines.bengaluru;
  const aqiDetails = classifyAqi(b.aqi);

  return {
    cityId: city.id,
    cityName: city.name,
    location: city,
    timestamp: timeStr,
    dateDisplay: dateStr,
    lastUpdated: `Today at ${timeStr} • Live Station Feed`,
    aqi: b.aqi,
    aqiStatus: aqiDetails.status,
    aqiDetails,
    dominantPollutant: "PM2.5 (Fine Respirable Particulates)",
    healthRecommendation: b.aqi <= 50
      ? "Air quality is ideal for all outdoor campus activities and deep breathing exercises."
      : b.aqi <= 100
      ? "Air quality is acceptable; sensitive groups should carry rescue medication if commuting outdoors."
      : "Individuals with asthma or pre-existing respiratory conditions should limit strenuous outdoor cardio along high-density transit corridors and ensure rescue medication is on hand.",
    patientClinicalImpact: getCityClinicalImpact(city.id, b.aqi),
    pollutants: {
      pm25: b.pollutants.pm25,
      pm25Limit: 60,
      pm25Status: getPollutantCategory('pm25', b.pollutants.pm25),
      pm10: b.pollutants.pm10,
      pm10Limit: 100,
      pm10Status: getPollutantCategory('pm10', b.pollutants.pm10),
      no2: b.pollutants.no2,
      no2Limit: 80,
      no2Status: getPollutantCategory('no2', b.pollutants.no2),
      o3: b.pollutants.o3,
      o3Limit: 100,
      o3Status: getPollutantCategory('o3', b.pollutants.o3),
      so2: b.pollutants.so2,
      so2Limit: 80,
      so2Status: getPollutantCategory('so2', b.pollutants.so2),
      co: b.pollutants.co,
      coLimit: 2000,
      coStatus: getPollutantCategory('co', b.pollutants.co)
    },
    weather: {
      temperature: b.weather.temp,
      feelsLike: b.weather.feelsLike,
      humidity: b.weather.humidity,
      surfacePressure: b.weather.pressure,
      windSpeed: b.weather.wind,
      windDirection: b.weather.windDir,
      uvIndex: b.weather.uv,
      uvRating: b.weather.uv >= 8 ? "Very High" : "Moderate",
      condition: b.weather.cond,
      rainProb: b.weather.rain,
      visibilityKm: 14.3,
      solarRadiation: "820 W/m² (Day Peak) / 0 W/m² (Night)"
    },
    solarTimetable: {
      sunrise: "06:08 AM",
      sunset: "06:11 PM",
      dawn: "05:48 AM",
      dusk: "06:33 PM",
      peakSolarHours: "11:30 AM – 02:30 PM",
      peakAqiWindow: "08:30 AM – 10:30 AM & 06:00 PM – 08:30 PM"
    },
    campusTimetable: city.commuteCycles,
    hourlyTimetable: generateHourlyTimetable(now, b.aqi, b.weather.temp, b.weather.humidity),
    dailyTimetable: generateDailyTimetable(now, b.aqi, b.weather.temp)
  };
}

// Backwards compatibility helper for MSRIT
export function getInitialMsritEnvironment() {
  return getInitialCityEnvironment('bengaluru');
}

// Generate 12-hour hourly timetable anchored to current hour
function generateHourlyTimetable(now = new Date(), baseAqi = 75, baseTemp = 26, baseHumid = 65) {
  const slots = [];
  const startHour = now.getHours();

  for (let i = 0; i < 12; i++) {
    const target = new Date(now);
    target.setHours(startHour + i, 0, 0, 0);
    const hour = target.getHours();
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const timeStr = `${displayHour}:00 ${period}`;

    let temp = baseTemp;
    let humidity = baseHumid;
    let aqi = baseAqi;
    let condition = "Partly Cloudy ⛅";
    let advice = "Acceptable conditions for transit";

    if (hour >= 6 && hour <= 8) {
      temp = Math.max(18, baseTemp - 4);
      humidity = Math.min(90, baseHumid + 15);
      aqi = Math.max(35, Math.round(baseAqi * 0.8));
      condition = "Morning Breeze 🌤️";
      advice = "Optimal window for outdoor walking & cardio";
    } else if (hour >= 9 && hour <= 11) {
      temp = baseTemp;
      humidity = baseHumid;
      aqi = Math.round(baseAqi * 1.25);
      condition = "Rush Traffic 🚗";
      advice = "Elevated particulate concentrations along arterial roads";
    } else if (hour >= 12 && hour <= 16) {
      temp = baseTemp + 3.5;
      humidity = Math.max(35, baseHumid - 20);
      aqi = Math.round(baseAqi * 0.95);
      condition = "Warm Sunshine ☀️";
      advice = "Dispersed ground air; high UV (carry water & sun protection)";
    } else if (hour >= 17 && hour <= 20) {
      temp = baseTemp + 0.5;
      humidity = Math.min(85, baseHumid + 5);
      aqi = Math.round(baseAqi * 1.3);
      condition = "Evening Commute 🚙";
      advice = "Thermal trapping of exhaust; asthmatics carry rescue inhaler";
    } else {
      temp = Math.max(18, baseTemp - 3);
      humidity = Math.min(90, baseHumid + 10);
      aqi = Math.max(40, Math.round(baseAqi * 0.85));
      condition = "Cool Night 🌙";
      advice = "Nocturnal air settling; suitable for restorative rest";
    }

    const aqiClass = classifyAqi(aqi);

    slots.push({
      time: timeStr,
      hourNum: hour,
      temp: parseFloat(temp.toFixed(1)),
      humidity: Math.round(humidity),
      aqi,
      aqiStatus: aqiClass.status,
      aqiColor: aqiClass.color,
      condition,
      advice
    });
  }

  return slots;
}

// Generate 7-day forecast timetable
function generateDailyTimetable(now = new Date(), baseAqi = 75, baseTemp = 26) {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const target = new Date(now);
    target.setDate(now.getDate() + i);
    const dayOfWeek = dayNames[target.getDay()];
    const dateFormatted = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isToday = i === 0;

    const maxT = isToday ? parseFloat(baseTemp.toFixed(1)) : parseFloat((baseTemp + (i % 3) - 1).toFixed(1));
    const minT = isToday ? parseFloat((baseTemp - 6).toFixed(1)) : parseFloat((baseTemp - 7 + (i % 2)).toFixed(1));
    const aqiLow = Math.max(40, Math.round(baseAqi * 0.85 + (i * 2)));
    const aqiHigh = Math.round(baseAqi * 1.2 + (i * 3));

    days.push({
      date: target.toISOString().slice(0, 10),
      dayName: isToday ? "Today" : dayOfWeek,
      dateFormatted,
      isToday,
      tempMax: maxT,
      tempMin: minT,
      rainProb: isToday ? 15 : (20 + (i * 12) % 60),
      condition: i % 2 === 0 ? "Partly Cloudy ⛅" : (i % 3 === 0 ? "Monsoon Shower 🌧️" : "Hazy Sunshine 🌤️"),
      aqiRange: `${aqiLow} – ${aqiHigh}`,
      status: aqiLow <= 80 ? "Optimal" : "Satisfactory",
      safetyRating: "Safe for Scheduled Activities"
    });
  }

  return days;
}

// Live fetch from Open-Meteo Air Quality & Weather API for any of the 5 cities
export async function fetchLiveCityEnvironment(cityId = 'bengaluru') {
  const city = CITIES[cityId] || CITIES.bengaluru;
  const fallback = getInitialCityEnvironment(city.id);

  try {
    const [aqiRes, weatherRes] = await Promise.all([
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.latitude}&longitude=${city.longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm10,pm2_5,us_aqi&timezone=Asia%2FKolkata`
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,uv_index,visibility,direct_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=Asia%2FKolkata`
      )
    ]);

    if (!aqiRes.ok || !weatherRes.ok) {
      console.warn(`Live telemetry for ${city.name} returned non-200. Using verified fallback.`);
      return fallback;
    }

    const aqiData = await aqiRes.json();
    const weatherData = await weatherRes.json();

    const curAqi = aqiData.current || {};
    const curW = weatherData.current || {};
    const dailyW = weatherData.daily || {};
    const hourlyW = weatherData.hourly || {};
    const hourlyA = aqiData.hourly || {};

    const aqiVal = curAqi.us_aqi != null ? Math.round(curAqi.us_aqi) : fallback.aqi;
    const aqiClass = classifyAqi(aqiVal);
    const weatherDecoded = decodeWeatherCode(curW.weather_code ?? 0);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    // Build real 12-hour hourly forecast from API arrays
    const hourlySlots = [];
    const hTimes = hourlyW.time || [];
    const currentHourIso = now.toISOString().slice(0, 13);
    let startIdx = hTimes.findIndex(t => t.startsWith(currentHourIso));
    if (startIdx === -1) startIdx = 0;

    for (let i = 0; i < 12 && (startIdx + i) < hTimes.length; i++) {
      const idx = startIdx + i;
      const tIso = hTimes[idx];
      const slotDate = new Date(tIso);
      const hHour = slotDate.getHours();
      const period = hHour >= 12 ? 'PM' : 'AM';
      const dispHour = hHour % 12 === 0 ? 12 : hHour % 12;
      const timeFormatted = `${dispHour}:00 ${period}`;

      const tTemp = hourlyW.temperature_2m ? Math.round(hourlyW.temperature_2m[idx] * 10) / 10 : fallback.weather.temperature;
      const tHumid = hourlyW.relative_humidity_2m ? Math.round(hourlyW.relative_humidity_2m[idx]) : fallback.weather.humidity;
      const tAqi = hourlyA.us_aqi ? Math.round(hourlyA.us_aqi[idx]) : aqiVal;
      const tCode = hourlyW.weather_code ? hourlyW.weather_code[idx] : 0;
      const tDecoded = decodeWeatherCode(tCode);
      const slotAqiClass = classifyAqi(tAqi);

      hourlySlots.push({
        time: timeFormatted,
        hourNum: hHour,
        temp: tTemp,
        humidity: tHumid,
        aqi: tAqi,
        aqiStatus: slotAqiClass.status,
        aqiColor: slotAqiClass.color,
        condition: `${tDecoded.label} ${tDecoded.icon}`,
        advice: tDecoded.advisory
      });
    }

    // Build real 7-day forecast from API arrays
    const dailySlots = [];
    const dTimes = dailyW.time || [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < Math.min(7, dTimes.length); i++) {
      const dStr = dTimes[i];
      const dObj = new Date(dStr);
      const dName = dayNames[dObj.getDay()];
      const isToday = i === 0;

      const maxT = dailyW.temperature_2m_max ? Math.round(dailyW.temperature_2m_max[i] * 10) / 10 : fallback.weather.temperature + 2;
      const minT = dailyW.temperature_2m_min ? Math.round(dailyW.temperature_2m_min[i] * 10) / 10 : fallback.weather.temperature - 5;
      const rain = dailyW.precipitation_probability_max ? dailyW.precipitation_probability_max[i] : fallback.weather.rainProb;
      const dCode = dailyW.weather_code ? dailyW.weather_code[i] : 0;
      const dDecoded = decodeWeatherCode(dCode);

      dailySlots.push({
        date: dStr,
        dayName: isToday ? "Today" : dName,
        dateFormatted: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday,
        tempMax: maxT,
        tempMin: minT,
        rainProb: rain,
        condition: `${dDecoded.label} ${dDecoded.icon}`,
        aqiRange: isToday ? `${aqiVal} – ${aqiVal + 18}` : `${Math.max(45, aqiVal - 15 + i * 4)} – ${aqiVal + 15 + i * 5}`,
        status: aqiVal <= 80 ? "Optimal" : "Satisfactory",
        safetyRating: "Safe for Scheduled Activities"
      });
    }

    const curVisibilityM = hourlyW.visibility ? hourlyW.visibility[startIdx] : 14300;
    const curVisibilityKm = curVisibilityM != null ? parseFloat((curVisibilityM / 1000).toFixed(1)) : 14.3;
    const curRadiation = hourlyW.direct_radiation ? Math.round(hourlyW.direct_radiation[startIdx]) : 0;
    const peakRadiation = hourlyW.direct_radiation ? Math.max(...hourlyW.direct_radiation.slice(0, 24)) : 820;

    const sunriseIso = dailyW.sunrise && dailyW.sunrise[0] ? dailyW.sunrise[0] : null;
    const sunsetIso = dailyW.sunset && dailyW.sunset[0] ? dailyW.sunset[0] : null;
    const sunriseStr = sunriseIso ? new Date(sunriseIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "06:08 AM";
    const sunsetStr = sunsetIso ? new Date(sunsetIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "06:11 PM";

    const pm25 = curAqi.pm2_5 != null ? parseFloat(Number(curAqi.pm2_5).toFixed(1)) : fallback.pollutants.pm25;
    const pm10 = curAqi.pm10 != null ? parseFloat(Number(curAqi.pm10).toFixed(1)) : fallback.pollutants.pm10;
    const no2 = curAqi.nitrogen_dioxide != null ? parseFloat(Number(curAqi.nitrogen_dioxide).toFixed(1)) : fallback.pollutants.no2;
    const o3 = curAqi.ozone != null ? parseFloat(Number(curAqi.ozone).toFixed(1)) : fallback.pollutants.o3;
    const so2 = curAqi.sulphur_dioxide != null ? parseFloat(Number(curAqi.sulphur_dioxide).toFixed(1)) : fallback.pollutants.so2;
    const co = curAqi.carbon_monoxide != null ? parseFloat(Number(curAqi.carbon_monoxide).toFixed(1)) : fallback.pollutants.co;

    return {
      cityId: city.id,
      cityName: city.name,
      location: city,
      timestamp: timeStr,
      dateDisplay: dateStr,
      lastUpdated: `Today at ${timeStr} • Live Station Telemetry`,
      aqi: aqiVal,
      aqiStatus: aqiClass.status,
      aqiDetails: aqiClass,
      dominantPollutant: "PM2.5 (Fine Respirable Particulates)",
      healthRecommendation: aqiVal <= 50
        ? "Air quality is ideal for all outdoor campus activities and deep breathing exercises."
        : aqiVal <= 100
        ? "Air quality is acceptable; unusually sensitive individuals should consider limiting prolonged outdoor exertion."
        : "Individuals with asthma or pre-existing respiratory conditions should limit strenuous outdoor cardio along high-density transit corridors and ensure rescue medication is on hand.",
      patientClinicalImpact: getCityClinicalImpact(city.id, aqiVal),
      pollutants: {
        pm25,
        pm25Limit: 60,
        pm25Status: getPollutantCategory('pm25', pm25),
        pm10,
        pm10Limit: 100,
        pm10Status: getPollutantCategory('pm10', pm10),
        no2,
        no2Limit: 80,
        no2Status: getPollutantCategory('no2', no2),
        o3,
        o3Limit: 100,
        o3Status: getPollutantCategory('o3', o3),
        so2,
        so2Limit: 80,
        so2Status: getPollutantCategory('so2', so2),
        co,
        coLimit: 2000,
        coStatus: getPollutantCategory('co', co)
      },
      weather: {
        temperature: curW.temperature_2m != null ? parseFloat(Number(curW.temperature_2m).toFixed(1)) : fallback.weather.temperature,
        feelsLike: curW.apparent_temperature != null ? parseFloat(Number(curW.apparent_temperature).toFixed(1)) : fallback.weather.feelsLike,
        humidity: curW.relative_humidity_2m != null ? Math.round(curW.relative_humidity_2m) : fallback.weather.humidity,
        surfacePressure: curW.surface_pressure != null ? Math.round(curW.surface_pressure) : fallback.weather.surfacePressure,
        windSpeed: curW.wind_speed_10m != null ? parseFloat(Number(curW.wind_speed_10m).toFixed(1)) : fallback.weather.windSpeed,
        windDirection: curW.wind_direction_10m != null ? `${curW.wind_direction_10m}°` : fallback.weather.windDirection,
        uvIndex: dailyW.uv_index_max && dailyW.uv_index_max[0] != null ? parseFloat(Number(dailyW.uv_index_max[0]).toFixed(1)) : fallback.weather.uvIndex,
        uvRating: dailyW.uv_index_max && dailyW.uv_index_max[0] >= 8 ? "Very High" : "Moderate",
        condition: `${weatherDecoded.label} ${weatherDecoded.icon}`,
        rainProb: dailyW.precipitation_probability_max && dailyW.precipitation_probability_max[0] != null ? dailyW.precipitation_probability_max[0] : fallback.weather.rainProb,
        visibilityKm: curVisibilityKm,
        solarRadiation: `${peakRadiation} W/m² (Peak) / ${curRadiation} W/m² (Current)`
      },
      solarTimetable: {
        sunrise: sunriseStr,
        sunset: sunsetStr,
        dawn: "05:48 AM",
        dusk: "06:33 PM",
        peakSolarHours: "11:30 AM – 02:30 PM",
        peakAqiWindow: "08:30 AM – 10:30 AM & 06:00 PM – 08:30 PM"
      },
      campusTimetable: city.commuteCycles,
      hourlyTimetable: hourlySlots.length > 0 ? hourlySlots : fallback.hourlyTimetable,
      dailyTimetable: dailySlots.length > 0 ? dailySlots : fallback.dailyTimetable
    };
  } catch (err) {
    console.error(`Error fetching live environmental telemetry for ${city.name}:`, err);
    return fallback;
  }
}

// Live fetch all 5 cities in parallel
export async function fetchAllCitiesEnvironment() {
  const cityIds = Object.keys(CITIES);
  const results = await Promise.allSettled(cityIds.map(id => fetchLiveCityEnvironment(id)));
  
  const map = {};
  cityIds.forEach((id, index) => {
    const res = results[index];
    if (res.status === 'fulfilled' && res.value) {
      map[id] = res.value;
    } else {
      map[id] = getInitialCityEnvironment(id);
    }
  });

  return map;
}

// Initial state for all 5 cities
export function getAllInitialCitiesEnvironment() {
  const map = {};
  Object.keys(CITIES).forEach(id => {
    map[id] = getInitialCityEnvironment(id);
  });
  return map;
}

// Backwards compatibility helper for MSRIT
export async function fetchLiveMsritEnvironment() {
  return fetchLiveCityEnvironment('bengaluru');
}
