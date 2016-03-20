function click_sso_button() {
    var button = document.getElementById("openid-1");
    if (button.innerText === "Google") {
        button.click();
    }
}

click_sso_button();