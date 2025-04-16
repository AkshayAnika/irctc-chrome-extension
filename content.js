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
      transition: opacity 0.3s ease, bottom 0.3s ease;
    `;

    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL("images/icon48.png");
    icon.style.cssText = `width: 20px; height: 20px;`;

    const text = document.createElement("span");
    text.textContent = message;

    snackbar.appendChild(icon);
    snackbar.appendChild(text);
    document.body.appendChild(snackbar);

    requestAnimationFrame(() => {
        snackbar.style.opacity = "1";
    });

    setTimeout(() => {
        snackbar.style.opacity = "0";
        setTimeout(() => snackbar.remove(), 300);
    }, 4000);
}

// Listen for popup request
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "showPopup") {
        createPopup(request.message);
        sendResponse({ success: true });
    }
    return true;
});

function setAngularValue(input, value) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

function autofillLoginForm(username, password) {
    const interval = setInterval(() => {
        const usernameInput = document.querySelector('input[formcontrolname="userid"]');
        const passwordInput = document.querySelector('input[formcontrolname="password"]');

        if (usernameInput && passwordInput) {
            setAngularValue(usernameInput, username || '');
            setAngularValue(passwordInput, password || '');

            clearInterval(interval);
        }
    }, 500);
}

function listenForLoginModal() {
    const observer = new MutationObserver((mutations, obs) => {
        const usernameField = document.querySelector('input[formcontrolname="userid"]');
        const passwordField = document.querySelector('input[formcontrolname="password"]');
        if (usernameField && passwordField) {
            chrome.storage.local.get(["irctc_username", "irctc_password"], (data) => {
                autofillLoginForm(data.irctc_username, data.irctc_password);
            });
            obs.disconnect(); // stop observing once we’ve found the form
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Save inputs as user types
function monitorInputSaving() {
    const saveInterval = setInterval(() => {
        const username = document.querySelector('input[formcontrolname="userid"]');
        const password = document.querySelector('input[formcontrolname="password"]');

        if (username && password) {
            username.addEventListener("input", () => {
                chrome.runtime.sendMessage({ action: "saveToStorage", key: "irctc_username", value: username.value });
            });

            password.addEventListener("input", () => {
                chrome.runtime.sendMessage({ action: "saveToStorage", key: "irctc_password", value: password.value });
            });

            clearInterval(saveInterval); // Done
        }
    }, 1000);
}

window.addEventListener("load", () => {
    listenForLoginModal();
    monitorInputSaving();
});
