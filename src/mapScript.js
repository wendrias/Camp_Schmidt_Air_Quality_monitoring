
//TO-DO: Hide API key,
//       hide group ID,
//       Update the map without refresh,
//       Calculate AQI and add it to the circle value,
//       Change circle color depending on the AQI level
//       Add Marker Clusters for better functionality and look (If there is time)

//Makes Map
function initMap() {
  const map = L.map("map", {
    //Figure out the smoothest  zooming for usability
    zoomSnap: 0.1,
    zoomDelta: 0,
  }).setView([38.7849, -76.8721], 10);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    }
  ).addTo(map);
  return map;
}

//returns an array with the aqi as the first value and the marker color as the second
function calculateAqi(sensor){
    const data = [];
    const pm2_5 = Math.floor( sensor[6] * 10) / 10;  //pm_25 value truncated at first decimal point
    let bp1;
    let bp2;
    let i1;
    let i2;
    let color;

    //breakpoints
    if (pm2_5 >= 0.0 && pm2_5 <= 12.0){
      bp1 = 0.0;
      bp2 = 12.0;
      i1 = 0;
      i2 = 50;
      color = 'green';
    } else if (pm2_5 > 12.1 && pm2_5<=35.4){
      bp1 = 12.1;
      bp2 = 35.4;
      i1 = 51;
      i2 = 100;
      color = 'yellow';
    } else if (pm2_5 > 35.5 && pm2_5<=55.4){
      bp1 = 35.5;
      bp2 = 55.4;
      i1 = 101;
      i2 = 150;
      color = 'orange';
    } else if (pm2_5 > 55.5 && pm2_5<= 150.4){
      bp1 = 55.5;
      bp2 = 150.4;
      i1 = 151;
      i2 = 200;
      color = 'red';
    } else if (pm2_5 > 150.5 && pm2_5<= 250.4){
      bp1 = 150.5;
      bp2 = 250.4;
      i1 = 201;
      i2 = 300;
      color = 'purple';
    } else if (pm2_5 > 250.5 && pm2_5 <=350.4){
      bp1 = 250.5;
      bp2 = 350.4;
      i1 = 301;
      i2 = 400;
      color = 'maroon';
    } else if (pm2_5 > 350.5 && pm2_5<=500.4){
      bp1 = 350.5;
      bp2 = 500.4;
      i1 = 401;
      i2 = 500;
      color = 'maroon';
    }

    //result of AQI formula rounded to nearest interger
    data.push(Math.round((((i2 -i1)/(bp2 - bp1)) * (pm2_5 - bp1)) + i1));

    data.push(color);
    
    return data;
  }
  
//Changes circle color based on value
// function getColor(temp) {
//   switch (true) {
//     case (temp<47):
//       return 'blue';
//       break;
//     case (temp>60 && temp <= 70):
//       return 'red';
//       break;
//     case (temp>70 || temp===null):
//       return 'green';
//       break;
//     default:
//       return 'grey';
//       break;
//   }
//}

//Adds Circles to each sensor's location
function addCircles(map, collection) {
  let data;
  console.log(collection.length);
  collection.forEach((index) => {
    data = calculateAqi(index);
    console.log(index);
    console.log(data);
    const circle = L.circleMarker([index[4], index[5]], {
      color: data[1],
      fillColor: data[1],
      fillOpacity: 0.7,
      radius: 15,
    }).addTo(map);

    map.on('click', function(e) {
      map.flyTo(e.latlng, 13, {
        animate: true,
        duration: 1.5
      });
    });

    L.gridLayer({updateWhenZooming: false});

    const popUpMessage = `
    <div style="
            background-color: yellow;
            padding: 15px;
            border-radius: 10px">
      <strong>Label: </strong>  ${index[1]} <br/>
      <strong>Sensor ID: </strong> ${index[0]}  <br/>
      <strong>Temperature: </strong> ${index[2]} <br/>
    </div>
    `;

    //Adds Pop Up Message when a circle is clicked
    circle.bindPopup(popUpMessage);

    //Centers Pop Up message in the circle when clicked
    circle.on("click", function (ev) {
      circle.openPopup(circle.getLatLng());
    });

    //Adds Temp value to the circles
    const myIcon = L.divIcon({
      className: "my-div-icon",
      html: "<strong>" + calculateAqi(index)[0] + "</strong>",
      iconAnchor: [6, 9],
    });
    L.marker([index[4], index[5]], {
      icon: myIcon,
    }).addTo(map);
  });
}

function mainEvent() {
  const myMap = initMap();

  async function getSensorsData() {
    const response = await fetch(
      "https://api.purpleair.com/v1/groups/1039/members?fields=name,temperature,humidity,latitude,longitude,pm2.5",
      {
        headers: {
          "X-API-Key": "14349495-BB81-11EC-B330-42010A800004",
        },
      }
    );
    const result = await response.json();

    addCircles(myMap, result.data);
  }

  getSensorsData();
}

//Loads the map with the API data
document.addEventListener("DOMContentLoaded", async () => mainEvent());
