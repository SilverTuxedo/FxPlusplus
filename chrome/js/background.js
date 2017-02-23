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

chrome.browserAction.setBadgeBackgroundColor({ color: "#007cff" });

chrome.storage.sync = (function ()
{
    return chrome.storage.sync ||
           chrome.storage.local;
})();

var socket;

chrome.storage.sync.get("settings", function (data)
{
    var settings = data.settings || {};
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


    if (settings.backgroundNotifications) //background notifications are enabled
    {
        console.info("background notifications enabled");
        initSocket(true);
    }
});


chrome.storage.onChanged.addListener(function (changes, areaName)
{
    if (changes.hasOwnProperty("settings")) //settings changed
    {
        if (changes.settings.newValue.backgroundNotifications) //background notificatios turned on
        {
            if (!socket.connected)
            {
                console.log("connecting socket");
                initSocket(true);
            }
        }
        else //background notificatios turned off
        {
            if (socket.connected)
            {
                console.log("disconnecting socket");
                socket.disconnect();
            }
        }
    }
})

//listener to cross-page messaging
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse)
  {
      if (request.hasOwnProperty("notification"))
      {
          sendNotification(request.notification.title, request.notification.message, request.notification.url);
      }
      if (request.hasOwnProperty("updateBadge"))
      {
          chrome.browserAction.getBadgeText({}, function (number)
          {
              var badgeCount = parseInt(number);
              if (isNaN(badgeCount))
                  badgeCount = 0;

              if (badgeCount > request.updateBadge) //badge shows more notifications than are actually present, user probably read a notification
                  checkNotificationCount(); //update the badge
          });
      }
      if (request.hasOwnProperty("event"))
      {
          sendEvent(request.event.cat, request.event.type);
      }
  });

//sends a (simple) notification
function sendNotification(title, message, url)
{
    var randomId = Math.random().toString(36).substr(2, 10); //generates a random 10 character id
    chrome.notifications.create(randomId, {
        type: 'basic',
        iconUrl: '../images/notificationImg.png',
        title: title,
        message: message,
        isClickable: true
    });

    //play notification sound
    var audio = new Audio('../sound/notice.mp3');
    audio.play();

    chrome.notifications.onClicked.addListener(function (notificationId)
    {
        if (notificationId == randomId && url.length > 0)
        {
            window.open(url); //open the url
            setTimeout(function () { chrome.notifications.clear(randomId); }, 200); //close notification
        }
    })
}

//sends a list notification
function sendListNotification(title, list, url, listStr)
{
    var randomId = Math.random().toString(36).substr(2, 10); //generates a random 10 character id
    var listInText = "";
    chrome.notifications.create(randomId, {
        type: 'list',
        iconUrl: '../images/notificationImg.png',
        title: title,
        message: listStr,
        items: list,
        isClickable: true
    });

    //play notification sound
    var audio = new Audio('../sound/notice.mp3');
    audio.play();

    chrome.notifications.onClicked.addListener(function (notificationId)
    {
        if (notificationId == randomId && url.length > 0)
        {
            window.open(url); //open the url
            setTimeout(function () { chrome.notifications.clear(randomId); }, 200); //close notification
        }
    })
}

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

//updates the number that appears in the badge
function updateNotificationCounter()
{
    getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id)
    {
        if (id != null)
            httpGetAsync("https://www.fxp.co.il/feed_live.php?userid=" + id + "&format=json", function (data)
            {
                var notificationCount = JSON.parse(data);
                var totalNotifications = parseInt(notificationCount.pm) + parseInt(notificationCount.like) + parseInt(notificationCount.noti);
                if (totalNotifications > 0)
                    changeBadge(totalNotifications);
                else
                    changeBadge("");
            })
        else
            changeBadge("");
    });
}

