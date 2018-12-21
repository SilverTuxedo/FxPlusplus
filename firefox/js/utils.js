/*
    Copyright 2015-2018 SilverTuxedo

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

var utils = function ()
{
    //gets a cookie from a domain
    function getDomainCookies(domain, name, callback)
    {
        chrome.cookies.get({ "url": domain, "name": name }, function (cookie)
        {
            if (callback)
            {
                if (cookie === null)
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
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }

    //get a user name from user ID
    function getUserNameById(id, knownIds, callback)
    {
        if (id !== "" && id !== 0)
        {
            if (knownIds[id] === undefined)
            { //user's name is not already known
                httpGetAsync(fxpDomain + "member.php?u=" + id, function (response)
                { //request user's page
                    var domParser = new DOMParser();
                    var doc = $(domParser.parseFromString(response, "text/html"));
                    var userName = doc.find("#userinfo .member_username").text().trim();
                    if (userName.length > 0)
                    { //found user's name
                        console.log("new user in memory: " + userName + "#" + id);
                        knownIds[id] = userName;
                        chrome.storage.local.set({ "knownIds": knownIds }); //store new name
                        if (typeof callback === "function")
                            callback(userName);
                    }
                    else
                    { //did not find name, user probably does not exist
                        console.warn("failed to find name by id: " + id);
                        if (typeof callback === "function")
                            callback(null);
                    }
                });
            }
            else
            {
                if (typeof callback === "function")
                    callback(knownIds[id]);
            }
        }
        else
            if (typeof callback === "function")
                callback(null);
    }

    //get a user ID from user name
    function getUserIdByName(name, callback)
    {
        var useridRegex = /userid=[0-9]+/g; //matches userid={NUMBER}

        if (name !== "")
            httpGetAsync(fxpDomain + "member.php?username=" + name, function (response)
            { //request user's page
                var doc = $(domParser.parseFromString(response, "text/html"));
                var userLinkElement = doc.find("a[href*='userid='"); //look for a URL with the user's id
                if (userLinkElement.length > 0)
                { //found a URL with the user's id
                    var userId = userLinkElement.attr("href").match(useridRegex)[0].substr("userid=".length); //extract the ID from the url
                    var userRealName = doc.find("#userinfo .member_username").text().trim();
                    if (userRealName !== name)
                        name = userRealName;
                    console.log(name + "#" + userId);
                    if (typeof callback === "function")
                        callback({
                            name: name,
                            id: userId
                        });
                }
                else
                { //did not find such url, user probably does not exist
                    console.warn("failed to find id by name: '" + name + "'");
                    if (typeof callback === "function")
                        callback({
                            name: name,
                            id: null
                        });
                }
            });
        else
            if (typeof callback === "function")
                callback({
                    name: name,
                    id: null
                });
    }

    //gets a users's id from a member.php?u=XXXXXXXXX address
    function getUserIdFromLink(link)
    {
        if (!link)
            return NaN;
        var id = link.match(/u=[0-9]+/g); //match u=XXXX
        if (id === null)
            return NaN;
        else
            return parseInt(id[0].substr(2)); //remove u= and return
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
                var settings = data2.settings;

                for (var i = 0; i < settings.trackedThreads.list.length; i++)
                {
                    for (var j = 0; j < threadComments.length; j++)
                    {
                        if (threadComments[j].id === settings.trackedThreads.list[i].threadId)
                        {
                            commentNum = settings.trackedThreads.list[i].totalComments - threadComments[j].comments;
                            url = fxpDomain + "showthread.php?t=" + settings.trackedThreads.list[i].threadId;
                            if (settings.trackedThreads.list[i].totalComments > 15) //add pages
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
                                });
                            }
                            break;
                        }
                    }
                }

                //return the notifications
                console.log(noti.length + " tracked threads notifications");
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
            if (id !== null)
                httpGetAsync(fxpDomain + "feed_live.php?userid=" + id + "&format=json", function (data)
                {
                    var notificationCount = JSON.parse(data);

                    noti.pms = parseInt(notificationCount.pm);
                    noti.likes = parseInt(notificationCount.like);
                    noti.notifications = parseInt(notificationCount.noti);

                    console.log(noti.total() + " normal notifications");
                    callback(noti);
                });
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
                total += n2.length;
                callback(total);
            });
        });
    }

    //returns the deepest child of the element
    function getDeepestChild(element)
    {
        if (element.children().length === 0)
            return element;

        var target = element.children(),
            next = target;

        while (next.length)
        {
            target = next;
            next = next.children();
        }

        return target;
    }

    //sets the content of the subnick container
    function setSubnickContainer(subnick, subnickContainer)
    {
        if (isURL(subnick.value)) //if it's a url, place as an image/video, not text
        {
            subnickContainer.empty();
            if (subnick.value.endsWith("mp4") || subnick.value.endsWith("webm"))
                subnickContainer.append($("<video>", { loop: true, autoplay: true }).append($("<source>", { src: subnick.value })));
            else
                subnickContainer.append($("<img>", { src: subnick.value }));
        }
        else
        {
            subnickContainer.text(subnick.value);
            subnickContainer.css({
                color: subnick.color,
                fontSize: subnick.size + "px",
                fontWeight: "bold"
            });
        }
    }


    //brightens all elements by selectors under the (jQuery) parent.
    //SEARCH brightenGlobal
    function brightenBySelectors(parent, elementSelectors)
    {

        var selector = elementSelectors.join(", ");

        if (parent.is(selector))
            brightenElement(parent);

        parent.find(selector).each(function ()
        {
            brightenElement(this);
        });

    }

    //changes a javascript DOM element's color to be bright enough behind black/dark backgrounds
    function brightenElement(el)
    {
        var color = $(el).css("color");
        var hex = convertRgbToHex(color);

        //detect override
        var hasColorParameterRegex = /(\s|;|^)color:/g;
        var hasOldValue = hasColorParameterRegex.test($(el).attr("style"));

        var brighter = getBrighterColor(hex, 150);
        if (brighter !== hex)
        {
            $(el).attr("data-ogcolor", color);
            if (hasOldValue) //if going to override, take note
                $(el).attr("data-darkoverride", true);
            $(el).css("color", brighter);
        }
    }

    //restores brightened elements' original colors for the element and all its children
    function reverseBrightening(parent)
    {
        if (parent.is("[data-ogcolor]"))
            reverseBrighteningElement(parent);

        parent.find("[data-ogcolor]").each(function ()
        {
            reverseBrighteningElement($(this));
        });
    }

    //restores the element's original colors using its data-ogcolor tag
    function reverseBrighteningElement(el)
    {
        if (el.attr("data-darkoverride"))
        {
            el.css("color", el.attr("data-ogcolor"));
            el.removeAttr("data-darkoverride");
        }
        else
            el.css("color", "");

        el.removeAttr("data-ogcolor");
    }

    //gets a color and a minimum average brightness (0-255), and returns a color bright enough based on the original
    function getBrighterColor(hexColor, minBrightness)
    {
        var color = hexColor.substr(1);
        var rgb = parseInt(color, 16);

        var r = (rgb >> 16) & 0xff;
        var g = (rgb >> 8) & 0xff;
        var b = (rgb >> 0) & 0xff;

        var brightness = (r + g + b) / 3;
        var diff = Math.round(minBrightness - brightness);

        while (diff > 0)
        {
            r = Math.min(r + diff, 255);
            g = Math.min(g + diff, 255);
            b = Math.min(b + diff, 255);

            brightness = (r + g + b) / 3;
            diff = Math.round(minBrightness - brightness);
        }

        var brightHex = "#" + r.toString(16) + g.toString(16) + b.toString(16);
        return brightHex;
    }

    //convert RGB color format to hexadecimal color format (X,X,X > #XXXXXX)
    function convertRgbToHex(rgb)
    {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        function hex(x)
        {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    //builds a wrapper object for custom default style
    function buildStyleWrapper(styleProp, noFonts, wysibbBox)
    {
        //wysibbBox = true for wysibb boxes which do not support specific styles.

        var styleWrapper;
        var styleElements = [];

        //build the elements according to the style
        if (styleProp.color !== "#333333") //disable if the color is the default color
        {
            styleElements.push($("<span>", { style: "color:" + styleProp.color }));
        }
        if (styleProp.size !== 2 && !wysibbBox) //disable if the size is the default size
        {
            styleElements.push($("<font>", { size: styleProp.size }));
        }
        if (styleProp.underline)
        {
            styleElements.push($("<u>"));
        }
        if (styleProp.italic && !wysibbBox)
        {
            styleElements.push($("<em>"));
        }
        if (styleProp.bold)
        {
            styleElements.push($("<strong>"));
        }
        if (styleProp.font !== "Arial" && !noFonts && !wysibbBox) //disable if default font or a page with no fonts enabled
        {
            styleElements.push($("<span>", { style: "font-family: '" + styleProp.font + "'" }));
        }

        if (styleElements.length > 0)
        {
            //wrap elements inside each other
            styleWrapper = styleElements[0];
            for (var i = 1; i < styleElements.length; i++)
            {
                getDeepestChild(styleWrapper).append(styleElements[i]);
            }
        }

        return styleWrapper;
    }

    //wraps the target around the deepest element of the wrapper
    function deepWrap(target, wrapper)
    {
        target.parentNode.insertBefore(wrapper, target);
        getDeepestChild($(wrapper))[0].appendChild(target);
    }

    //fixes the caret's position when applying a style to the editor
    function fixCaret(styleElement)
    {
        var doc = styleElement.ownerDocument || styleElement.document; //get the document
        var win = doc.defaultView || doc.parentWindow; //get the window

        var range = doc.createRange(); //create new range
        var selection = win.getSelection(); //get the current range

        //set the caret to the end of the element
        range.setStart(styleElement, styleElement.textContent.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

    }

    return {
        getDomainCookies: getDomainCookies,
        httpGetAsync: httpGetAsync,
        getUserNameById: getUserNameById,
        getUserIdByName: getUserIdByName,
        getUserIdFromLink: getUserIdFromLink,

        getNotificationsTrackedThreads: getNotificationsTrackedThreads,
        getNotificationsNormal: getNotificationsNormal,
        getNotificationsTotalNum: getNotificationsTotalNum,

        getDeepestChild: getDeepestChild,
        setSubnickContainer: setSubnickContainer,
        brightenBySelectors: brightenBySelectors,
        brightenElement: brightenElement,
        reverseBrightening: reverseBrightening,
        reverseBrighteningElement: reverseBrighteningElement,
        getBrighterColor: getBrighterColor,
        convertRgbToHex: convertRgbToHex,

        buildStyleWrapper: buildStyleWrapper,
        deepWrap: deepWrap,
        fixCaret: fixCaret
    };
}();