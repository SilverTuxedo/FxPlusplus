/*
   _____ ____  _______     _______  _____ _____ _    _ _______   _   _  ____ _______ _____ _____ ______
  / ____/ __ \|  __ \ \   / /  __ \|_   _/ ____| |  | |__   __| | \ | |/ __ \__   __|_   _/ ____|  ____|
 | |   | |  | | |__) \ \_/ /| |__) | | || |  __| |__| |  | |    |  \| | |  | | | |    | || |    | |__
 | |   | |  | |  ___/ \   / |  _  /  | || | |_ |  __  |  | |    | . ` | |  | | | |    | || |    |  __|
 | |___| |__| | |      | |  | | \ \ _| || |__| | |  | |  | |    | |\  | |__| | | |   _| || |____| |____
  \_____\____/|_|      |_|  |_|  \_\_____\_____|_|  |_|  |_|    |_| \_|\____/  |_|  |_____\_____|______|

FxPlus+ by SilverTuxedo is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
http://creativecommons.org/licenses/by-nc-sa/4.0/



██████╗ ██╗     ███████╗ █████╗ ███████╗███████╗
██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝██╔════╝
██████╔╝██║     █████╗  ███████║███████╗█████╗
██╔═══╝ ██║     ██╔══╝  ██╔══██║╚════██║██╔══╝
██║     ███████╗███████╗██║  ██║███████║███████╗▄█╗
╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝
If you want to explore the code and copy parts of it to your own project, go ahead.
But please appriciate the time and effort that I have put into this project, and consider giving proper credit.
Regarding the code itself, if you see something here and you want to know what it means, contact me.

Kudos!

*/

version = "0.0.19";
versionTitle = "עדכון 0.0.19";
versionDescription = '<blockquote class="twitter-tweet" data-lang="he"><p lang="iw" dir="rtl">דיווחתם שהתוסף מאט את האתר. גרסה 0.0.19 אמורה לטפל בזה!<a href="https://t.co/jlFxwhM8Bf">https://t.co/jlFxwhM8Bf</a></p>&mdash; FxPlus+ (@FxPlusplus) <a href="https://twitter.com/FxPlusplus/status/752447667469443076">11 ביולי 2016</a></blockquote><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';

var d1 = new Date();
var startExecution = d1.getTime();

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


var variableNames = [ //names of things in localStorage
    'savedThreads',
    'signatureResize',
    'newMessages',
    'daysPinned',
    'lowPriorityPost',
    'importantPost',
    'lowPriorityWord',
    'importantWord',
    'hideOutbrain',
    'lowPriorityComment',
    'subnick',
    'disableStyle',
    'commentsAndSubnicks',
    'defaultStyle',
    'showSpoilers',
    'nightMode',
    'readTimePrefix',
    'readTimeNews',
    'peekCloseMethod',
    'showStats',
    'hideRules'
];
var variableValues = [ //default values of things in localStorage
    '[["16859147","SilverTuxedo","פרסום| +FxPlus - תוסף לכרום"]]',
    "true",
    "true",
    "1000000",
    "[]",
    "[]",
    "[]",
    "[]",
    "true",
    "[]",
    "[]",
    "[]",
    '[["967488",false,false,true,"היוצר של +FxPlus","00afff","11px"]]',
    '[false,false,false,false,"Arial","#333333"]',
    "false",
    "[false,0,0,true]",
    '["מדריך"]',
    "true",
    '"doublePress"',
    "false",
    "false"
];

for (i = 0; i < variableNames.length; i++) {
    if (localStorage.getItem(variableNames[i]) == null) {
        localStorage.setItem(variableNames[i], variableValues[i]);
        console.log("Formatted " + variableNames[i]);
    }
}

var savedThreads = [];
var lowPriorityPost = [];
var importantPost = [];
var lowPriorityWord = [];
var importantWord = [];
var lowPriorityComment = [];
var disableStyle = [];
var subnick = [];
var defaultStyle = [];
var readTimePrefix = [];
var readTimeCustom = [];

function getDataFromLocal() { //convert localStorage info to accessable variables
    console.info('%cLOADED DATA!', 'color: #0000ff; font-weight: bold; font-size: 30px');
    savedThreads = JSON.parse(localStorage.getItem("savedThreads"));
    lowPriorityPost = JSON.parse(localStorage.getItem("lowPriorityPost"));
    importantPost = JSON.parse(localStorage.getItem("importantPost"));
    lowPriorityWord = JSON.parse(localStorage.getItem("lowPriorityWord"));
    importantWord = JSON.parse(localStorage.getItem("importantWord"));
    defaultStyle = JSON.parse(localStorage.getItem("defaultStyle"));
    readTimePrefix = JSON.parse(localStorage.getItem("readTimePrefix"));
    readTimeCustom = JSON.parse(localStorage.getItem("readTimeCustom"));
    var commentsAndSubnicks = JSON.parse(localStorage.getItem("commentsAndSubnicks"));
    for (i = 0; i < commentsAndSubnicks.length; i++) { //extract from commentsAndSubnicks
        if (commentsAndSubnicks[i][1] == true) lowPriorityComment.push(commentsAndSubnicks[i][0]);
        if (commentsAndSubnicks[i][2] == true) disableStyle.push(commentsAndSubnicks[i][0]);
        if (commentsAndSubnicks[i][3] == true) {
            var arrayPush = [];
            arrayPush.push(commentsAndSubnicks[i][0]);
            arrayPush.push(commentsAndSubnicks[i][4]);
            arrayPush.push(commentsAndSubnicks[i][5]);
            arrayPush.push(commentsAndSubnicks[i][6]);
            subnick.push(arrayPush);
        }
    }

}
function saveToSyncStorage() {
    var exportOutput = "";
    for (i = 0; i < variableNames.length; i++) {
        if (i != 0) exportOutput += "&*&*&";
        exportOutput += variableNames[i] + "&*&IS&*&" + localStorage.getItem(variableNames[i]);
    }
    setStorage("sync", { "backupData": exportOutput }, function () {
        console.log("backed up to sync storage:   " + exportOutput);
    });
}

function exportFromSyncStorage() {
    var backedUpData = [];
    getStorage("sync", "backupData", function (data) {
        var process = data.backupData;
        var exportArray = process.split("&*&*&");
        var exportMatrix = [];
        for (j = 0; j < exportArray.length; j++) {
            var temp = [];
            temp.push(exportArray[j].split("&*&IS&*&")[0]);
            temp.push(exportArray[j].split("&*&IS&*&")[1]);
            exportMatrix.push(temp);
        }
        for (i = 0; i < exportMatrix.length; i++) {
            localStorage.setItem(exportMatrix[i][0], exportMatrix[i][1]);
        }
    });
}

exportFromSyncStorage();

