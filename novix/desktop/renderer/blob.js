const blobImage = document.getElementById("blobImage");
if (!blobImage) {
    console.warn("Blob image element not found");
} else {
    let dragStarted = false;
    let startX = 0;
    let startY = 0;

    const api = window.electronAPI;

    function resetDrag() {
        dragStarted = false;
        startX = 0;
        startY = 0;
    }

    function safelyCallApi(method, ...args) {
        if (api && typeof api[method] === "function") {
            try {
                api[method](...args);
            } catch (error) {
                console.warn(`Electron API call failed for ${method}:`, error);
            }
        } else {
            console.warn(`Electron API method ${method} is unavailable`);
        }
    }

    blobImage.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        dragStarted = false;
        startX = event.clientX;
        startY = event.clientY;
        try {
            blobImage.setPointerCapture(event.pointerId);
        } catch (error) {
            console.warn("Could not capture pointer:", error);
        }
    });

    blobImage.addEventListener("pointermove", (event) => {
        if (startX === 0 && startY === 0) {
            return;
        }

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
            return;
        }

        dragStarted = true;
        safelyCallApi("moveWindow", dx, dy);
        startX = event.clientX;
        startY = event.clientY;
    });

    blobImage.addEventListener("pointerup", () => {
        if (!dragStarted) {
            safelyCallApi("toggleChat");
        }
        resetDrag();
    });

    blobImage.addEventListener("pointercancel", resetDrag);
}
