//
// Copyright 2016-2020 - Sverrir A. Berg <sab@keilir.com>
// See LICENSE file for more information.
//

//
// Database
//

const DISABLED = "(disabled)";
const EMPTY = "(empty)";
const DEBUG = false;

let db = null;
let tabState = {};

function initDatabase() {
    chrome.storage.sync.get(null, function (data) {
        if (DEBUG) console.log("db init:", data);
        db = data;
    });
}

initDatabase();

function clearDatabase() {
    chrome.storage.sync.clear();
}

function getDatabase() {
    return db;
}

function setEmail(domain, email) {
    if (getEmail(domain) === email) {
        return;
    }
    let update = {};
    update[domain] = email;
    if (DEBUG) console.log("setEmail:", update);
    chrome.storage.sync.set(
        update,
        function() {
            if (chrome.runtime.lastError) {
                console.log("setEmail: ERROR: %s", chrome.runtime.lastError)
            }
            else {
                if (DEBUG) console.log("setEmail: success");
            }
        }
    );
}

function getEmail(domain) {
    if (DEBUG) console.log("getEmail: %s -> %s", domain, db[domain]);
    return db[domain];
}

function getTabData(tabId) {
    if (tabId in tabState) {
        return tabState[tabId];
    }
    else {
        return null;
    }
}

function setPageState(tabId, domain, email, noSets) {
    if (DEBUG) console.log("setPageState: %s / %s [%d], %d", domain, email, tabId, noSets);
    tabState[tabId] = {
        domain: domain,
        email: email
    };
    setEmail(domain, email);


    // make sure icon is set after page navigation
    for (let i = 0; i < noSets; i++) {
        setTimeout(function() {
            setIconState(tabId, domain, email);
        }, i * 500);
    }

}

function accountSelected(tabId, domain, email) {
    if (DEBUG) console.log("accountSelected: %s / %s [%d]", domain, email, tabId);
    let oldEmail = getEmail(domain);

    if (oldEmail === DISABLED) {
        email = DISABLED;
        if (DEBUG) console.log("Domain disabled: %s / %s [%d]", domain, email, tabId);
    }
    setPageState(tabId, domain, email, 10);
}

function setIconState(tabId, domain, email) {
    let icon = "res/blue_icon.png";
    if (email === DISABLED) {
        icon = "res/red_icon.png";
    }
    else if (!email || email === EMPTY) {
        icon = "res/gray_icon.png";
    }
    chrome.pageAction.setIcon({
        tabId: tabId,
        path : {
            "38": icon
        }
    });
    chrome.pageAction.show(tabId);
}

//
// Register global callback functions
//

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === "sync") {
        for (let key in changes) {
            if (changes.hasOwnProperty(key)) {
                let values = changes[key];
                if (DEBUG) {
                    console.log("values:", values);
                    console.log("db change: %s -> %s (from %s)", key, values.newValue, values.oldValue);
                }
                if (values.hasOwnProperty("newValue")) {
                    db[key] = values.newValue;
                }
                else {
                    delete db[key];
                }
            }
        }
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let tabId = sender.tab.id;
        if (DEBUG) console.log("request: %s tabid: %d", request, tabId);
        if (request.action === "getEmail") {
            let email = getEmail(request.domain);

            // Update icon state so page action gets enabled.
            setPageState(tabId, request.domain, email, 1);

            if (email) {
                if (DEBUG) console.log("message-getEmail: %s -> %s", request.domain, email);
                sendResponse({email: email});
            }
            else
            {
                if (DEBUG) console.log("message-getEmail: %s not found", request.domain);
            }
        }
        else if (request.action === "setEmail") {
            if (DEBUG) console.log("message-setEmail: %s -> %s", request.domain, request.email);
            accountSelected(tabId, request.domain, request.email);
            sendResponse({status: "registered"});
        }
        else {
            console.log("message-unknown: ", request);
        }
        return true;
    }
);