function saveDataToLocal() {
    console.info('%cSAVED DATA!', 'color: #0000ff; font-weight: bold; font-size: 30px');
    localStorage.setItem("savedThreads", JSON.stringify(savedThreads));
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function removeCookiePrefix(prefix) {
    var arrSplit = document.cookie.split(";");

    for (var i = 0; i < arrSplit.length; i++) {
        var cookie = arrSplit[i].trim();
        var cookieName = cookie.split("=")[0];

        if (cookieName.indexOf(prefix) === 0) {
            document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
}

function ChangeLocalMatrix(localName, localIndexIdentifier, localNewValue) {
    var localMatrix = localStorage.getItem(localName);
    if (localMatrix == null)
        localMatrix = [["0", 0]];
    else
        localMatrix = JSON.parse(localMatrix);

    for (j = 0; j < localMatrix.length; j++) {
        if (localMatrix[j][0] == localIndexIdentifier) {
            localMatrix.splice(j, 1); //remove previous value
            j--;
        }
    }
    localMatrix.push([localIndexIdentifier, localNewValue]); //push new value
    var parsedMatrix = JSON.stringify(localMatrix);
    if (parsedMatrix.length > 500000) { //limited to 0.5MB
        localStorage.setItem(localName, '[["0",0]]'); //clear to default
    } else {
        localStorage.setItem(localName, JSON.stringify(localMatrix));
    }
}

function GetLocalMatrix(localName, localIndexIdentifier) {
    var localMatrix = localStorage.getItem(localName);
    if (localMatrix == null)
        localMatrix = [["0", 0]];
    else
        localMatrix = JSON.parse(localMatrix);

    for (j = 0; j < localMatrix.length; j++) {
        if (localMatrix[j][0] == localIndexIdentifier)
            return localMatrix[j][1];
    }
    return "";
}

var d = new Date();

$("body").append('<div id="blackage"></div>'); //add black screen div
$("body").append('<div class="notification"><div class="notiClose" title="סגור"></div><div class="notiText">אני טקסט!</div><div class="notiProg"></div></div>'); //add notification div
$("body").append('<div id="quickAccess"><div id="closeQuick" dir="ltr"></div><div id="quickText">גישה מהירהה</div></div>'); //add quick access div
if (localStorage.getItem("hideOutbrain") == "true") {
    $("head").append('<style>.OUTBRAIN, #related_main, #taboola-above-forum-thumbnails, #taboola-below-forum-thumbnails, #taboola-bottom-of-page-thumbnails, #taboola-above-article-thumbnails, #taboola-below-article-thumbnails {display: none !important;}</style>'); //remove outbrain and taboola
    $(window).load(function () {
        $("*[id*=taboola]").remove();
    });
}
$("body").append('<div id="SpecialInfo"></div>');

var threadData = {
    isThread: false,
    url: "",
    id: ""
}

if ($(".postbit:first .postcounter").length > 0) { //set thread data for global use
    threadData.isThread = true;
    threadData.url = "https://www.fxp.co.il/" + $(".postbit:first .postcounter").attr("href").split("&")[0];
    threadData.id = $(".postbit:first .postcounter").attr("href").split("&")[0].split("t=")[1];
}

var notify = []; //notification queue
var notifyFinished = true; //variable to make sure notifications don't override each other
var delayTime = { left: 0, started: 0 }; //time until the notification disappears
var timePaused = false;
setInterval(function () {
    if (notifyFinished == true && notify.length > 0) {
        notifyFinished = false;
        delayTime.started = notify[0].replace(/ /g, '').length * 0.7;
        delayTime.left = delayTime.started;
        $(".notiText").html(notify[0]);
        $(".notification").slideDown(500);
    }
    if (delayTime.left > 0) {
        if (delayTime.left <= 1) { //when no time is left until autoclose, close.
            $(".notification").slideUp(300, function () {
                notify.splice(0, 1); //remove from queue
                timePaused = false; //failproofing
                notifyFinished = true;
            });
        }
        var timePassedPercent = ((delayTime.started - delayTime.left) / delayTime.started) * 100; //get precent to display autoclose progress in real time
        $(".notification").css("background", "linear-gradient(to left, #00ff00 0%, #00ff00 " + timePassedPercent + "%, #00ee00 " + timePassedPercent + "%,#00ee00 100%)");
        if (!timePaused) delayTime.left--;
    }

}, 100);

$(".notiClose").click(function () { //when clicked X close notification by making the time left to close 1.
    delayTime.left = 1;
    timePaused = false;
});

$(".notification").on("mouseenter", function () { //stop autoclose when mouse is over the notification
    if (delayTime.left > 1) timePaused = true;
});
$(".notification").on("mouseleave", function () {
    timePaused = false;
});

$(".divhed div:first").css("z-index", "0"); //make FxP's logo not go over the black screen

var updateCooldown = 0;
var focusCooldown = 0;
setInterval(function () { //cooldown for update so the memory doesn't explode + focus
    if (updateCooldown > 0) updateCooldown--;
    if (focusCooldown > 0) focusCooldown--;
    if (updateCooldown === 1) {
        //update visual changes. function because the content of the page might change.
        lowPriorityComment = []; disableStyle = []; subnick = [];
        var commentsAndSubnicks = JSON.parse(localStorage.getItem("commentsAndSubnicks"));
        for (i = 0; i < commentsAndSubnicks.length; i++) { //extract from commentsAndSubnicks
            if (commentsAndSubnicks[i][1] == true) lowPriorityComment.push(commentsAndSubnicks[i][0]);
            if (commentsAndSubnicks[i][2] == true) disableStyle.push(commentsAndSubnicks[i][0]);
            if (commentsAndSubnicks[i][3] == true) {
                var arrayPush = [];
                arrayPush.push(commentsAndSubnicks[i][0]);
                arrayPush.push(commentsAndSubnicks[i][4]);
                arrayPush.push(commentsAndSubnicks[i][5]);
                arrayPush.push(commentsAndSubnicks[i][6]);
                subnick.push(arrayPush);
            }
        }
        lowPriorityPost = JSON.parse(localStorage.getItem("lowPriorityPost"));
        lowPriorityWord = JSON.parse(localStorage.getItem("lowPriorityWord"));
        importantWord = JSON.parse(localStorage.getItem("importantWord"));
        importantPost = JSON.parse(localStorage.getItem("importantPost"));

        $(".newComments").remove();
        if (localStorage.getItem("newMessages") == "true") {
            $(".title").each(function () { //show new comments on side of post
                var thread = {};
                thread.id = $(this).attr('href').split("?t=")[1];
                thread.storedComments = parseInt(GetLocalMatrix("comments", thread.id));
                thread.commentDifference = parseInt($(this).parents(".nonsticky").find(".threadstats > li:contains('תגובות') > a").text()) - thread.storedComments;
                if (thread.storedComments !== null && thread.commentDifference > 0) {
                    $(this).after(' <span class="newComments" dir="rtl" title="מספר התגובות החדשות מאז הכניסה האחרונה לאשכול.&#013;לחץ כדי לסמן כנקרא">(' + thread.commentDifference + ')</span>');
                    //$(this).parents(".nonsticky").find(".threadlastpost").after('<div class="newComments" title="מספר התגובות החדשות מאז הכניסה האחרונה לאשכול.&#013;לחץ כדי לסמן כנקרא">' + thread.commentDifference + '</div>')
                }
            });
        }
        $(".newComments").click(function () { //mark as read when clicked
            $(this).hide(250, function () {
                var threadTitle = $(this).parents(".nonsticky").find(".title").text();
                notify.push("<i><b>" + threadTitle + "</b></i> סומן כנקרא");
                var comment = { a: '', count: 0, thread: '' };
                comment.a = $(this).parents(".nonsticky").find(".threadstats > li:contains('תגובות') > a");
                comment.count = parseInt(comment.a.text());
                comment.thread = parseInt(comment.a.attr("onclick").match(/\(([^)]+)\)/)[1]);
                ChangeLocalMatrix("comments", comment.thread, comment.count); //set to local storage with format commentsX
                Update(true);
            });
        });

        $(".addIndicator").remove(); //add indicate button
        //$(".memberaction_body > .right:nth-child(2)").after('<li class="right addIndicator"><img src="http://i.imgur.com/glr97y8.png" alt=""><a href="">הוסף סממן</a></li>'); //מבוטל לכרגע, כי אין שימוש
    }
}, 10);

function Update(focusUpdate) {
    exportFromSyncStorage();

    lowPriorityComment = []; disableStyle = []; subnick = [];
    var commentsAndSubnicks = JSON.parse(localStorage.getItem("commentsAndSubnicks"));
    for (i = 0; i < commentsAndSubnicks.length; i++) { //extract from commentsAndSubnicks
        if (commentsAndSubnicks[i][1] == true) lowPriorityComment.push(commentsAndSubnicks[i][0]);
        if (commentsAndSubnicks[i][2] == true) disableStyle.push(commentsAndSubnicks[i][0]);
        if (commentsAndSubnicks[i][3] == true) {
            var arrayPush = [];
            arrayPush.push(commentsAndSubnicks[i][0]);
            arrayPush.push(commentsAndSubnicks[i][4]);
            arrayPush.push(commentsAndSubnicks[i][5]);
            arrayPush.push(commentsAndSubnicks[i][6]);
            subnick.push(arrayPush);
        }
    }
    lowPriorityPost = JSON.parse(localStorage.getItem("lowPriorityPost"));
    lowPriorityWord = JSON.parse(localStorage.getItem("lowPriorityWord"));
    importantWord = JSON.parse(localStorage.getItem("importantWord"));
    importantPost = JSON.parse(localStorage.getItem("importantPost"));

    for (i = 0; i < lowPriorityPost.length; i++) { //mark low priority posts
        $(".author > .label > a[href='member.php?u=" + lowPriorityPost[i] + "']").parents(".nonsticky").addClass("lowPriorityPost");
    }

    if (!focusUpdate) {
        for (i = 0; i < lowPriorityComment.length; i++) { //mark low priority commenters and hind content
            $('.username[href="member.php?u=' + lowPriorityComment[i] + '"]').parents(".postbit").addClass("lowPriorityComment");
            $('.username[href="member.php?u=' + lowPriorityComment[i] + '"]').parents(".postbit").addClass("fadeComment");
            $(".lowPriorityComment").find(".userinfo_noavatar").attr("title", "לחץ כדי להציג או להסתיר את התגובה.");
            $(".lowPriorityComment").find(".postbody").slideUp(100);
            $(".lowPriorityComment").find(".userinfo_noavatar").unbind('click.collapse').bind('click.collapse', function () {
                if ($(this).parents(".postbit").find(".postbody").is(':visible')) {
                    $(this).parents(".postbit").find(".postbody").slideUp();
                    $(this).parents(".postbit").addClass("fadeComment");
                } else {
                    $(this).parents(".postbit").find(".postbody").slideDown();
                    $(this).parents(".postbit").removeClass("fadeComment");
                }
            });
        }
    }

    for (i = 0; i < lowPriorityWord.length; i++) { //mark posts with important words (non-picky)
        $(".threadtitle").each(function () {
            var titleUpper = $(this).text().toUpperCase().replace("|", "////");
            var selectedWord = lowPriorityWord[i].toUpperCase();
            if (titleUpper.search(selectedWord) > -1) {
                $(this).parents(".nonsticky").addClass("lowPriorityPost");
            }
        });
    }

    for (i = 0; i < importantWord.length; i++) { //mark posts with important words (non-picky)
        $(".threadtitle").each(function () {
            var titleUpper = $(this).text().toUpperCase().replace("|", "////");
            var selectedWord = importantWord[i].toUpperCase();
            if (titleUpper.search(selectedWord) > -1) {
                $(this).parents(".nonsticky").removeClass("lowPriorityPost");
                $(this).parents(".nonsticky").addClass("highlightWord");
            }
        });
    }
    for (i = 0; i < importantPost.length; i++) { //mark posts from important posters
        $(".author > .label > a[href='member.php?u=" + importantPost[i] + "']").parents(".nonsticky").removeClass("lowPriorityPost");
        $(".author > .label > a[href='member.php?u=" + importantPost[i] + "']").parents(".nonsticky").addClass("highlightPost");
    }

    for (i = 0; i < subnick.length; i++) { //set subnicks
        $("div.username_container a.username[href='member.php?u=" + subnick[i][0] + "'").parents("div.username_container").find(".usertitle").html('<span style="color: #' + subnick[i][2] + ';font-size:' + subnick[i][3] + '">' + subnick[i][1] + '</span>');
    }

    if (localStorage.getItem("signatureResize") == "true") { //resize big signatures
        $(".signaturecontainer").each(function () {
            var signHeight = $(this).height();
            if (signHeight > 295) {
                var outByScale = 295 / signHeight;
                $(this).css({
                    "height": "295px",
                    "transform-origin": "top",
                    "transform": "scale(" + outByScale + ", " + outByScale + ")"
                });
                $(this).attr("title", "חתימה זו הוקטנה באופן אוטומטי."); //show that this has been shrinked
            }
        });
    }

    for (i = 0; i < disableStyle.length; i++) {
        var referredContent = $("div.username_container a.username[href='member.php?u=" + disableStyle[i] + "'").parents(".postbit").find(".content");
        referredContent.find("span").contents().unwrap();
        referredContent.find("b").contents().unwrap();
        referredContent.find("i").contents().unwrap();
        referredContent.find("u").contents().unwrap();
        referredContent.find("font").contents().unwrap();
    }

    if (localStorage.getItem('showSpoilers') == "true") {
        $(".postcontent font[color=#ffffff]").each(function () {
            if ($(this).parents("table").length < 1) { //make sure that is not in table
                $(this).unbind().hover(function () { //show spoilers in black background
                    $(this).css("color", "#fff");
                }, function () {
                    $(this).css("color", "#000");
                });
                $(this).css({ "background": "black", "color": "#000", "cursor": "default" });
            }
        })
    }

    getStorage("sync", "nightmode", function (data) {
        var nightmode = data.nightmode;
        if (nightmode) {
            $("#postlist img").addClass("invertedImg");
            $(".threadbit").css("-webkit-filter", "invert(100%)");
        }
    });

    var threadAutoSize;

    $(".threadstatus").css("cursor", "pointer").unbind().click(function () { //show mini thread (peek) when clicking on envelope
        var threadAddressPrev = $(".minithread .peekFrame").attr("src");
        var threadAddress = $(this).parents(".threadbit").find("a.title").attr("href") + "&frstmsg";
        if (threadAddress == threadAddressPrev) { //if closing the same subject, longer close.
            window.clearInterval(threadAutoSize);
            $(".minithread").slideUp(500, function () {
                $(this).prev(".threadbit").find("div").first().css("border-bottom-style", "solid");
                $(this).prev(".threadbit").css("border-right-color", "#c4c4c4");
                $(this).remove();
            });
        } else { //else, as normal
            window.clearInterval(threadAutoSize);
            $(".minithread").slideUp(200, function () {
                $(this).prev(".threadbit").find("div").first().css("border-bottom-style", "solid");
                $(this).prev(".threadbit").css("border-right-color", "#c4c4c4");
                $(this).remove();
            });

            $(this).parents(".threadbit").after('<li class="threadbit minithread" style="display: none"><iframe class="peekFrame" src="' + threadAddress + '"></iframe></li>');
            $(".minithread").prev(".threadbit").find("div").first().css("border-bottom-style", "dashed"); //make dashed thread bottom
            $(".minithread").prev(".threadbit").css("border-right-color", "#0000ff"); //blue border for reference
            $(".minithread").slideDown(500).unbind();
            threadAutoSize = setInterval(function () { //make sure that thread size is correct
                if ($(".minithread iframe").contents().find(".comment").length > 0) {
                    if (parseInt($(".minithread iframe").contents().find("body").css("height").slice(0, -2)) < 220) {
                        $(".minithread").animate({ height: $(".minithread iframe").contents().find("body").css("height") }, "500");
                        window.clearInterval(threadAutoSize);
                    }
                }
            }, 200);
            $(".minithread iframe").load(function () {
                if (parseInt($(".minithread iframe").contents().find("body").css("height").slice(0, -2)) < 220) {
                    $(".minithread").animate({ height: $(".minithread iframe").contents().find("body").css("height") }, "500");
                }
            }); //verify after load
            if (JSON.parse(localStorage.getItem("peekCloseMethod")) == "auto") { //collapse on mouse out if method is auto
                $(".minithread").on("mouseout", function () {
                    window.clearInterval(threadAutoSize);
                    $(this).delay(400).slideUp(500, function () {
                        $(this).prev(".threadbit").find("div").first().css("border-bottom-style", "solid");
                        $(this).prev(".threadbit").css("border-right-color", "#c4c4c4");
                        $(this).remove();
                    });
                })
            };
        }
    });

    var pmAutoSize;

    $(".threadicon").css("cursor", "pointer").unbind().click(function () { //the PM version of mini threads
        var threadAddressPrev = $(".minithread .peekFrame").attr("src");
        var threadAddress = $(this).parents(".pmbit").find("a.title").attr("href") + "&frstmsg";
        if (threadAddress == threadAddressPrev) { //if closing the same subject, longer close.
            window.clearInterval(pmAutoSize);
            $(".minithread").slideUp(500, function () {
                $(this).prev(".pmbit").css("border-bottom", "none");
                $(this).prev(".pmbit").css("border-right-color", "#6b91ab");
                $(this).remove();
            });
        } else { //else, as normal
            window.clearInterval(pmAutoSize);
            $(".minithread").slideUp(200, function () {
                $(this).prev(".pmbit").css("border-bottom", "none");
                $(this).prev(".pmbit").css("border-right-color", "#6b91ab");
                $(this).remove();
            });

            $(this).parents(".pmbit").after('<li class="pmbit minithread" style="display: none"><iframe class="peekFrame" src="' + threadAddress + '"></iframe></li>');
            if ($(this).parents(".pmbit").find(".unread").length > 0) {
                $(this).parents(".pmbit").find(".unread").removeClass("unread").parents(".pmbit").find(".threadicon").attr("src", "http://www.fcdn.co.il/images_new/statusicon/pm_old.png");
            }
            $(".minithread").prev(".pmbit").css("border-bottom", "1px dashed #c4c4c4"); //make dashed thread bottom
            $(".minithread").prev(".pmbit").css("border-right-color", "#0000ff"); //blue border for reference
            $(".minithread").slideDown(500).unbind();
            pmAutoSize = setInterval(function () { //make sure that PM size is correct
                if ($(".minithread iframe").contents().find(".comment").length > 0) {
                    $(".minithread").animate({ height: $(".minithread iframe").contents().find(".comment").css("height") }, "500");
                    window.clearInterval(pmAutoSize);
                }
            }, 200);
            $(".minithread iframe").load(function () { $(".minithread").animate({ height: $(".minithread iframe").contents().find(".comment").css("height") }, "500"); }); //verify after load
            if (JSON.parse(localStorage.getItem("peekCloseMethod")) == "auto") { //collapse on mouse out if method is auto
                $(".minithread").on("mouseout", function () {
                    window.clearInterval(pmAutoSize);
                    $(this).delay(400).slideUp(500, function () {
                        $(this).prev(".pmbit").css("border-bottom", "none");
                        $(this).prev(".pmbit").css("border-right-color", "#6b91ab");
                        $(this).remove();
                    });
                })
            };
        }
    });

    getStorage("sync", "replaceIcons", function (data) {
        var replace = data.replaceIcons;
        if (replace) {
            replaceOldWithNewSmiles($("body"));
        }
    });

    updateCooldown = 5;
    console.log("Updated with focusUpdate = ", focusUpdate);
}
Update(false); //initiate on page ready

$(window).load(function () { //make sure everything's fine after picture & others loading.
    Update(true);

    console.log("SIGNATURE2");
    if (window.location.href.search("editsignature") > -1 || window.location.href.search("updatesignature") > -1) {
        console.log("SIGNATURE");
        $('form[action*="signature"] .wysiwyg_block').prepend('<div id="addCreditSign">הוסף קרדיט עבור <div class="ltrInline">FxPlus+</div><br/><button type="button" id="sign1">500x276</button> <button type="button" id="sign2">128x128</button> <button type="button" id="sign3">48x48</button> <button type="button" id="sign4">טקסט</button></div>');
        $("#sign1").click(function () { $(".cke_contents:last iframe").contents().find("body").append('<div style="text-align: center;"><a href="https://www.fxp.co.il/showthread.php?t=16859147"><img src="http://www.imgweave.com/view/1114.png" /></a></div>') });
        $("#sign2").click(function () { $(".cke_contents:last iframe").contents().find("body").append('<div style="text-align: center;"><a href="https://www.fxp.co.il/showthread.php?t=16859147"><img src="http://i.imgur.com/bsVtJ5o.png" /></a></div>') });
        $("#sign3").click(function () { $(".cke_contents:last iframe").contents().find("body").append('<div style="text-align: center;"><a href="https://www.fxp.co.il/showthread.php?t=16859147"><img src="http://i.imgur.com/O7FsbY8.png" /></a></div>') });
        $("#sign4").click(function () { $(".cke_contents:last iframe").contents().find("body").append('<div style="text-align: center;"><a href="https://www.fxp.co.il/showthread.php?t=16859147">+FxPlus</a></div>') });
    }

    if (localStorage.getItem("signatureResize") == "true") {
        if ($("#lazyload_fxp.onset.ofset").length > 0) {
            notify.push('<b>הקטנת חתימות אוטומטית פועלת.</b> אנא כבה טעינת תמונות בגלילה.'); //remind to turn off scroll-load
            $("#lazyload_fxp").parents('div:eq(0)').css({ "background": "#ff4400", "font-weight": "bold" });
        }
    }

    if (window.location.href.search("updatepost") > -1 || window.location.href.search("private.php?") > -1 || window.location.href.search("newthread.php") > -1) { //add save interface
        $(".texteditor").parents(".section").after('<div id="pinnedThreadInterface"><div class="floatCenterer"><div class="pinBtn" title="לחץ כדי לשמור"> </div><div id="newPinName" contenteditable></div></div><div id="pinnedList"></div></div>');

        $("#pinnedThreadInterface .pinBtn").click(function () {
            var pinName = $("#newPinName").html();
            if (pinName.replace(/&nbsp;| /g, '').length > 0) { //save only if there's a thing in the title
                getStorage("local", "pinnedThreads", function (data) {
                    var pinnedThreads = data.pinnedThreads;
                    if (pinnedThreads == undefined) { //set if not present
                        setStorage("local", { "pinnedThreads": [] });
                        pinnedThreads = [];
                    }
                    for (i = 0; i < pinnedThreads.length; i++) {
                        if (pinnedThreads[i][0] == pinName) { //find dupes
                            pinnedThreads.splice(i, 1); //remove
                            i--;
                        }
                    }
                    pinnedThreads.push([pinName, $(".cke_editor iframe").contents().find("body").html()]);
                    setStorage("local", { "pinnedThreads": pinnedThreads }, function () { updatePinnedThreadsList(); }); //save change and update list

                });
            }
        })
        updatePinnedThreadsList();
    }

    $("input#subject").focusout(function () {
        if ($("#newPinName").text() == "") $("#newPinName").text($(this).val());
    })

});

function updatePinnedThreadsList() {
    getStorage("local", "pinnedThreads", function (data) {
        var pinnedThreads = data.pinnedThreads;
        if (pinnedThreads == undefined) { //set if not present
            setStorage("local", { "pinnedThreads": [] });
            pinnedThreads = [];
        }

        $("#pinnedList").html(""); //clear list
        for (i = 0; i < pinnedThreads.length; i++) {
            $("#pinnedList").append('<div class="entry"><div class="scrap" title="לחץ כדי למחוק"></div><div class="name" title="לחץ כדי להכניס לעורך\nשים לב! זה ימחק את מה שכבר נמצא בעורך כרגע.">' + pinnedThreads[i][0] + '</div></div>');
        }

        $("#pinnedList .entry .name").click(function () { //add saved thread
            for (i = 0; i < pinnedThreads.length; i++) {
                if (pinnedThreads[i][0] == $(this).html()) { //find correct one
                    $(".cke_editor iframe").contents().find("body").html(pinnedThreads[i][1]); //apply
                    var tickTrashElement = $(this).parents(".entry").find(".scrap");
                    tickTrashElement.css("background-position", "0px -16px");
                    setTimeout(
                        function () {
                            tickTrashElement.css("background-position", "0px 0px");
                        }, 1000
                        );
                }
            }
        });
        $("#pinnedList .entry .scrap").click(function () { //remove saved thread
            for (i = 0; i < pinnedThreads.length; i++) {
                if (pinnedThreads[i][0] == $(this).parents(".entry").find(".name").html()) { //find correct one
                    pinnedThreads.splice(i, 1); //remove
                    i--;
                    $(this).parents(".entry").hide(200);
                    setTimeout(function () {
                        setStorage("local", { "pinnedThreads": pinnedThreads }, function () { updatePinnedThreadsList(); }); //save change and update list
                    }, 200);

                }
            }
        });

    });
}

var nightLocalArray = JSON.parse(localStorage.getItem("nightMode"));
if (nightLocalArray[3]) { //show night mode marker
    $("body").append('<div class="nightmode"></div>');
}

if (nightLocalArray[0]) {
    var hour = d.getHours();
    console.log(hour + "," + nightLocalArray[1] + "," + nightLocalArray[2]);

    if (nightLocalArray[1] <= nightLocalArray[2]) {
        if (hour >= nightLocalArray[1] && hour < nightLocalArray[2]) {
            if (localStorage.getItem("nightByStart") != "true") {
                setStorage("sync", { "nightmode": true });
                localStorage.setItem("nightByStart", "true");
                localStorage.setItem("nightByEnd", "false");
                location.reload(); //reload to show effect

            }
        } else {
            if (localStorage.getItem("nightByEnd") != "true") {
                setStorage("sync", { "nightmode": false });
                localStorage.setItem("nightByEnd", "true");
                localStorage.setItem("nightByStart", "false");
                $("#postlist img").css("-webkit-filter", "invert(0)");
                $(".threadbit").css("-webkit-filter", "invert(0)");
                location.reload();
            }
        }
    } else {
        if (hour >= nightLocalArray[1] || hour < nightLocalArray[2]) {
            if (localStorage.getItem("nightByStart") != "true") {
                setStorage("sync", { "nightmode": true });
                localStorage.setItem("nightByStart", "true");
                localStorage.setItem("nightByEnd", "false");
                location.reload();
            }
        } else {
            if (localStorage.getItem("nightByEnd") != "true") {
                setStorage("sync", { "nightmode": false });
                localStorage.setItem("nightByEnd", "true");
                localStorage.setItem("nightByStart", "false");
                $("#postlist img").css("-webkit-filter", "invert(0)");
                $(".threadbit").css("-webkit-filter", "invert(0)");
                location.reload();
            }
        }
    }
}

$(".sticky").each(function () { //hide stickied posts older than X days
    var postDateFull = $(this).find(".threadlastpost > dd:nth-child(3)").text().substr(0, 10);
    if (postDateFull.search("היום") < 0 || postDateFull.search("אתמול") < 0) {
        var postDate = {};
        postDate.day = parseInt(postDateFull.substr(0, 2));
        postDate.month = parseInt(postDateFull.substr(3, 5));
        postDate.year = parseInt(postDateFull.substr(6, 10));
        var todayDate = {};
        todayDate.day = parseInt(d.getDate());
        todayDate.month = parseInt(d.getMonth() + 1);
        todayDate.year = parseInt(d.getFullYear());
        var calculatedDifference = (todayDate.year - postDate.year) * 365 + (todayDate.month - postDate.month) * 31 + todayDate.day - postDate.day;
        var daysDifference = parseInt(localStorage.getItem("daysPinned"));
        if (calculatedDifference > daysDifference) {
            $(this).addClass("smallStick");
        }
    }

});

if (!JSON.parse(localStorage.getItem("hideRules"))) {
    for (i = 0; i < $(".smallStick").length; i++) {
        var thread = $(".smallStick:eq(" + i + ")");
        var threadTitle = thread.find(".threadtitle").text();
        if (threadTitle.indexOf("חוק") > -1 || threadTitle.indexOf("כלל") > -1)
            thread.removeClass("smallStick");
    }
}

// create an observer instance for threads
var threadObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        //thread list content has changed
        Update(true);
        console.info('%cUPDATE via DOM update.', 'color: #ff00ff; font-weight: bold; font-size: 20px');
    });
});

if ($('.threads')[0])
    threadObserver.observe($('.threads')[0], { attributes: true, childList: true, characterData: true }); //observe thread changes


var postbitObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        //comment list content has changed
        Update(true);
        console.info('%cUPDATE via comment update.', 'color: #ff0000; font-weight: bold; font-size: 20px');
        //$('.postbit:last .username[href="member.php?u=1131848"]')
        for (i = 0; i < lowPriorityComment.length; i++) { //mark low priority commenters and hide content
            $('.postbit:last .username[href="member.php?u=' + lowPriorityComment[i] + '"]').parents(".postbit").addClass("lowPriorityComment");
            $('.postbit:last .username[href="member.php?u=' + lowPriorityComment[i] + '"]').parents(".postbit").addClass("fadeComment");
            $(".lowPriorityComment:last").find(".userinfo_noavatar").attr("title", "לחץ כדי להציג או להסתיר את התגובה.");
            $(".lowPriorityComment:last").find(".postbody").slideUp(100);
            $(".lowPriorityComment:last").find(".userinfo_noavatar").unbind('click.collapse').bind('click.collapse', function () {
                if ($(this).parents(".postbit").find(".postbody").is(':visible')) {
                    $(this).parents(".postbit").find(".postbody").slideUp();
                    $(this).parents(".postbit").addClass("fadeComment");
                } else {
                    $(this).parents(".postbit").find(".postbody").slideDown();
                    $(this).parents(".postbit").removeClass("fadeComment");
                }
            });
        }
    });
});

if ($('#postlist #posts')[0])
    postbitObserver.observe($('#postlist #posts')[0], { attributes: true, childList: true, characterData: true }); //observe thread changes


$(document).ready(function () {
    $([window, document]).focusin(function () {
        if (focusCooldown < 1) {
            Update(true);
            focusCooldown = 5;
            console.info('%cUPDATE via focus.', 'color: #ff8800; font-weight: bold; font-size: 20px');
        }
    });
});

$(".title").click(function () { //tracks number of comments upon clicking title.
    var comment = { a: '', count: 0, thread: '' };
    comment.a = $(this).parents(".nonsticky").find(".threadstats > li:contains('תגובות') > a");
    comment.count = parseInt(comment.a.text());
    comment.thread = parseInt(comment.a.attr("onclick").match(/\(([^)]+)\)/)[1]);
    ChangeLocalMatrix("comments", comment.thread, comment.count); //set to local storage with format commentsX
});

$(".lastpostdate").click(function () { //tracks number of comments upon clicking shortcut to last comment.
    var comment = { a: '', count: 0, thread: '' };
    comment.thread = $(this).attr("href").split("?t=")[1].split("&")[0];
    comment.count = parseInt($(this).parents(".nonsticky").find(".threadstats > li:contains('תגובות') > a").text());
    ChangeLocalMatrix("comments", comment.thread, comment.count);
});

$("#qr_submit").click(function () { //increase comment count by 1 when user posts
    var commentsInMemory = parseInt(GetLocalMatrix("comments", window.location.href.split("?t=")[1].split("&")[0]));
    ChangeLocalMatrix("comments", window.location.href.split("?t=")[1].split("&")[0], commentsInMemory + 1);
});

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

function replaceOldWithNewSmiles(affectedContainer) {
    for (i = 0; i < newSmile.length; i++) {
        affectedContainer.find('img[src="' + oldSmile[i] + '"]')
            .attr("src", newSmile[i])
            .css("max-height", "20px");
    }
}

