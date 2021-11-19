"use strict";

const taskform = document.querySelector(".task--form");
const task = document.querySelector(".task");
const taskDate = document.querySelector(".taskDate");
const selectedLocation = document.querySelector("#location");

class tasky {
  constructor(taskName, taskDate, taskLocation) {
    this.taskName = taskName;
    this.taskDate = taskDate;
    this.taskLocation = taskLocation;
  }
}

class taskClass {
  #map;
  #geocodeService;
  taskList = [];

  constructor() {
    this.#geocodeService = L.esri.Geocoding.geocodeService({
      apikey:
        "AAPKaede21b406ec4ff38d55ced0bf46fdc3pGxLWQIJqeCXoPzJvFwVaQT45kDptmdeN702PPIVusUfo3upbDtqfZFLgOGkCO21", // replace with your api key - https://developers.arcgis.com
    });

    this._getCurrentPositions();

    let y = localStorage.getItem("tasks");

    this.taskList = JSON.parse(y);

    this._renderTasks();

    document
      .querySelector(".save-btn")
      .addEventListener("click", this._submitCallBack.bind(this));
  }

  _submitCallBack(formdata) {
    if (false === this._valdiateForm(taskform)) {
      return fasle;
    }

    this.taskList.push(
      new tasky(
        taskform.elements["task"].value,
        taskform.elements["taskDate"].value,
        taskform.elements["location"].value
      )
    );

    localStorage.setItem("tasks", JSON.stringify(this.taskList));

    this._renderTasks();

    L.marker([
      taskform.elements["location--lat"].value,
      taskform.elements["location--lang"].value,
    ])
      .addTo(this.#map)
      .bindPopup("You are here now 🌏")
      .openPopup();

    this.taskList.pop();
  }

  _valdiateForm() {
    if ("" === taskform.elements["task"].value) {
      alert("Task must be filled out");
      return false;
    }

    if ("" === taskform.elements["taskDate"].value) {
      alert("Task Date must be filled out");
      return false;
    }

    if ("" === taskform.elements["location"].value) {
      alert("Task Location must be filled out");
      return false;
    }
  }

  _renderTasks() {
    var h = document.querySelector(".task--form");

    this.taskList.forEach(function (current) {
      const htmlData = ` <div class="task">
      <input type="button" class="close" value="x">
    <ul class="u">
      <li id="task--name">${current.taskName}</li>
      <li id="task--date">${current.taskDate}</li>
      <li id="task--location">${current.taskLocation}</li>
    </ul>

  </div>`;

      h.insertAdjacentHTML("afterend", htmlData);
    });
    /* Get all elements with class="close" */
    var closebtns = document.getElementsByClassName("close");
    var i;

    /* Loop through the elements, and hide the parent, when clicked on */
    for (i = 0; i < closebtns.length; i++) {
      closebtns[i].addEventListener("click", function () {
        let nodeList = this.parentNode.childNodes;
        for (let i = 0; i < nodeList.length; i++) {
          let noddd = nodeList[i].nodeValue;
        }

        this.parentElement.style.display = "none";
      });
    }
  }

  _getCurrentPositions() {
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      this._errorGettingPosition,
      options
    );
  }

  _loadMap(pos) {
    var crd = pos.coords;

    //   console.log('Your current position is:');
    //   console.log(`Latitude : ${crd.latitude}`);
    //   console.log(`Longitude: ${crd.longitude}`);
    //   console.log(`More or less ${crd.accuracy} meters.`);
    this.#map = L.map("map").setView([crd.latitude, crd.longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker([crd.latitude, crd.longitude])
      .addTo(this.#map)
      .bindPopup("You are here now 🌏")
      .openPopup();

    L.control.scale().addTo(this.#map);

    this.#map.on("click", this._mapMarker.bind(this));

    var arcgisOnlineProvider = L.esri.Geocoding.arcgisOnlineProvider({
      apikey:
        "AAPKaede21b406ec4ff38d55ced0bf46fdc3pGxLWQIJqeCXoPzJvFwVaQT45kDptmdeN702PPIVusUfo3upbDtqfZFLgOGkCO21", // replace with your api key - https://developers.arcgis.com
    });

    var gisDayProvider = L.esri.Geocoding.featureLayerProvider({
      url: "https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/GIS_Day_Registration_Form_2019_Hosted_View_Layer/FeatureServer/0",
      searchFields: ["event_name", "host_organization"],
      label: "GIS Day Events 2019",
      bufferRadius: 5000,
      formatSuggestion: function (feature) {
        return (
          feature.properties.event_name +
          " - " +
          feature.properties.host_organization
        );
      },
    });

    L.esri.Geocoding.geosearch({
      providers: [arcgisOnlineProvider, gisDayProvider],
    }).addTo(this.#map);
  }

  _errorGettingPosition(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  _mapMarker(event) {
    // L.marker([event.latlng.lat, event.latlng.lng])
    //   .addTo(this.#map)
    //   .bindPopup("what.")
    //   .openPopup();
    // var geocodeService = L.esri.Geocoding.geocodeService({
    //   apikey:
    //     "AAPKaede21b406ec4ff38d55ced0bf46fdc3pGxLWQIJqeCXoPzJvFwVaQT45kDptmdeN702PPIVusUfo3upbDtqfZFLgOGkCO21", // replace with your api key - https://developers.arcgis.com
    // });

    this.#geocodeService
      .reverse()
      .latlng(event.latlng)
      .run(this._reverseGeoLocation.bind(this));
  }

  _reverseGeoLocation(error, result) {
    if (error) {
      return;
    }

    // L.marker(result.latlng)
    //   .addTo(this.#map)
    //   .bindPopup(result.address.Match_addr)
    //   .openPopup();

    taskform.classList.add("display--form");

    //this.#curLocation = result.address.Match_addr;
    document.querySelector("#location").value = result.address.Match_addr;

    document.querySelector("#location--lat").value = result.latlng.lat;
    document.querySelector("#location--lang").value = result.latlng.lng;
    //selectedLocation.textContent = result.address.Match_addr;
  }
}

let a = new taskClass();

// function success(pos) {
//   var crd = pos.coords;

//   //   console.log('Your current position is:');
//   //   console.log(`Latitude : ${crd.latitude}`);
//   //   console.log(`Longitude: ${crd.longitude}`);
//   //   console.log(`More or less ${crd.accuracy} meters.`);
//   var map = L.map("map").setView([crd.latitude, crd.longitude], 13);

//   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution:
//       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//   }).addTo(map);

//   L.marker([crd.latitude, crd.longitude])
//     .addTo(map)
//     .bindPopup(" customizable.")
//     .openPopup();

//   L.control.scale().addTo(map);

//   map.on("click", function (event) {
//     L.marker([event.latlng.lat, event.latlng.lng])
//       .addTo(map)
//       .bindPopup(" what.")
//       .openPopup();
//   });

// // var searchControl = new L.esri.Controls.Geosearch().addTo(map);

// // var results = new L.LayerGroup().addTo(map);

// // searchControl.on("results", function (data) {
// //   results.clearLayers();
// //   for (var i = data.results.length - 1; i >= 0; i--) {
// //     results.addLayer(L.marker(data.results[i].latlng));
// //   }
// // });
//}

// function error(err) {
//   console.warn(`ERROR(${err.code}): ${err.message}`);
// }

// navigator.geolocation.getCurrentPosition(success, error, options);
