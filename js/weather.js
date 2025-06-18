document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = "https://nodeapi-moneyblog.onrender.com";
  const weatherContainer = document.getElementById('weather-comp');

  async function getUserLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              method: "gps",
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
            });
          },
          async () => {
            const ipData = await fetch("https://ipapi.co/json/").then(res => res.json());
            resolve({
              method: "ip",
              city: ipData.city
            });
          },
          { timeout: 5000 }
        );
      } else {
        fetch("https://ipapi.co/json/")
          .then(res => res.json())
          .then(ipData => resolve({ method: "ip", city: ipData.city }));
      }
    });
  }

  try {
    const location = await getUserLocation();

    let city = location.city;

    // If GPS was used and city is unknown, reverse geocode (optional)
    if (location.method === "gps") {
      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lon}&localityLanguage=en`);
      const geoData = await geoRes.json();
      city = geoData.city || geoData.locality || geoData.principalSubdivision;
    }

    if (!city) {
      weatherContainer.innerHTML = `<p>Unable to detect your city</p>`;
      return;
    }

    const res = await fetch(`${API_URL}/misc/weather?city=${city}`);
    const { data } = await res.json();

    const icon = data?.current?.is_day
      ? data.current.condition.icon.replace("64x64", "128x128")
      : data.current.condition.icon;

    weatherContainer.innerHTML = `
      <div class="weather-box">
        <img src="https:${icon}" alt="Weather Icon" />
        <p><strong>${data.location.name}</strong></p>
        <p>${data.current.temp_c}°C, ${data.current.condition.text}</p>
        <p>${data.location.localtime}</p>
      </div>
    `;

  } catch (error) {
    console.log("Error fetching weather data", error.message);
    weatherContainer.innerHTML = `<p>Weather unavailable right now</p>`;
  }
});