//should the textbox be modified by anything
var textboxModifyWorthy =
    window.location.href.search("showthread") > -1 ||
    window.location.href.search("private.php?") > -1 ||
    window.location.href.search("newthread.php") > -1 ||
    window.location.href.search("member.php") > -1 ||
    window.location.href.search("newreply.php") > -1;

function bindDefaultStyle() {
    console.log("BOUND");
    defaultStyle = JSON.parse(localStorage.getItem("defaultStyle"));
    if (textboxModifyWorthy && defaultStyle[0] == true) {
        $(".cke_contents:not(.affected) iframe").contents().find("body:not(.affectedBody)").attr("tabindex", 1).unbind().focus(function () {
            console.log("focused");
            if (defaultStyle[0] == true && $("label[for='vB_Editor_QE_1_edit_reason']").length < 1) {
                var opening = "";
                var closing = "";
                if (defaultStyle[1]) {
                    opening += '<strong>';
                    closing += '</strong>';
                }
                if (defaultStyle[2]) {
                    opening += '<em>';
                    closing += '</em>';
                }
                if (defaultStyle[3]) {
                    opening += '<u>';
                    closing += '</u>';
                }
                if (defaultStyle[4] != "none" && defaultStyle[4] != "Arial" && window.location.href.search("member.php") < 0) { //exclude if font is the same as fxp's default, or a friend message
                    opening += '<span style="font-family: ' + defaultStyle[4] + '">';
                    closing += '</span>';
                }
                if (defaultStyle[5] != "#333333") { //exclude if color is the same as fxp's default
                    opening += '<span style="color: ' + defaultStyle[5] + '">';
                    closing += '</span>';
                }
                finalOutput = "";
                var prevText = $(this).html();
                var splitCharacters = Array.from(prevText);
                var splitHistory = "";
                for (var i = 0; i < splitCharacters.length; i++) {
                    finalOutput += splitCharacters[i];

                    splitHistory += splitCharacters[i];
                    if (splitHistory.length > 4) { //make sure the length is 4 characters max
                        splitHistory = splitHistory.substr(splitHistory.length - 4);
                    }

                    if (splitHistory == "<br>") { //detected break row
                        //add style before the broken row
                        finalOutput = finalOutput.substr(0, finalOutput.length - 4) + opening + "&#8203;" + closing + "<br>";
                    }
                }
                finalOutput += opening + "&#8203;" + closing;

                $(this).html(finalOutput);
                $(".cke_contents").addClass("affected");
                $(this).unbind();
            }
        }).addClass("affectedBody");
    }
}
bindDefaultStyle();


var styleObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length > 0) {
            //a new comment textbox appeared
            bindDefaultStyle();
        }
    });
});

if ($(".editor_textbox")[0])
    styleObserver.observe($(".editor_textbox")[0], { attributes: true, childList: true, characterData: true, subtree: true }); //observe comment textbox changes


var changedIconsTime = new Date().getTime();
var commentTextObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        var currentTime = new Date().getTime();
        if (currentTime - changedIconsTime >= 100) { //buffer for too many updates
            changedIconsTime = currentTime;

            var commentEditBody = $(".cke_contents iframe").contents().find("body");
            for (i = 0; i < oldSmile.length; i++) {
                commentEditBody.find('img[src="' + oldSmile[i] + '"]').removeClass("inlineimg smilesfxp").removeAttr("smilieid"); //remove traces of smilies
            }
            replaceOldWithNewSmiles(commentEditBody);
        }
    });
});

$(window).load(function () {
    getStorage("sync", "replaceIcons", function (data) {
        var replace = data.replaceIcons;
        if (replace && $(".editor_textbox iframe").contents().find("body")[0])
            commentTextObserver.observe($(".editor_textbox iframe").contents().find("body")[0], { childList: true, characterData: true, subtree: true })
    });
});


$(".newreply").click(function () { $(".cke_contents").removeClass("affected"); })
$(".quickreply").click(function () { $(".cke_contents").removeClass("affected"); })
$(".quickreply").click(function () { $(".cke_contents").removeClass("affected"); })
$("#qr_defaultcontainer .group input.button").click(function () { $(".cke_contents").removeClass("affected"); })

$(".titleshowt").find("h1").after('<div id="titleShortcuts"></div>');

exportFromSyncStorage();
savedThreads = JSON.parse(localStorage.getItem("savedThreads"));
$("#titleShortcuts").append('<div id="addToQuick" title="הוסף אשכול זה לגישה מהירה"></div>'); //add to quick access button
if (!threadData.isThread || window.location.href.search("page=") > -1) $("#addToQuick").remove();
for (i = 0; i < savedThreads.length; i++) { //remove quick access if thread already in there
    if (threadData.isThread) {
        if (savedThreads[i][0] == threadData.id) {
            $("#addToQuick").addClass("duplicateAddition"); //note that this is a double
        }
    }
}

//if (JSON.parse(localStorage.getItem("nicePerson"))) { //CANCELED, BUT KEPT IN.
//    $(window).load(function () {
//        $(".cke_contents:last").parents(".wysiwyg_block").find('input[name="sbutton"]').attr("onclick", '').click(function () {
//            $(".cke_contents:last iframe").contents().find("body").append('<br><div style="text-align: left;"><em><font color="#d3d3d3"><font size="1"> 3&gt;  +FxPlus</font></font></em></div>');
//        });
//    });
//}


$("#addToQuick").click(function () {
    console.log(localStorage.getItem("savedThreads"));
    exportFromSyncStorage();
    savedThreads = JSON.parse(localStorage.getItem("savedThreads"));
    if (threadData.isThread) {
        var threadWriter = $(".postbit:first .username").text();
        var threadTitle = $(".titleshowt .prefixtit").text() + " " + $(".titleshowt h1").text();
        savedThreads.push([threadData.id, threadWriter, threadTitle]);
        notify.push("<b>" + threadTitle + "</b> נוסף לגישה המהירה.");
        $(this).remove();
        saveDataToLocal(); //save the new list
        saveToSyncStorage();
        console.log(localStorage.getItem("savedThreads"));
        invokeQuickAccess();
    } else {
        notify.push("לא ניתן להוסיף אשכול זה (3)");
    }
});
$("#addToQuick.duplicateAddition").css("background-image", "url(http://i.imgur.com/LF5W4Mp.png)").unbind().click(function () {
    invokeQuickAccess();
}).attr("title", "אשכול זה כבר נמצא בגישה המהירה");

function invokeQuickAccess() { //display quick access
    getDataFromLocal(); //make sure the data is up to date
    exportFromSyncStorage();
    var quickAccessText = '<center><span style="font-size: 25px; font-weight: bold;">גישה מהירה</span><br/>';
    quickAccessText += "אשכולות שנשמרו יופיעו כאן.<br/>";
    quickAccessText += '<span style="font-size:8.5px">טיפ: לחץ על ALT+Q כדי לפתוח חלון זה בזריזות.</span></center><br/><br/>';
    for (i = 0; i < savedThreads.length; i++) {
        var link = "https://www.fxp.co.il/showthread.php?t=" + savedThreads[i][0];
        quickAccessText += '<div class="quickThread"><div class="quickContain"><a href="' + link + '">';
        quickAccessText += '<span style="font-weight: bold">' + savedThreads[i][2] + '</span><br/> ' + savedThreads[i][1];
        quickAccessText += '</a></div><div class="quickOption">הסר<br/><img src="http://i.imgur.com/OUMbiFf.png" alt="trash" /></div></div>';
    }
    quickAccessText += '<div class="quickThreadFinisher"></div>';
    $("#quickText").html(quickAccessText);
    $(".quickOption").click(function () { //removal of saved threads
        var really = window.confirm("מסיר אשכול:\n" + $(this).parents(".quickThread").find(".quickContain a span").text());
        if (really) {
            var threadId = $(this).parents(".quickThread").find(".quickContain a").attr("href").split("?t=")[1];
            for (i = 0; i < savedThreads.length; i++) {
                if (savedThreads[i][0] == threadId) {
                    savedThreads.splice(i, 1);
                    saveDataToLocal(); //save the new list
                    saveToSyncStorage();
                    $(this).parents(".quickThread").slideUp(200, function () {
                        invokeQuickAccess();
                    });
                }
            }
        }
    });

    $("#blackage").unbind().fadeIn(200, function () {
        $("#quickAccess").fadeIn(200, function () {
            $("#blackage").unbind().click(function () { //close quick access on click-elsewhere
                $("#quickAccess").fadeOut(100);
                $("#blackage").fadeOut(200);
            });
        });
    }
        );
}

function KeyPress(e) { //key combination handler
    var evtobj = window.event ? event : e

    if (evtobj.keyCode == 81 && evtobj.altKey || evtobj.keyCode == 191 && evtobj.altKey) { //check for key combination ALT+Q and activate quick access, 191 for macs.
        invokeQuickAccess();
    }

    else if (evtobj.keyCode == 82 && evtobj.altKey) { //check for command line function (ALT+R)
        var command = prompt("FXPLUS+ COMMAND LINE\n--------------------\nCAREFUL! This command line is for experienced users only, and there is no Undo.\nEnter a command in the line below.");
        command = command.toLowerCase();
        switch (command) {
            case "clear":
                chrome.storage.sync.clear();
                chrome.storage.local.clear();
                localStorage.clear();
                alert("Chrome storage and local storage cleared.");
                break;
            case "log storage":
                chrome.storage.local.get(null, function (data) {
                    console.log(data);
                });
                chrome.storage.sync.get(null, function (data) {
                    console.log(data);
                });
                alert("the chrome sync/local storage has been logged to the console.");
                break;
            case "test":
                alert("Command line is working properly.");
                break;
            case "fxplus+":
            case "sex":
            case "lol":
                alert("I said experienced users..\n.-.");
                break;
            case "format var":
                var formatWhat = prompt("Enter name of variable to format:", "x");
                for (i = 0; i < variableNames.length; i++) {
                    if (variableNames[i] == formatWhat) {
                        localStorage.setItem(variableNames[i], variableValues[i]);
                        alert("Formatted " + variableNames[i]);
                    }
                    saveToSyncStorage();
                }
                break;
            case "format cookie":
                var formatWhat = prompt("Enter prefix of cookies to format:", "x");
                removeCookiePrefix(formatWhat);
                location.reload();
                break;
            case "format storage":
                var storageType = prompt("local or sync?");
                var storageName = prompt("name of variable:");
                if (storageType == "sync") {
                    chrome.storage.sync.remove(storageName);
                    alert("formatted the synced variable " + storageName);
                } else {
                    chrome.storage.local.remove(storageName);
                    alert("formatted the local variable " + storageName);
                }

                break;
            case "star wars":
            case "starwars":
                $(".bbcode_quote").remove();
                $("#videotoscan").parents("div:first").remove();
                $("script").remove();
                window.scrollTo(0, 0);
                var textForScroll = "";
                var chapterName = "";
                var chapterNumber = "";
                if (threadData.isThread) {
                    var texts = [];
                    for (i = 0; i < $(".postcontent").length ; i++) {
                        texts.push($(".postcontent:eq(" + i + ")").text().replace(/\n/g, " "));
                    }
                    for (i = 0; i < texts.length; i++) {
                        textForScroll += "<p>" + texts[i] + "</p>";
                    }
                    chapterName = $(".titleshowt").text().replace(/\n/g, "").replace(/\|/g, "| ");
                    chapterNumber = "פורום " + $("td[colspan=3].tfooter a").text();

                    threadData.isThread = false;
                } else {
                    chapterName = "מחתרת כספלוס";
                    chapterNumber = "פרק 1-";
                    textForScroll = "<p> המצב ב-FXP מדרדר. יותר ויותר ספאמרים חסרי ישע מציפים את הקהילה. הקהילה כולה זועקת לעזרה, וללא מענה, כי צוות תמיכה הלך לישון. </p><p> רק איש אחד, בשם סילברטוקסידו, יכול היה להציל את המצב. </p><p> הטוקסידו, ביחד עם מחתרת כספ העממית, תכנן תוסף קטלני לכרום שישפר את כספ ויגאול את האתר ממצבו הקשה. </p><p> לאחר מאמצים רבים, התוסף יצא לאור, והמשיך להתפתח עם הזמן. העם החל להפיץ ולפרסם את התוסף ולתת הצעות לטוקסידו, שלבסוף הכניס אותן. כולם חיו בשלווה. </p><p> אבל אז, כספ החליטו למחוק את האשכול שמפרסם את התוסף, כי הוא הווה לכם סכנה משמעותית - הוא שיפר את האתר. לאחר דיונים רבים ומלחמות חסרות מנוחה, הוצא התוסף לאוויר הזך שוב, והנה הוא כיום במלוא תפארתו. </p><p>בזבזתי יותר מידי זמן על לכתוב את הדבר הזה..</p>";
                }

                $('head').html("");
                $('body').html("");
                //basic css
                $('head').append('<title>. . . .</title><style>body{font-family:Arial;direction:rtl;background:url(http://i.imgur.com/kitaVLo.gif) #000;color:#ff6;font-size:60px;font-weight:700;overflow:hidden}#intro{color:#4bd5ee;font-weight:400;width:900px;animation:intro 6s ease-out 1s}#openingLogo{animation:logo 9s ease-out 9s}#intro,#openingLogo{opacity:0;position:fixed;top:50%;left:50%;-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}#scrolling{text-align:justify;width:75%;position:absolute;bottom:0;-moz-transform-origin:50% 100%;-ms-transform-origin:50% 100%;-o-transform-origin:50% 100%;-webkit-transform-origin:50% 100%;transform-origin:50% 100%;left:0;right:0;margin-left:auto;margin-right:auto;top:100%}#chapter,#chapterNumber{text-align:center}#chapterNumber{font-size:50px}#chapter{font-size:75px}@keyframes intro{0%{opacity:0}20%{opacity:1}90%{opacity:1}100%{opacity:0}}@keyframes logo{0%{transform:translate(-50%,-50%) scale(2.15);opacity:1}50%{opacity:1}100%{transform:translate(-50%,-50%) scale(0.1);opacity:0}}</style>');
                $('body').append('<div id="action"> <div id="intro"> לפני הרבה זמן בקטגוריה רחוקה, מאוד<br />מאוד מאוד.... </div> <div id="openingLogo"> <img src="http://i.imgur.com/mfuoOx3.jpg" alt="FxP Wars" /> </div> <div id="scrolling"> <div id="scrollContent"> <div id="chapterNumber">' + chapterNumber + '</div> <div id="chapter">' + chapterName + '</div> <div id="paragraphs">' + textForScroll + '</div> </div> </div> </div> ');
                var outOfBoundsPercent = (-1 * $("#scrollContent").height() / window.innerHeight) * 100 + 70;
                var timeToScroll = ($("#scrollContent").height() / 70) * 4;
                //text perspective and animation timing
                $('head style:first').append('#scrolling{animation:scroll ' + timeToScroll + 's linear 13s;-moz-transform:perspective(300px) rotateX(25deg);-ms-transform:perspective(300px) rotateX(25deg);-o-transform:perspective(300px) rotateX(25deg);-webkit-transform:perspective(300px) rotateX(25deg);transform:perspective(300px) rotateX(25deg)}@keyframes scroll{0%{top:100%;opacity:1}95%{opacity:1}100%{top:' + outOfBoundsPercent + '%;opacity:0}}');

                setTimeout(function () { //music
                    $('body').append('<iframe style="opacity: 0;" src="https://player.vimeo.com/video/153600657?autoplay=1&loop=1&title=0&byline=0&portrait=0"></iframe>')
                }, 8200);

                setTimeout(function () { //reload normal page after done scrolling
                    location.reload();
                }, timeToScroll * 1000 + 13200);

                break;
            case "erez":
                $("body").append('<div id="PinhasErez"></div>')

                setInterval(function () { //falling shekels
                    var top = Math.floor(Math.random() * (window.innerHeight - 25));
                    var left = Math.floor(Math.random() * (window.innerWidth - 25));

                    $("body").prepend('<div class="floatingShnekel" style="top: ' + top + 'px; left: ' + left + 'px;"></div>'); //shnekels

                    $(".floatingShnekel").on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function () {
                        $(this).remove(); //remove shnekel after falling
                    })
                }, 2);

                $(document).on("mousemove", function (event) {
                    $("#PinhasErez").css({ "top": event.pageY + "px", "left": event.pageX + "px" }); //move pinhas
                    $("body").append('<div class="thoughtVanish" style="top: ' + (event.pageY - 30) + 'px; left: ' + (event.pageX - 45) + 'px;">כספ</div>'); //kasaps

                    $(".thoughtVanish").on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function () {
                        $(this).remove(); //remove kasap after vaporizing
                    })

                });
                break;
            default:
                alert("No valid command given.");
                break;
        }
    }
}

document.onkeydown = KeyPress;


$("#closeQuick").click(function () { //close quick access on X
    $("#quickAccess").fadeOut(200);
    $("#blackage").fadeOut(400);
});
$("#blackage").click(function () { //close quick access on click-elsewhere
    $("#quickAccess").fadeOut(100);
    $("#blackage").fadeOut(200);
});

getStorage("sync", "nightmode", function (data) {
    var nightmode = data.nightmode;
    if (nightmode) {
        $(".nightmode").addClass("nighton").attr("title", "לחץ כדי לכבות את מצב הלילה"); //active night button
    } else {
        $(".nightmode").attr("title", "לחץ כדי להפעיל את מצב הלילה");
    }
});

$(".nightmode").click(function () {
    if ($(this).hasClass("nighton")) {
        $("body").append('<div class="nightEffect" style="left:0; top:0; position:fixed; z-index: 9999999; width:100%; height:100%; background-color: #fff; display: none;"></div>');
        $(".nightEffect").slideDown(500); //slide down screen effect
        setStorage("sync", { "nightmode": false }, function () { location.reload(); }); //reload tab
    } else {
        $("body").append('<div class="nightEffect" style="left:0; top:0; position:fixed; z-index: 9999999; width:100%; height:100%; background-color: #000; display: none;"></div>');
        $(".nightEffect").slideDown(500);
        setStorage("sync", { "nightmode": true }, function () { location.reload(); });
    }
});

exportFromSyncStorage();

readTimePrefix = JSON.parse(localStorage.getItem("readTimePrefix"));
$(".threadbit > div:not(.sticky) .threadtitle .prefix").each(function () {
    for (i = 0; i < readTimePrefix.length; i++) {
        if ($(this).text().search(readTimePrefix[i]) > -1) { //add tags to the prefix
            $(this).addClass("threadTimeQueue");
            $(this).parents(".threadbit").find(".threadstatus").after('<div class="loadingInlineRead" title="מעריך את זמן הקריאה של אשכול זה"></div>');
        }
    }
});

var readTimeNews = JSON.parse(localStorage.getItem("readTimeNews"));
if ($(".pagetitle h1 span").text().search("עדכוני") > -1 && readTimeNews) {
    $(".threadbit > div:not(.sticky) .threadtitle").each(function () {
        if ($(this).find(".prefix").length < 1) {
            $(this).prepend('<div class="prefix" display="none"></div>');
        }
    });
    $(".threadbit > div:not(.sticky) .threadtitle .prefix").addClass("threadTimeQueue").parents(".threadbit").find(".threadstatus").after('<div class="loadingInlineRead" title="מעריך את זמן הקריאה של אשכול זה"></div>');
}

