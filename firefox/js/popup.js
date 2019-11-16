/*
    Copyright 2015-2019 SilverTuxedo

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

"use strict";

//if sync storage not supported, fallback to local.
chrome.storage.sync = (function ()
{
    return chrome.storage.sync ||
        chrome.storage.local;
})();

chrome.browserAction.setBadgeBackgroundColor({ color: "#007cff" });

var fxpDomain = "https://www.fxp.co.il/";

var domParser = new DOMParser();

$(".switch").click(function () { $(this).removeClass("noAnimation"); });
$(".counter").hide();
$("#settingsLink").attr("href", chrome.extension.getURL("html/settings.html")).click(function ()
{
    chrome.runtime.sendMessage({ event: { cat: "Click", type: "Settings popup" } });
});

var newNotificationSelector = 'a[style*="background-color:"]';

var updateBadge = true;

var settings;
chrome.storage.sync.get("settings", function (data)
{
    if (data)
        settings = data.settings || {};
    else
        settings = {};

    if (settings.backgroundNotifications)
    {
        $("#backgroundNotifications").prop("checked", true);
    }
    else
    {
        updateBadge = false;
    }

    $("#backgroundNotifications").change(function ()
    {
        var enabled = $(this).prop("checked");
        chrome.storage.sync.get("settings", function (data)
        {
            settings = data.settings || {};
            settings.backgroundNotifications = enabled;
            chrome.storage.sync.set({ "settings": settings }, function ()
            {
                console.info("settings saved");
            });
        });
    });
});

utils.getDomainCookies(fxpDomain, "bb_livefxpext", function (id) //get user ID (safe id)
{
    console.log(id);
    if (id === null) //the user is not logged in
    {
        $("#countersContainer").empty().append(
            $("<div>", { class: "counter fullWidth" }).append(
                $("<div>", { class: "counterNum" }).text("אופס!")
            ).append(
                $("<div>", { class: "counterName" }).text("אתה לא מחובר ל-FxP.")
            )
        );
        $("#notifications").append($("<div>", { class: "del_noti" }).append(
            $("<a>", {
                href: "https://www.fxp.co.il/",
                target: "_blank",
                style: "text-align: center"
            }).text("אם אתה מחובר ובעיה זו עדיין נשארת, נסה להתנתק ולהתחבר מחדש, או לאפס cookies.")));
    }
    else
    {
        utils.getNotificationsNormal(function (normal)
        {
            utils.getNotificationsTrackedThreads(function (tracked)
            {
                $("#likeCount").text(normal.likes);
                $("#notificationCount").text(normal.notifications + tracked.length);
                $("#pmCount").text(normal.pms);

                $(".counter").show();

                if (updateBadge)
                {
                    var notificationSum = normal.total() + tracked.length;
                    if (notificationSum > 0)
                        changeBadge(notificationSum);
                    else
                        changeBadge("");
                }
                else
                {
                    changeBadge("");
                }

                utils.getDomainCookies(fxpDomain, "bb_userid", function (idNum)
                {
                    var requestsComplete = 0;
                    var requestsSent = 0;
                    if (normal.likes > 0)
                    {
                        //show like messages
                        requestsSent++;
                        utils.httpGetAsync(fxpDomain + "likesno.php?userid=" + idNum, function (response)
                        {
                            requestsComplete++;

                            var doc = $(domParser.parseFromString(response, "text/html"));
                            appendToNotifications(doc);

                            addExtraNotifications(requestsSent, requestsComplete, normal.pms, tracked);
                        });
                    }
                    if (normal.notifications > 0)
                    {
                        requestsSent++;
                        //show like messages
                        utils.httpGetAsync(fxpDomain + "notifc.php?userid=" + idNum, function (response)
                        {
                            requestsComplete++;

                            var doc = $(domParser.parseFromString(response, "text/html"));
                            appendToNotifications(doc);

                            addExtraNotifications(requestsSent, requestsComplete, normal.pms, tracked);
                        });
                    }
                    addExtraNotifications(requestsSent, requestsComplete, normal.pms, tracked);
                });

            });
        });
    }
});

//receives a jQuery doc, formats the notifications in it and pushes them to the view
function appendToNotifications(doc)
{
    doc.find(newNotificationSelector).parent().each(function ()
    {
        formatNoti($(this));
        $(this).click(function () { chrome.runtime.sendMessage({ event: { cat: "Click", type: "Notification" } }); });
        $("#notifications").append($(this))
            .append($("<div>", { class: "seperator" }));
    });
}

//adds the https: prefix to images
function addHttpsToImage(img)
{
    var src = img.attr("src");
    if (src.indexOf("//") === 0)
    {
        src = "https:" + src;
    }
    img.attr("src", src);
}

//formats the notification element returned by FXP to fit the popup
function formatNoti(element)
{
    element.find("img").each(function ()
    {
        addHttpsToImage($(this)); //add https to the images so they're visible outside of the fxp domain
        $(this).parents("span").css("top", "8px"); //fix alignment of image
    });
    var href;
    element.find("a").css("background-color", "").each(function ()
    {
        href = $(this).attr("href");
        $(this).attr("href", fxpDomain + href);
        $(this).attr("target", "_blank");
    });
}

//adds the new pm notification and tracked threads notification if all requests have been completed
function addExtraNotifications(sent, complete, pmCount, tracked)
{
    console.log(sent + " " + complete + " " + pmCount);
    if (complete >= sent)
    {
        if (pmCount > 0)
        {
            var pmNotification = $("<div>", { class: "del_noti" }).append(
                $("<a>", {
                    href: "https://www.fxp.co.il/chat.php",
                    target: "_blank",
                    style: "text-align: center"
                }).click(function () { chrome.runtime.sendMessage({ event: { cat: "Click", type: "Notification" } }); })
                    .text(pmCount + " הודעות פרטיות שלא נקראו"));
            setTimeout(function ()
            {
                $("#notifications").append(pmNotification)
                    .append($("<div>", { class: "seperator" }));
            }, 500);
        }

        if (tracked.length > 0)
        {

            setTimeout(function ()
            {
                var notification, additional;
                for (var i = 0; i < tracked.length; i++)
                {
                    console.log(tracked[i]);

                    if (tracked[i].newComments < 2)
                    {
                        additional = " הגיב באשכול במעקב ";
                    }
                    else if (tracked[i].newComments === 2)
                    {
                        additional = " ומשתמש נוסף הגיבו באשכול במעקב ";
                    }
                    else
                    {
                        additional = " ו-" + (tracked[i].newComments - 1) + " משתמשים נוספים הגיבו באשכול במעקב ";
                    }

                    notification =
                        $("<div>", { class: "del_noti" }).append(
                            $("<span>", { style: "position: relative;float: right;clear: left;top: 8px;padding-right: 3px;" }).append(
                                $("<img>", { src: chrome.extension.getURL("images/comments.svg") })
                            )
                        ).append($("<a>", {
                            href: tracked[i].url,
                            target: "_blank",
                            style: "font-size:11px; padding-right: 25px;"
                        }).click(function () { chrome.runtime.sendMessage({ event: { cat: "Click", type: "Notification" } }); })
                            .append($("<span>").text("המשתמש "))
                            .append($("<span>", { style: "font-weight: bold" }).text(tracked[i].lastCommentor))
                            .append($("<span>").text(additional))
                            .append($("<span>", { style: "font-weight: bold" }).text(tracked[i].threadTitle))
                        );

                    $("#notifications").append(notification)
                        .append($("<div>", { class: "seperator" }));
                }
            }, 700);
        }
    }
}

//changes the badge in the browser navbar
function changeBadge(str)
{
    str = "" + str; //make sure it's a string
    chrome.browserAction.setBadgeText({ text: str });
}

