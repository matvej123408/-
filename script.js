// Координаты остановок (примерные)
const stops = [
    { name: "Friedenstraße 44", coords: [50°34'59.9"N 8°41'57.3"E], time: 0 },
    { name: "Friedenstraße/Licherstraße", coords: [50°34'53.9"N 8°41'45.7"E], time: 4 },
    { name: "Kugelberg/Licherstraße", coords: [50°34'55.2"N 8°41'41.9"E], time: 2 },
    { name: "Spielplatz", coords: [50°35'01.9"N 8°41'48.9"E], time: 5 },
    { name: "Rewe/volkshallebushalterstelle", coords: [50°35'09.2"N 8°41'47.6"E], time: 3 },
    { name: "Kugelberg/Friedenstraße", coords: [50°35'01.5"N 8°41'52.8"E], time: 5 },
    { name: "Friedenstraße 44", coords: [50°34'59.9"N 8°41'57.3"E], time: 2 }
];

let currentStop = 0;
let startTime = null;

// Создаём карту
const map = L.map('map').setView(stops[0].coords, 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Добавляем метки на карту
stops.forEach(stop => {
    L.marker(stop.coords).addTo(map).bindPopup(stop.name);
});

document.getElementById("startBtn").addEventListener("click", startNavigation);

function startNavigation() {
    startTime = new Date();
    document.getElementById("status").innerText = "Маршрут начался!";
    checkNextStop();
}

function checkNextStop() {
    if (currentStop >= stops.length) {
        document.getElementById("status").innerText = "Маршрут завершён!";
        return;
    }

    const now = new Date();
    const elapsedMinutes = Math.floor((now - startTime) / 60000); // Прошло минут

    const expectedTime = stops[currentStop].time;
    const delay = elapsedMinutes - expectedTime;

    let statusText = Остановка: ${stops[currentStop].name} | Время по плану: ${expectedTime} мин | Прошло: ${elapsedMinutes} мин;

    if (delay > 0) {
        statusText +=  | Опаздываем на ${delay} мин;
    } else if (delay < 0) {
        statusText +=  | Идём с опережением на ${Math.abs(delay)} мин;
    } else {
        statusText +=  | Идём по расписанию;
    }

    document.getElementById("status").innerText = statusText;

    // Переключаемся на следующую остановку через 3 секунды
    currentStop++;
    setTimeout(checkNextStop, 3000);
}


---
// Функция для голосового объявления
function speakText(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "de-DE"; // Немецкий язык (можно поменять на "ru-RU" для русского)
    speech.rate = 1.0; // Скорость речи
    window.speechSynthesis.speak(speech);
}

// Функция проверки следующей остановки (обновлено с голосом)
function checkNextStop() {
    if (currentStop >= stops.length) {
        const finalText = "Маршрут завершён.";
        document.getElementById("status").innerText = finalText;
        speakText(finalText);
        return;
    }

    const now = new Date();
    const elapsedMinutes = Math.floor((now - startTime) / 60000); // Прошло минут
    const expectedTime = stops[currentStop].time;
    const delay = elapsedMinutes - expectedTime;

    let statusText = Остановка: ${stops[currentStop].name} | Время по плану: ${expectedTime} мин | Прошло: ${elapsedMinutes} мин;

    let voiceText = Прибываем на остановку ${stops[currentStop].name}.;

    if (delay > 0) {
        statusText +=  | Опаздываем на ${delay} мин;
        voiceText +=  Опоздание ${delay} минут.;
    } else if (delay < 0) {
        statusText +=  | Идём с опережением на ${Math.abs(delay)} мин;
        voiceText +=  Опережаем расписание на ${Math.abs(delay)} минут.;
    } else {
        statusText +=  | Идём по расписанию;
        voiceText +=  Двигаемся по расписанию.;
    }

    document.getElementById("status").innerText = statusText;
    speakText(voiceText);

    // Переключаемся на следующую остановку через 3 секунды
    currentStop++;
    setTimeout(checkNextStop, 3000);
}


---