var gotoNext = true;
var threadTimeQueueVar = setInterval(function () {
    console.log("QUEUE WORKS " + $(".threadTimeQueue").length);
    if (gotoNext) {
        console.log("QUEUE IN ACTION");
        gotoNext = false;

        if (GetLocalMatrix("readTime", $(".threadTimeQueue:eq(0)").parents(".threadtitle").find("a.title").attr("href").split("?t=")[1]) == "") {
            var iframeAddress = $(".threadTimeQueue:eq(0)").parents(".threadbit").find("a.title").attr("href") + "&readTime"; //get read time address
            $(".threadTimeQueue:eq(0)").parents(".threadbit").append('<iframe src="' + iframeAddress + '" style="display:none;"></iframe>'); //add iframe
            var iframeTarget = $(".threadTimeQueue:eq(0)").parents(".threadbit").find("iframe");
            var checkReady = setInterval(function () {
                if (iframeTarget.contents().find(".timeInText").length > 0) { //check for read time stated (instead of load)
                    var timeText = iframeTarget.contents().find(".timeInText").text();
                    ChangeLocalMatrix("readTime", $(".threadTimeQueue:eq(0)").parents(".threadtitle").find("a.title").attr("href").split("?t=")[1], timeText);
                    iframeTarget.parents(".threadbit").find(".threadstatus").after('<div class="threadReadTime" title="זמן הקריאה המוערך של אשכול זה">' + timeText + '</div>').parents(".threadbit").find(".loadingInlineRead").remove();
                    iframeTarget.parents(".threadbit").find(".threadTimeQueue").removeClass("threadTimeQueue");
                    iframeTarget.remove();
                    window.clearInterval(checkReady);
                    console.log("QUEUE NEXT");
                    gotoNext = true;
                }
            }, 200);
        } else {
            var timeText = GetLocalMatrix("readTime", $(".threadTimeQueue:eq(0)").parents(".threadtitle").find("a.title").attr("href").split("?t=")[1]);
            $(".threadTimeQueue:eq(0)").parents(".threadbit").find(".threadstatus").after('<div class="threadReadTime" title="זמן הקריאה המוערך של אשכול זה">' + timeText + '</div>').parents(".threadbit").find(".loadingInlineRead").remove();
            $(".threadTimeQueue:eq(0)").removeClass("threadTimeQueue");
            console.log("QUEUE NEXT");
            gotoNext = true;
        }
    }
    if ($(".threadTimeQueue").length < 1) { //stop the loop when there is nothing left
        window.clearInterval(threadTimeQueueVar);
        $(".threadTimeQueue").removeClass("threadTimeQueue");
        console.log("QUEUE CLEAR");
    }
}, 500);

if (readTimeNews) {
    $(".mainsik > div > a").addClass('threadTimeQueueFront');
    $(".images_sik img").after('<div class="estTime">מחשב..</div>');
    $(".images_sik .textsik").css("border-top", "1px solid #F0A443");

    //blur for posts hovered
    $("head").append('<style>.images_sik:hover img { -webkit-filter: blur(2px); filter: blur(2px);}.images_sik:hover .estTime {opacity: 1;}</style>');

    var gotoNextFront = true;
    var threadTimeQueueFrontVarFront = setInterval(function () { //read time for front page
        if (gotoNextFront) {
            gotoNextFront = false;

            if (GetLocalMatrix("readTime", $(".threadTimeQueueFront:eq(0)").attr("href").split("?t=")[1]) == "") {
                var iframeAddress = $(".threadTimeQueueFront:eq(0)").attr("href") + "&readTime"; //get read time address
                $(".threadTimeQueueFront:eq(0)").append('<iframe src="' + iframeAddress + '" style="display:none;"></iframe>'); //add iframe
                var iframeTarget = $(".threadTimeQueueFront:eq(0)").find("iframe");
                var checkReady = setInterval(function () {
                    if (iframeTarget.contents().find(".timeInText").length > 0) { //check for read time stated (instead of load)
                        var timeText = iframeTarget.contents().find(".timeInText").text();
                        ChangeLocalMatrix("readTime", $(".threadTimeQueueFront:eq(0)").attr("href").split("?t=")[1], timeText);
                        iframeTarget.parents(".threadTimeQueueFront").find(".textsik").css("border-top-color", "#DBF043");
                        iframeTarget.parents(".threadTimeQueueFront").find(".estTime").html(timeText);
                        iframeTarget.parents(".threadTimeQueueFront").removeClass("threadTimeQueueFront");
                        iframeTarget.remove();
                        window.clearInterval(checkReady);
                        gotoNextFront = true;
                    }
                }, 200);

            } else {
                var timeText = GetLocalMatrix("readTime", $(".threadTimeQueueFront:eq(0)").attr("href").split("?t=")[1]);
                $(".threadTimeQueueFront:eq(0)").find(".estTime").html(timeText);
                $(".threadTimeQueueFront:eq(0)").find(".textsik").css("border-top-color", "#DBF043");
                $(".threadTimeQueueFront:eq(0)").removeClass("threadTimeQueueFront");
                gotoNextFront = true;
            }
        }
        if ($(".threadTimeQueueFront").length < 1) { //stop the loop when there is nothing left
            window.clearInterval(threadTimeQueueFrontVarFront);
            $(".threadTimeQueueFront").removeClass("threadTimeQueueFront");
        }
    }, 125);
}




$("#titleShortcuts").append('<div id="sortByLikes" title="מיין תגובות לפי סימוני אהבתי"></div>'); //add to quick access button
var pages = parseInt($("#yui-gen8").text().split(" מתוך ")[1]); //get number of pages from page indication
if (isNaN(pages)) pages = 1; //1 page if no page indication

if (!threadData.isThread) $("#sortByLikes").remove();

var comments = [];
$("#sortByLikes").click(function () {
    comments = [];
    var pages = parseInt($("#yui-gen8").text().split(" מתוך ")[1]); //get number of pages from page indication
    if (isNaN(pages)) pages = 1; //1 page if no page indication
    $(this).unbind().attr("title", "טוען תגובות...").css("background-image", "url(http://i.imgur.com/LjxMglI.png)"); //loading heart
    if (pages == 1) {
        for (i = 0; i < $(".postbit").length; i++) {
            var commentWhole = $(".postbit:eq(" + i + ")").html();
            var commentLikes = parseInt($(".postbit:eq(" + i + ") .postfoot a.countlike").text());
            var thisComment = [commentLikes, commentWhole];
            comments.push(thisComment);
        }
        sortCommentsByLikes(comments)
    } else {
        $("#posts").before('<div class="commentIframes"></div><div id="indicateLoadingPages" style="text-align: center;">טוען עמודים..</div>'); //loading title
        var currentPage = 1;
        var next_LikeFrames = true;
        var checkNext_LikeFrames = setInterval(function () {
            if (next_LikeFrames) {
                $("#indicateLoadingPages").html("טוען עמודים...<br/><b>" + currentPage + " מתוך " + pages + "<b>");
                next_LikeFrames = false;
                if (currentPage > pages) { //all done loading
                    sortCommentsByLikes(comments);
                    $("#indicateLoadingPages").remove();
                    window.clearInterval(checkNext_LikeFrames);
                } else {
                    $(".commentIframes").append('<iframe class="likeFrame" src="' + threadData.url + '&page=' + currentPage + '"></iframe>'); //append iframe
                    var checkLoaded_LikeFrames = setInterval(function () {
                        if ($(".likeFrame").contents().find("#thisPageLoaded").length === 1) { //wait for the page to be ready
                            var targetedIframe = $(".likeFrame").contents();
                            for (i = 0; i < targetedIframe.find(".postbit").length; i++) { //take comment data
                                var commentWhole = targetedIframe.find(".postbit:eq(" + i + ")").html();
                                var commentLikes = parseInt(targetedIframe.find(".postbit:eq(" + i + ") .postfoot .countlike").text());
                                var thisComment = [commentLikes, commentWhole];
                                comments.push(thisComment);
                            }
                            $(".likeFrame").remove(); //remove the inspected frame
                            currentPage++; //next page
                            next_LikeFrames = true; //start processing the next page
                            window.clearInterval(checkLoaded_LikeFrames);
                        }
                    }, 200);
                }
            }
        }, 300)

        //$("#posts").before('<div class="commentIframes"></div><div id="indicateLoadingPages" style="text-align: center;">טוען עמודים..</div>');
        //for (i = 1; i <= pages; i++) {
        //    $(".commentIframes").append('<iframe src="' + threadData.url + '&page=' + i + '"></iframe>');
        //}
        //var readyFrames = 0;
        ////$(".commentIframes iframe").load(function () { readyFrames++; })
        //var testContinueAction = setInterval(function () {
        //    $(".commentIframes iframe").each(function () {
        //        if ($(this).contents().find("#thisPageLoaded").length === 1) readyFrames++;
        //    });
        //    $("#indicateLoadingPages").html("טוען עמודים...<br/><b>" + readyFrames + " מתוך " + pages + "<b>");

        //    if (readyFrames >= pages) { //can continue with actions
        //        for (j = 0; j < pages; j++) {
        //            var targetedIframe = $(".commentIframes iframe:eq(" + j + ")").contents();
        //            for (i = 0; i < targetedIframe.find(".postbit").length; i++) {
        //                var commentWhole = targetedIframe.find(".postbit:eq(" + i + ")").html();
        //                var commentLikes = parseInt(targetedIframe.find(".postbit:eq(" + i + ") .postfoot a.countlike").text());
        //                var thisComment = [commentLikes, commentWhole];
        //                comments.push(thisComment);
        //            }
        //        }
        //        window.clearInterval(testContinueAction);
        //        sortCommentsByLikes();
        //        $("#indicateLoadingPages").remove();
        //    }
        //}
        //    , 500)
    }
})

function sortCommentsByLikes(cmnts) {
    setTimeout(function () { // 0.5s fallback
        cmnts.sort(function (a, b) { return b[0] - a[0] }); //sort from high to low

        var commentOutput = "";
        for (i = 0; i < cmnts.length; i++) { //wrap comments
            commentOutput += '<li class="postbit postbitim postcontainer">'
            commentOutput += cmnts[i][1];
            commentOutput += '</li>'
        }
        $("#posts").html(commentOutput); //insert output

        $("head script").each(function () { //make sure they can still like comments
            if ($(this).html().search('.addlike') > -1) { //is like script?
                var script = $(this).html();
                var startAt = script.indexOf("function(){") + 11;
                var endAt = script.lastIndexOf("});") - 30;
                script = script.substr(startAt, endAt); //get like script without document.ready part
                $("body").append('<script>' + script + '</script>'); //add to html
            }
        })

        $(".commentIframes").remove();

        $("#sortByLikes").attr("title", "התגובות ממויינות בהתאם לכמות סימוני האהבתי.").css("background-image", "url(http://i.imgur.com/GmAfz4N.png)"); //success heart
    }, 500);
}


$("head").append('<script id="editorScript" src="//cdn.tinymce.com/4/tinymce.min.js"></script>');

if (window.location.href.search("member.php") > -1) {
    getStorage("local", "notes", function (data) {
        var notes = data.notes;
        if (notes == undefined) { //set defaults
            notes = [["967488", '<p style="direction: rtl;" data-mce-style="direction: rtl;">איש מגניב <strong>במיוחד</strong>.</p>'], ["30976", '<p style=\"direction: rtl; text-align: center;\" data-mce-style=\"direction: rtl; text-align: center;\">&nbsp;<span class=\"mce-preview-object mce-object-iframe\" contenteditable=\"false\" data-mce-object=\"iframe\" data-mce-p-allowfullscreen=\"allowfullscreen\" data-mce-p-src=\"//www.youtube.com/embed/JSgeAFTwg0U\"><iframe src=\"//www.youtube.com/embed/JSgeAFTwg0U\" width=\"560\" height=\"314\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\" data-mce-src=\"//www.youtube.com/embed/JSgeAFTwg0U\"></iframe></span><br></p>']];
            setStorage("local", { "notes": [["967488", '<p style="direction: rtl;" data-mce-style="direction: rtl;">איש מגניב <strong>במיוחד</strong>.</p>'], ["30976", '<p style=\"direction: rtl; text-align: center;\" data-mce-style=\"direction: rtl; text-align: center;\">&nbsp;<span class=\"mce-preview-object mce-object-iframe\" contenteditable=\"false\" data-mce-object=\"iframe\" data-mce-p-allowfullscreen=\"allowfullscreen\" data-mce-p-src=\"//www.youtube.com/embed/JSgeAFTwg0U\"><iframe src=\"//www.youtube.com/embed/JSgeAFTwg0U\" width=\"560\" height=\"314\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\" data-mce-src=\"//www.youtube.com/embed/JSgeAFTwg0U\"></iframe></span><br></p>']] });
        }

        $(".tabslight dd a").click(function () { $("#view-notes").removeClass("selected_view_section").addClass("view_section"); });

        $(".tabslight").append('<dd class="userprof_moduleinactive"><a id="notes-tab" href="" onclick="return tabViewPicker(this);">הערות</a></dd>'); //add user notes
        $(".profile_content.userprof").append('<div id="view-notes" class="view_section"><textarea style="height: 0;" id="noteProfile" class="noteProfile"><p style="direction: rtl; "><br data-mce-bogus="1"></p></textarea><button id="saveNote">שמור שינויים</button></div>');
        //apply text editor
        setTimeout(function () {
            $("#editorScript").after("<script>tinymce.init({ selector: '#noteProfile', height: " + ($(".profile_widgets").height() - 120) + ", theme: 'modern', fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 72px', plugins: [ 'advlist autolink lists link image charmap hr anchor pagebreak', 'searchreplace visualblocks visualchars code fullscreen', 'insertdatetime media nonbreaking save table contextmenu directionality', 'emoticons template paste textcolor colorpicker textpattern imagetools' ], menubar: false, toolbar1: 'insertfile undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | link image', toolbar2: 'print preview media | forecolor backcolor | fontselect | fontsizeselect | emoticons', });</script>");
        }, 100);

        var userId = $(".usermenu li:last-child a").attr("href").split("&userid=")[1].split("&")[0];
        for (i = 0; i < notes.length; i++) {
            if (notes[i][0] == userId) {
                $(".noteProfile").html(notes[i][1]);
            }
        }
        $("#notes-tab").click(function () {
            $(".selected_view_section").removeClass("selected_view_section").addClass("view_section");
            $("#view-notes").removeClass("view_section").addClass("selected_view_section");
        })

        $("#saveNote").click(function () {

            var noteContent = $("#view-notes iframe").contents().find("body").html() || $(".noteProfile").html();

            for (i = 0; i < notes.length; i++) {
                if (notes[i][0] == userId) {
                    notes.splice(i, 1); //remove entry if exists
                }
            }
            notes.push([userId, noteContent]);
            setStorage("local", { "notes": notes }, function () {
                $("#saveNote").text("השינויים נשמרו.");
                setTimeout(function () { $("#saveNote").text("שמור שינויים") }, 3000);
                console.log(notes);
            });
        });
    });
}
$("div.username_container .usertitle a").each(function () {
    $(this).parents(".usertitle").attr("style", $(this).attr("style"));
    $(this).contents().unwrap();
});

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

$("div.username_container .usertitle").attr('title', 'לחץ כדי לערוך').click(function () { //click to edit subnicks quickly
    $(this).hide();
    var previousNick = $(this).text();
    var color = rgb2hex($(this).css("color"));
    var size = $(this).css("font-size");
    var innerReference = $(this).find("*"); //find inner place for reference of color in case of special sub nick
    if (innerReference.length > 0) { //have the correct color and size if has special sub nick
        color = rgb2hex(innerReference.css("color"));
        size = innerReference.css("font-size");
    }

    $(this).after('<input type="text" style="color: ' + color + '; width: ' + $(this).width() + 'px; font-size: ' + size + ';" class="subnickliveedit" placeholder="' + previousNick + '">'); //add input field
    $(this).parents("div.username_container").find(".subnickliveedit").focus(); //focus on input field

    exportFromSyncStorage(); //make sure data is up to date before attempting to change it

    function saveQuickEditSubnick(object) { //save function, quick subnick edit
        $("div.username_container .usertitle").show();
        var newSubnick = object.val();
        var userId = object.parents(".username_container").find("a.username").attr("href").split("u=")[1];

        if (newSubnick != "") { //don't change values if text is nothing
            var commentsAndSubnicks = [[]];
            commentsAndSubnicks = JSON.parse(localStorage.getItem("commentsAndSubnicks"));
            var dupe = -1; //-1 if is not a dupe of an existing rule, bigger than -1 if it is (number is index of dupe)
            for (i = 0; i < commentsAndSubnicks.length; i++) {
                if (commentsAndSubnicks[i][0] == userId) {
                    dupe = i;
                }
            }
            if (dupe == -1) {
                var entry = [userId, false, false, true, newSubnick, color.substr(1), size];
                commentsAndSubnicks.push(entry);
            } else {
                commentsAndSubnicks[dupe][3] = true;
                commentsAndSubnicks[dupe][4] = newSubnick;
                commentsAndSubnicks[dupe][5] = color.substr(1);
                commentsAndSubnicks[dupe][6] = size;
            }

            localStorage.setItem("commentsAndSubnicks", JSON.stringify(commentsAndSubnicks));
            saveToSyncStorage();
        }
        object.remove();
        Update(true);
    }

    $(this).parents("div.username_container").find(".subnickliveedit").focusout(function () { //save when focus leaves input field
        $(this).unbind();
        saveQuickEditSubnick($(this));
    });

    $(this).parents("div.username_container").find(".subnickliveedit").on('keydown', function (e) {
        if (e.which === 13) {
            $(this).unbind();
            saveQuickEditSubnick($(this));
            return false; //don't submit
        }
    });

});

function randomThreadId() {
    var max = parseInt($(".stast:eq(1) span:eq(1)").html().replace(/,/gi, ""));
    var min = 25;
    var url = "https://www.fxp.co.il/showthread.php?t=" + Math.floor(Math.random() * (max - min + 1) + min);
    window.location.href = url;
}

function randomUserId() {
    var max = parseInt($(".stast:eq(2) span:eq(1)").html().replace(/,/gi, ""));
    var min = 1;
    var url = "https://www.fxp.co.il/member.php?u=" + Math.floor(Math.random() * (max - min + 1) + min);
    window.location.href = url;
}

$(".stast:eq(1)").click(function () { randomThreadId() });
$(".stast:eq(2)").click(function () { randomUserId() });


