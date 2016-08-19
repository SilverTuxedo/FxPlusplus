/*
    Copyright 2016 SilverTuxedo

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 */

chrome.storage.sync = (function () {
    return chrome.storage.sync ||
           chrome.storage.local;
})();


function getDomainCookies(domain, name, callback) { //gets a cookie that is on an online site
    chrome.cookies.get({ "url": domain, "name": name }, function (cookie) {
        if (callback) {
            if (cookie == null) {
                $("#allList").html("אופס! נראה שאתה לא מחובר לאתר.")
            } else {
                callback(cookie.value);
            }
        }
    });
}

chrome.browserAction.setBadgeBackgroundColor({ color: "#3491ef" });

var shouldUpdateBadge = false;

function updateBadge(number) {
    if (number > 0 && shouldUpdateBadge)
        chrome.browserAction.setBadgeText({ text: number + "" });
    else
        chrome.browserAction.setBadgeText({ text: "" });
}

chrome.storage.sync.get("BackgroundNotifications", function (data) {
    var bgn = data.BackgroundNotifications;
    if (bgn) {
        $("#sendBackground").prop("checked", true);
        shouldUpdateBadge = true;
        console.log(shouldUpdateBadge);
    }
});

$("#sendBackground").change(function () { //changed the state in the background notification checkbox
    chrome.storage.sync.set({ "BackgroundNotifications": $("#sendBackground").prop("checked") }, function () {
        $("#sendBackground").fadeOut(250, function () {
            $(this).fadeIn(250);
        });
    });
});

$("#flexList").hide();
getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id) { //get user ID (safe id)
    $.get("https://www.fxp.co.il/feed_live.php?userid=" + id + "&format=json", function (data) {
        var notificationCount = JSON.parse(data);

        //update the counts
        $("#likeCount").text(notificationCount.like);
        $("#notificationCount").text(notificationCount.noti);
        $("#pmCount").text(notificationCount.pm);

        $("#flexList").slideDown(150);
        $("#allList").html('<div style="width: 100%; border-bottom: 1px solid #e1e1e1;"></div>');

        //show the counter
        //$("#flexList").slideDown(500);

        var list = "";

        var popAnimationName = "pop 0.5s linear 0.2s 1 normal none running";

        getDomainCookies("https://www.fxp.co.il", "bb_userid", function (numId) { //get user ID (number id)
            if (parseInt(notificationCount.noti) > 0) { //user has notifications
                $("#notificationCount").css("animation", popAnimationName);
                $("#notificationList").load("https://www.fxp.co.il/notifc.php?userid=" + numId, function () {
                    for (var i = 0; i < $('#notificationList span > img').length ; i++) {
                        var img = $('#notificationList span > img:eq(' + i + ')');
                        if (img.attr("src").indexOf("//") == 0) {
                            img.attr("src", "https:" + img.attr("src")); //add https before address
                        }
                    }
                    for (var i = 0; i < $('#notificationList a').length ; i++) {
                        var url = $('#notificationList a:eq(' + i + ')');
                        if (url.attr("href").indexOf("https://") == -1) {
                            url.attr("href", "https://www.fxp.co.il/" + url.attr("href")).attr("target", "_blank"); //add address before reference
                        }
                    }
                    for (var i = 0; i < $('#notificationList a[style*="background-color: #fafe8a"]').length; i++) {
                        $("#allList").append($('#notificationList a[style*="background-color: #fafe8a"]:eq(' + i + ')').parent("#del_noti")[0].outerHTML);
                    }
                });
            }
            if (parseInt(notificationCount.like) > 0) { //user has likes
                $("#likeCount").css("animation", popAnimationName);
                $("#likeList").load("https://www.fxp.co.il/likesno.php?userid=" + numId, function () {
                    for (var i = 0; i < $('#likeList span > img').length ; i++) {
                        var img = $('#likeList span > img:eq(' + i + ')');
                        if (img.attr("src").indexOf("//") == 0) {
                            img.attr("src", "https:" + img.attr("src")); //add https before address
                        }
                    }
                    for (var i = 0; i < $('#likeList a').length ; i++) {
                        var url = $('#likeList a:eq(' + i + ')');
                        if (url.attr("href").indexOf("https://") == -1) {
                            url.attr("href", "https://www.fxp.co.il/" + url.attr("href")).attr("target", "_blank"); //add address before reference
                        }
                    }
                    for (var i = 0; i < $('#likeList a[style*="background-color: #fafe8a"]').length; i++) {
                        $("#allList").append($('#likeList a[style*="background-color: #fafe8a"]:eq(' + i + ')').parent("#del_noti")[0].outerHTML);
                    }

                });
            }
            if (parseInt(notificationCount.pm) > 0) { //user has pms
                $("#pmCount").css("animation", popAnimationName);
                setTimeout(function () { $("#allList").append('<li id="del_noti"><a href="https://www.fxp.co.il/private.php" target="_blank" style="text-align: center;">בדוק את תיבת הדואר הנכנס</a></li>'); }, 160); //a little bit of delay so it doesn't look synthetic
            }

            var totalNotifications = parseInt(notificationCount.pm) + parseInt(notificationCount.like) + parseInt(notificationCount.noti);
            updateBadge(totalNotifications);
        });
    });
});
