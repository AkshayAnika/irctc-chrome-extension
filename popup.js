$(document).ready(function () {
    // Load data from storage
    chrome.storage.local.get(["irctc_username", "irctc_password"], function (data) {
        $("#username").val(data.irctc_username || "");
        $("#password").val(data.irctc_password || "");
    });

    // Toggle password visibility
    $(".toggle").on("click", function () {
        const $password = $("#password");
        const isPassword = $password.attr("type") === "password";
        $password.attr("type", isPassword ? "text" : "password");
        $(this).html(
            isPassword
                ? '<img width="16" src="https://img.icons8.com/fluency-systems-regular/48/invisible.png" alt="Hide">'
                : '<img width="16" src="https://img.icons8.com/fluency-systems-regular/48/visible--v1.png" alt="Show">'
        );
    });

    // Copy to clipboard
    $(".copy").on("click", function () {
        const targetId = $(this).data("target");
        const $input = $("#" + targetId);
        const value = $input.val().trim();

        if (!value) {
            chrome.runtime.sendMessage({
                action: "showPopupInTab",
                message: `Cannot copy. ${targetId} is empty.`,
            });
            return;
        }

        $input[0].select();
        document.execCommand("copy");

        chrome.runtime.sendMessage({
            action: "showPopupInTab",
            message: `${targetId} copied`,
        });
    });

    // Delete/Clear stored credentials
    $(".delete").on("click", function () {
        chrome.storage.local.clear(() => {
            $("#username, #password").val("");
            chrome.runtime.sendMessage({
                action: "showPopupInTab",
                message: "Credentials cleared",
            });
        });
    });

    // Set footer logo
    const logoUrl = chrome.runtime.getURL("images/icon48.png");
    $("#footer-logo").attr("src", logoUrl);
});
