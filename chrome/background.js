
chrome.browserAction.setBadgeBackgroundColor({ color: "#3491ef" });

(function (i, s, o, g, r, a, m) { //analytics
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'); //added https

ga('create', 'UA-69320118-1', 'auto');
ga('set', 'checkProtocolTask', function () { }); //fixes for extension
ga('require', 'displayfeatures');
ga('send', 'pageview', '/background.html');

var d = new Date();
var today = { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };


//chrome.runtime.sendMessage({ sendTestNotification: true });
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      //if (request.features.length > 0) {
      //    for (i = 0; i < request.features.length; i++) {
      //        ga('send', 'event', 'feature', request.features[i], request.user + "  " + today.day + "/" + today.month + "/" + today.year);
      //    }
      //    sendResponse({ message: "- " + request.features });
      //}

      if (request.sendTestNotification) {
          var randomId = Math.random().toString(36).substr(2, 10); //generates a random 10 character id
          chrome.notifications.create(randomId, {
              type: 'basic',
              iconUrl: '/notificationImg.png',
              title: "הודעת בדיקה!",
              message: "הידעת? הגולש הממוצע באינטרנט ממצמץ רק 7 פעמים בדקה! ממוצע המצמוץ הנורמלי הוא 20 - כמעט פי 3.",
              isClickable: false
          });
          //play notification sound
          var audio = new Audio('/notice.mp3');
          audio.play();
      } else if (!isNaN(request.checkNotiCount)) {
          var newCount = request.checkNotiCount;
          chrome.browserAction.getBadgeText({}, function (result) {
              if (result.length < 1)
                  result = "0";

              console.log(result);
              if (newCount < parseInt(result)) { //the number on the display is higher than the actual number
                  updateNotificationCounter();
                  console.log("ICCORILATION!");
              }
          });
      }

  });

//function checkForValidUrl(tabId, changeInfo, tab) { //make sure the extension's logo appears in the correct places
//    if (tab.url.indexOf('https://www.fxp.co.il') > -1) {
//        chrome.pageAction.show(tabId);
//        chrome.pageAction.setTitle({ tabId: tabId, title: "FxPlus+ פעיל בדף זה." });
//    }
//}
//chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.storage.onChanged.addListener(function (changes, areaName) {//tracks changes in variables
    if (areaName == "sync") {
        if (changes.BackgroundNotifications) {

            if (changes.BackgroundNotifications.newValue && !changes.BackgroundNotifications.oldValue) {
                //value of background notifications was changed from false to true
                checkForCookieAccess();
            } else if (!changes.BackgroundNotifications.newValue && changes.BackgroundNotifications.oldValue) {
                //value of background notifications was changed from true to false
                window.clearInterval(reconnection);
            }
        }
    }
});




function updateBadge(number) {
    if (number > 0)
        chrome.browserAction.setBadgeText({ text: number + "" });
    else
        chrome.browserAction.setBadgeText({ text: "" });
}

function updateNotificationCounter() {
    getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id) { //get user ID
        $.get("https://www.fxp.co.il/feed_live.php?userid=" + id + "&format=json", function (data) {
            var notificationCount = JSON.parse(data);
            var totalNotifications = parseInt(notificationCount.pm) + parseInt(notificationCount.like) + parseInt(notificationCount.noti);
            updateBadge(totalNotifications);
        })
    });
}


function FxpPushNotification(title, message, url) {
    var randomId = Math.random().toString(36).substr(2, 10); //generates a random 10 character id
    chrome.notifications.create(randomId, {
        type: 'basic',
        iconUrl: '/notificationImg.png',
        title: title,
        message: message,
        isClickable: true
    });

    //play notification sound
    var audio = new Audio('/notice.mp3');
    audio.play();

    chrome.notifications.onClicked.addListener(function (notificationId) {
        if (notificationId == randomId) {
            window.open(url); //open the url
            setTimeout(function () { chrome.notifications.clear(randomId); }, 200); //close notification
        }
    })
}



function getDomainCookies(domain, name, callback) { //gets a cookie that is on an online site
    chrome.cookies.get({ "url": domain, "name": name }, function (cookie) {
        if (callback) {
            callback(cookie.value);
        }
    });
}




//check if cookies are accessible
function checkForCookieAccess() {
    console.log("Attempting to get cookies");
    //attempt to get cookies (sometimes chrome can't do that)
    chrome.cookies.get({ "url": "https://www.fxp.co.il", "name": "bb_livefxpext" }, function (cookie) {
        if (chrome.runtime.lastError) {
            console.log("Failed to get cookies: " + chrome.runtime.lastError.message);
            setTimeout(checkForCookieAccess, 5000);
        } else {
            activateNotificationListeners();
            console.log("Successfully got cookies");
        }
    });
}
checkForCookieAccess();




