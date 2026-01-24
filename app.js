let map;
let addMode = false;
let signals = [];
let userMarker;

const DISTANCE_TRIGGER = 40;

function createSignalIcon(text, color) {
  return L.divIcon({
    className: "signal-icon",
    html: `<div style="width:40px;height:40px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;border:3px solid black;">${text}</div>`
  });
}

const ICON_RED = createSignalIcon("", "red");
const ICON_A = createSignalIcon("A", "orange");
const ICON_GREEN = createSignalIcon("", "green");

function initMap() {
  map = L.map("map").setView([52.52, 13.405], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  map.on("click", (e) => {
    if (!addMode) return;

    const marker = L.marker(e.latlng, { icon: ICON_RED }).addTo(map);
    marker.triggered = false;

    marker.on("click", () => {
      map.removeLayer(marker);
      signals = signals.filter(s => s !== marker);
      saveSignals();
    });

    signals.push(marker);
    saveSignals();
  });
}

function watchUserLocation() {
  navigator.geolocation.watchPosition((pos) => {
    const latlng = [pos.coords.latitude, pos.coords.longitude];

    if (!userMarker) {
      userMarker = L.circleMarker(latlng, { radius: 8, color: "blue" }).addTo(map);
    } else {
      userMarker.setLatLng(latlng);
    }

    checkSignals(latlng);
  });
}

function checkSignals(userLatLng) {
  signals.forEach(signal => {
    if (signal.triggered) return;

    const d = map.distance(userLatLng, signal.getLatLng());
    if (d < DISTANCE_TRIGGER) triggerSignal(signal);
  });
}

function triggerSignal(signal) {
  signal.triggered = true;
  signal.setIcon(ICON_A);
  setTimeout(() => signal.setIcon(ICON_GREEN), 15000);
}

function saveSignals() {
  const data = signals.map(s => s.getLatLng());
  localStorage.setItem("signals", JSON.stringify(data));
}

function loadSignals() {
  const data = JSON.parse(localStorage.getItem("signals") || "[]");
  data.forEach(latlng => {
    const marker = L.marker(latlng, { icon: ICON_RED }).addTo(map);
    marker.triggered = false;

    marker.on("click", () => {
      map.removeLayer(marker);
      signals = signals.filter(s => s !== marker);
      saveSignals();
    });

    signals.push(marker);
  });
}

document.getElementById("addModeBtn").onclick = () => {
  addMode = !addMode;
  alert(addMode ? "Тыкни на карту чтобы поставить светофор" : "Режим выключен");
};

document.getElementById("clearBtn").onclick = () => {
  signals.forEach(s => map.removeLayer(s));
  signals = [];
  saveSignals();
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

initMap();
loadSignals();
watchUserLocation();
