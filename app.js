
let xrSession = null;
let xrRefSpace = null;
let hitTestSource = null;
const reticle = document.getElementById("reticle");
const btn = document.getElementById("startBtn");

async function startAR() {
    if (!navigator.xr) {
        alert("WebXR не поддерживается");
        return;
    }

    xrSession = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test", "dom-overlay"],
        domOverlay: { root: document.body }
    });

    const gl = document.createElement("canvas").getContext("webgl", { xrCompatible: true });
    await gl.makeXRCompatible();

    const layer = new XRWebGLLayer(xrSession, gl);
    xrSession.updateRenderState({ baseLayer: layer });

    xrRefSpace = await xrSession.requestReferenceSpace("local");
    const viewerSpace = await xrSession.requestReferenceSpace("viewer");
    hitTestSource = await xrSession.requestHitTestSource({ space: viewerSpace });

    xrSession.requestAnimationFrame(onXRFrame);
}

function onXRFrame(time, frame) {
    const session = frame.session;
    session.requestAnimationFrame(onXRFrame);

    const pose = frame.getViewerPose(xrRefSpace);
    if (!pose) return;

    const hitTestResults = frame.getHitTestResults(hitTestSource);
    if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(xrRefSpace);
        const camPos = pose.transform.position;
        const hitPos = hitPose.transform.position;

        const dx = camPos.x - hitPos.x;
        const dy = camPos.y - hitPos.y;
        const dz = camPos.z - hitPos.z;

        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

        reticle.textContent = distance.toFixed(2) + " м";

        if (distance < 0.5) {
            reticle.style.background = "rgba(255,0,0,0.9)";
        } else {
            reticle.style.background = "rgba(0,255,0,0.8)";
        }
    }
}

btn.addEventListener("click", startAR);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