function mostFrequent(array) {
    if (array.length == 0)
        return null;

    var modeMap = {},
        maxEl = array[0],
        maxCount = 1;

    for (var i = 0; i < array.length; i++) {
        var el = array[i];

        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;

        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
        else if (modeMap[el] == maxCount) {
            maxEl += '&OR&' + el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

if (JSON.parse(localStorage.getItem("showStats")) && $(".threads_list_fxp").length > 0) { //show forum stats
    var popularAuthors = [];
    var popularTitles = [];
    var popularPrefixes = [];
    var totalComments = 0;
    var totalViews = 0;
    var popularCommentors = [];

    $(".nonsticky").each(function () {
        popularAuthors.push($(this).find(".author a.username").text());
        popularTitles = popularTitles.concat($(this).find(".threadtitle .title").text().replace(/[^א-תA-Za-z\s']/g, " ").split(" "));
        popularPrefixes.push($(this).find(".threadtitle .prefix").text().replace(/\||\n/gi, ""));
        if (!isNaN(parseInt($(this).find(".threadstats li:eq(0) a").text().replace(/,/g, ""))))
            totalComments += parseInt($(this).find(".threadstats li:eq(0) a").text().replace(/,/g, ""));
        if (!isNaN(parseInt($(this).find(".threadstats li:eq(1)").text().replace("צפיות: ", "").replace(/,/g, ""))))
            totalViews += parseInt($(this).find(".threadstats li:eq(1)").text().replace("צפיות: ", "").replace(/,/g, ""));
        popularCommentors.push($(this).find(".threadlastpost .username").text());
    })

    for (i = 0; i < popularTitles.length; i++) {
        if (popularTitles[i].length < 2 || popularTitles[i] == " ") {
            popularTitles.splice(i, 1);
            i--;
        };
    }

    var mostPopularAuthor = mostFrequent(popularAuthors);
    var mostPopularTitle = mostFrequent(popularTitles);
    var mostPopularPrefix = mostFrequent(popularPrefixes);
    var mostPopularCommentor = mostFrequent(popularCommentors);

    var popularAuthorsCount = 0;
    var popularTitlesCount = 0;
    var popularPrefixesCount = 0;
    var popularCommentorsCount = 0;

    for (i = 0; i < popularAuthors.length; i++) { if (popularAuthors[i] == mostPopularAuthor.split("&OR&")[0]) popularAuthorsCount++; }
    for (i = 0; i < popularTitles.length; i++) { if (popularTitles[i] == mostPopularTitle.split("&OR&")[0]) popularTitlesCount++; }
    for (i = 0; i < popularPrefixes.length; i++) { if (popularPrefixes[i] == mostPopularPrefix.split("&OR&")[0]) popularPrefixesCount++; }
    for (i = 0; i < popularCommentors.length; i++) { if (popularCommentors[i] == mostPopularCommentor.split("&OR&")[0]) popularCommentorsCount++; }

    if (mostPopularPrefix == "") mostPopularPrefix = "כלום";

    $(".threads_list_fxp").after('<div id="pageStats"><i>סטטיסטיקה:</i><br/></div>'); //add stats place

    if (popularAuthorsCount > 1)
        $("#pageStats").append("המפרסם הדומיננטי ביותר הוא <b>" + mostPopularAuthor + "</b>, עם " + popularAuthorsCount + " אשכולות. <br/>");
    else
        $("#pageStats").append("אין מפרסם דומיננטי במיוחד.<br/>");

    if (popularCommentorsCount > 1)
        $("#pageStats").append("המגיב האחרון הדומיננטי ביותר הוא <b>" + mostPopularCommentor + "</b>, עם " + popularCommentorsCount + " תגובות אחרונות. <br/>");
    else
        $("#pageStats").append("אין מגיב אחרון דומיננטי במיוחד.<br/>");

    if (popularTitlesCount > 1)
        $("#pageStats").append("המילה הנפוצה ביותר בכותרות היא <b>" + mostPopularTitle + "</b>, עם " + popularTitlesCount + " אזכורים. <br/>");
    else
        $("#pageStats").append("אין מילה נפוצה במיוחד בכותרות.<br/>");

    if (popularPrefixesCount > 1)
        $("#pageStats").append("התיוג הנפוץ ביותר הוא <b>" + mostPopularPrefix + "</b>, שנמצא ב-" + popularPrefixesCount + " אשכולות. <br/>");
    else
        $("#pageStats").append("אין תיוג נפוץ במיוחד.<br/>");

    $("#pageStats").append("יחס התגובות לצפיות הוא תגובה אחת כל <b>" + Math.round(totalViews / totalComments) + " צפיות</b>.");

    $("#pageStats").html($("#pageStats").html().replace(/&amp;OR&amp;/g, "</b> או <b>")).slideDown(500); //replace &OR& with או
}

/*

  var checkForChat = setInterval(function () {
    $(".cometchat_tabsubtitle .cometchat_message").each(function () {
        var status = $(this).html();
        $(this).parents(".cometchat_tabpopup").find(".cometchat_tabtitle").append('<div class="cometchat_message">' + status + '</div>');
        $(this).remove();
    });
    $(".cometchat_chatboxmessage").attr("style", "box-sizing: border-box !important; background: #C7EDFC;margin: 6px;width: calc(100% - 12px);padding: 2px;");

}, 200);

*/


var pages = { //html for pages
    welcome: '<div class="SettingsTitle">ברוכים הבאים!</div> זהו דף ההגדרות. מצד ימין ניתן לראות את החלקים השונים שניתן לשנות בתוסף.<br />במידה ומצאתם באג, או סתם בא לכם לדבר על התוסף, צרו קשר! <br /><div class="settingsWarning"> <span class="warningTtl">אתה בגרסת פיתוח!</span><br/> התוסף אינו בשלבי סיום! <a href="http://goo.gl/forms/38SFbns8EG" target="_blank"><b>לחץ כאן כדי לדווח על באג</b></a>.<br/>בנוסף לכך, שקול להביע את דעתך לגבי התוסף ולדרג אותו בחנות. תוכל גם לעזור לתוסף ו<a href="https://www.fxp.co.il/profile.php?do=editsignature" target="_blank" style="color: blue;">לקשר אליו בחתימה שלך</a>.</div><br/><span style="font-weight: bold; font-size: 16px">אם זו הפעם הראשונה שלך בתוסף, מומלץ לעבור אל "איך להשתמש" כדי להבין איך להתחיל.</span><br/><br/><div style="position:absolute; left:0; bottom: 0; direction: ltr; padding: 6px 14px;"><a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">FxPlus+</span> by <span xmlns:cc="http://creativecommons.org/ns#" property="cc:attributionName">SilverTuxedo</span> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.</div>',
    general: '<div class="SettingsTitle">כללי</div> <br /> <input type="checkbox" class="SettingsCheckbox" id="BackgroundNotifications"> שלח התראות גם כאשר האתר סגור<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="testNotif">שלח הודעת בדיקה</a><br /> <br /> <input type="checkbox" class="SettingsCheckbox" id="signatureResize"> הקטן אוטומטית חתימות גדולות<br /> <br /> <input type="checkbox" class="SettingsCheckbox" id="newMessages"> הצג בסוגריים את מספר ההודעות שלא נקראו<br /> <br /> הסתר אשכולות נעוצים בני יותר מ-<select name="daysPinned"> <option value="3day">3 ימים</option> <option value="7day">שבוע</option> <option value="14day">שבועיים</option> <option value="28day">חודש</option> <option value="never">אף פעם</option> </select><br />&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" class="SettingsCheckbox" id="hideRules"> כולל אשכולות חוקים<br /> <br /> <input type="checkbox" class="SettingsCheckbox" id="showSpoilers"> הצג ספוילרים<br /> <br /> <input type="checkbox" class="SettingsCheckbox" id="hideOutbrain"> הסתר את Taboola (אשכולות מוצעים)<br /> <br /> <input type="checkbox" class="SettingsCheckbox" id="autonight"> הפעל מצב לילה אוטומטית מ-<select name="startNight"></select> עד <select name="endNight"></select> <br /> <br /> <input type="checkbox" class="SettingsCheckbox" id="showNightIndicator"> הצג קיצור דרך למצב לילה<br/><br/>סגור הצצה לאשכולות <select name="peekCloseMethod"> <option value="auto">אוטומטית</option> <option value="doublePress">בלחיצה חוזרת על המעטפה</option></select><br /> <br /><input type="checkbox" class="SettingsCheckbox" id="useOldSmiles"> השתמש בסמיילים ישנים<br/><br/> <input type="checkbox" class="SettingsCheckbox" id="showStats"> הצג סטטיסטיקת פורומים<br/><br/> <button class="SettingsButton" id="changeBgSet">שנה את הרקע של FxP</button><br/><br/> <div class="settingsEndBtn cyan">שמור</div> <div class="saveSuccess">השינויים נשמרו! ייתכן שיהיה צורך לרענן.</div> <br /> <br /> <br />',
    threads: '<div class="SettingsTitle">אשכולות</div><br /><span style="font-size:18px">פעולה לפי משתמש</span><br />המתן לטעינת הטבלה.<br /><table class="sThreadContainer" style="width: 100%;"><tr class="sThreadLine" style="font-weight: bold;"><th>מספר משתמש</th><th>הסתרה</th><th>הדגשה</th><th>שם משתמש</th><th>הסר</th></tr></table><br /><div class="settingsEndBtn green" style="width: 110px; margin-left: 40px; float:right;">הוסף שורה</div><div class="settingsEndBtn cyan" style="float:right;">שמור</div><br/><br/><div class="saveSuccess">השינויים נשמרו! ייתכן שיהיה צורך לרענן.</div><br /><br/><span style="font-size:18px">פעולה לפי מילים</span><br />בחר מה יקרה אם אשכול מסויים יכלול מילים אלה בכותרת. הפרד מילים ברווח.<br /><table class="sConvertContainer" style="width: 45%;"> <tr class="sConvertLine" style="font-weight: bold;"> <th style="width: 50%">הסתר</th> <th style="width: 50%">הדגש</th> </tr> <tr class="sConvertLine"> <th><textarea class="dataText"></textarea></th> <th><textarea class="dataText"></textarea></th> </tr> </table><br /><div class="settingsEndBtn cyan">שמור</div><div class="saveSuccess">השינויים נשמרו! ייתכן שיהיה צורך לרענן.</div><br/><span style="font-size:18px">זמן קריאה</span><br />בחר לאילו אשכולות יוצג זמן הקריאה המשוער. <span id="calculateReadTime"> מהירות הקריאה שלך כרגע היא <span id="placeReadSpeed"></span> מילים לדקה. לחץ כאן כדי לחשב מחדש.</span><br /><div class="tagItem" id="דיון"> דיון|</div><div class="tagItem" id="עזרה"> עזרה|</div><div class="tagItem" id="שאלה"> שאלה|</div><div class="tagItem" id="כתבה"> כתבה|</div><div class="tagItem" id="מדריך"> מדריך|</div><div class="tagItem" id="בעיה"> בעיה|</div><div class="tagItem" id="מידע"> מידע|</div><div class="tagItem" id="הצעה"> הצעה|</div><div class="tagItem" id="פרסום"> פרסום|</div><div class="tagItem" id="פתרון"> פתרון|</div><div class="tagItem" id="עקיבה"> עקיבה|</div><div class="tagItem" id="הכרזה"> הכרזה|</div><div class="tagItem" id="ספוילר"> ספוילר|</div><div class="tagItem" id="הורדה"> הורדה|</div><div class="tagItem" id="בקשה"> בקשה|</div><div class="tagItem" id="השוואה"> השוואה|</div><div class="tagItem" id="סיקור"> סיקור|</div><div class="tagItem" id="updateForums"> כתבות בפורומי עדכונים</div><br/><br/><div class="settingsEndBtn cyan">שמור</div><div class="saveSuccess">השינויים נשמרו! ייתכן שיהיה צורך לרענן.</div><br/><hr /><span style="font-size:16px;" class="convertTitleHighlight">המרה</span><br /><span class="convertHighlighter"> המר שם משתמש למספר משתמש (שבו תוכל להשתמש בטבלה העליונה)</span><br /><table class="sConvertContainer"><tr class="sConvertLine" style="font-weight: bold;"><th>שם משתמש</th><th>מספר משתמש</th><th>הוסף לטבלה</th></tr><tr class="sConvertLine"><th><input type="text" class="userName"></th><th><iframe src="https://www.fxp.co.il/member.php?username=PlaceHolderThisUserCantExist&getIdOnly" class="userIdFrame" /><div class="userIdFrame loadingBackground"></div></th><th><div class="addToTable" title="הוסף לטבלה"></div></th></tr></table>',
    comments: '<div class="SettingsTitle">תגובות ותת-ניקים</div> <br /><span style="font-size:18px">פעולה לפי משתמש</span> <br />המתן לטעינת הדף.<br /> <div class="containtersPlace"> </div> <br /> <div class="settingsEndBtn green" style="width: 110px; margin-left: 40px; float:right;">הוסף אריח</div> <div class="settingsEndBtn cyan" style="float:right;">שמור</div><br /><br /><div class="saveSuccess">השינויים נשמרו! ייתכן שיהיה צורך לרענן.</div> <br /> <br/> <span style="font-size:18px">עצב תגובות </span> <br />הגדר את העיצוב ההתחלתי של התגובות שלך.<br /><br/> <input type="checkbox" class="SettingsCheckbox enableDefaultStyle" /> אפשר <br/><div style="display: inline-block;"><div class="styleBar"> <div class="bold">B</div> <div class="italic">I</div> <div class="underline">U</div> <select class="font"><option value="unknown">almoni-dl</option> <option value="unknown">Arial</option> <option value="unknown">Arial Black</option> <option value="unknown">Arial Narrow</option> <option value="unknown">Book Antiqua</option> <option value="unknown">Century Gothic</option> <option value="unknown">Comic Sans MS</option> <option value="unknown">Courier New</option> <option value="unknown">Fixedsys</option> <option value="unknown">Franklin Gothic Medium</option> <option value="unknown">Garamond</option> <option value="unknown">Georgia</option> <option value="unknown">Gisha</option> <option value="unknown">Impact</option> <option value="unknown">Lucida Console</option> <option value="unknown">Lucida Sans Unicode</option> <option value="unknown">Micorosft Sans Serif</option> <option value="unknown">Palatino Linotype</option> <option value="unknown">rancho</option> <option value="unknown">Segoe UI</option> <option value="unknown">System</option> <option value="unknown">Tahoma</option> <option value="unknown">Times New Roman</option> <option value="unknown">Terbuchet MS</option> <option value="unknown">Verdana</option> </select><input type="color" class="textColor" value="#333333"> </div><br/> <div class="styleText"> טקסט זה כתוב בעברית.<br/> This text is written in English. </div></div><br /><br/><div class="settingsEndBtn cyan">שמור</div><div class="saveSuccess">השינויים נשמרו! ייתכן שיהיה צורך לרענן.</div> <br /><hr /> <span style="font-size:16px;" class="convertTitleHighlight">המרה</span><br /><span class="convertHighlighter"> המר שם משתמש למספר משתמש (שבו תוכל להשתמש באריחים העליונים)</span><br /><table class="sConvertContainer"><tr class="sConvertLine" style="font-weight: bold;"><th>שם משתמש</th><th>מספר משתמש</th><th>הוסף לטבלה</th></tr><tr class="sConvertLine"><th><input type="text" class="userName"></th><th><iframe src="https://www.fxp.co.il/member.php?username=PlaceHolderThisUsernameCantExist@@&getIdOnly" class="userIdFrame" /><div class="userIdFrame loadingBackground"></div></th><th><div class="addToTable" title="הוסף לטבלה"></div></th></tr></table>',
    use: '<iframe src="' + chrome.runtime.getURL("html/howto.html") + '" class="howToFrame"></iframe>',
    touch: '<div class="SettingsTitle">תמיכה</div> <br/><span style="font-size:18px">ממני אליך</span> <br/>במידה ויש לך בעיה, הצעה או סתם בא לך ליצור איתי קשר, תוכל לעשות זאת בשני האופנים הבאים:<br /><br/> • באמצעות <a href="https://www.fxp.co.il/private.php?do=newpm&u=967488" style="color: #0000ff">הודעה פרטית ב-FXP</a><br/> • באמצעות Discord - רשום <a href="https://www.fxp.co.il/member.php?u=967488" style="color: #0000ff">בפרופיל שלי</a><br/><br/>אשמח לענות על שאלות ולעזור.<br/><br/><br/><span style="font-size:18px">ממך אל התוסף</span> <br/>התוסף הוא פחות מ-0.1% מהמשתמשים הפעילים ב-FxP. במידה ונהנית מהתוסף, <b>שתף את הכיף!™</b> - תוכל לעשות זאת בכמה אופנים: <br /><br/> • באמצעות תמיכה בתוסף ושיתוף שלו בחתימה שלך. <br/> • באמצעות שיתוף התוסף עם החברים שלך.<br/> • באמצעות השווצה בדברים שהתוסף יכול לעשות.<br/> • בכל אמצעי אחר שנראה לך שיועיל לפרסום התוסף.<br/><br/> אנצל את ההזדמנות הזו גם כדי לומר תודה על זה שהורדת את התוסף! אני מקווה שהוא מועיל לך ומשפר את חוויית הגלישה שלך. <br/><br/>'
};

var lastRadioName = 0;

$("#settings_pop .popupbody .boxcolor").parent("div").css("height", "15px"); //fix settings panel
$("#settings_pop .popupbody").append('<div style="margin: 10px;height: 2px;background-color: #C3D825;"></div>'); //add seperator
$("#settings_pop .popupbody").append('<div class="settingsBtn">הגדרות <div class="ltrInline">FxPlus+</div></div>'); //add button itself
$("body").append('<div id="settings"></div>'); //add settings div
var settingsSide = '<div id="SettingsSideNav">';
settingsSide += '<div style="width:100%;height:50px;line-height:50px;text-align:center;font-weight:bold;font-family:Tahoma;background:#e8e8e8;font-size:19px">הגדרות <div class="ltrInline">FxPlus+</div></div>';
settingsSide += '<li class="SettingsItem welcomeTab">ברוכים הבאים</li>';
settingsSide += '<li class="SettingsItem generalTab">כללי</li>';
settingsSide += '<li class="SettingsItem threadsTab">אשכולות</li>';
settingsSide += '<li class="SettingsItem commentsTab">תגובות ותת-ניקים</li>';
settingsSide += '<li class="SettingsItem useTab">איך להשתמש</li>';
settingsSide += '<li class="SettingsItem touchTab">תמיכה</li>';
//if (d.getMonth() == 3 && d.getDate() == 1) settingsSide += '<li class="SettingsItem aprlflsS aprlsafe">?</li>';
settingsSide += '<div style="margin-top:20px;"></div><li class="SettingsItem closeTab" style="font-style: italic;">סגור</li>';
settingsSide += '</div><div id="SettingsContent">';
settingsSide += '</div><div id="twitterContainer"><a class="twitter-timeline" href="https://twitter.com/FxPlusplus" data-widget-id="658321258107510785">ציוצים מאת FxPlusplus</a> <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?\'http\':\'https\';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script></div>';
$("#settings").html(settingsSide);

$(".welcomeTab").click(function () { $("#SettingsContent").html(pages.welcome); $("#SettingsContent").css("padding", "21px 32px"); }); //load pages on click of sidebar
$(".generalTab").click(function () {
    exportFromSyncStorage();
    $("#SettingsContent").html(pages.general); //load basic skeleton
    if (localStorage.getItem("signatureResize") == "true") { //change skeleton to fit current values
        $("#signatureResize").attr("checked", true);
    } else {
        $("#signatureResize").attr("checked", false);
    }
    if (localStorage.getItem("newMessages") == "true") {
        $("#newMessages").attr("checked", true);
    } else {
        $("#newMessages").attr("checked", false);
    }
    switch (localStorage.getItem("daysPinned")) {
        case "3":
            $('[name=daysPinned]').val("3day");
            break;
        case "7":
            $('[name=daysPinned]').val("7day");
            break;
        case "14":
            $('[name=daysPinned]').val("14day");
            break;
        case "28":
            $('[name=daysPinned]').val("28day");
            break;
        default:
            $('[name=daysPinned]').val("never");
            break;
    }
    if (localStorage.getItem("hideOutbrain") == "true") {
        $("#hideOutbrain").attr("checked", true);
    } else {
        $("#hideOutbrain").attr("checked", false);
    }
    if (localStorage.getItem("showSpoilers") == "true") {
        $("#showSpoilers").attr("checked", true);
    } else {
        $("#showSpoilers").attr("checked", false);
    }

    for (i = 0; i < 24; i++) { //add values for dropdown lists
        if (i < 10) {
            $("[name=startNight]").append('<option value="' + i + '">0' + i + ':00</option>');
            $("[name=endNight]").append('<option value="' + i + '">0' + i + ':00</option>');
        }
        else {
            $("[name=startNight]").append('<option value="' + i + '">' + i + ':00</option>');
            $("[name=endNight]").append('<option value="' + i + '">' + i + ':00</option>');
        }
    }

    var nightExportArray = JSON.parse(localStorage.getItem("nightMode"));
    console.log(nightExportArray);
    $("#autonight").attr("checked", nightExportArray[0]);
    $("[name=startNight]").val(nightExportArray[1]);
    $("[name=endNight]").val(nightExportArray[2]);
    $("#showNightIndicator").attr("checked", nightExportArray[3]);

    $('[name=peekCloseMethod]').val(JSON.parse(localStorage.getItem("peekCloseMethod")));
    $("#showStats").prop("checked", JSON.parse(localStorage.getItem("showStats")));

    getStorage("sync", "replaceIcons", function (data) {
        var replace = data.replaceIcons;
        $("#useOldSmiles").prop("checked", replace);
    });

    getStorage("sync", "BackgroundNotifications", function (data) {
        var bgn = data.BackgroundNotifications;
        $("#BackgroundNotifications").prop("checked", bgn);
    });


    $("#testNotif").click(function () { //test notification
        chrome.runtime.sendMessage({ sendTestNotification: true });
    });

    getStorage("sync", "customBg", function (data) {
        var customBg = data.customBg;
        if (customBg == undefined) customBg = ["", ""];
        var backgroundOptions = [ //default backgrounds
        ["http://i.imgur.com/1MmUNu3.png", "http://i.imgur.com/bDWYR8Z.png"],
        ["http://i.imgur.com/ADrRgIt.png", "http://i.imgur.com/Pjsc6hN.png"],
        ["http://i.imgur.com/CMrXz8C.png", "http://i.imgur.com/qeFYhiV.png"],
        ["http://i.imgur.com/BBhSnQe.png", "http://i.imgur.com/czWChlP.png"],
        ["http://i.imgur.com/DsaJFcC.png", "http://i.imgur.com/oy9i3HC.png"],
        ["http://i.imgur.com/5aAa07S.png", "http://i.imgur.com/C5PEadU.png"],
        ["http://i.imgur.com/cBpNKbC.png", "http://i.imgur.com/cg00LqB.png"],
        ["http://i.imgur.com/EPItv2I.png", "http://i.imgur.com/ydaX5SR.png"],
        ["http://i.imgur.com/HUJ8DiQ.png", "http://i.imgur.com/1ZPqz07.png"],
        ["http://i.imgur.com/Zdn0dcl.png", "http://i.imgur.com/KuohAF3.png"],
        ["http://i.imgur.com/GMWMX6k.png", "http://i.imgur.com/TMeYKDG.png"],
        ["http://i.imgur.com/85oSEzZ.png", "http://i.imgur.com/6JlEIa3.png"],
        ["http://i.imgur.com/rEW5Qez.png", "http://i.imgur.com/SSCQKzG.png"],
        ["http://i.imgur.com/toShjHB.png", "http://i.imgur.com/lkCHdKb.png"],
        ["http://i.imgur.com/3bzgci3.png", "http://i.imgur.com/u7DobRc.png"],
        ["http://i.imgur.com/WULD0vG.png", "http://i.imgur.com/93gxurP.png"],
        ["http://i.imgur.com/CDQaTZp.png", "http://i.imgur.com/4roFVau.png"],
        ["http://i.imgur.com/iifEP38.png", "http://i.imgur.com/Mjd130p.png"],
        ["http://i.imgur.com/grQrpbz.png", "http://i.imgur.com/HYFGeXE.png"],
        ["http://i.imgur.com/Gwk41En.png", "http://i.imgur.com/2s4sHgS.png"],
        ["http://i.imgur.com/5rOH2Jf.png", "http://i.imgur.com/Sh3ThC4.png"],
        ["http://i.imgur.com/KC9Mhws.png", "http://i.imgur.com/J1vFm19.png"]
        ]

        $("#changeBgSet").click(function () {
            $("#SettingsContent").append('<div class="overSettings"><div class="SettingsTitle">בחר רקע:</div>בחר רקע על ידי לחיצה עליו, או <a style="cursor:pointer; color: #0000ff" id="resetBg">אפס את הרקע הנוכחי</a>. ניתן להגדיר רקעים מותאמים אישית בתחתית הרשימה. בחירת רקע תרענן את הדף.<br/>הצד הימני של הרקע הוא המצב הרגיל שלו, והצד השמאלי הוא המצב שלו כשמצב לילה פועל.<br/><br/><div id="backgroundsHolder"></div></div>');

            var isFromSuggestions = false;
            for (i = 0; i < backgroundOptions.length; i++) { //add default backgrounds to list
                $("#backgroundsHolder").append('<div class="bg-contain"> <div class="bg-block right" style="background-image: url(' + backgroundOptions[i][0] + ')"></div><div class="bg-block left" style="background-image: url(' + backgroundOptions[i][1] + ')"></div> </div>');
                if (backgroundOptions[i][0] == customBg[0]) {
                    $(".bg-contain:last").addClass("selected");
                    isFromSuggestions = true;
                }
            }
            $("#backgroundsHolder").append('<div class="bg-contain customBg"> <div class="bg-block right"><input type="url" class="customBackgroundInput" placeholder="הכנס כתובת תמונה" /></div><div class="bg-block left"><input type="url" class="customBackgroundInput" placeholder="הכנס כתובת תמונה" /></div> </div>');
            if ((customBg[0] != "" || customBg[1] != "") && !isFromSuggestions) {
                $(".bg-contain:last").addClass("selected");
                $(".customBg .right .customBackgroundInput").val(customBg[0]);
                $(".customBg .left .customBackgroundInput").val(customBg[1]);
            }

            $("#backgroundsHolder").after('<br/><br/><center>כל הרקעים שנמצאים ברשימה זו, מלבד האחרון, נלקחו מהאתר <a href="http://subtlepatterns.com/" target="_blank">subtlepatterns.com</a>. הרקעים השחורים יותר הם ניגודים של הרקעים שנלקחו מאתר זה.</center>')

            $("#resetBg").click(function () {
                setStorage("sync", { "customBg": ["", ""] }, function () { location.reload(); });
            })

            $(".customBackgroundInput").focusout(function () {
                $(this).parents(".bg-block").css("background-image", "url(" + $(this).val() + ")");
            }).each(function () {
                $(this).parents(".bg-block").css("background-image", "url(" + $(this).val() + ")");
            })

            $(".bg-block").click(function () { //select new background
                $(".bg-contain").removeClass("selected");
                $(this).parents(".bg-contain").addClass("selected");
                var loc = $(this).parents(".bg-contain").index();
                if (loc == backgroundOptions.length) { //custom background
                    var dayBg = $(".customBg .right .customBackgroundInput").val();
                    var nightBg = $(".customBg .left .customBackgroundInput").val();
                    setStorage("sync", { "customBg": [dayBg, nightBg] }, function () { location.reload(); });
                } else {
                    setStorage("sync", { "customBg": [backgroundOptions[loc][0], backgroundOptions[loc][1]] }, function () { location.reload(); });
                }
            }).children().click(function (e) { //stop input boxes from setting
                return false;
            });
        });
    });

    $(".settingsEndBtn").click(function () { //save changes in page to memory
        if ($("#signatureResize").is(":checked")) {
            localStorage.setItem("signatureResize", "true");
        } else {
            localStorage.setItem("signatureResize", "false");
        }
        if ($("#newMessages").is(":checked")) {
            localStorage.setItem("newMessages", "true");
        } else {
            localStorage.setItem("newMessages", "false");
        }

        switch ($('[name=daysPinned]').find(":selected").attr("value")) {
            case "3day":
                localStorage.setItem("daysPinned", 3);
                break;
            case "7day":
                localStorage.setItem("daysPinned", 7);
                break;
            case "14day":
                localStorage.setItem("daysPinned", 14);
                break;
            case "28day":
                localStorage.setItem("daysPinned", 28);
                break;
            default:
                localStorage.setItem("daysPinned", 1000000);
                break;
        }
        localStorage.setItem("hideRules", JSON.stringify($("#hideRules").prop("checked")));

        if ($("#hideOutbrain").is(":checked")) {
            localStorage.setItem("hideOutbrain", "true");
        } else {
            localStorage.setItem("hideOutbrain", "false");
        }

        if ($("#showSpoilers").is(":checked")) {
            localStorage.setItem("showSpoilers", "true");
        } else {
            localStorage.setItem("showSpoilers", "false");
        }
        var nightArray = [];
        if ($("#autonight").is(":checked")) {
            nightArray.push(true);
        } else {
            nightArray.push(false);
        }
        nightArray.push(parseInt($("[name=startNight]").val()));
        nightArray.push(parseInt($("[name=endNight]").val()));
        if ($("#showNightIndicator").is(":checked")) {
            nightArray.push(true);
        } else {
            nightArray.push(false);
        }
        localStorage.setItem("nightMode", JSON.stringify(nightArray));
        localStorage.setItem("peekCloseMethod", JSON.stringify($('[name=peekCloseMethod]').find(":selected").attr("value")));
        localStorage.setItem("showStats", JSON.stringify($("#showStats").prop("checked")));
        setStorage("sync", { "replaceIcons": $("#useOldSmiles").prop("checked") });

        setStorage("sync", { "BackgroundNotifications": $("#BackgroundNotifications").prop("checked") });


        $(".saveSuccess").fadeIn(1).delay(3000).fadeOut(1000); //show success message
        saveToSyncStorage();
    });
    $("#SettingsContent").css("padding", "21px 32px");

});

function bindFrameLoad() {
    $("iframe.userFrame").unbind('load').load(function () {
        var userId = $(this).contents().find(".userOnly").text();
        $(this).parents("tr").find("div.userFrame").text(userId).removeClass("loadingBackground");
        $(this).after('<iframe class="userFrame" />');
        $(this).remove();
        bindFrameLoad();
    });
    $("iframe.userIdFrame").unbind('load').load(function () {
        var userName = $(this).contents().find(".userOnly").text();
        $(this).parents("tr").find("div.userIdFrame").text(userName).removeClass("loadingBackground");
        $(this).after('<iframe class="userIdFrame" />');
        $(this).remove();
        if (userName != "? ? ?" && userName != "") {
            $(".addToTable").css({
                "transform": "rotate(0deg)",
                "filter": "hue-rotate(0deg)",
                "webkitFilter": "hue-rotate(0deg)",
                "mozFilter": "hue-rotate(0deg)",
                "oFilter": "hue-rotate(0deg)",
                "cursor": "pointer"
            }).click(function () {
                if ($(".sThreadLine").length > 0) { //make sure to make the right action
                    $(".sThreadLine:last").after('<tr class="sThreadLine"> <th><input type="text" class="userId" value="' + userName + '"></th> <th> <input type="radio" name="radio' + lastRadioName + '" value="hide" class="SettingsCheckbox" />הסתר</th> <th> <input type="radio" name="radio' + lastRadioName + '" value="show" class="SettingsCheckbox" checked="checked" />הדגש</th> <th><iframe src="https://www.fxp.co.il/member.php?u=0&getUserOnly" class="userFrame" /><div class="userFrame loadingBackground"></div></th> <th><div class="removeEntry" title="הסר"></div></th> </tr>');
                    lastRadioName++;
                    $(".sThreadLine:last .removeEntry").click(function () {
                        $(this).parents(".sThreadLine").remove();
                    });
                    $(".sThreadLine:last .userId").focusout(function () {
                        $(this).parents("tr").find("div.userFrame").text("").addClass("loadingBackground");
                        var idOfUser = $(this).val();
                        $(this).parents(".sThreadLine").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + idOfUser + "&getUserOnly");
                    });
                    $(".sThreadLine:last .userId").parents(".sThreadLine").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + userName + "&getUserOnly");
                } else if ($(".containtersPlace").length > 0) {
                    $(".containtersPlace").append('<div class="sUserGridContainer"> <input type="text" class="userId" placeholder="מספר משתמש" value="' + userName + '"/><br /> <input type="checkbox" class="SettingsCheckbox hideComments"> הסתר תגובות ממשתמש זה<br /> <input type="checkbox" class="SettingsCheckbox unstyleComments"> נטרל עיצוב תגובות ממשתמש זה<br /> <input type="checkbox" class="SettingsCheckbox activeSubNick"> הפעל תת-ניק מיוחד<br /><br /> <table class="nUserGridNick"> <tr> <td colspan="2"><iframe src="https://www.fxp.co.il/member.php?u=' + userName + '&getUserOnly" class="userFrame"></iframe><div class="userFrame loadingBackground"></div></td> </tr> <tr> <td colspan="2"><input type="text" class="userSubNick" placeholder="תת-ניק.." /></td> </tr> <tr> <th><input type="color" class="colorId" value="#000000" /></th> <th>px <input type="number" class="textSize" min="0" max="100" value="11"> </th> </tr> <tr> <td colspan="2"><div class="removeEntry" title="הסר"></div></td> </tr> </table> </div>');
                    $(".sUserGridContainer:last .removeEntry").click(function () {
                        $(this).parents(".sUserGridContainer").remove();
                    });
                    $(".sUserGridContainer:last .userId").focusout(function () { //update username when focus out
                        $(this).parents(".sUserGridContainer").find("div.userFrame").text("").addClass("loadingBackground");
                        var idOfUser = $(this).val();
                        $(this).parents(".sUserGridContainer").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + idOfUser + "&getUserOnly");
                    });
                    $(".sUserGridContainer:last .colorId").change(function () { //update color of subnick when focus out
                        $(this).parents(".sUserGridContainer").find(".userSubNick").css("color", $(this).val());
                    });
                    $(".sUserGridContainer:last .textSize").change(function () { //update size of subnick when focus out
                        $(this).parents(".sUserGridContainer").find(".userSubNick").css("font-size", $(this).val() + "px");
                    });
                }
                bindFrameLoad();
            });
        }
        bindFrameLoad();
    });
}

$(".threadsTab").click(function () {
    exportFromSyncStorage();
    importantPost = JSON.parse(localStorage.getItem("importantPost"));
    lowPriorityPost = JSON.parse(localStorage.getItem("lowPriorityPost"));
    importantWord = JSON.parse(localStorage.getItem("importantWord"));
    lowPriorityWord = JSON.parse(localStorage.getItem("lowPriorityWord"));
    readTimePrefix = JSON.parse(localStorage.getItem("readTimePrefix"));
    var readTimeNews = JSON.parse(localStorage.getItem("readTimeNews"));
    $("#SettingsContent").html(pages.threads);
    if (daysSinceInstall == 0) { $(".convertTitleHighlight").css("background-color", "#FFFF00") }; //highlight convert for the blind

    for (i = 0; i < importantPost.length; i++) { //load important (show)
        $(".sThreadLine:last").after('<tr class="sThreadLine"> <th><input type="text" class="userId"></th> <th> <input type="radio" name="radio' + lastRadioName + '" value="hide" class="SettingsCheckbox" />הסתר</th> <th> <input type="radio" name="radio' + lastRadioName + '" value="show" class="SettingsCheckbox" checked="checked" />הדגש</th> <th><iframe src="https://www.fxp.co.il/member.php?u=0&getUserOnly" class="userFrame" /><div class="userFrame loadingBackground"></div></th> <th><div class="removeEntry" title="הסר"></div></th> </tr>');
        lastRadioName++;
        $(".sThreadLine:last .userId").val(importantPost[i]);
        $(".sThreadLine:last .SettingsCheckbox[value=show]").prop("checked", true);
        var idOfUser = importantPost[i];
        $(".sThreadLine:last").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + idOfUser + "&getUserOnly");
    }
    for (i = 0; i < lowPriorityPost.length; i++) { //load low priority (hide)
        $(".sThreadLine:last").after('<tr class="sThreadLine"> <th><input type="text" class="userId"></th> <th> <input type="radio" name="radio' + lastRadioName + '" value="hide" class="SettingsCheckbox" />הסתר</th> <th> <input type="radio" name="radio' + lastRadioName + '" value="show" class="SettingsCheckbox" checked="checked" />הדגש</th> <th><iframe src="https://www.fxp.co.il/member.php?u=0&getUserOnly" class="userFrame" /><div class="userFrame loadingBackground"></div></th> <th><div class="removeEntry" title="הסר"></div></th> </tr>');
        lastRadioName++;
        $(".sThreadLine:last .userId").val(lowPriorityPost[i]);
        $(".sThreadLine:last .SettingsCheckbox[value=hide]").prop("checked", true);
        var idOfUser = lowPriorityPost[i];
        $(".sThreadLine:last").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + idOfUser + "&getUserOnly");
    }

    var lowPriorityBox = "";
    for (i = 0; i < lowPriorityWord.length; i++) { //add low priority words to box
        if (i > 0) lowPriorityBox += " ";
        lowPriorityBox += lowPriorityWord[i];
    }
    $(".dataText:eq(0)").val(lowPriorityBox);
    var importantBox = "";
    for (i = 0; i < importantWord.length; i++) { //add low priority words to box
        if (i > 0) importantBox += " ";
        importantBox += importantWord[i];
    }
    $(".dataText:eq(1)").val(importantBox);

    $(".removeEntry").click(function () { //remove line when clicked "remove"
        $(this).parents(".sThreadLine").remove();
    });
    $(".userId").focusout(function () { //update username when focus out
        $(this).parents("tr").find("div.userFrame").text("").addClass("loadingBackground");
        var idOfUser = $(this).val();
        $(this).parents(".sThreadLine").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + idOfUser + "&getUserOnly");
    });


    $("#calculateReadTime").click(function () { //calculate read time interface
        $("#SettingsContent").html('<div id="calcReadInterface"></div>');
        $('head').append('<link rel="stylesheet" href="http://fonts.googleapis.com/earlyaccess/opensanshebrew.css" type="text/css" />'); //have beautiful font for easy reading
        $("#calcReadInterface").html('<span style="font-size:20px; font-weight: bold">חישוב מהירות קריאה ממוצעת</span><br/><div class="calcInnerFace"></div><div class="settingsEndBtn calcTime" style="background: #32CD32; border: 1px solid #30b130; margin: 0 auto;">התחל</div>');
        $(".calcInnerFace").html('בעוד רגעים ספורים יוצג בפניך קטע קצר שלקוח מויקיפדיה. קרא אותו עד סופו, ובסיום הקריאה לחץ על הכפתור בתחתית הדף.<br/>התוסף יחלק את כמות המילים בקטע בזמן שלקח לך לקרוא אותו, ובכך יקבע את מהירות הקריאה שלך.');
        $(".calcTime").click(function () {

            var readTimeTexts = [ //a bunch of text taken from wikipedia for use in setting read time.
    'עברית היא שפה ממשפחת השפות השמיות, הידועה כשפתו של העם היהודי, ואשר ניב מודרני שלה משמש כשפה רשמית ועיקרית של מדינת ישראל. השפה העברית הייתה מדוברת החל מן האלף ה-2 לפנה"ס באזור הלבנט. טקסטים מהתקופה הזו שהתגלו בירדן ובלבנון חושפים קרבה רבה בין השפה העברית לשפה הפיניקית והמואבית. בעברית נכתבו רוב ספרי התנ"ך, כל המשנה, רוב הספרים החיצוניים ורוב המגילות הגנוזות. המקרא נכתב בעברית מקראית, ואילו המשנה נכתבה בניב הקרוי לשון חז"ל. כנראה במאה ה-2 או לאחר מכן, פסקה העברית לשמש כשפת דיבור.',
'המשלחת הטראנס-אנטארקטית של חבר העמים הייתה משלחת שיצאה לאנטארקטיקה בין השנים 1955‏-1958 בחסות חבר העמים הבריטי, במטרה להגיע לקוטב הדרומי. המשלחת הייתה הראשונה בהיסטוריה שהשלימה בהצלחה חצייה יבשתית של אנטארקטיקה דרך הקוטב הדרומי, והייתה השלישית שהגיעה לקוטב הדרומי, 46 שנים לאחר שעשו זאת משלחת הקוטב הדרומי של רואלד אמונדסן ומשלחת טרה נובה של רוברט פלקון סקוט, בשנים 1911 ו-1912.',
'המקרר של איינשטיין הוא סוג של מקרר ללא חלקים נעים, אשר הומצא בשנת 1926 על ידי אלברט איינשטיין ולאו סילארד, שהיה סטודנט שלו מספר שנים לפני כן באוניברסיטה הטכנית של ברלין. ההמצאה נרשמה כפטנט במשרד הפטנטים האמריקאי, ב-11 בנובמבר 1930. המכונה עובדת על קליטת לחץ יחיד, בדומה למקררי ספיגת הגז, אשר ניצלו מקור חום כדי ליצור את האנרגיה הדרושה לשם הקירור, ולא על ידי חשמל המפעיל את המדחס.',
'האיגוד האסטרונומי הבינלאומי עוסק גם במתן שמות לאסטרואידים. נכון ל-8 במרץ 2015, 19,112 אסטרואידים זכו לשם פרטי. מנהג זה, להעניק שמות לאסטרואידים, מאפשר להנציח בחלל הקרוב אלפי אנשים מכל התחומים: מלחינים כבאך ופלסטרינה, זמרים כאלביס ופיאף, אנשי מדע כגדל, איינשטיין ופון נוימן, אסטרונומים כהרשל ואולברס, ציירים כרנואר ופיקאסו, אסטרונאוטים כאילן רמון ואפילו תלמיד בית ספר תיכון ישראלי, רון נוימן. ישנם גם שמות שאינם על שם אנשים: ASCII, נמיביה, אפריקה, אפופיס, לינוקס, ויקיפדיה ועוד.',
'עם חנוכת מסילת הרכבת לירושלים בשנת 1892 התעוררה ביישוב השאלה - איזה שם עברי יינתן לכלי הרכב הנע על מסילת ברזל. יחיאל מיכל פינס הציע לאליעזר בן יהודה שם עברי ל"סוס הפלדה" - כמשקל המילה המקראית "גמלת" (שפירושה הוא שיירת גמלים) הציע פינס את המילה "עגלת" (כלומר, שיירת עגלות). בן יהודה קיבל את המשקל שהוצע, אך העדיף שורש אחר. כך טבע את המילה החדשה "רכבת" (שיירת רכב).',
'בחברה האנושית יש דרכים רבות לברך פני אדם זר, אך בכולן מועבר אותו מסר, המברך אינו מהווה איום על הזר. הרומאים נהגו להרים את כף יד ימין הפתוחה בברכה, ובכך להראות שאין בידם כלי נשק. בחברות אחרות מקובל ללחוץ את יד ימין לשלום, תוך העברת מסר דומה. בימי הביניים האבירים היו מרימים את מכסה העיניים בקסדתם כאשר היו נפגשים באביר אחר, על מנת שיוכלו לזהותם כאוהב ולא כאויב. מנהג זה שרד למעשה עד ימינו, והוא המקור להצדעה המקובלת בצבא.',
'ב-1921 הגיע וינסטון צ\'רצ\'יל, שר המושבות הבריטי, לביקור ממלכתי בתל אביב, וראש העיר מאיר דיזנגוף החליט להרשימו. מאחר שתל אביב הייתה אז בת פחות מ-15 שנה ורחובותיה היו דלים וחפים מצמחייה, הובאו עצים בוגרים מן המושבות הסמוכות, וניטעו באופן זמני בחולות שדרות רוטשילד. צ\'רצ\'יל עמד נפעם מול "העיר שהתפתחה פלאים", אך פרץ בצחוק למראה העצים הקורסים אחד אחד, כאשר ילדיה הסקרנים של תל אביב טיפסו עליהם כדי לחזות בשר מקרוב. דיזנגוף הנבוך לא ידע את נפשו, אך צ\'רצ\'יל רק טפח על שכמו ואמר לו: "הקפידו להעמיק שורשיכם, שכן בלעדיהם לא תחזיקו מעמד."',
'לפני החדרת מחט מזרק או עירוי לזרוע, נהוג לחטא באלכוהול את העור באזור המיועד לדקירה, על מנת למנוע זיהום. באופן לכאורה פרדוקסלי, חיטוי שכזה הוא חובה בארצות הברית גם לפני הוצאה להורג באמצעות זריקת רעל, על אף שבגוף הנידון למוות לא יכול להתפתח נזק מזיהום חיידקי או נגיפי בזמן הקצר שנותר לו לחיות, ועל אף שההוצאה להורג מיועדת לפגוע בעליל בבריאותו. אחת הסיבות לנוהל זה היא שייתכן כי בפרק הזמן שבין החדרת המחט לבין תחילת הזרקת הרעל יורה בית המשפט לעכב את ביצוע גזר הדין, כפי שאכן קרה בטקסס ב-1983, בעת ההוצאה להורג של הרוצח ג\'יימס אוטרי. אוטרי הוחזר חי ובריא לתאו, אך הוצא להורג מספר חודשים לאחר מכן.',
'הנפת דגל בחצי התורן היא ביטוי לאבל במדינות רבות. אחד ההסברים למקור המנהג הוא מתן קדימות לדגל הסמלי הבלתי נראה של המוות. הנס המלכותי של הממלכה המאוחדת, אשר משמש את ריבון הממלכה המאוחדת, להבדיל מדגל הממלכה המאוחדת אשר משמש את המדינה, אינו מורכן לעולם לחצי התורן, אפילו לאות אבל על מותו של הריבון, משום שאף על פי שהריבון מת, תמיד יהיה מי שימלוך תחתיו, לפי העיקרון של "המלך מת, יחי המלך!". גם דגל ערב הסעודית אינו מורכן לחצי התורן, אך מסיבה אחרת – הוא נושא את השהאדה, הכרזת האמונה האסלאמית, ולכן הרכנתו עלולה להיחשב לכפירה.',
'על אף שלא ניתן למדוד בדיוק רב את מיקומן של חלליות הוויאג\'ר, אפשר לקבוע בוודאות שוויאג\'ר 1 רחוקה יותר מכדור הארץ מאשר וויאג\'ר 2 למרות שהיא שוגרה אחריה, מכיוון שמסלולה של וויאג\'ר 1 נשא אותה מהר יותר לכיוון כוכב הלכת צדק. לעומת זאת, את מיקומן של החלליות פיוניר 10 ופיוניר 11 ניתן למדוד בדיוק רב אך התוצאה המתקבלת לא תואמת את התחזיות. ייתכן שתופעה זו, המכונה האנומליה של פיוניר, מצביעה על טעות בתורת היחסות הכללית, אך יכולים להיות הסברים פשוטים יותר כגון דליפת גז.',
'"הכפר הירוק ע"ש לוי אשכול" נקרא בטעות על שמם של שניים מראשי ממשלת ישראל. מייסד הכפר, גרשון זק, קרא לו "כפר הירוק",‏‏‏ ללא ה"א הידיעה לפני המילה כפר, מתוך כוונה לקרוא לו על שם דוד בן גוריון, ששם משפחתו המקורי היה "גרין", ירוק ביידיש. משמעות השם לפיכך הייתה "הכפר על שם הירוק".‏ ברבות השנים, וכתוצאה מכך שרבים לא הבינו את הרמז הטמון בשם המוסד, הוספה בטעות ה"א הידיעה לשם והוא נקרא "הכפר הירוק". כ-20 שנה מאוחר יותר, לאחר פטירת ראש הממשלה השלישי לוי אשכול, נקרא המקום גם על שמו, כנראה משכחת המקור לשם הראשוני.',
            ];
            var arrayIndex = Math.floor(Math.random() * readTimeTexts.length);
            var randomSentence = readTimeTexts[arrayIndex]; //get random sentence from array
            var wordCount = readTimeTexts[arrayIndex].split(" ").length; //get word count
            $(".calcInnerFace").html('<span style="line-height: 18px">' + randomSentence + '</span>'); //put in text place
            $(".calcTime").unbind().css({ "background": "#FF2C2C", "border": "1px solid #B32D2D" }).html("קראתי!");
            var timePassedInHalfSecond = 0;
            var timerStart = setInterval(function () { //start counting time
                timePassedInHalfSecond++;
            }, 500);
            $(".calcTime").click(function () {
                $(this).remove();
                window.clearInterval(timerStart); //stop time ticking
                var timePassedInMinutes = timePassedInHalfSecond / 120;
                var readSpeed = Math.round(wordCount / timePassedInMinutes * 10) / 10; //rounds to 1 decimal place
                if (isNaN(parseInt(readSpeed)) || readSpeed == 0) { //invalid time
                    $(".calcInnerFace").html('מהירות הקריאה הממוצעת שלך היא:' +
                    '<br/><span id="finalTime" style="font-weight:bold; font-size:25px; color:red">' + readSpeed + '</span><br/>' +
                    '<b>מילים לדקה.</b><br/><br/>משום שנתון זה אינו תקין, התוסף לא יעשה בו שימוש ומהירות הקריאה נקבעה למהירות הקריאה הממוצעת, 220 מילים לדקה. בחר קטגוריה מהצד כדי לסגור דף זה.'
                    );
                    setStorage("sync", { "readTimeUser": 220 });
                    setCookie("readTime", '[["0",0]]', 14);
                } else {
                    $(".calcInnerFace").html('מהירות הקריאה הממוצעת שלך היא:' +
                    '<br/><span id="finalTime" style="font-weight:bold; font-size:25px; color:green;">' + readSpeed + '</span><br/>' +
                    '<b>מילים לדקה.</b><br/><br/>מעכשיו התוסף ישתמש בנתון זה כאשר יחשב זמני קריאה לאשכולות. בחר קטגוריה מהצד כדי לסגור דף זה.'
                    );
                    setStorage("sync", { "readTimeUser": readSpeed });
                    setCookie("readTime", '[["0",0]]', 14);
                }
                var arrSplit = document.cookie.split(";");

                for (var i = 0; i < arrSplit.length; i++) {
                    var cookie = arrSplit[i].trim();
                    var cookieName = cookie.split("=")[0];

                    if (cookieName.indexOf("readTime") === 0) { //remove already calculated readtime variables
                        document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    }
                }
                exportFromSyncStorage(); //make sure the extension's data stays unharmed

                $("#finalTime").fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300); //highlight
            })
        })
    })

    $(".settingsEndBtn.green").click(function () { //add new line
        $(".sThreadLine:last").after('<tr class="sThreadLine"> <th><input type="text" class="userId"></th> <th> <input type="radio" name="radio' + lastRadioName + '" value="hide" class="SettingsCheckbox" />הסתר</th> <th> <input type="radio" name="radio' + lastRadioName + '" value="show" class="SettingsCheckbox" checked="checked" />הדגש</th> <th><iframe src="https://www.fxp.co.il/member.php?u=0&getUserOnly" class="userFrame" /><div class="userFrame loadingBackground"></div></th> <th><div class="removeEntry" title="הסר"></div></th> </tr>');
        lastRadioName++;
        $(".sThreadLine:last .removeEntry").click(function () {
            $(this).parents(".sThreadLine").remove();
        });
        $(".sThreadLine:last .userId").focusout(function () {
            $(this).parents("tr").find("div.userFrame").text("").addClass("loadingBackground");
            var idOfUser = $(this).val();
            $(this).parents(".sThreadLine").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + idOfUser + "&getUserOnly");
        });
        bindFrameLoad();
    });

    $(".tagItem").click(function () { $(this).toggleClass("selectedItem"); });
    for (i = 0; i < readTimePrefix.length; i++) { //select from storage
        $(".tagItem:contains('" + readTimePrefix[i] + "')").addClass("selectedItem");
    }
    if (readTimeNews) $(".tagItem:contains('כתבות בפורומי עדכונים')").addClass("selectedItem");

    getStorage("sync", "readTimeUser", function (data) { //place current read speed
        var readSpeed = data.readTimeUser;
        if (isNaN(readSpeed)) {
            setStorage("sync", { "readTimeUser": 220 });
            readSpeed = 220;
        }
        $("#placeReadSpeed").text(readSpeed);
    });

    $(".settingsEndBtn.cyan").click(function () { //save button
        importantPost = []; //clear list
        $(".SettingsCheckbox[value=show]:checked").each(function () { //add each line to list
            var idOfUser = $(this).parents(".sThreadLine").find(".userId").val();
            importantPost.push(idOfUser);
        });
        lowPriorityPost = []; //clear list
        $(".SettingsCheckbox[value=hide]:checked").each(function () { //add each line to list
            var idOfUser = $(this).parents(".sThreadLine").find(".userId").val();
            lowPriorityPost.push(idOfUser);
        });
        var inputArray = $(".dataText:eq(0)").val().split(" "); //get input for low priority words
        for (i = 0; i < inputArray.length; i++) {
            if (inputArray[i] === "") {
                inputArray.splice(i, 1); //remove empty values from array
            }
        }
        lowPriorityWord = inputArray; //set values

        inputArray = $(".dataText:eq(1)").val().split(" "); //get input for low priority words
        for (i = 0; i < inputArray.length; i++) {
            if (inputArray[i] === "") {
                inputArray.splice(i, 1); //remove empty values from array
            }
        }
        importantWord = inputArray; //set values

        inputArray = [];
        $(".tagItem.selectedItem").each(function () {
            if ($(this).attr("id") != "updateForums") inputArray.push($(this).attr("id"));
        });
        readTimePrefix = inputArray;

        readTimeNews = false;
        if ($(".tagItem.selectedItem#updateForums").length > 0) readTimeNews = true;

        localStorage.setItem("importantPost", JSON.stringify(importantPost)); //set new list to localstorage
        localStorage.setItem("lowPriorityPost", JSON.stringify(lowPriorityPost));
        localStorage.setItem("importantWord", JSON.stringify(importantWord));
        localStorage.setItem("lowPriorityWord", JSON.stringify(lowPriorityWord));
        localStorage.setItem("readTimePrefix", JSON.stringify(readTimePrefix));
        localStorage.setItem("readTimeNews", JSON.stringify(readTimeNews));

        $(this).nextAll(".saveSuccess").first().fadeIn(1).delay(3000).fadeOut(1000); //show success message
        saveToSyncStorage();
    });
    $(".userName").focusout(function () { //update user id when focus out (convert)
        $(this).parents("tr").find("div.userIdFrame").text("").addClass("loadingBackground");
        var nameOfUser = $(this).val();
        $(this).parents(".sConvertLine").find("iframe.userIdFrame").attr("src", "https://www.fxp.co.il/member.php?username=" + nameOfUser + "&getIdOnly");
        $(".addToTable").css({
            "transform": "rotate(45deg)",
            "filter": "hue-rotate(-90deg)",
            "webkitFilter": "hue-rotate(-90deg)",
            "mozFilter": "hue-rotate(-90deg)",
            "oFilter": "hue-rotate(-90deg)",
            "cursor": "url(http://fcdn.co.il/smilies2/nono.gif), not-allowed"
        }).unbind("click");
    });

    if ($(".userIdFrame").text() == "") {
        $(this).attr("src", $(this).attr("src"));
        $(this).parents("tr").find("div.userIdFrame").text("").addClass("loadingBackground");
    }

    bindFrameLoad();
    $("#SettingsContent").css("padding", "21px 32px");
});
$(".commentsTab").click(function () {
    exportFromSyncStorage();
    defaultStyle = JSON.parse(localStorage.getItem("defaultStyle"));
    $("#SettingsContent").html(pages.comments);
    if (daysSinceInstall == 0) { $(".convertTitleHighlight").css("background-color", "#FFFF00") }; //highlight convert for the blind
    var commentsAndSubnicks = [[]];
    commentsAndSubnicks = JSON.parse(localStorage.getItem("commentsAndSubnicks"));

    $(".font > option[value='unknown']").each(function () { //set font values
        $(this).attr("value", $(this).text());
        $(this).css("font-family", $(this).text());
    });

    for (i = 0; i < commentsAndSubnicks.length; i++) {
        $(".containtersPlace").append('<div class="sUserGridContainer"> <input type="text" class="userId" placeholder="מספר משתמש" /><br /> <input type="checkbox" class="SettingsCheckbox hideComments"> הסתר תגובות ממשתמש זה<br /> <input type="checkbox" class="SettingsCheckbox unstyleComments"> נטרל עיצוב תגובות ממשתמש זה<br /> <input type="checkbox" class="SettingsCheckbox activeSubNick"> הפעל תת-ניק מיוחד<br /><br /> <table class="nUserGridNick"> <tr> <td colspan="2"><iframe src="https://www.fxp.co.il/member.php?u=0&getUserOnly" class="userFrame"></iframe><div class="userFrame loadingBackground"></div></td> </tr> <tr> <td colspan="2"><input type="text" class="userSubNick" placeholder="תת-ניק.." /></td> </tr> <tr> <th><input type="color" class="colorId" value="#000000" /></th> <th>px <input type="number" class="textSize" min="0" max="100" value="11"> </th> </tr> <tr> <td colspan="2"><div class="removeEntry" title="הסר"></div></td> </tr> </table> </div>');
        $(".sUserGridContainer:last .removeEntry").click(function () {
            $(this).parents(".sUserGridContainer").remove();
        });
        $(".sUserGridContainer:last .userId").val(commentsAndSubnicks[i][0]);
        $(".sUserGridContainer:last .hideComments").prop("checked", commentsAndSubnicks[i][1]);
        $(".sUserGridContainer:last .unstyleComments").prop("checked", commentsAndSubnicks[i][2]);
        $(".sUserGridContainer:last .activeSubNick").prop("checked", commentsAndSubnicks[i][3]);
        $(".sUserGridContainer:last .userSubNick").val(commentsAndSubnicks[i][4]);
        $(".sUserGridContainer:last .colorId").val("#" + commentsAndSubnicks[i][5]);
        $(".sUserGridContainer:last .textSize").val(commentsAndSubnicks[i][6].split("px")[0]);

        $(".sUserGridContainer:last").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + commentsAndSubnicks[i][0] + "&getUserOnly");
        $(".sUserGridContainer:last").find(".userSubNick").css("color", "#" + commentsAndSubnicks[i][5]);
        $(".sUserGridContainer:last").find(".userSubNick").css("font-size", commentsAndSubnicks[i][6]);
    }

    if (defaultStyle[0]) $(".enableDefaultStyle").prop("checked", true);
    if (defaultStyle[1]) { $(".styleBar .bold").addClass("activeEffect"); $(".styleText").css("font-weight", "bold"); }
    if (defaultStyle[2]) { $(".styleBar .italic").addClass("activeEffect"); $(".styleText").css("font-style", "italic"); }
    if (defaultStyle[3]) { $(".styleBar .underline").addClass("activeEffect"); $(".styleText").css("text-decoration", "underline"); }
    $(".styleBar .font").val(defaultStyle[4]);
    $(".styleText").css("font-family", defaultStyle[4]);
    $(".styleBar .textColor").val(defaultStyle[5]);
    $(".styleText").css("color", defaultStyle[5]);

    $(".userId").focusout(function () { //update username when focus out
        $(this).parents(".sUserGridContainer").find("div.userFrame").text("").addClass("loadingBackground");
        var idOfUser = $(this).val();
        $(this).parents(".sUserGridContainer").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + idOfUser + "&getUserOnly");
    });
    $(".colorId").change(function () { //update color of subnick when focus out
        $(this).parents(".sUserGridContainer").find(".userSubNick").css("color", $(this).val());
    });
    $(".textSize").change(function () { //update size of subnick when changed
        $(this).parents(".sUserGridContainer").find(".userSubNick").css("font-size", $(this).val() + "px");
    });

    $(".settingsEndBtn.green").click(function () { //add new tile
        $(".containtersPlace").append('<div class="sUserGridContainer"> <input type="text" class="userId" placeholder="מספר משתמש" /><br /> <input type="checkbox" class="SettingsCheckbox hideComments"> הסתר תגובות ממשתמש זה<br /> <input type="checkbox" class="SettingsCheckbox unstyleComments"> נטרל עיצוב תגובות ממשתמש זה<br /> <input type="checkbox" class="SettingsCheckbox activeSubNick"> הפעל תת-ניק מיוחד<br /><br /> <table class="nUserGridNick"> <tr> <td colspan="2"><iframe src="https://www.fxp.co.il/member.php?u=0&getUserOnly" class="userFrame"></iframe><div class="userFrame loadingBackground"></div></td> </tr> <tr> <td colspan="2"><input type="text" class="userSubNick" placeholder="תת-ניק.." /></td> </tr> <tr> <th><input type="color" class="colorId" value="#000000" /></th> <th>px <input type="number" class="textSize" min="0" max="100" value="11"> </th> </tr> <tr> <td colspan="2"><div class="removeEntry" title="הסר"></div></td> </tr> </table> </div>');
        $(".sUserGridContainer:last .removeEntry").click(function () {
            $(this).parents(".sUserGridContainer").remove();
        });
        $(".sUserGridContainer:last .userId").focusout(function () { //update username when focus out
            $(this).parents(".sUserGridContainer").find("div.userFrame").text("").addClass("loadingBackground");
            var idOfUser = $(this).val();
            $(this).parents(".sUserGridContainer").find("iframe.userFrame").attr("src", "https://www.fxp.co.il/member.php?u=" + idOfUser + "&getUserOnly");
        });
        $(".sUserGridContainer:last .colorId").change(function () { //update color of subnick when focus out
            $(this).parents(".sUserGridContainer").find(".userSubNick").css("color", $(this).val());
        });
        $(".sUserGridContainer:last .textSize").change(function () { //update size of subnick when focus out
            $(this).parents(".sUserGridContainer").find(".userSubNick").css("font-size", $(this).val() + "px");
        });
        bindFrameLoad();
    });

    $(".userName").focusout(function () { //update user id when focus out (convert)
        $(this).parents("tr").find("div.userIdFrame").text("").addClass("loadingBackground");
        var nameOfUser = $(this).val();
        $(this).parents(".sConvertLine").find("iframe.userIdFrame").attr("src", "https://www.fxp.co.il/member.php?username=" + nameOfUser + "&getIdOnly");
        $(".addToTable").css({
            "transform": "rotate(45deg)",
            "filter": "hue-rotate(-90deg)",
            "webkitFilter": "hue-rotate(-90deg)",
            "mozFilter": "hue-rotate(-90deg)",
            "oFilter": "hue-rotate(-90deg)",
            "cursor": "url(http://fcdn.co.il/smilies2/nono.gif), not-allowed"
        }).unbind("click");
    });

    $(".settingsEndBtn.cyan").click(function () { //save changes
        commentsAndSubnicks = [];
        $(".sUserGridContainer").each(function () {
            var userId = $(this).find(".userId").val();
            var hideComments = $(this).find(".hideComments").prop('checked');
            var unstyleComments = $(this).find(".unstyleComments").prop('checked');
            var activeSubNick = $(this).find(".activeSubNick").prop('checked');
            var subnick = $(this).find(".userSubNick").val();
            var subnickColor = $(this).find(".colorId").val().substr(1);
            var textSize = $(this).find(".textSize").val() + "px";
            var arrayPushed = [];
            arrayPushed.push(userId);
            arrayPushed.push(hideComments);
            arrayPushed.push(unstyleComments);
            arrayPushed.push(activeSubNick);
            arrayPushed.push(subnick);
            arrayPushed.push(subnickColor);
            arrayPushed.push(textSize);
            commentsAndSubnicks.push(arrayPushed);
        });
        localStorage.setItem("commentsAndSubnicks", JSON.stringify(commentsAndSubnicks));

        var styleChange = $(".enableDefaultStyle").prop("checked");
        var bold = $(".styleBar .bold").hasClass("activeEffect");
        var italic = $(".styleBar .italic").hasClass("activeEffect");
        var underline = $(".styleBar .underline").hasClass("activeEffect");
        var font = $(".styleBar .font").val();
        var color = $(".styleBar .textColor").val();
        defaultStyle = [styleChange, bold, italic, underline, font, color];
        localStorage.setItem("defaultStyle", JSON.stringify(defaultStyle));

        $(this).nextAll(".saveSuccess").first().fadeIn(1).delay(3000).fadeOut(1000); //show success message
        saveToSyncStorage();
    });

    $(".styleBar .font").change(function () {
        if ($(this).val() != "none") {
            $(this).parents("div:eq(1)").find(".styleText").css("font-family", $(this).val());
        }
    });
    $(".styleBar .textColor").change(function () {
        $(this).parents("div:eq(1)").find(".styleText").css("color", $(this).val());
    });
    $(".styleBar div").click(function () {
        if ($(this).hasClass("activeEffect")) {
            $(this).removeClass("activeEffect");
            switch ($(this).attr('class')) {
                case "bold":
                    $(this).parents("div:eq(1)").find(".styleText").css("font-weight", "normal");
                    break;
                case "italic":
                    $(this).parents("div:eq(1)").find(".styleText").css("font-style", "normal");
                    break;
                default:
                    $(this).parents("div:eq(1)").find(".styleText").css("text-decoration", "inherit");
                    break;
            }
        } else {
            $(this).addClass("activeEffect");
            switch ($(this).attr('class')) {
                case "bold activeEffect":
                    $(this).parents("div:eq(1)").find(".styleText").css("font-weight", "bold");
                    break;
                case "italic activeEffect":
                    $(this).parents("div:eq(1)").find(".styleText").css("font-style", "italic");
                    break;
                default:
                    $(this).parents("div:eq(1)").find(".styleText").css("text-decoration", "underline");
                    break;
            }
        }

    });

    bindFrameLoad();
    $("#SettingsContent").css("padding", "21px 32px");
});

