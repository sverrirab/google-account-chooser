// Sverrir Á. Berg <sab@keilir.com>

var DEBUG = true;

console.log("in like Flynn!");

function getDomain() {
    try {
        var domain = document.referrer.split('/')[2];
        if (domain === undefined) {
            return "test.html";
        }
        return domain;
    }
    catch(err) {
        if (DEBUG) console.log("Problem getting domain from referrer:", err.mesasge);
        return "NONE";
    }
}

function getLoginButtons() {
    var buttons = [];
    var btnNo = 0;
    do {
        var btnId = "choose-account-".concat(btnNo);
        var button = document.getElementById(btnId);
        if (!button) {
            break;
        }
        buttons.push(button);
        btnNo++;
    } while (true);
    return buttons;
}

function clickHandler(domain, email) {
    return function () {
        console.log("clickHandler: registering %s -> %s", domain, email);
        chrome.runtime.sendMessage(
            {
                action: "setEmail",
                email: email,
                domain: domain
            },
            function (response) {
                console.log("clickHandler: done registering %s -> %s", domain, email);
            }
        );
    }
}

function registerClickHandlers() {
    var buttons = getLoginButtons();
    var domain = getDomain();
    console.log(buttons);
    console.log(domain);
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        var email = button.getAttribute("value");
        console.log("registerClickHandlers: %s %i is %s", domain, i, email);
        button.addEventListener("click", clickHandler(domain, email), false);
    }

    // Try to see if we should log in automatically.
    chrome.runtime.sendMessage(
        {
            action: "getEmail",
            domain: domain
        },
        function(response) {
            if (response !== undefined)  {
                if (response.email) {
                    for (var i = 0; i < buttons.length; i++) {
                        var button = buttons[i];
                        if (button.getAttribute("value") === response.email) {
                            console.log("clicking button for email:", response.email);
                            button.click();
                        }
                    }
                }
            }
        }
    );
}

//
// Let's begin...
//

registerClickHandlers();
