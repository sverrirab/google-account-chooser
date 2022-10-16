//
// Copyright 2016-2022 - Sverrir A. Berg <sab@keilir.com>
// See LICENSE file for more information.
//

const DEBUG = true; // TODO: REMOVE!!!
const DELAY_LOGIN_MILLISECONDS = 500;

if (DEBUG) console.log("google_account.js - in like Flynn!");

function gacGetDomain() {
    try {
        let domain = document.referrer.split('/')[2];
        if (domain === undefined) {
            return "test.html";
        }
        return domain;
    } catch (err) {
        if (DEBUG) console.log("Problem getting domain from referrer:", err.mesasge);
        return "NONE";
    }
}

function gacGetLoginElements() {
    return document.querySelectorAll('[data-identifier]');
}

function gacPerformLogin(email) {
    if (DEBUG) console.log("gacPerformLogin: %s", email);
    let loginElements = gacGetLoginElements();

    // Find and click if the account match given email
    for (let i = 0; i < loginElements.length; i++) {
        let el = loginElements[i];
        let elEmail = el.getAttribute("data-identifier");
        if (DEBUG) console.log("gacFoundEntry: %s", elEmail);
        if (elEmail === email) {
            if (DEBUG) console.log("clicking button for email:", email);
            el.click();
            return true;
        }
    }

    if (DEBUG) console.log("gacPerformLogin: did not match any");
    return false;
}

function gacClickHandler(domain, el) {
    return function () {
        let email = el.getAttribute("data-identifier");
        if (DEBUG) console.log("clickHandler: registering %s -> %s", domain, email);
        chrome.runtime.sendMessage(
            {
                action: "setEmail",
                email: email,
                domain: domain
            },
            function (response) {
                if (DEBUG) console.log("clickHandler: done registering %s -> %s", domain, email);
            }
        );
    }
}

function gacStartup() {
    let domain = gacGetDomain();
    let loginElements = gacGetLoginElements();

    // Register click handlers
    loginElements.forEach(
        el => el.addEventListener("click", gacClickHandler(domain, el), false)
    );

    // Auto click the first account if there is only one
    if (loginElements.length == 1) {
        setTimeout(() => {
            let el = loginElements[0];
            el.click();
        }, DELAY_LOGIN_MILLISECONDS);
        return;
    }

    // Try to see if we should log in automatically.
    chrome.runtime.sendMessage(
        {
            action: "getEmail",
            domain: domain
        },
        function (response) {
            if (response !== undefined) {
                if (response.email) {
                    setTimeout(gacPerformLogin, DELAY_LOGIN_MILLISECONDS, response.email);
                }
            }
        }
    );
}

gacStartup();