$(".useTab").click(function () { $("#SettingsContent").html(pages.use); $("#SettingsContent").css("padding", "0"); });
$(".touchTab").click(function () { $("#SettingsContent").html(pages.touch); $("#SettingsContent").css("padding", "21px 32px"); });
//$(".aprlflsS").html("אחד באפריל!").css("font-weight", "bold").click(function () {
//    $("#SettingsContent").html('<div class="aprlsafe"><div class="SettingsTitle aprlsafe">אחד באפריל!</div> <br /><br/>כן, זו שוב התקופה הזו בשנה. לתאריך מיוחד זה בלבד, התוסף משנה לגופן איכותי ומרהיב - והוא למעשה גופן הכתב של דוד בן גוריון בכבודו ובעצמו! לא מדהים?<br/><br/><a id="cancelDavid" class="aprlsafe" style="cursor: pointer; color: #0000ff">כדי לנטרל את עיצוב זה לחץ כאן.</a></div>').find("*").css("font-family", "Arial");
//    $("#cancelDavid").click(function () {
//        setCookie("disableDavid", "true", 5);
//        location.reload();
//    })
//});
$(".closeTab").click(function () { //close settings
    $("#settings").fadeOut(100);
    document.title = oldTitle;
    $("html").css("overflow", "visible");
});

