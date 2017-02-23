/*
    Copyright 2017 SilverTuxedo

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

var factorySettings =
    {
        backgroundNotifications: true,
        resizeSignatures: false,
        trackUnreadComments: true,
        peekCloseMethod: "double",
        showSpoilers: true,
        hideSuggested: false,
        classicIcons: false,
        nightmodeShortcut: true,
        showForumStats: true,
        hideSticky: {
            active: false,
            includingRules: false,
            days: 14
        },
        showAutoPinned: false,
        autoNightmode: {
            active: false,
            start: "17:05",
            end: "23:30"
        },
        readtime: {
            speed: 220,
            activePrefixes: ["מדריך"],
            newsForums: true
        },
        threadFilters: {
            users: [
            ],
            keywords: [
            ],
            filterSticky: false
        },
        commentFilters: [
            {
                id: 967488,
                subnick: {
                    value: "היוצר של +FxPlus",
                    color: "#00afff",
                    size: 11
                },
                hideSignature: false,
                disableStyle: false,
                hideComments: false
            }
        ],
        customDefaultStyle: {
            active: false,
            bold: false,
            italic: false,
            underline: false,
            font: "Arial",
            color: "#333333"
        },
        customBg: {
            day: "",
            night: ""
        }
    };

chrome.storage.sync = (function ()
{
    return chrome.storage.sync ||
           chrome.storage.local;
})();
chrome.browserAction.setBadgeBackgroundColor({ color: "#007cff" });

var fxpDomain = "https://www.fxp.co.il/";

var domParser = new DOMParser();

$(".switch").click(function () { $(this).removeClass("noAnimation") })
$(".counter").hide();
$("#settingsLink").attr("href", chrome.extension.getURL("html/settings.html")).click(function ()
{
    chrome.runtime.sendMessage({ event: { cat: "Click", type: "Settings popup" } });
});

var updateBadge = true;

var settings;
chrome.storage.sync.get("settings", function (data)
{
    settings = data.settings || {};
    //make sure settings has values
    var settingsReset = false;
    for (var prop in factorySettings)
    {
        if (settings.hasOwnProperty(prop))
        {
            if (settings[prop] === null)
            { //no value for the settings key
                settings[prop] = factorySettings[prop];
                settingsReset = true;
                console.warn(prop + ": value has been reset");
            }
        }
        else
        { //no settings key
            settings[prop] = factorySettings[prop];
            settingsReset = true;
            console.warn(prop + ": value has been reset");
        }
    }
    if (settingsReset) //save changes (if any)
        chrome.storage.sync.set({ "settings": settings });


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
        })
    })
})

getDomainCookies(fxpDomain, "bb_livefxpext", function (id) //get user ID (safe id)
{
    console.log(id);
    if (id == null) //the user is not logged in
    {
        $("#countersContainer").empty().append(
            $("<div>", { class: "counter fullWidth" }).append(
                $("<div>", { class: "counterNum" }).text("אופס!")
            ).append(
                $("<div>", { class: "counterName" }).text("אתה לא מחובר ל-FxP.")
            )
        );
        $("#notifications").append($("<div>", { id: "del_noti" }).append(
                        $("<a>", {
                            href: "https://www.fxp.co.il/",
                            target: "_blank",
                            style: "text-align: center"
                        }).text("אם אתה מחובר ובעיה זו עדיין נשארת, נסה להתנתק ולהתחבר מחדש, או לאפס cookies.")));
    }
    else
    {
        $.get(fxpDomain + "feed_live.php?userid=" + id + "&format=json", function (data) //get the like, notification, and pm count
        {
            var notificationCount = JSON.parse(data);

            //update counters
            $("#likeCount").text(notificationCount.like);
            $("#notificationCount").text(notificationCount.noti);
            $("#pmCount").text(notificationCount.pm);

            $(".counter").show();

            if (updateBadge)
            {
                var notificationSum = parseInt(notificationCount.like) +
                                      parseInt(notificationCount.noti) +
                                      parseInt(notificationCount.pm);
                if (notificationSum > 0)
                    changeBadge(notificationSum);
                else
                    changeBadge("");
            }
            else
            {
                changeBadge("");
            }


            getDomainCookies(fxpDomain, "bb_userid", function (idNum)
            {
                var requestsComplete = 0;
                var requestsSent = 0;
                if (parseInt(notificationCount.like) > 0)
                {
                    //show like messages
                    requestsSent++;
                    httpGetAsync(fxpDomain + "likesno.php?userid=" + idNum, function (response)
                    {
                        requestsComplete++;

                        var doc = $(domParser.parseFromString(response, "text/html"));

                        doc.find('a[style*="background-color: #fafe8a"]').parent().each(function ()
                        {
                            formatNoti($(this));
                            $(this).click(function () { chrome.runtime.sendMessage({ event: { cat: "Click", type: "Notification" } }) });
                            $("#notifications").append($(this))
                            .append($("<div>", { class: "seperator" }));
                        })

                        addUnreadPm(requestsSent, requestsComplete, notificationCount.pm);
                    })
                }
                if (parseInt(notificationCount.noti) > 0)
                {
                    requestsSent++;
                    //show like messages
                    httpGetAsync(fxpDomain + "notifc.php?userid=" + idNum, function (response)
                    {
                        requestsComplete++;

                        var doc = $(domParser.parseFromString(response, "text/html"));

                        doc.find('a[style*="background-color: #fafe8a"]').parent().each(function ()
                        {
                            formatNoti($(this));
                            $(this).click(function () { chrome.runtime.sendMessage({ event: { cat: "Click", type: "Notification" } }) });
                            $("#notifications").append($(this))
                            .append($("<div>", { class: "seperator" }));
                        })

                        addUnreadPm(requestsSent, requestsComplete, notificationCount.pm);
                    })
                }
                if (parseInt(notificationCount.pm) > 0)
                {
                    addUnreadPm(requestsSent, requestsComplete, notificationCount.pm);
                }
            });
        });
    }
});

//gets a cookie from a domain
function getDomainCookies(domain, name, callback)
{
    chrome.cookies.get({ "url": domain, "name": name }, function (cookie)
    {
        if (callback)
        {
            if (cookie == null)
                callback(null);
            else
                callback(cookie.value);
        }
    });
}

//GET http function
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function ()
    {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

//adds the https: prefix to images
function addHttpsToImage(img)
{
    var src = img.attr("src");
    if (src.indexOf("//") == 0)
    {
        src = "https:" + src;
    }
    img.attr("src", src);
}

//formats the notification element returned by FXP to fit the popup
function formatNoti(element)
{
    element.find("img").each(function () { addHttpsToImage($(this)); });
    var href;
    element.find("a").each(function ()
    {
        href = $(this).attr("href");
        $(this).attr("href", fxpDomain + href);
        $(this).attr("target", "_blank");
    })
}

//adds the new pm notification if all requests have been completed
function addUnreadPm(sent, complete, pmCount)
{
    console.log(sent + " " + complete + " " + pmCount);
    if (parseInt(pmCount) > 0)
    {
        if (complete >= sent)
        {
            var pmNotification = $("<div>", { id: "del_noti" }).append(
                        $("<a>", {
                            href: "https://www.fxp.co.il/private.php",
                            target: "_blank",
                            style: "text-align: center"
                        }).click(function () { chrome.runtime.sendMessage({ event: { cat: "Click", type: "Notification" } }) })
                            .text(pmCount + " הודעות פרטיות שלא נקראו"));
            setTimeout(function ()
            {
                $("#notifications").append(pmNotification)
                    .append($("<div>", { class: "seperator" }));
            }, 500);
        }
    }
}

//changes the badge in the browser navbar
function changeBadge(str)
{
    str = "" + str; //make sure it's a string
    chrome.browserAction.setBadgeText({ text: str });
}