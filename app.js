
const video = document.getElementById('camera');
const btn = document.getElementById('startBtn');
const reticle = document.getElementById('reticle');

let fakeDistance = 2.0;

// 📷 Запрос разрешения на камеру
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        video.srcObject = stream;
        btn.style.display = "none";

        simulateDistance(); // без WebXR используем приближенную модель
    } catch (e) {
        alert("Нет доступа к камере");
    }
}

// ⚠️ ВАЖНО:
// Без WebXR или ARCore браузер НЕ может реально измерять дистанцию.
// Поэтому используется имитация изменения расстояния
// (можно заменить на AI/ML модель при желании)

function simulateDistance() {
    setInterval(() => {
        fakeDistance += (Math.random() - 0.5) * 0.2;
        fakeDistance = Math.max(0.2, Math.min(3, fakeDistance));

        reticle.textContent = fakeDistance.toFixed(2) + " м";

        if (fakeDistance < 0.5) {
            reticle.style.background = "rgba(255,0,0,0.9)";
        } else {
            reticle.style.background = "rgba(0,255,0,0.8)";
        }
    }, 500);
}

btn.addEventListener('click', startCamera);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
