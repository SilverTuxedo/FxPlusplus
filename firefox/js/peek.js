$("html").append('<body><div style="top:0;left:0;position:fixed;width:100%;height:100%;z-index:10000000000;background: #fbfbfb url(http://i.imgur.com/yV7gTKc.gif) no-repeat center;"></div></body>');
var noOverflow = setInterval(function () { $("body").css("overflow", "hidden"); $("img[alt=fxp]").remove(); }, 100); //make sure there is no overflow while loading

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


var oldSmile = [
    "https://images.fxp.co.il/smilies3/124_40x.png", //replace mad
    "https://images.fxp.co.il/smilies3/6_40x.png",   //replace wink
    "https://images.fxp.co.il/smilies3/32_40x.png",  //replace tongue
    "https://images.fxp.co.il/smilies3/4_40x.png",   //replace blush
    "https://images.fxp.co.il/smilies3/200_40x.png", //replace bot/nerd
    "https://images.fxp.co.il/smilies3/43_40x.png",  //replace XD
    "https://images.fxp.co.il/smilies3/143_40x.png", //replace confused
    "https://images.fxp.co.il/smilies3/205_40x.png", //replace angel
    "https://images.fxp.co.il/smilies3/204_40x.png", //replace smile
    "https://images.fxp.co.il/smilies3/173_40x.png", //replace devil
    "https://images.fxp.co.il/smilies3/202_40x.png", //replace kiss
    "https://images.fxp.co.il/smilies3/131_40x.png", //replace cool
    "https://images.fxp.co.il/smilies3g/206.gif",    //replace i love u
    "https://images.fxp.co.il/smilies3g/207.gif"     //replace tongue 2
]

var newSmile = [
    "http://i.imgur.com/lSrkVhN.png", //replace mad
    "http://i.imgur.com/qpPriMw.png", //replace wink
    "http://i.imgur.com/icnMREx.png", //replace tongue
    "http://i.imgur.com/CgwnVDU.png", //replace blush
    "http://i.imgur.com/3StcOJf.png", //replace bot/nerd
    "http://i.imgur.com/gpEocl5.png", //replace XD
    "http://i.imgur.com/eNdc1XA.png", //replace confused
    "http://i.imgur.com/eq274Ao.png", //replace angel
    "http://i.imgur.com/lPepnzd.png", //replace smile
    "http://i.imgur.com/Y0xWnOV.png", //replace devil
    "http://i.imgur.com/yDHz3MY.png", //replace kiss
    "http://i.imgur.com/FekEBW4.png", //replace cool
    "http://i.imgur.com/1htCYLi.gif", //replace i love u
    "http://i.imgur.com/WzfVnDk.gif"  //replace tongue 2
]

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

setCookie("peekUse", true, 5);

