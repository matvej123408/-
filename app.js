
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const distanceEl = document.getElementById('distance');

let currentStream = null;
let facingMode = 'user';

async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode }
  });
  currentStream = stream;
  video.srcObject = stream;
}

document.getElementById('btnFront').onclick = async () => {
  facingMode = 'user';
  await startCamera();
};

document.getElementById('btnBack').onclick = async () => {
  facingMode = { exact: 'environment' };
  await startCamera();
};

// --- WebXR Depth API (best-effort) ---
let xrSession = null;
let xrRefSpace = null;

document.getElementById('btnAR').onclick = async () => {
  if (!navigator.xr) {
    alert('WebXR не поддерживается в этом браузере.');
    return;
  }
  try {
    xrSession = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['depth-sensing'],
      depthSensing: {
        usagePreference: ['cpu-optimized'],
        dataFormatPreference: ['luminance-alpha', 'float32']
      }
    });
    xrRefSpace = await xrSession.requestReferenceSpace('local');
    xrSession.requestAnimationFrame(onXRFrame);
  } catch (e) {
    alert('AR/LiDAR недоступен на этом устройстве.');
  }
};

function onXRFrame(t, frame) {
  const pose = frame.getViewerPose(xrRefSpace);
  if (pose) {
    const view = pose.views[0];
    const depthInfo = frame.getDepthInformation(view);
    if (depthInfo) {
      // Берем центр экрана
      const x = Math.floor(depthInfo.width / 2);
      const y = Math.floor(depthInfo.height / 2);
      const d = depthInfo.getDepth(x, y); // метры
      if (Number.isFinite(d)) {
        distanceEl.textContent = d.toFixed(2) + ' м';
      } else {
        distanceEl.textContent = '—';
      }
    } else {
      distanceEl.textContent = 'LiDAR не поддерживается';
    }
  }
  xrSession.requestAnimationFrame(onXRFrame);
}

// Resize overlay to video
video.addEventListener('loadedmetadata', () => {
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
});
