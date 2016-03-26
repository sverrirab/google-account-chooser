const DISABLED = "(disabled)";
const EMPTY = "(empty)";

var extension = chrome.extension.getBackgroundPage();
var tabId = null;
var email = null;
var domain = null;
var DEBUG = true;

if (DEBUG) console.log("loading popup.js at: ", new Date());

function X(elId) {
    return document.getElementById(elId)
}

function updatePopupState() {
    if (DEBUG) console.log("updatePopupState %s, %s", domain, email);
    var d = domain;
    var e = email;
    if (d && e) {
        X("btnDomain").onclick = disableForThisDomain;
        X("btnEmail").onclick = removeAsDefault;
    }
    else {
        d = "(error)";
        e = "(error)";
        X("btnDomain").disabled = true;
        X("btnEmail").disabled = true;
    }
    X("domain").innerText = d;
    X("email").innerText = e;
}

function removeAsDefault() {
    if (tabId && domain) {
        extension.setPageState(tabId, domain, EMPTY, 1);
        window.close();
    }
}

function disableForThisDomain() {
    if (tabId && domain) {
        extension.setPageState(tabId, domain, DISABLED, 1);
        window.close();
    }
}

chrome.tabs.query(
    {
        currentWindow: true,
        active : true
    },
    function(tabArray) {
        if (tabArray.length > 0) {
            tabId = tabArray[0].id;
            var data = extension.getTabData(tabId);
            if (data) {
                domain = data["domain"];
                email = data["email"];
                updatePopupState();
            }
        }
    }
);
