var filtered = []; // array to store cookies when filtered

// add onclick listener and fill table with cookie data when page loaded
document.addEventListener("DOMContentLoaded", function() {
    // button to apply filter or refresh table
    document.getElementById("apply").onclick = function() {
        filterCookies();
    };
    // button to reset filters and view all cookies again
    document.getElementById("removeallfilters").onclick = function() {
        removeAllFilters();
    };
    // button to delete all currently shown cookies; confirmation required
    document.getElementById("deleteselected").onclick = function() {
        if(window.confirm("Do you really want to delete all selected cookies?")) {
            deleteSelectedCookies();
        }
    };
    // load table
    initTable();
});

// gets all cookies from all cookie stores and passes them to fillTable function
function initTable() {
    chrome.cookies.getAll({}, function(cookies) {
        if(cookies.length > 0) {
            fillTable(cookies);
        }
    });
}

// fills html table with the cookie data which are passed as an array
function fillTable(cookies) {
    var table = document.getElementById("cookiesTable");
    // for all passed cookies...
    for(i = 0; i < cookies.length; i++) {
        // current cookie
        var cookie = cookies[i];
        // insert new row into table
        var row = table.insertRow(-1);
        // update table row dataset with the data necessary to remove a cookie
        row.setAttribute("data-name", cookie.name);
        row.setAttribute("data-url", "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path);

        // fill cells:
        // enumeration
        var cell0 = row.insertCell(0);
        cell0.innerHTML = (i + 1) + ".";
        // cookie host/domain
        var cell1 = row.insertCell(1);
        cell1.innerHTML = cookie.domain;
        // cookie path
        var cell2 = row.insertCell(2);
        cell2.innerHTML = cookie.path;
        // cookie name
        var cell3 = row.insertCell(3);
        cell3.innerHTML = cookie.name;
        // cookie value
        var cell4 = row.insertCell(4);
        cell4.innerHTML = cookie.value;
        // cookie expiration date
        var cell5 = row.insertCell(5);
        cell5.innerHTML = convertTimestampToUTC(cookie.expirationDate);
        // delete cookie button
        var cell6 = row.insertCell(6);
        cell6.style.textAlign = "center";
        cell6.style.fontWeight = "bold";
        cell6.innerHTML = "<div id=\"del" + i + "\">&#128473;</div>";
        let div = document.getElementById("del" + i);
        div.style.cursor = "pointer";
        div.onclick = function() {removeCookie(div.parentNode.parentNode)};
    }
    document.getElementById("results").innerHTML = table.rows.length + " result" + ((table.rows.length == 1) ? ":" : "s:");
}

// convert expirationDate timestamp to local time string
function convertTimestampToUTC(timestamp) {
    // if the cookie has no expiration date, it is a session cookie
    if (timestamp == null) {
        return "Expires by the end of your session";
    } else {
        timestamp = Math.floor(timestamp * 1000);
        var convertedTime = new Date(timestamp).toString();
        // add some commas
        convertedTime = convertedTime.substring(0, 3) + "," + convertedTime.substring(3, 15) + "," + convertedTime.substring(15, 24);
        return convertedTime;
    }
}

// delete a single cookie
function removeCookie(div) {
    // remove cookie from Chrome
    chrome.cookies.remove({url: div.dataset.url, name: div.dataset.name});
    // update filtered array, will update table too
    filterCookies();
}

// apply host, name and session filter
function filterCookies() {
    chrome.cookies.getAll({}, function(cookies) {
        // create regular expressions to make search case insensitive
        let domain = new RegExp(document.getElementById("hostFilter_input").value, "i");
        let name = new RegExp(document.getElementById("nameFilter_input").value, "i");
        let value = new RegExp(document.getElementById("valueFilter_input").value, "i");
        let session = document.querySelector("input[name = 'session']:checked").value;
        // reset filtered array
        filtered = [];
        // for each cookie in chrome...
        cookies.forEach(function(item) {
            // add to filtered array if cookie properties match user input
            // matches (case insensitive) if user input is substring of property
            if(domain === "" || item.domain.search(domain) > -1) {
                if(name === "" || item.name.search(name) > -1) {
                    if(value == "" || item.value.search(value) > -1) {
                        if(session === "-1" || item.session == session) {
                            filtered.push(item);
                        }
                    }
                }
            }
        });
        refreshTable();
    });
}

// update table when a cookie was deleted
function refreshTable() {
    // delete all rows
    let rows = document.getElementById("cookiesTable").rows;
    while(rows.length > 0) {
        rows[0].parentNode.removeChild(rows[0]);
    }
    // refill table. if filter was applied keep it applied
    fillTable(filtered);
}

// remove all filters
function removeAllFilters() {
    document.getElementById("hostFilter_input").value = "";
    document.getElementById("nameFilter_input").value = "";
    document.getElementById("valueFilter_input").value = "";
    document.getElementById("all").checked = true;
    filterCookies();
}

// delete all selected cookies
function deleteSelectedCookies() {
    let n = document.getElementById("cookiesTable").rows.length;
    // delete cookies by their row because url is stored in row dataset
    for (i = 0; i < n; i++) {
        let tmp = document.getElementById("cookiesTable").rows[i];
        chrome.cookies.remove({url: tmp.dataset.url, name: tmp.dataset.name});
    }
    // then check for new cookies and refresh table
    filterCookies();
}
