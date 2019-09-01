// background script to set the number of cookies as tooltip

function setTitle() {
    chrome.cookies.getAll({}, function(cookies) {
        let n = cookies.length;
        chrome.browserAction.setTitle({title: "Cookie Manager: " + n + " cookie" + ((n == 1) ? "" : "s")});
    });
}

setTitle();

// update when cookies are set or deleted
chrome.cookies.onChanged.addListener(function() {
    setTitle();
});