$(window).resize(function () {
    if ($("#settings").css("display") == "block") //settings are shown
    {
        if (window.innerWidth - $("#SettingsSideNav").width() - $("#twitterContainer").width() < 150)
            $("#SettingsContent").css("width", "calc(100% - 200px)"); //make settings content wider
        else
            $("#SettingsContent").css("width", ""); //default
    }
});

var oldTitle = "FxP";
$("#SettingsContent").html(pages.welcome); //load settings
$(".settingsBtn").click(function () {
    oldTitle = document.title;
    document.title = "הגדרות FxPlus+";
    $("#settings").fadeIn(100);
    $("html").css("overflow", "hidden");
});

//if (getCookie("ftrck") != "no") {
//    getStorage("sync", "replaceIcons", function (data) {
//        getStorage("sync", "customBg", function (data2) {
//            var customBg = data2.customBg;
//            var replaceIcons = data.replaceIcons;

//            exportFromSyncStorage();
//            var featureList = [];
//            if (localStorage.getItem("savedThreads") != variableValues[0])
//                featureList.push("savedThreads");
//            if (localStorage.getItem("signatureResize") == "true")
//                featureList.push("signatureResize");
//            if (localStorage.getItem("newMessages") == "true")
//                featureList.push("newMessages");
//            if (localStorage.getItem("daysPinned") != variableValues[3])
//                featureList.push("daysPinned");
//            if (localStorage.getItem("lowPriorityPost") != variableValues[4])
//                featureList.push("lowPriorityPost");
//            if (localStorage.getItem("importantPost") != variableValues[5])
//                featureList.push("importantPost");
//            if (localStorage.getItem("lowPriorityWord") != variableValues[6])
//                featureList.push("lowPriorityWord");
//            if (localStorage.getItem("importantWord") != variableValues[7])
//                featureList.push("importantWord");
//            if (localStorage.getItem("hideOutbrain") == "true")
//                featureList.push("hideOutbrain");
//            if (localStorage.getItem("lowPriorityComment") != variableValues[9])
//                featureList.push("lowPriorityComment");
//            //skipping subnick and disableStyle?
//            if (localStorage.getItem("commentsAndSubnicks") != variableValues[12])
//                featureList.push("commentsAndSubnicks");
//            if (JSON.parse(localStorage.getItem("defaultStyle"))[0] == true)
//                featureList.push("defaultStyle");
//            if (localStorage.getItem("showSpoilers") == "true")
//                featureList.push("showSpoilers");
//            if (getCookie("nightUse") == "true")
//                featureList.push("nightmode");
//            if (JSON.parse(localStorage.getItem("readTimePrefix")).length > 0)
//                featureList.push("readTimePrefix");
//            if (localStorage.getItem("readTimeNews") == "true")
//                featureList.push("readTimeNews");
//            if (getCookie("peekUse") == "true")
//                featureList.push("peek");
//            if (localStorage.getItem("showStats") == "true")
//                featureList.push("showStats");
//            if (localStorage.getItem("hideRules") == "true")
//                featureList.push("hideRules");
//            if (replaceIcons)
//                featureList.push("replaceIcons");
//            if (customBg.constructor === Array) {
//                if (customBg[0] != "" && customBg[1] != "")
//                    featureList.push("customBg");
//            }
//            var usrid = parseInt($(".toplogin .log_in2 > a").attr("href").substr(13)) || 0;
//            usrid += ' {' + $(".toplogin .log_in2 > a").text() + '}';

