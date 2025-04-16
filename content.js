function captureIRCTCInputs() {
    const $usernameInput = $('input[formcontrolname="userid"]');
    const $passwordInput = $('input[formcontrolname="password"]');

    if ($usernameInput.length && $passwordInput.length) {
        $usernameInput.on("input", function () {
            const username = $(this).val();
            if (chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: "saveToStorage",
                    key: "irctc_username",
                    value: username,
                });
            }
        });

        $passwordInput.on("input", function () {
            const password = $(this).val();
            if (chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: "saveToStorage",
                    key: "irctc_password",
                    value: password,
                });
            }
        });
    } else {
        setTimeout(captureIRCTCInputs, 1000);
    }
}

$(window).on("load", captureIRCTCInputs);

function createPopup(message) {
    const existing = document.getElementById("irctc-extension-snackbar");
    if (existing) {
        existing.remove();
    }

    // Create snackbar container
    const snackbar = document.createElement("div");
    snackbar.id = "irctc-extension-snackbar";
    snackbar.style.cssText = `
      position: fixed;
      background-color: #fff;
      color: #000;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      padding: 14px 24px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      transition: opacity 0.3s ease, bottom 0.3s ease;`
        ;

    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL("images/icon48.png");
    icon.style.cssText = `
      width: 20px;
      height: 20px;`;

    const text = document.createElement("span");
    text.textContent = message;

    snackbar.appendChild(icon);
    snackbar.appendChild(text);
    document.body.appendChild(snackbar);

    // Animate in
    requestAnimationFrame(() => {
        snackbar.style.opacity = "1";
    });

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        snackbar.style.opacity = "0";
        setTimeout(() => snackbar.remove(), 300); // Cleanup after fade out
    }, 4000);
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "showPopup") {
        createPopup(request.message);
        sendResponse({ success: true });
    }
    return true;
});