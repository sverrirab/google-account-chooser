// Google-Account-Chooser
function click_sso_button() {
    var parent = document.getElementById("googleSSO");
    if (parent) {
        var buttons = parent.getElementsByTagName("button");
        if (buttons.length) {
            buttons[0].click();
        }
    }
}

click_sso_button();