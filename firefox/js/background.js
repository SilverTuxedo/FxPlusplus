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
        },
        quickAccessThreads: [
            {
                prefix: "פרסום|",
                title: "+FxPlus - תוסף לכרום",
                authorId: 967488,
                threadId: 16859147
            }
        ],
        trackedThreads: {
            list: [
            ],
            refreshRate: 15,
            lastRefreshTime: 0
        }
    };

var fxpDomain = "https://www.fxp.co.il/";

chrome.browserAction.setBadgeBackgroundColor({ color: "#007cff" });

chrome.storage.sync = (function ()
{
    return chrome.storage.sync ||
           chrome.storage.local;
})();

var socket;

var alreadyNotifiedTrackedThreads = {}; //tracked threads id-comment pairs that were already notified to the user

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

    //update number of comments on tracked threads
    scheduleTrackedThreadsUpdate(settings.trackedThreads.lastRefreshTime, settings.trackedThreads.refreshRate);
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

        //refresh rate of tracked threads shortened
        if (changes.settings.oldValue.trackedThreads.refreshRate > changes.settings.newValue.trackedThreads.refreshRate)
        {
            scheduleTrackedThreadsUpdate(changes.settings.newValue.trackedThreads.lastRefreshTime, changes.settings.newValue.trackedThreads.refreshRate);
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

              getNotificationsTrackedThreads(function (tracked)
              {
                  if (badgeCount - tracked.length > request.updateBadge) //badge shows more notifications than are actually present, user probably read a notification
                      checkNotificationCount(); //update the badge
              });
          });
      }
      if (request.hasOwnProperty("event"))
      {
          sendEvent(request.event.cat, request.event.type);
      }
    });


//listeners for alarms (scheduled events)
chrome.alarms.onAlarm.addListener(function (alarm)
{
    //update comment conunts in tracked threads
    if (alarm.name == "updateTrackedThreads")
    {
        trackedThreadsAlarm();
    }
});

//the alarm that fires when the comments of tracked threads should be updated
function trackedThreadsAlarm()
{
    chrome.storage.sync.get("settings", function (data2)
    {
        var settings = data2.settings;
        updateTotalCommentsTrackedThreads(settings.trackedThreads.list, settings.trackedThreads.refreshRate);
    });
}

