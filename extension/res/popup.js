//
// Copyright 2016-2022 - Sverrir A. Berg <sab@keilir.com>
// See LICENSE file for more information.
//
const DISABLED = "(disabled)";
const EMPTY = "(empty)";

let extension = chrome.extension.getBackgroundPage();
let tabId = null;
let email = null;
let domain = null;
const DEBUG = true;  // TODO: remove

if (DEBUG) extension.console.log("loading popup.js at: ", new Date());

function X(elId) {
    return document.getElementById(elId)
}

function updatePopupState() {
    if (DEBUG) extension.console.log("updatePopupState %s, %s", domain, email);
    let d = domain;
    let e = email;
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
            let data = extension.getTabData(tabId);
            if (DEBUG) extension.console.log("data", data);
            if (data) {
                domain = data["domain"];
                email = data["email"];
                updatePopupState();
            }
        }
    }
);

browser.tabs.onUpdated(function(activeInfo) {
    if (DEBUG) extension.console.log(activeInfo.tabId);
});
