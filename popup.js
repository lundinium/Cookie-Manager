var cookie_count = 0; // total number of cookies

document.addEventListener("DOMContentLoaded", function() {
    setTestCookies();
});

// update when cookies are set or deleted
chrome.cookies.onChanged.addListener(function() {
    getCookies();
});

// count all cookies and display their number
function countCookies(cookies) {
    cookie_count = cookies.length;
    if(cookie_count == 1) {
        document.getElementById("cookie_count").innerHTML = "is " + cookie_count + " cookie";
    } else {
        document.getElementById("cookie_count").innerHTML = "are " + cookie_count + " cookies";
    }
    // if there are no cookies, the button is invisible
    if(cookie_count > 0) {
        let button = document.getElementById("newTab_button");
        button.style.display = "block";
        button.onclick = function() {
            window.open("newpage.html", "_blank");
        };
    }
}

// API call to get all cookies
function getCookies() {
    chrome.cookies.getAll({}, function(cookies) {
        countCookies(cookies);
    });
}

// sets a couple of test cookies if there are no cookies
function setTestCookies() {
    // chrome.cookies.set({url: , name: , value: , domain: , path: , secure: , httpOnly: , expirationDate: });
    chrome.cookies.getAll({}, function(cookies) {
        if(cookies.length == 0) {
            chrome.cookies.set({url: "http://.example.com", name: "test0", value: "foo", secure: false, httpOnly: false, expirationDate: ((Date.now() / 1000) + 3600)});
            chrome.cookies.set({url: "https://.example.com", name: "test1", value: "bar", secure: true, httpOnly: false, expirationDate: ((Date.now() / 1000) + 3600)});
            chrome.cookies.set({url: "http://.example.com", name: "test2", value: "foobar", secure: false, httpOnly: true});
            chrome.cookies.set({url: "https://.example.com", name: "test3", value: "1337", secure: true, httpOnly: true, expirationDate: ((Date.now() / 1000) + 86400)});
            chrome.cookies.set({url: "http://.example.org", name: "test0", value: "foo", secure: false, httpOnly: false, expirationDate: ((Date.now() / 1000) + 3600)});
            chrome.cookies.set({url: "https://.example.org", name: "test1", value: "bar", secure: true, httpOnly: false, expirationDate: ((Date.now() / 1000) + 3600)});
            chrome.cookies.set({url: "http://.example.org", name: "test2", value: "foobar", secure: false, httpOnly: true});
            chrome.cookies.set({url: "https://.example.org", name: "test3", value: "1337", secure: true, httpOnly: true, expirationDate: ((Date.now() / 1000) + 86400)});
            getCookies();
        } else getCookies();
    });
}
