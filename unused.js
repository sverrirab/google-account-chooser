
var query_string = {};
var query = window.location.search.substring(1);
var vars = query.split("&");
for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    console.log("stuff:", pair[1], pair[0]);
    if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
}

console.log(response.farewell);

chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("Selecting account");
    //console.log(tab);
    //chrome.tabs.executeScript({
    //    code: 'var button = document.getElementById("choose-account-1"); button.click();'
    //console.log(button);
    //if (button) {
    //    button.click();
    //}
    //});
    //var manager_url = chrome.extension.getURL("popup.html");
    //focusOrCreateTab(manager_url);
});
