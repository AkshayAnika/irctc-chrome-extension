chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "saveToStorage") {
        chrome.storage.local.set({ [message.key]: message.value });
    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "showPopupInTab") {
        // Get the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                // Send message to content script in the active tab
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: "showPopup",
                        message: request.message,
                    },
                    function (response) {
                        sendResponse(response);
                    }
                );
            }
        });
        return true;
    }
});