//send GA event
function sendEvent(cat, type)
{
    chrome.storage.local.get("uuid4", function (data)
    {
        var uuid4 = data.uuid4;
        if (uuid4 == undefined || uuid4 == null)
        {
            uuid4 = generate_uuid4();
            chrome.storage.local.set({ "uuid4": uuid4 });
        }

        try
        {
            var request = new XMLHttpRequest();
            request.open("POST", "https://www.google-analytics.com/collect", true);
            request.send("v=1&tid=UA-91940263-1&cid=" + uuid4 + "&aip=1&ds=add-on&t=event&ec=" + cat + "&ea=" + type);
        }
        catch (e)
        {
            console.log("error sending report: " + e);
        }
    });
}

//returns uuid of form xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx
function generate_uuid4()
{
    var uuid = '', ii;
    for (ii = 0; ii < 32; ii += 1)
    {
        switch (ii)
        {
            case 8:
            case 20:
                uuid += '-';
                uuid += (Math.random() * 16 | 0).toString(16);
                break;
            case 12:
                uuid += '-';
                uuid += '4';
                break;
            case 16:
                uuid += '-';
                uuid += (Math.random() * 4 | 8).toString(16);
                break;
            default:
                uuid += (Math.random() * 16 | 0).toString(16);
        }
    }
    return uuid;
};

//changes the badge in the browser navbar
function changeBadge(str)
{
    str = "" + str; //make sure it's a string
    chrome.browserAction.setBadgeText({ text: str });
}

//callback function runs only if there are no FXP tabs open
function noTabsOpen(callback)
{
    chrome.tabs.query({ url: "https://www.fxp.co.il/*" }, function (query)
    {
        var openFxpTabs = query.length; //number of open fxp tabs
        if (openFxpTabs < 1) //only run callback if there are no tabs
        {
            callback();
        }
    });
}

//initiate socket listeners if cookies are accessible
function initSocket(alertUnreadList)
{
    socket = undefined;
    console.log("Attempting to get cookies");
    //attempt to get cookies (sometimes chrome can't do that)
    chrome.cookies.get({ "url": "https://www.fxp.co.il", "name": "bb_livefxpext" }, function (cookie)
    {
        if (chrome.runtime.lastError)
        {
            console.log("Failed to get cookies: " + chrome.runtime.lastError.message);
            setTimeout(
                function () { initSocket(alertUnreadList) }, 5000);
        } else
        {
            connectSocket();
            alertUnreadNotifications();
            console.log("Successfully got cookies");
        }
    });
}

//sets the socket to listen to new notifications
function connectSocket()
{
    socket = io.connect('https://socket.fxp.co.il/', { reconnection: true });

    //general listeners
    socket.on('connect', function ()
    {
        getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id)
        {
            var send = '{"userid":"' + id + '","froum":"f-fe7fdfa8be5eb96fc56f318738a6410e"}';
            socket.send(send);
            console.log('user connect');
        });
    });
    socket.on('reconnecting', function ()
    {
        getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id)
        {
            var send = '{"userid":"' + id + '","froum":"f-fe7fdfa8be5eb96fc56f318738a6410e"}';
            socket.send(send);
            console.log('user reconnect');
        });
    });

    //reply to a thread
    socket.on('newreply', function (data)
    {
        checkNotificationCount();
        console.log("new reply from " + data.username);
        noTabsOpen(function ()
        {
            if (data.quoted)
                sendNotification(
                    "התראה חדשה!",
                    'המשתמש ' + data.username + ' ציטט את הודעתך באשכול ' + data.title,
                    'https://www.fxp.co.il/showthread.php?t=' + data.thread_id + '&goto=newpost'
                );
            else
                sendNotification(
                    "התראה חדשה!",
                    'המשתמש ' + data.username + ' הגיב באשכול ' + data.title,
                    'https://www.fxp.co.il/showthread.php?t=' + data.thread_id + '&goto=newpost'
                );

        });
    });

    //new private message
    socket.on('newpm', function (data)
    {
        checkNotificationCount();
        console.log("new pm from " + data.username);
        noTabsOpen(function ()
        {
            sendNotification(
                "דואר נכנס!",
                'קיבלת הודעה פרטית חדשה מהמשתמש ' + data.username,
                'https://www.fxp.co.il/private.php?do=showpm&pmid=' + data.pmid
            );
        });
    });

    //new like
    socket.on('new_like', function (data)
    {
        checkNotificationCount();
        console.log("new like from " + data.username);
        noTabsOpen(function ()
        {
            sendNotification(
                "לייק חדש!",
                'המשתמש ' + data.username + ' אהב את ההודעה שלך!',
                'https://www.fxp.co.il/showthread.php?p=' + data.postid + '#post' + data.postid
            );
        });
    });

    //debugging for socket
    var onevent = socket.onevent;
    socket.onevent = function (packet)
    {
        var args = packet.data || [];
        onevent.call(this, packet);    // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet);      // additional call to catch-all
    };
    socket.on("*", function (event, data)
    {
        if (event != "online_update" && event != "posts_update")
        {
            console.log("");
            console.log("EVENT:");
            console.log(event);
            console.log(data);
        }

    });
}