var reconnection;
function activateNotificationListeners() {
    //the fxp notifications socket
    var socket = io.connect('https://socket.fxp.co.il/', { reconnection: true });

    socket.on('connect', function () {
        getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id) {
            send = '{"userid":"' + id + '","froum":"f-fe7fdfa8be5eb96fc56f318738a6410e"}';
            socket.send(send);
            console.log('user connect');
        });
    });

    socket.on('reconnecting', function () {
        getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id) {
            send = '{"userid":"' + id + '","froum":"f-fe7fdfa8be5eb96fc56f318738a6410e"}';
            socket.send(send);
            console.log('user reconnect');
        });
    })
    

    //get unread notifications
    chrome.storage.sync.get("BackgroundNotifications", function (dataC) {
        var bgnC = dataC.BackgroundNotifications;
        if (bgnC || bgnC == undefined) {
            var notificationList;
            getDomainCookies("https://www.fxp.co.il", "bb_livefxpext", function (id) { //get user ID
                $.get("https://www.fxp.co.il/feed_live.php?userid=" + id + "&format=json", function (data) {
                    var notificationCount = JSON.parse(data);
                    notificationList = [];

                    if (parseInt(notificationCount.noti) > 0) { //user has notifications
                        if (parseInt(notificationCount.noti) == 1)
                            notificationList.push({ title: notificationCount.noti + "", message: 'התראה חדשה' });
                        else
                            notificationList.push({ title: notificationCount.noti + "", message: 'התראות חדשות' });
                    }
                    if (parseInt(notificationCount.like) > 0) { //user has likes
                        if (parseInt(notificationCount.like) == 1)
                            notificationList.push({ title: notificationCount.like + "", message: 'לייק חדש' });
                        else
                            notificationList.push({ title: notificationCount.like + "", message: 'לייקים חדשים' });
                    }
                    if (parseInt(notificationCount.pm) > 0) { //user has pms
                        if (parseInt(notificationCount.pm) == 1)
                            notificationList.push({ title: notificationCount.pm + "", message: 'הודעה פרטית חדשה' });
                        else
                            notificationList.push({ title: notificationCount.pm + "", message: 'הודעות פרטיות חדשות' });
                    }

                    var totalNotifications = parseInt(notificationCount.pm) + parseInt(notificationCount.like) + parseInt(notificationCount.noti);
                    updateBadge(totalNotifications);

                    if (notificationList.length > 0) { //user actually misses some notifications
                        var randomId = Math.random().toString(36).substr(2, 10); //generates a random 10 character id
                        chrome.notifications.create(randomId, {
                            type: 'list',
                            iconUrl: '/notificationImg.png',
                            title: "בזמן שלא היית מחובר...",
                            message: "",
                            items: notificationList,
                            isClickable: true
                        });

                        //play notification sound
                        var audio = new Audio('/notice.mp3');
                        audio.play();

                        chrome.notifications.onClicked.addListener(function (notificationId) {
                            if (notificationId == randomId) {
                                window.open("https://www.fxp.co.il"); //open the url
                                setTimeout(function () { chrome.notifications.clear(randomId); }, 200); //close notification
                            }
                        })
                    }
                });
            });
        }
    });






    // --notification listeners:--

    //new reply to a thread
    socket.on('newreply', function (data) {
        chrome.storage.sync.get("BackgroundNotifications", function (dataC) {
            var bgnC = dataC.BackgroundNotifications;
            if (bgnC || bgnC == undefined) {
                updateNotificationCounter();
                //checks if an fxp tab is open
                var tablink;
                chrome.tabs.getSelected(null, function (tab) {
                    if (tab == undefined) {
                        tablink = "";
                    } else {
                        tablink = tab.url;
                    }

                    if (tablink.indexOf("fxp.co.il") == -1) {
                        //no fxp tab is open
                        if (data.quoted) {
                            //the user was quoted
                            FxpPushNotification('התראה חדשה!', 'המשתמש ' + data.username + ' ציטט את הודעתך באשכול ' + data.title, 'https://www.fxp.co.il/showthread.php?t=' + data.thread_id + '&goto=newpost')
                        } else {
                            //the user was not quoted
                            FxpPushNotification('התראה חדשה!', 'המשתמש ' + data.username + '  הגיב באשכול ' + data.title, 'https://www.fxp.co.il/showthread.php?t=' + data.thread_id + '&goto=newpost')
                        }
                        


                    }
                });
            }
        });
    });

    //new private message
    socket.on('newpm', function (data) {
        chrome.storage.sync.get("BackgroundNotifications", function (dataC) {
            var bgnC = dataC.BackgroundNotifications;
            if (bgnC || bgnC == undefined) {
                updateNotificationCounter();
                //checks if an fxp tab is open
                var tablink;
                chrome.tabs.getSelected(null, function (tab) {
                    if (tab == undefined) {
                        tablink = "";
                    } else {
                        tablink = tab.url;
                    }
                    if (tablink.indexOf("fxp.co.il") == -1) {
                        //no fxp tab is open
                        FxpPushNotification('דואר נכנס!', 'קיבלת הודעה פרטית חדשה מהמשתמש ' + data.username, 'https://www.fxp.co.il/private.php?do=showpm&pmid=' + data.pmid);
                        
                    }
                });
            }
        });
    });

    //new like
    socket.on('new_like', function (data) {
        chrome.storage.sync.get("BackgroundNotifications", function (dataC) {
            var bgnC = dataC.BackgroundNotifications;
            if (bgnC || bgnC == undefined) {
                updateNotificationCounter();
                //checks if an fxp tab is open
                var tablink;
                chrome.tabs.getSelected(null, function (tab) {
                    if (tab == undefined) {
                        tablink = "";
                    } else {
                        tablink = tab.url;
                    }
                    if (tablink.indexOf("fxp.co.il") == -1) {
                        //no fxp tab is open
                        FxpPushNotification('לייק חדש!', 'המשתמש ' + data.username + ' אהב את ההודעה שלך!', 'https://www.fxp.co.il/showthread.php?p=' + data.postid + '#post' + data.postid);
                        
                    }
                });
            }
        });
    });




    var onevent = socket.onevent;
    socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call(this, packet);    // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet);      // additional call to catch-all
    };

    socket.on("*", function (event, data) {
        if (event != "online_update" && event != "posts_update") {
            console.log("");
            console.log("EVENT:");
            console.log(event);
            console.log(data);
        }

    });
}


