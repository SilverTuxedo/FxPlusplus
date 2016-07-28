
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

function customBackgroundSet(isNight) {
    getStorage("sync", "customBg", function (data) {
        var customBg = data.customBg;
        if (customBg == undefined) customBg = ["", ""];
        if (customBg[0] != "" || customBg[1] != "") {
            if (isNight) $("head").append('<style>body {background-image: url(' + customBg[1] + '); background-repeat: repeat;}</style>');
            else $("head").append('<style>body {background-image: url(' + customBg[0] + '); background-repeat: repeat;}</style>');
        }

    });
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

//this part makes sure that the screen is black while loading in night-mode.

getStorage("sync", "nightmode", function (data) {
    var nightmode = data.nightmode;
    if (nightmode) {
        $("html").append('<body><div class="utterBlack" style="width: 100%; height: 100%; top:0; left:0; position:fixed; z-index: 10000000; background-color: #000"></div></body>');
        console.log("EYES WILL BE HAPPY");
        customBackgroundSet(true);
    } else {
        customBackgroundSet(false);
    }

    $(document).ready(function () {
        if (nightmode) {

            $("body").css("background-color", "#000") //invert things

            customBackgroundSet(true);

            $(".sec.barssize.graygr").css({ "background-color": "#222", "border": "1px solid #313131" })
            $("iframe").each(function () { //target Ynet / youtube iframe
                if ($(this).attr("src")) {
                    if (/*$(this).attr("src").search("ynet-fxp") > -1 ||  YNET no longer needs inversion*/
                        $(this).attr("src").search("youtube") > -1) {
                        $(this).css("-webkit-filter", "invert(100%)")
                    }
                }
            })
            $(".threadpagenav").css("-webkit-filter", "invert(100%)") //the rest
            $(".threadbit").css("-webkit-filter", "invert(100%)")
            $(".threadlisthead").css("border", "1px solid #3B3B3B")
            $(".divhed div:first").css("-webkit-filter", "brightness(0.5)")
            $(".dargot").css("-webkit-filter", "invert(100%)")
            $(".gu").css("-webkit-filter", "invert(100%)")
            $(".c-fav").css("-webkit-filter", "invert(100%)")
            $(".table_footer").find("iframe").css("-webkit-filter", "contrast(2) brightness(3.5)")
            $(".table_footer").css("-webkit-filter", "invert(100%)")
            $("#cometchat_base").css("-webkit-filter", "invert(100%)")
            $("#cometchat_userstab_popup").css("-webkit-filter", "invert(100%)")
            $("#leftBlock").css("-webkit-filter", "invert(100%)")
            $(".ynetdiv.flo:eq(1)").css("-webkit-filter", "hue-rotate(192deg) brightness(2.3)")
            $("#breadcrumb").css("-webkit-filter", "invert(100%)")
            $(".pagetitle").css({ "border-left": "1px solid #3B3B3B", "border-right": "1px solid #3B3B3B" })
            $("#thread_controls").css({ "border": "1px solid #3b3b3b", "-webkit-filter": "brightness(0.7)" })
            $(".titleshowt").css({ "border": "1px solid #3b3b3b", "-webkit-filter": "brightness(0.7)" })
            $("#postlist").css("-webkit-filter", "invert(100%)")
            $("#postlist img").addClass("invertedImg");
            $("#qr_defaultcontainer").css("-webkit-filter", "invert(100%)")
            $(".navlinks").css("-webkit-filter", "invert(100%) brightness(2)")
            $("#pagination_top").css("-webkit-filter", "invert(100%)")
            $("#pagination_bottom").css("-webkit-filter", "invert(100%)")
            $("#pagetitle").css("-webkit-filter", "invert(100%)")
            $(".wysiwyg_block").css("-webkit-filter", "invert(100%)")
            $(".wysiwyg_block img").css("-webkit-filter", "invert(100%) brightness(2)")
            $(".formcontrols:eq(1)").css("-webkit-filter", "invert(100%)")
            $(".actionbuttons:eq(1)").css("-webkit-filter", "invert(100%)")
            $(".big-image").css("border", "1px solid #161616")
            $(".cats .ct").css("-webkit-filter", "invert(100%)")
            $(".cats").css("-webkit-filter", "invert(100%)")
            $("#sidebar_container").css("-webkit-filter", "invert(100%)")
            $("#sidebar_container img").css("-webkit-filter", "invert(100%) brightness(2)")
            $("#sidebar_container #usermenu .inlineimg").css("-webkit-filter", "invert(0)")
            $(".userprof_border").css("-webkit-filter", "invert(100%)")
            $("#view-aboutme").css("-webkit-filter", "invert(100%)")
            $("#view-aboutme img").css("-webkit-filter", "invert(100%)")
            $("#view-friends-content").css("-webkit-filter", "invert(100%)")
            $("#view-friends-content img").css("-webkit-filter", "invert(100%)")
            $("#view-infractions-content").css("-webkit-filter", "invert(100%)")
            $(".userprof #pagination_top").css("-webkit-filter", "invert(0)")
            $(".devWater").css("-webkit-filter", "invert(100%)")
            $("head").append("<style>#pageStats {color: #fff;border: 1px solid #3B3B3B;background: #040404;}</style>");
            $(".c-fav").parents("div:first").css("-webkit-filter", "invert(100%)");
            $(window).load(function () {
                $(".devWater").css("-webkit-filter", "invert(100%)");
                $(".editor_textbox_container").css("-webkit-filter", "invert(100%)");
                $("#usercp_content .formcontrols  .editor_textbox_container").css("-webkit-filter", "invert(0)");
                $("#related_main").css("-webkit-filter", "invert(100%)")

            });

            setCookie("nightUse", true, 5);
        }
        $(".utterBlack").fadeOut(1000, function () { $(this).remove() }); //remove blackness cover
    })
});