//updates the counter at the navbar
function checkNotificationCount()
{
    getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id)
    {
        httpGetAsync("https://www.fxp.co.il/feed_live.php?userid=" + id + "&format=json", function (data)
        {
            var notificationCount = JSON.parse(data);
            var totalNotifications = parseInt(notificationCount.pm) + parseInt(notificationCount.like) + parseInt(notificationCount.noti);
            if (totalNotifications > 0)
                changeBadge(totalNotifications);
            else
                changeBadge("");
        })
    });
}

//sends a notification with the number of notifications of each type
function alertUnreadNotifications()
{
    getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id)
    { //get user ID
        console.log(id);
        httpGetAsync("https://www.fxp.co.il/feed_live.php?userid=" + id + "&format=json", function (data)
        {
            var notificationCount = JSON.parse(data);
            var notificationList = [];

            //add notification lists
            if (parseInt(notificationCount.noti) > 0)
            { //user has notifications
                console.log("has noti");
                if (parseInt(notificationCount.noti) == 1)
                    notificationList.push({
                        title: notificationCount.noti + "",
                        message: 'התראה חדשה'
                    });
                else
                    notificationList.push({
                        title: notificationCount.noti + "",
                        message: 'התראות חדשות'
                    });
            }

            if (parseInt(notificationCount.like) > 0)
            { //user has likes
                if (parseInt(notificationCount.like) == 1)
                    notificationList.push({
                        title: notificationCount.like + "",
                        message: 'לייק חדש'
                    });
                else
                    notificationList.push({
                        title: notificationCount.like + "",
                        message: 'לייקים חדשים'
                    });
            }

            if (parseInt(notificationCount.pm) > 0)
            { //user has pms
                if (parseInt(notificationCount.pm) == 1)
                    notificationList.push({
                        title: notificationCount.pm + "",
                        message: 'הודעה פרטית חדשה'
                    });
                else
                    notificationList.push({
                        title: notificationCount.pm + "",
                        message: 'הודעות פרטיות חדשות'
                    });
            }

            //update the badge
            var totalNotifications = parseInt(notificationCount.pm) + parseInt(notificationCount.like) + parseInt(notificationCount.noti);
            if (totalNotifications > 0)
                changeBadge(totalNotifications);
            else
                changeBadge("");

            if (notificationList.length > 0) //notifications exist
            {
                var listString = ""; //backup string in case the browser does not support list
                for (var i = 0; i < notificationList.length; i++)
                {
                    if (i > 0) listString += "\n";
                    listString += notificationList[i].title + " " + notificationList[i].message;
                }

                sendListNotification("בזמן שלא היית מחובר...", notificationList, "https://www.fxp.co.il", listString);
            }
        });
    });
}

sendEvent("Passive", "Load");