//            chrome.runtime.sendMessage({ features: featureList, user: usrid}, function (response) {
//                console.log(response.message);
//            });
//        })
//    });
//    setCookie("ftrck", "no", 1); 
//}





getStorage("local", "loadedbefore", function (data) { //first visit check
    var loaded = data.loadedbefore;
    console.log(loaded);
    if (!loaded) {
        $("body").append('<div id="firstVisit"> <div class="ribbon" style="display: none">ברוכים הבאים!<i></i> <i></i> <i></i> <i></i> </div> <img src="http://i.imgur.com/h9jTh1x.png" /><br /> <br /> תודה על שהורדת את <div class="ltrInline">FxPlus+</div>!<br /> <b>כדי לפתוח את הגדרות התוסף, לחץ על כפתור גלגל השיניים בבר העליון.</b><br /><br /> <img src="http://i.imgur.com/QweqQ1h.png" style="margin-bottom: 1px;" /><br/><br/> <div class="closeBtn" style="margin: 0 auto;" title="סגור"></div></div>'); //add first visit div
        $("#blackage").unbind().fadeIn(1000, function () { $("#firstVisit").fadeIn(300); $(".ribbon").show() }); //fade in
        saveToSyncStorage(); //make sure sync has something
        $("#firstVisit").find(".closeBtn").click(function () {
            $("#firstVisit").fadeOut(50, function () { $("#blackage").fadeOut(200); });
            var n = d.getTime();
            setStorage("local", { "loadedbefore": true, "previousVersion": version, "installTime": n, "suggestedToRate": false });
        });
    } else {
        //var aprlfls = d.getMonth() == 3 && d.getDate() == 1 && getCookie("disableDavid") != "true";
        //if (aprlfls) {
        //    $("head").append("<style>@font-face { font-family: 'Ben Gurion';src: url(" + chrome.runtime.getURL("BENGURION.woff") + ") format('woff');}</style>");
        //    $("*:not(.aprlsafe)").css("font-family", "'Ben Gurion', cursive, Arial");
        //    $("body").append('<a href="https://www.youtube.com/watch?v=yhJJws3kgzY" target="_blank"><img src="http://i.imgur.com/yhQCIOE.png" id="davidBenGurionImg" /></a>');
        //    $("#davidBenGurionImg").css("left", "-200px").delay(3000).animate({ left: 0 }, 1000);
        //}
        getStorage("local", "previousVersion", function (data) { //show update notification on version change
            var prev = data.previousVersion;
            if (prev != version && !(chrome.runtime.lastError)) {
                if (prev == "0.0.11") { //remove cookie explosion from this version
                    removeCookiePrefix("readTime");
                    removeCookiePrefix("comments");
                }
                $("#blackage").unbind().fadeIn(1000, function () {
                    $("#SpecialInfo").append('<div class="ribbon" style="display: none">' + versionTitle + '<i></i> <i></i> <i></i> <i></i> </div>')
                        .append(versionDescription + '<br/><div class="specialClose"></div>')
                        .append('<audio autoplay> <source src="' + chrome.runtime.getURL("sound/success.mp3") + '" type="audio/mpeg"> </audio>')
                        .show().find(".ribbon").show();

                    $(".specialClose").click(function () {
                        $("#SpecialInfo").fadeOut(200, function () { $("#blackage").fadeOut(100); });
                        notify.push("<b>עצה:</b> בדוק מה השתנה בהגדרות!");
                        setStorage("local", { "previousVersion": version });
                    });
                });
            } else if (chrome.runtime.lastError) setStorage("local", { "previousVersion": version }); //fallback if no version
        });
    }
});

var daysSinceInstall = -1;
getStorage("local", "installTime", function (data) { //first visit check
    if (chrome.runtime.lastError || data.installTime == undefined) {
        var n = d.getTime();
        setStorage("local", { "installTime": n, "suggestedToRate": false });
    } else {
        var insTime = data.installTime;
        var n = d.getTime();
        daysSinceInstall = Math.round((n - insTime) / 86400000);
        console.log("daysSinceInstall : " + daysSinceInstall);
        console.log("n : " + n);
        console.log("insTime : " + insTime);
        getStorage("local", "suggestedToRate", function (data2) {
            var sugToRate = data2.suggestedToRate;
            if (daysSinceInstall >= 3 && !sugToRate) {
                $("#blackage").unbind().fadeIn(1000, function () {
                    $("body").append('<div class="bigMessage" id="experiencedUserScreen"> <div class="ribbon" style="display: none">אז.. מה דעתך?<i></i> <i></i> <i></i> <i></i> </div><span style="font-size: 14px; font-weight: bold;">כבר עברו ' + daysSinceInstall + ' ימים מאז שהורדת את התוסף <div class="ltrInline">FxPlus+</div>. אני מקווה שאתה מרוצה ממנו ושהוא עמד בציפיות שלך.</span><br/>אשמח אם תדרג את התוסף בחנות. הדירוג שלך יעזור למשתמשים אחרים לגלות ולהוריד את התוסף, וגם זה אומר לי שמה שאני עושה שווה את זה.<br/><a href="https://chrome.google.com/webstore/detail/fxplus%2B-beta/gpfgllaokimfkkbnhiimahpbemmdmobg/reviews" target="_blank"><img src="http://i.imgur.com/EYs93sf.png" title="לחץ כדי להיכנס לדף הביקורות של התוסף" alt="לינק לדף של התוסף"/></a><br/><br/><b>תודה!</b><br/><br/> <div class="closeBtn" style="margin: 0 auto;" title="סגור"></div></div>'); //add first visit div
                    $("#experiencedUserScreen").fadeIn(250, function () {
                        $(this).find(".ribbon").show();
                    });


                    $(".closeBtn").click(function () {
                        $("#experiencedUserScreen").fadeOut(200, function () { $("#blackage").fadeOut(100); });
                        setStorage("local", { "suggestedToRate": true });
                    });
                });
            }
        });
    }
});

var fxpLogo = $('.divhed div[style="position:absolute; z-index: 99;left: 870px;"], .divhed div[style="position: absolute; z-index: 0; left: 870px;"]');
if (fxpLogo.css("z-index")) { //itay's design makes FXP's logo too high - fix
    fxpLogo.css("z-index", "10001");
}

getStorage("sync", "BackgroundNotifications", function (data) {
    var bgn = data.BackgroundNotifications;
    if (bgn) {
        console.log(bgn)
        var totalNotifications = 0;
        $(".noticount").each(function () {
            totalNotifications += parseInt($(this).text());
        });
        chrome.runtime.sendMessage({ checkNotiCount: totalNotifications });
    }
});


console.info('%cFxPlus+ load successful.', 'color: #0000ff; font-weight: bold; font-size: 30px');
//notify.push('<span style="color:blue;">FxPlus+ נטען בהצלחה!</span>');
$("body").append('<div class="devWater">FxPlus+ Beta</div>');
d1 = new Date();
var timeTook = d1.getTime() - startExecution;
$("#footer_copyright").after('<div style="font-family: monospace; font-size:10px; margin: 0 auto; text-align: center; color: #aaa">FxPlus+ @ ' + version + '<br/>+FxPlus שיפר את דף זה בתוך ' + timeTook + 'ms.</div>'); //add version number at bottom of page