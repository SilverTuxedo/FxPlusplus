
var storageSyncSupport;
if (chrome.storage.sync) {
    //browser supports chrome.storage.sync (eg. chrome)
    storageSyncSupport = true;
} else {
    //browser does not support chrome.storage.sync (eg. firefox)
    storageSyncSupport = false;
}

//set a value in the extension's storage
function setStorage(type, storageObject, callback) {
    if (type == "sync" && storageSyncSupport) {
        //sync has been called and browser supports sync
        chrome.storage.sync.set(storageObject, function () {
            if (callback)
                callback();
        });
    } else {
        //local has been called and/or browser does not support sync
        chrome.storage.local.set(storageObject, function () {
            if (callback)
                callback();
        });
    }
}
//get a value from the extension's storage
function getStorage(type, name, callback) {
    if (type == "sync" && storageSyncSupport) {
        //sync has been called and browser supports sync
        chrome.storage.sync.get(name, function (data) {
            if (callback)
                callback(data);
        });
    } else {
        //local has been called and/or browser does not support sync
        chrome.storage.local.get(name, function (data) {
            if (callback)
                callback(data);
        });
    }
}

getStorage("sync", "readTimeUser", function (data) {
    var readTimeUser = data.readTimeUser;
    if (isNaN(readTimeUser)) {
        setStorage("sync", { "readTimeUser": 220 }, function () { location.reload() });
    } else {
        var msg = "";
        var readtime = 0;

        var interval;
        $(document).ready(function () {
            $("script").remove();
            $("img").remove();
            if ($(".navbit:eq(2)").text().search("עדכוני") > -1) { //verify that this is from an "update" forum
                if ($(".postcontent:eq(0) table[width=950]").length > 1) { //FxP's dumb table design
                    msg = $(".postcontent:eq(0) table[width=950] table[width=950] > tbody > tr:first > td:eq(1)").text().replace(/\n/g, " ").replace(/  /g, " ");
                } else {
                    for (i = 2; i < 11; i++) {
                        if ($(".postbit:eq(0) .postcontent").text().split("\n")[i].split(" ").length > 15) {
                            msg = $(".postbit:eq(0) .postcontent").text().split("\n")[i];
                            i = 200;
                        } else if (i == 10) {
                            msg = $(".postbit:eq(0) .postcontent").text();
                        }
                    }
                }
            }
            else msg = $(".postbit:eq(0) .postcontent").text();


            var words = msg.split(" ").length;
            readtime = Math.round(words / readTimeUser * 10) / 10; //round to 1 decimal place
            var output = "";
            if (readtime >= 1) output += readtime + " דק'";
            else if (Math.round(readtime * 60) > 0) output += Math.round(readtime * 60) + " שנ'";
            else output += ">1 שנ'"
            interval = setInterval(function () { $("html").html('<head></head><body><div class="timeInText">' + output + '</div></body>'); }, 100);
        })
        $(window).load(function () {
            window.clearInterval(interval);
            $("body").css("background", "#00ff00")
        })
    }

});