//an asynchronous loop. func runs every iteration and callback runs when the loop is over
function asyncLoop(iterations, func, callback)
{
    var index = 0;
    var done = false;
    var loop = {
        next: function () //next iteration
        {
            if (done)
            {
                return;
            }

            if (index < iterations)
            {
                index++;
                func(loop);

            } else
            {
                done = true;
                callback();
            }
        },

        getIteration: function () //return current iteration
        {
            return index - 1;
        },

        break: function () //stop the loop
        {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
}

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

var domParser = new DOMParser();

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
    chrome.tabs.query({ url: fxpDomain + "*" }, function (query)
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
    chrome.cookies.get({ "url": fxpDomain, "name": "bb_livefxpext" }, function (cookie)
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
        getDomainCookies(fxpDomain, "bb_livefxpext", function (id)
        {
            var send = '{"userid":"' + id + '","froum":"f-fe7fdfa8be5eb96fc56f318738a6410e"}';
            socket.send(send);
            console.log('user connect');
        });
    });
    socket.on('reconnecting', function ()
    {
        getDomainCookies(fxpDomain, "bb_livefxpext", function (id)
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
                    fxpDomain + 'showthread.php?t=' + data.thread_id + '&goto=newpost'
                );
            else
                sendNotification(
                    "התראה חדשה!",
                    'המשתמש ' + data.username + ' הגיב באשכול ' + data.title,
                    fxpDomain + 'showthread.php?t=' + data.thread_id + '&goto=newpost'
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
                fxpDomain + 'private.php?do=showpm&pmid=' + data.pmid
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
                fxpDomain + 'showthread.php?p=' + data.postid + '#post' + data.postid
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
    getNotificationsTotalNum(function (total)
    {
        if (total > 0)
            changeBadge(total);
        else
            changeBadge("");

    });
}

//sends a notification with the number of notifications of each type
function alertUnreadNotifications()
{
    var notificationList = [];
    getNotificationsNormal(function (normal)
    {
        //add notification lists
        if (normal.notifications > 0)
        { //user has notifications
            if (normal.notifications == 1)
                notificationList.push({
                    title: normal.notifications + "",
                    message: 'התראה חדשה'
                });
            else
                notificationList.push({
                    title: normal.notifications + "",
                    message: 'התראות חדשות'
                });
        }

        if (normal.likes > 0)
        { //user has likes
            if (normal.likes == 1)
                notificationList.push({
                    title: normal.likes + "",
                    message: 'לייק חדש'
                });
            else
                notificationList.push({
                    title: normal.likes + "",
                    message: 'לייקים חדשים'
                });
        }

        if (normal.pms > 0)
        { //user has pms
            if (normal.pms == 1)
                notificationList.push({
                    title: normal.pms + "",
                    message: 'הודעה פרטית חדשה'
                });
            else
                notificationList.push({
                    title: normal.pms + "",
                    message: 'הודעות פרטיות חדשות'
                });
        }

        getNotificationsTrackedThreads(function (tracked)
        {
            if (tracked.length > 0)
            { //user has new comments from tracked threads
                if (tracked.length == 1)
                    notificationList.push({
                        title: tracked.length + "",
                        message: 'התראה מאשכולות במעקב'
                    });
                else
                    notificationList.push({
                        title: tracked.length + "",
                        message: 'התראות מאשכולות במעקב'
                    });

                for (var i = 0; i < tracked.length; i++)
                {
                    //note that the user was notified about this thread
                    alreadyNotifiedTrackedThreads[tracked[i].threadId] = tracked[i].totalComments;
                }
            }


            //update the badge
            var totalNotifications = normal.total() + tracked.length;
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

                sendListNotification("בזמן שלא היית מחובר...", notificationList, fxpDomain, listString);
            }
        })
    })
}

//returns how many comments there are in a thread
function getLastCommentDataForThreadById(threadId, callback)
{
    //url of the last page (fxp automatically redirects, assuming there are no more than 999999 pages)
    var fullUrl = fxpDomain + "showthread.php?t=" + threadId + "&page=999999";

    //get the thread
    httpGetAsync(fullUrl, function (response)
    {
        var doc = domParser.parseFromString(response, "text/html");

        var commentCount = parseInt(doc.querySelector(".postbit:last-child .postcounter").textContent.substr(1)) - 1; //extract the number of comments from the index of the last post
        var last = doc.querySelector(".postbit:last-child .username").textContent.trim();
        callback({
            comments: commentCount,
            lastCommentor: last
        });
    });
}

var refreshTimeout = setTimeout(function () { }, 0);
//updates the total number of comments in tracked threads. callback returns the time of last update
function updateTotalCommentsTrackedThreads(threadList, refreshRate)
{
    var i;
    window.clearTimeout(refreshTimeout);
    //loop over all threads and update their comment counts
    asyncLoop(threadList.length,
        function (loop) //loop body
        {
            i = loop.getIteration();
            getLastCommentDataForThreadById(threadList[i].threadId, function (data)
            {
                threadList[i].totalComments = data.comments;
                threadList[i].lastCommentor = data.lastCommentor;
                loop.next();
            });
        }, function () //done
        {
            chrome.storage.sync.get("settings", function (data)
            {
                var settings = data.settings;
                var prev = {}; //threadId-comments pairs - used to determine if there are new comments that should be alerted
                //update comment counts
                //not setting directly since the thread list can change while comments are being counted
                for (var i = 0; i < threadList.length; i++)
                {
                    for (var j = 0; j < settings.trackedThreads.list.length; j++)
                    {
                        //update the correct thread
                        if (settings.trackedThreads.list[j].threadId == threadList[i].threadId)
                        {
                            prev[threadList[i].threadId] = settings.trackedThreads.list[j].totalComments;
                            settings.trackedThreads.list[j] = threadList[i];
                            break;
                        }
                    }
                }
                settings.trackedThreads.lastRefreshTime = new Date().getTime();

                //save new times
                chrome.storage.sync.set({ "settings": settings });

                console.log("updated comment count of " + threadList.length + " threads");

                //notify of new comments
                getNotificationsTrackedThreads(function (tracked)
                {
                    var checkedBadge = false;
                    //new comment, notify the user
                    for (var i = 0; i < tracked.length; i++)
                    {
                        if (prev[tracked[i].threadId] < tracked[i].totalComments || prev[tracked[i].threadId] == undefined)
                        {
                            console.log("new comments in tracked thread " + tracked[i].threadId);
                            var additional = "";
                            if (tracked[i].newComments < 2)
                            {
                                additional = " הגיב באשכול ";
                            }
                            else if (tracked[i].newComments == 2)
                            {
                                additional = " ומשתמש נוסף הגיבו באשכול ";
                            }
                            else
                            {
                                additional = " ו-" + (tracked[i].newComments - 1) + " משתמשים נוספים הגיבו באשכול ";
                            }

                            var url = fxpDomain + "showthread.php?t=" + tracked[i].threadId;
                            if (tracked[i].totalComments > 15) //add pages
                            {
                                url += "&page=" + Math.ceil(tracked[i].totalComments / 15);
                            }

                            sendNotification(
                                "התראה חדשה מאשכול במעקב!",
                                'המשתמש ' + tracked[i].lastCommentor + additional + tracked[i].threadTitle,
                                url
                            );

                            prev[tracked[i].threadId] = tracked[i].totalComments;

                            if (!checkedBadge)
                                checkNotificationCount();
                        };
                    }
                });


                //update again after the specified minutes
                if (refreshRate > 0)
                {
                    chrome.storage.sync.get("settings", function (data2)
                    {
                        var settings = data2.settings;
                        scheduleTrackedThreadsUpdate(settings.trackedThreads.lastRefreshTime, settings.trackedThreads.refreshRate);
                    });
                }
            });
        });
}

//schedules an update to the tracked threads data
function scheduleTrackedThreadsUpdate(lastRefresh, refreshRate)
{
    var timeToRefresh = lastRefresh - new Date() + (1000 * 60 * refreshRate);
    var refreshTime = lastRefresh + (1000 * 60 * refreshRate);
    var nextUpIn = (lastRefresh - new Date() + (1000 * 60 * refreshRate)) / 1000 / 60;
    //clear previous alarm if exists, and set a new for the next time of update
    chrome.alarms.clear("updateTrackedThreads", function (wasCleared)
    {
        console.log("thread tracker scheduled for " + Math.round(nextUpIn * 100) / 100 + "mins from now");
        if (nextUpIn < 1)
        {
            trackedThreadsAlarm();
        }
        else
        {
            chrome.alarms.create("updateTrackedThreads", {
                delayInMinutes: nextUpIn
            })
        }
    }); 
}

//returns notification objects for tracked threads
function getNotificationsTrackedThreads(callback)
{
    var noti = [];
    var commentNum, url;
    chrome.storage.local.get("threadComments", function (data)
    {
        var threadComments = data.threadComments || [];
        chrome.storage.sync.get("settings", function (data2)
        {
            var settings = data2.settings || factorySettings;

            for (var i = 0; i < settings.trackedThreads.list.length; i++)
            {
                for (var j = 0; j < threadComments.length; j++)
                {
                    if (threadComments[j].id == settings.trackedThreads.list[i].threadId)
                    {
                        commentNum = settings.trackedThreads.list[i].totalComments - threadComments[j].comments;
                        url = fxpDomain + "showthread.php?t=" + settings.trackedThreads.list[i].threadId;
                        if (settings.trackedThreads.list[i].totalComments  > 15) //add pages
                        {
                            url += "&page=" + Math.ceil(settings.trackedThreads.list[i].totalComments / 15);
                        }
                        if (commentNum > 0)
                        {
                            noti.push({
                                threadTitle: settings.trackedThreads.list[i].title,
                                threadId: settings.trackedThreads.list[i].threadId,
                                totalComments: settings.trackedThreads.list[i].totalComments,
                                newComments: commentNum,
                                lastCommentor: settings.trackedThreads.list[i].lastCommentor,
                                url: url
                            })
                        }
                        break;
                    }
                }
            }

            //return the notifications
            callback(noti);
        });
    });
}

//returns notifications from each kind, and total from FXP itself
function getNotificationsNormal(callback)
{
    var noti = {
        pms: 0,
        likes: 0,
        notifications: 0,
        total: function ()
        {
            return this.pms + this.likes + this.notifications;
        }
    };
    getDomainCookies(fxpDomain, "bb_livefxpext", function (id)
    {
        if (id != null)
            httpGetAsync(fxpDomain + "feed_live.php?userid=" + id + "&format=json", function (data)
            {
                var notificationCount = JSON.parse(data);

                noti.pms = parseInt(notificationCount.pm);
                noti.likes = parseInt(notificationCount.like);
                noti.notifications = parseInt(notificationCount.noti);

                callback(noti);
            })
        else
            callback(noti);
    });
}

//returns the addition of all notification types
function getNotificationsTotalNum(callback)
{
    var total = 0;
    getNotificationsNormal(function (n1)
    {
        total += n1.total();
        getNotificationsTrackedThreads(function (n2)
        {
            total += n2.length
            callback(total);
        })
    })
}

sendEvent("Passive", "Load");