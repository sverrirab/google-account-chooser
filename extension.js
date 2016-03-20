// Sverrir Á. Berg <sab@keilir.com>

//
// Database
//

var db = null;
var blinkIndex = 0;


function initDatabase() {
    chrome.storage.sync.get(null, function (data) {
        console.log("db init:", data);
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
    var update = {};
    update[domain] = email;
    console.log("setEmail:", update);
    chrome.storage.sync.set(
        update,
        function() {
            if (chrome.runtime.lastError) {
                console.log("setEmail: ERROR: %s", chrome.runtime.lastError)
            }
            else {
                console.log("setEmail: success");

            }
        }
    );
}

function getEmail(domain) {
    return db[domain];
}

//
// Register global callback functions
//

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === "sync") {
        for (var key in changes) {
            if (changes.hasOwnProperty(key)) {
                var values = changes[key];
                console.log("values:", values);
                console.log("db change: %s -> %s (from %s)", key, values.newValue, values.oldValue);
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
        // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        console.log(sender.tab);
        console.log(sender.tab.id);

        if (request.action == "getEmail") {
            var email = getEmail(request.domain);
            if (email) {
                console.log("message-getEmail: %s -> %s", request.domain, email);
                sendResponse({email: email});
            }
            else
            {
                console.log("message-getEmail: %s not found", request.domain);
            }
        }
        else if (request.action == "setEmail") {
            console.log("message-setEmail: %s -> %s", request.domain, request.email);
            blinkStart();
            setEmail(request.domain, request.email);
            sendResponse({status: "registered"});
        }
        else {
            console.log("message-unknown: ", request);
        }
    }
);

function blinkStart() {
    blinkIndex = 5 * 5;
    blinkIcon();
}

function blinkIcon() {
    if (blinkIndex > 0) {
        blinkIndex--;

        var icon = "res/gray16x16.png";
        if (blinkIndex % 2 === 1) {
            icon = "res/blue16x16.png";
        }
        console.log("blinkIcon %d, %s", blinkIndex, icon);
        chrome.browserAction.setIcon({
            path : {
                "19": icon
            }
        });
        setTimeout(blinkIcon, 200)
    }
}

// Called when the user clicks on the browser action.
/*
chrome.browserAction.onClicked.addListener(
    function(tab) {
        console.log('Turning ' + tab.url + ' red!');
        chrome.tabs.executeScript({
            code: 'document.body.style.backgroundColor="red"'
        });
    }
);
*/

function click(e) {
    chrome.tabs.executeScript(null,
        {code:"document.body.style.backgroundColor='" + e.target.id + "'"});
    window.close();
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("domcontentloaded?");
    var divs = document.querySelectorAll('div');
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', click);
    }
});