getStorage("sync", "replaceIcons", function (dataR) {
    $(document).ready(function () {
        window.clearInterval(noOverflow);
        $("head").append('<style>#cometchat_base {display: none !important}</style>');

        $("script").remove();
        $(".videoyoudiv").parents("div").first().css("width", "auto");
        $(".video-js").parents("div").first().replaceWith('<div style="margin: 0 auto; font-family: monospace; color: red;"><span style="font-size:20px; font-style: italic; font-weight: bold;">סרטון</span><br/>הצצה מהירה לא תומכת בסרטונים מסוג זה.</div>');

        var replace = dataR.replaceIcons;
        if (replace) {
            for (i = 0; i < newSmile.length; i++) {
                $('img[src="' + oldSmile[i] + '"]').attr("src", newSmile[i]);
            }
        }
        $(".bbcode_quote").each(function () { //change quotes to reference text
            if ($(this).find(".bbcode_postedby strong").text() !== "")
                var responseTo = "(בתגובה ל-" + $(this).find(".bbcode_postedby strong").text() + ")";
            else var responseTo = '<i>"' + $(this).find(".quote_container").html().split("</div>")[1] + '"</i>';
            $(this).parents(".bbcode_container").after(responseTo + "<br/>");
            $(this).parents(".bbcode_container").remove();
        });
        $(".bbcode_code").css({ "direction": "ltr", "overflow": "scroll" });

        var isMultipage = $(".pagination").length > 0;

        var comments = [];
        for (j = 0; j < $(".postbit").length ; j++) { //get comments as variables
            if ($(".postbit:eq(" + j + ")").length > 0) {
                comments.push([
                    $(".postbit:eq(" + j + ") .username").text(),
                    $(".postbit:eq(" + j + ") blockquote.postcontent").html(),
                    parseInt($(".postbit:eq(" + j + ") .postfoot .countlike").text()),
                    $(".postbit:eq(" + j + ") .username").attr("href").split("?u=")[1]
                ]);
            }
        }

        console.log(comments);

        var output = "";
        var i = 0;
        while (i < 4 && i < comments.length) { //turn comment variables to needed structure
            output += '<div class="comment"><span style="font-weight: bold;">' + comments[i][0] + "</span>";
            if (comments[i][2] > 0) {
                output += ' <div style="display: inline-block; direction: rtl">(' + comments[i][2] + ' לייקים)</div>';
            }
            output += '<div style="margin-bottom:6px;"></div>' + comments[i][1] + '</div>';

            i++;
        }

        var usersInThread = [];
        for (q = 0; q < comments.length; q++) { //get list of users in thread
            usersInThread.push([comments[q][3], comments[q][0]]);
        }

        var huesForUsers = [];
        for (n = 0; n < usersInThread.length; n++) { //random values depending on user code
            var h = Math.floor((Math.abs(Math.cos(usersInThread[n][0] / 2 * 3) * 3600)) % 3600) / 10; //generate color
            var s = (Math.floor((Math.abs(Math.cos(usersInThread[n][0] / 2 * 3) * 800)) % 800) + 200) / 10 + "%";
            var l = (Math.floor((Math.abs(Math.cos(usersInThread[n][0] / 2 * 3) * 500)) % 500) + 300) / 10 + "%";

            huesForUsers.push([h, s, l]); //push to array of all user colors by order
        }

        if (comments.length === 0) //no comments = thread removed
            output = '<div class="comment">התוכן המבוקש (אשכול) הינו שגוי - רוב הסיכויים שמנהל מחק אותו. אם עשיתם הכל כהלכה, דווחו על הבעיה בפורום משוב.</div>';

        getStorage("sync", "nightmode", function (data) {

            function buildPage() {
                window.stop();
                $("html").html("<head></head><body></body>");
                $("body").css({
                    "-moz-transform": "rotate(180deg) scale(1,-1)",
                    "-ms-transform": "rotate(180deg) scale(1,-1)",
                    "-o-transform": "rotate(180deg) scale(1,-1)",
                    "-webkit-transform": "rotate(180deg) scale(1,-1)",
                    "transform": "rotate(180deg) scale(1,-1)"
                });
                $("head").append("<style>html,body {font-family: Arial; font-size:13px; max-width: 100%; overflow-x: hidden; overflow-y: visible; margin: 0; background: #fff} img {max-width: 100%} .comment {padding: 10px; padding-bottom: 15px; box-sizing: border-box;} .comment:nth-child(odd) {background: #f7f7f7} .smilesfxp[src^='http:https://images.fxp.co.il/smilies3'] {max-width: 20px !important;} .invertedImg {-webkit-filter: invert(100%) brightness(1); -moz-transition: 0.2s; -o-transition: 0.2s; -webkit-transition: 0.2s; transition: 0.2s;} .joinDiscussion {width: 20px; height: 20px; position: absolute; left: 2px; bottom: 10px; background: url(http://i.imgur.com/W7SiAm8.png) no-repeat; background-size: contain; opacity: 0.5} .joinDiscussion:hover {opacity: 1} #cometchat_base {display: none !important} .smilesfxp[src*='_40x.png'] {max-width: 20px !important;}</style>");
                if (window.location.href.search("showpm") > -1) {
                    $("head").append('<style id="noOverflowBecauseResize">html,body {overflow: hidden}</style>');
                }
                $("body").append(output);

                for (r = 0; r < $(".comment").length; r++) { //add colors to users
                    $(".comment:eq(" + r + ") span:eq(0)").after('<div class="colorIndicator" style="background: hsl(' + huesForUsers[r][0] + ',' + huesForUsers[r][1] + ',' + huesForUsers[r][2] + ')"> </div>');
                }

                $(".colorIndicator").css({ "width": "8px", "height": "8px", "border-radius": "3px", "display": "inline-block", "margin": "0 3px 0 1px" });

                if (window.location.href.search("showpm") < 0) {
                    if ($(".comment").length < comments.length) {
                        $("body").append('<div class="comment klik" style="font-size: 9px;font-style: italic; margin-bottom: 0;">- ראה תגובות נוספות -</div>');
                    } else if (isMultipage) {
                        $("body").append('<div class="comment" style="font-size: 9px;font-style: italic; margin-bottom: 0;" title="לאשכול יש דפים נוספים הכוללים תגובות נוספות.">- תגובות נוספות -</div>');
                    } else {
                        $("body").append('<div class="comment" style="font-size: 9px;font-style: italic; margin-bottom: 0;">- סוף האשכול -</div>');
                    }
                    if (comments.length > 0) $("body").append('<a href="' + window.location.href.split("&")[0] + '#quick_reply' + '" target="_blank"><div class="joinDiscussion" title="הגב לאשכול זה"></div></a>');
                }
                if (data.nightmode) nightModeEffects();
            }

            buildPage();

            $(".klik").css("cursor", "pointer").unbind().click(function () {
                for (k = 4; k < comments.length; k++) {
                    output += '<div class="comment"><span style="font-weight: bold;">' + comments[k][0] + "</span>";
                    if (comments[k][2] > 0) {
                        output += ' <div style="display: inline-block; direction: rtl">(' + comments[k][2] + ' לייקים)</div>';
                    }
                    output += '<div style="margin-bottom:6px;"></div>' + comments[k][1] + '</div>';
                    buildPage();
                }
            });



            function nightModeEffects() {
                $("img").addClass("invertedImg");
                $("iframe").css("-webkit-filter", "invert(100%)");
            }

            if (data.nightmode) nightModeEffects();

            $("head").append("<style>.invertedImg:hover {-webkit-filter: invert(100%) brightness(1)}</style>"); //stop epilepsy
            $("#noOverflowBecauseResize").remove();

            var forgiveness = 0;
        });
    });
});