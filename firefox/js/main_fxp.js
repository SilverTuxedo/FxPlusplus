/*
    Copyright 2018 SilverTuxedo

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

var versionDescription = "שינוי התנהגות במצב לילה ותיקוני באגים.";
var versionBig = false;
var versionHref = "https://fxplusplus.blogspot.com/2018/07/141.html";

var defaultNotes = [
    { id: 967488, content: "רק דברים טובים" },
    { id: 30976, content: "אושיית רשת וזוכת האירוויזיון עם השיר המקורי מיוטיוב: מור הראפרית FXP" }
]

//if sync storage not supported, fallback to local.
chrome.storage.sync = (function ()
{
    return chrome.storage.sync ||
           chrome.storage.local;
})();


//observers that detect DOM changes
var observers = {};

//print functions for debugging

var debug = {
    big:     function (msg) { },
    info:    function (msg) { },
    error:   function (msg) { },
    notice:  function (msg) { },
    warning: function (msg) { },
    print:   function (msg) { },
}

if (localStorage.getItem("fxplusplus_debugging"))
{
    debug = {
        big: function (msg)
        {
            console.log('%c' + msg, 'background: #000; color: yellow; font-size:2em');
        },
        info: function (msg)
        {
            console.log('%c' + msg, 'background: #fff; color: #00f; font-weight: bold; font-style: italic;');
        },
        error: function (msg)
        {
            console.log('%cERROR: ' + msg, 'background: #f00; color: #fff; font-weight: bold;');
        },
        notice: function (msg)
        {
            console.log('%cNotice: ' + msg, 'background: #ffcc55');
        },
        warning: function (msg)
        {
            console.log('%cWarning: ' + msg, 'background: #ff3355; color: #fff; font-weight: bold;');
        },
        print: function (msg)
        {
            console.log(msg);
        }
    }
}

var fxpDomain = "https://www.fxp.co.il/";

//useful regex expressions
var regex = {
    fullWord: /([^\s.,\/#?!$%\^&\*+;:{}|=\-_`~()]+)/g,
    notNumber: /^\D+/g
}

var readTimeSpeed = 220;

var classicIconsList = [ //old, new, width, height
    ["https://static.fcdn.co.il/smilies3/124_40x.png", "https://i.imgur.com/lSrkVhN.png", 20, 20], //replace mad
    ["https://static.fcdn.co.il/smilies3/6_40x.png", "https://i.imgur.com/qpPriMw.png", 18, 18], //replace wink
    ["https://static.fcdn.co.il/smilies3/32_40x.png", "https://i.imgur.com/icnMREx.png", 20, 20], //replace tongue
    ["https://static.fcdn.co.il/smilies3/4_40x.png", "https://i.imgur.com/CgwnVDU.png", 20, 20], //replace blush
    ["https://static.fcdn.co.il/smilies3/200_40x.png", "https://i.imgur.com/3StcOJf.png", 18, 18], //replace bot/nerd
    ["https://static.fcdn.co.il/smilies3/43_40x.png", "https://i.imgur.com/gpEocl5.png", 18, 18], //replace XD
    ["https://static.fcdn.co.il/smilies3/143_40x.png", "https://i.imgur.com/eNdc1XA.png", 20, 20], //replace confused
    ["https://static.fcdn.co.il/smilies3/205_40x.png", "https://i.imgur.com/eq274Ao.png", 74, 30], //replace angel
    ["https://static.fcdn.co.il/smilies3/204_40x.png", "https://i.imgur.com/lPepnzd.png", 20, 20], //replace smile
    ["https://static.fcdn.co.il/smilies3/173_40x.png", "https://i.imgur.com/Y0xWnOV.png", 18, 23], //replace devil
    ["https://static.fcdn.co.il/smilies3/202_40x.png", "https://i.imgur.com/yDHz3MY.png", 19, 19], //replace kiss
    ["https://static.fcdn.co.il/smilies3/131_40x.png", "https://i.imgur.com/FekEBW4.png", 20, 20], //replace cool
    ["https://static.fcdn.co.il/smilies3g/206.gif", "https://i.imgur.com/1htCYLi.gif", 22, 20], //replace i love u
    ["https://static.fcdn.co.il/smilies3g/207.gif", "https://i.imgur.com/WzfVnDk.gif", 20, 20]  //replace tongue 2
]

var classicIconsDict = [
    { old: "https://static.fcdn.co.il/smilies3/205_40x.png", new: "images/old_icons/angel.png", width: 74, height: 30 },
    { old: "https://static.fcdn.co.il/smilies3/173_40x.png", new: "images/old_icons/devil.png", width: 18, height: 23 },
    { old: "https://static.fcdn.co.il/smilies3/202_40x.png", new: "images/old_icons/kiss.png", width: 19, height: 19 },
    { old: "https://static.fcdn.co.il/smilies3g/206.gif", new: "images/old_icons/loveyou.gif", width: 22, height: 20 },
    { old: "https://static.fcdn.co.il/smilies3g/207.gif", new: "images/old_icons/tongue2.gif", width: 20, height: 20 },

    { old: "https://images.fxp.co.il/smilies3/205_40x.png", new: "images/old_icons/angel.png", width: 74, height: 30 },
    { old: "https://images.fxp.co.il/smilies3/173_40x.png", new: "images/old_icons/devil.png", width: 18, height: 23 },
    { old: "https://images.fxp.co.il/smilies3/202_40x.png", new: "images/old_icons/kiss.png", width: 19, height: 19 },
    { old: "https://images.fxp.co.il/smilies3g/206.gif", new: "images/old_icons/loveyou.gif", width: 22, height: 20 },
    { old: "https://images.fxp.co.il/smilies3g/207.gif", new: "images/old_icons/tongue2.gif", width: 20, height: 20 }
]

//build an animated loading element
var loadingElement = $("<div>", { class: "sk-cube-grid" });
for (var i = 1; i <= 9; i++)
{
    loadingElement.append($("<div>", { class: ("sk-cube sk-cube" + i) }))
}

//char that is placed where a close button should be
var closeChar = '✖';

//id:username pairs that are known
var globalKnownIds = {};
chrome.storage.local.get("knownIds", function (data)
{
    globalKnownIds = data.knownIds;
    if (globalKnownIds == undefined) //reset if needed
        globalKnownIds = {};
});


//night mode is active
if (localStorage.getItem("nightmodeEnabled") == "true")
{
    //temporarily add a black screen so the screen doesn't flash white while the user switches pages
    var darkElement = document.createElement("div");
    darkElement.setAttribute("style", "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background:black; z-index: 999999999999999;");
    darkElement.setAttribute("id", "happyEyes");
    document.documentElement.appendChild(document.importNode(darkElement, true));

    //check when body is added to the document
    observers.htmlTree = new MutationObserver(function (mutations)
    {
        mutations.forEach(function (mutation)
        {
            if (mutation.addedNodes.length > 0)
                if (mutation.addedNodes[0].tagName == "BODY") //body added
                {
                    //append the style
                    $("body").append($("<link>", { id: "nightmodeStyle", rel: "stylesheet", href: chrome.extension.getURL("css/nightmode.css") }));
                    $("body").addClass("nightmodeActive");
                    debug.info("night mode applied");
                    setTimeout(function ()
                    {
                        //remove black screen
                        $("#happyEyes").fadeOut(100);
                    }, 200);
                    observers.htmlTree.disconnect();
                }
        })
    });
    observers.htmlTree.observe(document.documentElement, { childList: true });
}

/*
 * 
 * the magic starts here
 * 
 */
var settings;
chrome.storage.sync.get("settings", function (data)
{ //get settings
    if (data)
        settings = data.settings || {};
    else
        settings = {};

    readTimeSpeed = settings.readtime.speed;

    //add custom background
    if (localStorage.getItem("nightmodeEnabled") == "true")
    {
        if (settings.customBg.night.length > 0)
        {
            var bgStyle = "body { background: url('" + settings.customBg.night + "') #000 }";
            addStyle(bgStyle, "customBg");
        }
    }
    else if (settings.customBg.day.length > 0)
    {
        var bgStyle = "body { background: url('" + settings.customBg.day + "') }";
        addStyle(bgStyle, "customBg");
    }

    //remove taboola
    if (settings.hideSuggested)
    {
        debug.info("hideSuggested is enabled");
        var taboolaSelectors = [
            "script[src*='taboola.com']",
            "#taboola-above-article-thumbnails",
            "#taboola-bottom-of-page-thumbnails",
            "#related_main",
            "#taboola-above-forum-thumbnails",
            "#taboola-below-forum-thumbnails",
            ".trc_related_container",
            ".trc_spotlight_widget",
            ".videoyoudiv"
        ]

        var taboolaString = taboolaSelectors[0];
        for (var i = 1; i < taboolaSelectors.length; i++)
        {
            taboolaString += ", " + taboolaSelectors[i];
        }
        taboolaString += " { display: none !important }";
        addStyle(taboolaString);
    }

    //use classic icons
    if (settings.classicIcons)
    {
        addStyle(buildOldIconsStylesheet());
    }

    //hide the accessibility menu
    if (settings.hideAccessibilityMenu)
    {
        addStyle(".nagish-button { display: none; }");
    }

    $(document).ready(function ()
    { //DOM is ready for manipulation
        debug.info("Page ready");

        var beginDate = new Date();

        

        //add helper for night mode to determine where the personal category is
        $(".fav_div").parent().addClass("personalCategoryHelper");

        //add settings button in FxP toolbar
        $("#settings_pop .popupbody").append($("<div>", { class: "fxpSpopupSeperator" })) //add seperator
        .append(
            $("<div>", { style: "text-align: center;" }).append(
                $("<a>", { class: "niceButton darkBlueBtn", style: "font-size: 1em; color: #fff; margin-top: 0", target: "_blank", href: chrome.extension.getURL("html/settings.html") })
                    .text("הגדרות +FxPlus").click(function ()
                    {
                        chrome.runtime.sendMessage({ event: {cat: "Click", type:"Settings site"} });
                    })
            ).append(
                $("<a>", { target: "_blank", href: chrome.extension.getURL("html/settings.html") + "#multiuser" }).text("החלף משתמש").click(function ()
                    {
                        chrome.runtime.sendMessage({ event: {cat: "Click", type:"User Settings site"} });
                    })
            )
        ); //add button itself

        //show the hidden by FxP pinned 
        if (settings.showAutoPinned)
        {
            addStyle("#stickies li.threadbit:nth-child(n+4) { display: block; }");
            $(".morestick").remove();
        }

        //resize big signatures
        if (settings.resizeSignatures)
        {
            debug.info("resizeSignatures is enabled");

            //observer to handle images that change their src after page is ready (fxp's load while scrolling feature)
            observers.signatures = new MutationObserver(function (mutations)
            {
                mutations.forEach(function (mutation)
                {
                    if (mutation.attributeName == "src")
                    { //the src of the image has changed
                        //resize the container of the mutated image
                        resizeSignature($(mutation.target).parents(".signaturecontainer"));
                        if ($(".signaturecontainer img[src='clear.gif']").length == 0) //there are no images in signatures that can change their src
                        {
                            debug.notice("signature mutation observers disconnected");
                            observers.signatures.disconnect(); //disconnect signature observer
                        }

                    }

                })
            });

            //handle all signatures
            $(".signaturecontainer").each(function ()
            {
                resizeSignature($(this));
            })

            //handle images that load in signatures 
            $(".signaturecontainer img").one("load", function ()
            {
                resizeSignature($(this).parents(".signaturecontainer"));
            }).each(function ()
            {
                //observe images since their src can change
                observers.signatures.observe(this, { attributes: true });
            });
            //handle videos that load in signatures (gifs)
            $(".signaturecontainer video").one("loadeddata", function ()
            {
                resizeSignature($(this).parents(".signaturecontainer"));
            });
        }

        //change style of white text
        if (settings.showSpoilers)
        {
            debug.info("showSpoilers is enabled");
            $("[color = '#ffffff']").each(function ()
            {
                if ($(this).parentsUntil("table", "[style*='background-color']").length <= 0) //the spoiler is not in a table that has a color
                    $(this).addClass("whiteSpoiler");
            })
        }

        //there are threads in the page
        if ($("#threads").length > 0)
        {

            //hide old stickied threads
            if (settings.hideSticky.active)
            {
                debug.info("hideSticky is enabled");
                $(".threadbit .sticky").each(function ()
                {
                    var days = getDaysSinceComment($(this));
                    var title = $(this).find(".title").text();
                    if (days > settings.hideSticky.days)
                    {
                        var hideSticky = true;
                        if (title.indexOf("חוק") > -1) //the thread title indicates it's a rules thread
                            if (!settings.hideSticky.includingRules)
                                hideSticky = false; //don't hide sticky if hiding rules is disabled

                        if (hideSticky)
                        {
                            $(this).addClass("hiddenSticky");
                        }
                    }
                });
            }

            //show forum stats
            if (settings.showForumStats)
            {
                debug.info("showForumStats is enabled");

                $(".threads_list_fxp").after(
                    $("<div>", { id: "forumStatsContainer" }).append(
                        $("<div>", { id: "forumStats" }).append(
                            $("<i>").text("סטטיסטיקות:")
                        )
                    )
                );

                //PUBLISHERS

                var publishers = []; //array of all posters that posted in the forum
                $("#threads .threadinfo .username").each(function ()
                {
                    publishers.push($(this).text());
                });

                var publishersDict = getDupeSortedDictionary(publishers);

                line = $("<div>");
                if (publishersDict.length > 1 && publishersDict[0].count > 1)
                {
                    line.append($("<span>").text("המפרסם הדומיננטי ביותר הוא "));
                    //add names until the count is not the largest
                    for (var i = 0; i < publishersDict.length && (publishersDict[i].count == publishersDict[0].count); i++)
                    {
                        if (i > 0)
                            line.append($("<span>").text(" או "));
                        line.append($("<b>").text(publishersDict[i].value));
                    }
                    line.append($("<span>").text(" עם " + publishersDict[0].count + " אשכולות."));
                }
                else
                {
                    line.append($("<span>").text("אין מפרסם דומיננטי במיוחד."));
                }
                $("#forumStats").append(line);

                //COMMENTORS

                var commentors = []; //array of all commentors that last posted in threads
                $("#threads .threadlastpost .username").each(function ()
                {
                    commentors.push($(this).text());
                });

                var commentorsDict = getDupeSortedDictionary(commentors);

                line = $("<div>");
                if (commentorsDict.length > 1 && commentorsDict[0].count > 1)
                {
                    line.append($("<span>").text("המגיב האחרון הדומיננטי ביותר הוא "));
                    for (var i = 0; i < commentorsDict.length && (commentorsDict[i].count == commentorsDict[0].count); i++)
                    {
                        if (i > 0)
                            line.append($("<span>").text(" או "));
                        line.append($("<b>").text(commentorsDict[i].value));
                    }
                    line.append($("<span>").text(" עם " + commentorsDict[0].count + " תגובות אחרונות."));
                }
                else
                {
                    line.append($("<span>").text("אין מגיב אחרון דומיננטי במיוחד."));
                }
                $("#forumStats").append(line);

                //WORDS

                var words = []; //array of all words in titles
                $("#threads .title").each(function ()
                {
                    var titleWords = $(this).text().match(regex.fullWord); //get words in title
                    if (titleWords != null)
                    {
                        titleWords.forEach(function (word)
                        {
                            if (word.length > 1) //push words to the array of all the words
                                words.push(word);
                        });
                    }
                });

                var wordsDict = getDupeSortedDictionary(words);

                var line = $("<div>");
                if (wordsDict.length > 1 && wordsDict[0].count > 1)
                {
                    line.append($("<span>").text("המילה הנפוצה ביותר בכותרות היא "));
                    for (var i = 0; i < wordsDict.length && (wordsDict[i].count == wordsDict[0].count); i++)
                    {
                        if (i > 0)
                            line.append($("<span>").text(" או "));
                        line.append($("<b>").text(wordsDict[i].value));
                    }
                    line.append($("<span>").text(" עם " + wordsDict[0].count + " אזכורים."));
                }
                else
                {
                    line.append($("<span>").text("אין מילה נפוצה במיוחד בכותרות."));
                }
                $("#forumStats").append(line);

                //PREFIXES

                var prefixes = []; //array of all prefixes of threads
                $("#threads .prefix").each(function ()
                {
                    var prefix = $(this).text().trim();
                    prefix = prefix.replace("|", ""); //remove |
                    prefix = prefix.replace("סקר: ", "").trim(); //remove poll prefix
                    prefixes.push(prefix);
                });

                var prefixesDict = getDupeSortedDictionary(prefixes);

                line = $("<div>");
                if (prefixesDict.length > 1 && prefixesDict[0].count > 1) 
                {
                    line.append($("<span>").text("התיוג הנפוץ ביותר הוא "));
                    for (var i = 0; i < prefixesDict.length && (prefixesDict[i].count == prefixesDict[0].count); i++)
                    {
                        if (i > 0)
                            line.append($("<span>").text(" או "));
                        line.append($("<b>").text(prefixesDict[i].value));
                    }
                    line.append($("<span>").text(" שנמצא ב-" + prefixesDict[0].count + " אשכולות."));
                }
                else
                {
                    line.append($("<span>").text("אין תיוג נפוץ במיוחד."));
                }
                $("#forumStats").append(line);

                //VIEW COMMENT RATIO

                var commentsCount = 0;
                var viewsCount = 0;

                var cc, vc;

                $("#threads .threadstats").each(function ()
                {
                    cc = parseInt($(this).find("li:eq(0)").text().replace(",", "").replace(regex.notNumber, ""));
                    vc = parseInt($(this).find("li:eq(1)").text().replace(",", "").replace(regex.notNumber, ""));
                    if (!isNaN(cc))
                        commentsCount += cc;
                    if (!isNaN(vc))
                        viewsCount += vc;
                });

                var viewsCommentsRatio = Math.round(viewsCount / commentsCount);
                if (viewsCommentsRatio < 1)
                    viewsCommentsRatio = 1; //make sure that it's not rounded to 0

                if (isNaN(viewsCommentsRatio))
                    viewsCommentsRatio = "∞";

                line = $("<div>");
                line.append($("<span>").text("יחס הצפיות לתגובה הוא תגובה כל "));
                line.append($("<b>").text(viewsCommentsRatio + " צפיות"));
                line.append($("<span>").text("."));
                $("#forumStats").append(line);


                //shorten the words dictionary
                var shortWordsDict = [];
                for (var i = 0; i < wordsDict.length && wordsDict[i].count > 1; i++)
                {
                    shortWordsDict.push(wordsDict[i]);
                }
                wordsDict = shortWordsDict;

                //button for detailed statistics
                $("#forumStats").append(
                    $("<div>", { class: "smallPlusButton", id: "detailedStatsBtn" }).text("+").click(function ()
                    {

                        var pContent = $("<div>");

                        pContent.append($("<div>").text("להלן פירוט הסטטיסטיקות לפורום זה:"));

                        var flexTableContainer = $("<div>", { style: "display: flex; flex-wrap: wrap;" });

                        //add table skeleton
                        flexTableContainer.append($("<table>", { class: "statTable", id: "publishersStatTable" }).append(
                            $("<tr>").append(
                                $("<th>").text("מפרסם")
                            ).append(
                                $("<th>").text("אשכולות")
                                ))
                        );

                        flexTableContainer.append($("<table>", { class: "statTable", id: "commentorsStatTable" }).append(
                            $("<tr>").append(
                                $("<th>").text("מגיב")
                            ).append(
                                $("<th>").text("תגובות אחרונות")
                                ))
                        );

                        flexTableContainer.append($("<table>", { class: "statTable", id: "wordsStatTable" }).append(
                            $("<tr>").append(
                                $("<th>").text("מילה")
                            ).append(
                                $("<th>").text("אזכורים")
                                ))
                        );

                        flexTableContainer.append($("<table>", { class: "statTable", id: "prefixesStatTable" }).append(
                            $("<tr>").append(
                                $("<th>").text("תיוג")
                            ).append(
                                $("<th>").text("אשכולות")
                                ))
                        );

                        //add table content
                        for (var i = 0; i < publishersDict.length; i++)
                        {
                            flexTableContainer.find("#publishersStatTable").append(
                                $("<tr>").append(
                                    $("<td>").text(publishersDict[i].value)
                                ).append(
                                    $("<td>").text(publishersDict[i].count)
                                    )
                            )
                        }

                        for (var i = 0; i < commentorsDict.length; i++)
                        {
                            flexTableContainer.find("#commentorsStatTable").append(
                                $("<tr>").append(
                                    $("<td>").text(commentorsDict[i].value)
                                ).append(
                                    $("<td>").text(commentorsDict[i].count)
                                    )
                            )
                        }

                        for (var i = 0; i < wordsDict.length; i++)
                        {
                            flexTableContainer.find("#wordsStatTable").append(
                                $("<tr>").append(
                                    $("<td>").text(wordsDict[i].value)
                                ).append(
                                    $("<td>").text(wordsDict[i].count)
                                    )
                            )
                        }

                        for (var i = 0; i < prefixesDict.length; i++)
                        {
                            flexTableContainer.find("#prefixesStatTable").append(
                                $("<tr>").append(
                                    $("<td>").text(prefixesDict[i].value)
                                ).append(
                                    $("<td>").text(prefixesDict[i].count)
                                    )
                            )
                        }

                        //append all the tables in their container
                        pContent.append(flexTableContainer);

                        pContent.append(
                            $("<div>", { class: "closeBtn" }).text("סגור").click(function ()
                            {
                                removePopupWindow("detailedStats");
                            })
                            );

                        //open the window
                        var imgUrl = chrome.extension.getURL("images/graph.svg");
                        openPopupWindow("detailedStats",
                            imgUrl,
                            "סטטיסטיקות מפורטות לפורום " + getForumName(),
                            pContent);
                    }
                    ));
            }


            //peek binding for new threads
            observers.threadsList = new MutationObserver(function (mutations)
            {
                mutations.forEach(function (mutation)
                {
                    if (mutation.addedNodes.length > 0)
                    {
                        var addedThread = $(mutation.addedNodes[0]);
                        if (addedThread.hasClass("threadbit") && !(addedThread.hasClass("minithread")))
                        { //it's a new thread
                            addedThread.find(".threadstatus").click(function ()
                            { //peek on envelope click
                                peekToThread($(this), settings.peekCloseMethod)
                            });

                            if (settings.trackUnreadComments) //check if new comments in the added thread
                            {
                                checkNewComments(addedThread);
                            }

                            //fix minithreads
                            fixMinithreadOrdring();

                            if (settings.readtime.activePrefixes.length > 0) //calculate read time of new thread if needed
                            {
                                var threadPrefix = addedThread.find(".prefix").text().trim(); //get the prefix of a thread

                                for (var i = 0; i < settings.readtime.activePrefixes.length; i++) //for each of the active prefixes
                                {
                                    if (threadPrefix.indexOf(settings.readtime.activePrefixes[i]) > -1) //thread has a tracked prefix
                                    {
                                        addedThread.find(".threadstatus").append($("<div>", { class: "readTimeThreadbit" }).text("...")); //push the container for the time
                                        pushToReadTimeQueue(addedThread.find(".readTimeThreadbit"), addedThread.find(".title").attr("href"), true); //calculate readtime
                                    }
                                }
                            }
                            checkAllFilters(settings.threadFilters.users, settings.threadFilters.keywords, addedThread); //check all the filters for the thread
                        }

                    }

                })
            });
            //track when new threads appear in the threadlist
            observers.threadsList.observe($("#threads")[0], { childList: true });
        }

        //there are comments in the page
        if ($("#posts").length > 0)
        {

            observers.commentList = new MutationObserver(function (mutations)
            {
                mutations.forEach(function (mutation)
                {
                    var addedComment = $(mutation.addedNodes[0]);
                    //new comments, set the read comments to the new last comment
                    if (settings.trackUnreadComments)
                    {
                        var lastComment = $(".postbit:last");
                        var lastIndex = parseInt(lastComment.find(".postcounter").text().substr(1)); //extract the index of the last post
                        //last comments added by fxp's LIVE system do not include the thread's id in the link, so extract from the first comment in the thread
                        var threadId = getThreadIdFromLink($(".postbit:first").find(".postcounter").attr("href")); //extract the id of the thread
                        compareReadCommentsWithLast(threadId, lastIndex);
                    }

                    //handle the signature of the added comment
                    if (settings.resizeSignatures)
                    {
                        resizeSignature(addedComment.find(".signaturecontainer"));

                        //handle images that load in signatures 
                        addedComment.find(".signaturecontainer img").one("load", function ()
                        {
                            resizeSignature($(this).parents(".signaturecontainer"));
                        }).each(function ()
                        {
                            //observe images since their src can change
                            observers.signatures.observe(this, { attributes: true });
                        });
                    }


                    checkCommentFilter(settings.commentFilters, addedComment); //apply filters to new comment

                    //make subnick quickly editable
                    addedComment.find(".usertitle").click(function () { quickEditSubnick($(this)) }).attr("data-balloon", "לחץ כדי לערוך").attr("data-balloon-pos", "left").addClass("balloonNoBorder");
                })
            });
            //track when new comments appear in the comments list
            observers.commentList.observe($("#posts")[0], { childList: true });


            //confirm ids fit to usernames, since users can change their names from time to time
            $(".postbit").each(function ()
            {
                var userId = getUserIdFromLink($(this).find(".username").attr("href")); //get the comment user's id
                var userName = $(this).find(".username").text().trim();

                if (userId > 0)
                    if (globalKnownIds[userId] != userName && globalKnownIds[userId] != undefined) //id and name do not match, update
                    {
                        updateKnownIds(userId, userName);
                    }
            })
        }

        //bind all envelopes to peek
        $(".threadstatus, .threadicon").click(function ()
        {
            peekToThread($(this), settings.peekCloseMethod)
        });

        //bind all titles to track comment count when clicked, and check state of loaded threads
        if (settings.trackUnreadComments)
        {
            if ($(".postbit").length > 0)
            { //there are comments in the page
                //this checks for the last comment, and makes sure that the number of known comments is not smaller than its index
                var lastComment = $(".postbit:last");
                var lastIndex = parseInt(lastComment.find(".postcounter").text().substr(1)); //extract the index of the last post
                var threadId = getThreadIdFromLink(lastComment.find(".postcounter").attr("href")); //extract the id of the thread
                compareReadCommentsWithLast(threadId, lastIndex);
            }

            //track comments of threads also by their displayed comment count when clicked
            $(".threadbit .title").on("mousedown", function (e)
            {
                if (e.which === 3) //ignore right clicks
                    return;
                //clicked on thread, track the comments it has currently
                var comments = getThreadbitComments($(this).parents(".threadbit"));
                var id = getThreadIdFromLink($(this).attr("href"));
                updateThreadCommentCount(id, comments);
            });

            $(".threadbit .lastpostdate").on("mousedown", function (e)
            {
                if (e.which === 3) //ignore right clicks
                    return;
                var comments = getThreadbitComments($(this).parents(".threadbit"));
                var id = getThreadIdFromLink($(this).parents(".threadbit").find(".title").attr("href"));
                updateThreadCommentCount(id, comments);
            });

            chrome.storage.local.get("threadComments", function (data)
            {
                var threadComments = data.threadComments || [];
                //check for each thread if it has new comments
                var thread;
                var commentDifference;
                threadComments.forEach(function (threadData)
                {
                    if (checkTrackThreadUnread(threadData.id))
                    {
                        thread = $(".threadbit .title[href$='t=" + threadData.id + "']"); //find threads that is tracked by title
                        if (thread.length > 0) //there is a thread with a tracked id in the page
                        {
                            thread = thread.parents(".threadbit"); //focus on the actual thread, not title
                            commentDifference = getThreadbitComments(thread) - threadData.comments;
                            if (commentDifference > 0) //new comments
                            {
                                tagNewComments(thread, commentDifference);
                            }
                        }
                    }
                })
            });
        }

        //there is a title (big thread title) that can contain the dropdown menu
        if ($(".titleshowt").length > 0)
        {
            //add thread settings button and options
            $(".titleshowt").append(
                $("<div>", { class: "stickToLeft" }).append($("<div>", { class: "dropdownL manageThreadDropdown" }).append(
                    $("<div>", { class: "manageThreadPP mdi mdi-menu" })
                ).append(
                    $("<div>", { class: "dropdownLContent" }).append(
                        $("<table>", { class: "dropTable" }).append(
                            $("<tr>", { id: "quickAccessAddRemove" }).append(
                                $("<td>", {"data-balloon": "פתח את גישה מהירה עם ALT+Q", "data-balloon-pos": "right"}).text("הוסף לגישה מהירה")
                            ).append(
                                $("<td>").append(
                                    $("<span>", { class: "mdi mdi-bookmark-plus" })
                                )
                                )
                        ).append(
                            $("<tr>", { id: "toggleTrackThread" }).append(
                                $("<td>").text("קבל התראות מאשכול זה")
                            ).append(
                                $("<td>").append(
                                    $("<span>", { class: "mdi mdi-comment-alert" })
                                )
                                )
                        ).append(
                            $("<tr>", { id: "toggleThreadCommentTracking" }).append(
                                $("<td>").text("בטל מעקב אחר הודעות שלא נקראו")
                            ).append(
                                $("<td>").append(
                                    $("<span>", { class: "mdi mdi-comment-multiple-outline" })
                                )
                                )
                        )
                    )
                    ))
            );

            //remove option to toggle comment tracking if its not enabled in settings
            if (!settings.trackUnreadComments)
                $("#toggleThreadCommentTracking").remove();

            //toggle dropdown on click
            $(".manageThreadPP").click(function ()
            {
                toggleManageThreadDropdown(!getManageThreadDropdownOpened());
            });

            var currentThreadId = getThreadIdFromLink($(".postbit:first").find(".postcounter").attr("href"));
            var title = $(".titleshowt h1").text().trim();
            var prefix = $(".titleshowt .prefixtit").text().trim();

            //change the text in the option "track unread comments" if its turned on or off
            if (checkTrackThreadUnread(currentThreadId))
                $("#toggleThreadCommentTracking td:first").text("בטל מעקב אחר הודעות שלא נקראו");
            else
                $("#toggleThreadCommentTracking td:first").text("הפעל מעקב אחר הודעות שלא נקראו");

            //change the text in the option "quick access" if its in there or not and keep title up to date
            if (checkThreadExistsQuickAccess(currentThreadId))
            {
                //change text to "remove"
                $("#quickAccessAddRemove td:first").text("הסר מגישה מהירה");
                $("#quickAccessAddRemove td:eq(1) span").attr("class", "mdi").addClass("mdi-bookmark-remove");

                //verify that the thread title is kept up to date
                updateQuickAccessTitle(prefix, title, currentThreadId);

            }
            else
            {
                $("#quickAccessAddRemove td:first").text("הוסף לגישה מהירה");
                $("#quickAccessAddRemove td:eq(1) span").attr("class", "mdi").addClass("mdi-bookmark-plus");
            }

             //change the text in the option "track thread" if its turned on or off
            if (checkThreadExistsTrackList(currentThreadId))
                $("#toggleTrackThread td:first").text("כבה התראות מאשכול זה");
            else
                $("#toggleTrackThread td:first").text("קבל התראות מאשכול זה");
            

            //toggle tracking new comments
            $("#toggleThreadCommentTracking").click(function ()
            {
                var threadId = getThreadIdFromLink($(".postbit:first").find(".postcounter").attr("href")); //extract the id of the thread
                if (checkTrackThreadUnread(threadId)) //cancel tracking unread comments
                {
                    setTrackThreadUnread(threadId, false);
                    $(this).find("td:first").text("הפעל מעקב אחר הודעות שלא נקראו");
                }
                else //activate tracking unread comments
                {
                    setTrackThreadUnread(threadId, true);
                    $(this).find("td:first").text("בטל מעקב אחר הודעות שלא נקראו");

                    //make sure that the current page is marked as read
                    var lastComment = $(".postbit:last");
                    var lastIndex = parseInt(lastComment.find(".postcounter").text().substr(1)); //extract the index of the last post
                    //last comments could be added by fxp's LIVE system and not include the thread's id in the link, so extract from the first comment in the thread
                    var threadId = getThreadIdFromLink($(".postbit:first").find(".postcounter").attr("href")); //extract the id of the thread
                    compareReadCommentsWithLast(threadId, lastIndex);
                }
            });

            //toggle presence in quick access
            $("#quickAccessAddRemove").click(function ()
            {
                if (checkThreadExistsQuickAccess(currentThreadId)) //thread exists, remove it
                {
                    removeThreadFromQuickAccess(currentThreadId, function ()
                    {
                        $("#quickAccessAddRemove td:first").text("הוסף לגישה מהירה");
                        $("#quickAccessAddRemove td:eq(1) span").attr("class", "mdi").addClass("mdi-bookmark-plus");
                    })
                }
                else //thread does not exist, add it
                {
                    //the first comment has the OP, no need to search for the correct id
                    if ($(".postbit:first .postcounter").text() == "#1")
                    {
                        var userId = getUserIdFromLink($(".postbit:first a.username").attr("href"));
                        addThreadToQuickAccess(prefix, title, userId, currentThreadId, function ()
                        {
                            //change the text in the option
                            $("#quickAccessAddRemove td:first").text("הסר מגישה מהירה");
                            $("#quickAccessAddRemove td:eq(1) span").attr("class", "mdi").addClass("mdi-bookmark-remove");
                            //show the user the quick access window
                            openQuickAccess();
                            //close the menu
                            toggleManageThreadDropdown(false);
                        })
                    }
                    else
                    {
                        //mark loading
                        $("#quickAccessAddRemove td:eq(1) span").attr("class", "mdi").addClass("mdi-dots-horizontal");

                        //the first comment is not the OP, need to search for the correct id
                        getAuthorIdByThreadId(currentThreadId, function (userId)
                        {
                            addThreadToQuickAccess(prefix, title, userId, currentThreadId, function ()
                            {
                                //change the text in the option
                                $("#quickAccessAddRemove td:first").text("הסר מגישה מהירה");
                                $("#quickAccessAddRemove td:eq(1) span").attr("class", "mdi").addClass("mdi-bookmark-remove");
                                //show the user the quick access window
                                openQuickAccess();
                                //close the menu
                                toggleManageThreadDropdown(false);
                            })
                        })
                    }
                }
            });

            //toggle tracking thread
            $("#toggleTrackThread").click(function ()
            {
                if (checkThreadExistsTrackList(currentThreadId)) //thread in list, remove
                {
                    removeThreadFromTrackList(currentThreadId);
                    $("#toggleTrackThread td:first").text("קבל התראות מאשכול זה");
                }
                else //add thread to list
                {
                    //mark loading
                    $("#toggleTrackThread td:eq(1) span").attr("class", "mdi").addClass("mdi-dots-horizontal");

                    getLastCommentDataForThreadById(currentThreadId, function (data)
                    {
                        addThreadToTrackList(currentThreadId, prefix, title, data.comments, data.lastCommentor);
                        $("#toggleTrackThread td:first").text("כבה התראות מאשכול זה");
                        $("#toggleTrackThread td:eq(1) span").attr("class", "mdi").addClass("mdi-comment-alert");

                        var imgUrl = chrome.extension.getURL("images/confirm.svg");


                        var dontTrackYourselfBox = $("<div>").append(
                            $("<div>").text("הפעלת מעקב אחרי אשכול ששייך לך, ולכן תיתכן התנגשות בין ההתראות של התוסף וההתראות של FxP לאשכול זה.")
                        ).append(
                            $("<div>").text("מומלץ שלא לעקוב אחרי אשכולות שאתה כבר מקבל מהם התראות.")
                            ).append(
                            $("<div>").append(
                                $("<div>", { class: "niceButton redBtn" }).text("בטל מעקב").click(function ()
                                {
                                    removeThreadFromTrackList(currentThreadId);
                                    $("#toggleTrackThread td:first").text("קבל התראות מאשכול זה");
                                    removePopupWindow("dontTrackYourself");
                                })
                            ).append(
                                $("<div>", { class: "niceButton thinBtn" }).text("עקוב בכל זאת").click(function ()
                                {
                                    removePopupWindow("dontTrackYourself");
                                })
                                )
                            );

                        //just make sure afterwards that its not the user's own thread
                        if ($(".postbit:first .postcounter").text() == "#1")
                        {
                            var userId = getUserIdFromLink($(".postbit:first a.username").attr("href"));
                            if (getMyUserId() == userId)
                            {
                                openPopupWindow("dontTrackYourself",
                                    imgUrl,
                                    "שים לב!",
                                    dontTrackYourselfBox, "alertTopPopup");
                            }
                        }
                        else
                        {
                            //the first comment is not the OP, need to search for the correct id
                            getAuthorIdByThreadId(currentThreadId, function (userId)
                            {
                                if (getMyUserId() == userId)
                                {
                                    openPopupWindow("dontTrackYourself",
                                        imgUrl,
                                        "שים לב!",
                                        dontTrackYourselfBox, "alertTopPopup");
                                }
                            })
                        }
                    });
                }
            });
        }


        //show read time for threads in news forums, which includes front page
        if (settings.readtime.newsForums)
        {
            debug.info("readtime.newsForums is enabled");
            $(".images_sik").each(function ()
            {
                $(this).css("position", "relative");
                $(this).append($("<div>", { class: "thumbnailReadtime mdi mdi-clock" }).text("מחשב..."));
                $(this).addClass("readTimeThumbnail");
                pushToReadTimeQueue($(this).find(".thumbnailReadtime"), $(this).parents("a").attr("href"), false);
            })
            if (getForumName().indexOf("עדכוני") > -1) //an updates forum, by the forum title
            {
                $("#threads .threadbit").each(function () //add every thread (that is not stickied) to the readtime queue
                {
                    $(this).find(".threadstatus").append($("<div>", { class: "readTimeThreadbit" }).text("...")); //push the container for the time
                    pushToReadTimeQueue($(this).find(".readTimeThreadbit"), $(this).find(".title").attr("href"), true); //calculate readtime
                });
            }
        }

        //thread readtime calculation by prefix
        if (settings.readtime.activePrefixes.length > 0)
        {
            $(".threadbit").each(function ()
            {
                var threadPrefix = $(this).find(".prefix").text().trim(); //get the prefix of a thread

                for (var i = 0; i < settings.readtime.activePrefixes.length; i++) //for each of the active prefixes
                {
                    if (threadPrefix.indexOf(settings.readtime.activePrefixes[i]) > -1) //thread has a tracked prefix
                    {
                        $(this).find(".threadstatus").append($("<div>", { class: "readTimeThreadbit" }).text("...")); //push the container for the time
                        pushToReadTimeQueue($(this).find(".readTimeThreadbit"), $(this).find(".title").attr("href"), true); //calculate readtime
                    }
                }
            });
        }

        //filter threads by user
        if (settings.threadFilters.users.length > 0)
        {
            debug.info("threadFilters.users is enabled");

            var stickyFilter = ""; //filters the threads to include only non-sticky, or all
            if (!settings.threadFilters.filterSticky)
                stickyFilter = ".nonsticky ";

            settings.threadFilters.users.forEach(function (filter) //for each filter
            {
                $(stickyFilter + ".author a[href*='member.php?u=" + filter.id + "'").parents(".threadbit").each(function () //select all the threads of the filtered user
                {
                    filterThread(filter, $(this)); //filter the user's threads
                });
            })
        }

        //filter threads by keywords
        if (settings.threadFilters.keywords.length > 0)
        {
            debug.info("threadFilters.keywords is enabled");

            var stickyFilter = ""; //filters the threads to include only non-sticky, or all
            if (!settings.threadFilters.filterSticky)
                stickyFilter = ".nonsticky ";

            settings.threadFilters.keywords.forEach(function (filter) //for each filter
            {
                $(stickyFilter + ".threadtitle").parents(".threadbit").each(function () //select all the threads
                {
                    filterThread(filter, $(this)); //filter the threads by keywords
                });
            })
        }

        //comment filters
        if (settings.commentFilters.length > 0)
        {
            debug.info("commentFilters is enabled");

            var userPostbits;
            settings.commentFilters.forEach(function (filter) //go over all filters
            {
                userPostbits = $(".postbit a.username[href$='u=" + filter.id + "']").parents(".postbit"); //all the postbits of the user

                applyCommentsFilter(filter, userPostbits);
            })
        }

        //bind click on subnick to change it
        $(".postbit .usertitle").click(function () { quickEditSubnick($(this)) }).attr("data-balloon", "לחץ כדי לערוך").attr("data-balloon-pos", "left").addClass("balloonNoBorder");

        //background notifications
        if (settings.backgroundNotifications)
        {
            var totalNotifications = 0;
            var noti;
            $(".noticount").each(function ()
            {
                noti = parseInt($(this).text());
                if (isNaN(noti))
                    noti = 0;
                totalNotifications += noti;
            })

            chrome.runtime.sendMessage({ updateBadge: totalNotifications }); //update the badge
        }


        var styleWrapper; //element to wrap around the text that has the styles

        //custom style to comments
        if (settings.customDefaultStyle.active)
        {
            var styleElements = [];
            var styleProp = settings.customDefaultStyle;

            var noFontsPage = //true if the page's editor does not allow fonts
                window.location.href.indexOf("member.php") > -1 ||
                window.location.href.indexOf("converse.php") > -1 ||
                window.location.href.indexOf("visitormessage.php") > -1;

            //build the elements according to the style
            if (styleProp.color != "#333333") //disable if the color is the default color
            {
                styleElements.push($("<span>", { style: "color:" + styleProp.color }));
            }
            if (styleProp.size != 2) //disable if the size is the default size
            {
                styleElements.push($("<font>", { size: styleProp.size }));
            }
            if (styleProp.underline)
            {
                styleElements.push($("<u>"));
            }
            if (styleProp.italic)
            {
                styleElements.push($("<em>"));
            }
            if (styleProp.bold)
            {
                styleElements.push($("<strong>"));
            }
            if (styleProp.font != "Arial" && !noFontsPage) //disable if default font or a page with no fonts enabled
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
        }

        //observer to new text, to wrap with style
        observers.insideEditor = new MutationObserver(function (mutations)
        {
            mutations.forEach(function (mutation)
            {
                if (mutation.addedNodes.length > 0)
                {
                    if (mutation.addedNodes[0].nodeName == "#text")
                    {
                        //new text node, wrap with the style
                        $(mutation.addedNodes[0]).wrap(styleWrapper);
                        fixCaret(mutation.addedNodes[0]); //move the caret to the end of the text element
                        debug.info("editor style applied");
                    }
                }
            })
        });

        //mutation to track when the iframe editor is added
        observers.texteditor = new MutationObserver(function (mutations)
        {
            mutations.forEach(function (mutation)
            {
                if (mutation.addedNodes.length > 0)
                    if (settings.customDefaultStyle.active || settings.classicIcons)
                    {
                        var addedJ = $(mutation.addedNodes[0]);
                        if (addedJ.parents(".cke_contents").length > 0 && mutation.addedNodes[0].tagName == "IFRAME") //editor iframe added
                        {
                            debug.info("binding to new editor div");
                            var editorFrame = addedJ;
                            var qtnts = editorFrame.contents();

                            //bind observer for new children (text)
                            if (qtnts.length > 0) //the contents are available, iframe loaded
                            {
                                setTimeout(function () //give things a chance to load (looking at you, firefox.)
                                {
                                    if (editorFrame.contents().find("body.forum, body.content").length > 0)
                                    {
                                        if (settings.customDefaultStyle.active)
                                        {
                                            observers.insideEditor.observe(editorFrame.contents().find("body.forum, body.content")[0], { childList: true });
                                        }
                                        if (settings.classicIcons)
                                        {
                                            addStyle(buildOldIconsStylesheet(), "oldIcons", editorFrame.contents().find("head")[0]);
                                        }
                                    }
                                    else
                                        bindEditorFrameLoad(editorFrame, settings);
                                }, 100);
                            }
                            else //iframe not loaded yet
                                bindEditorFrameLoad(editorFrame, settings);
                        }
                    }
            })
        });

        if ($(".cke_contents iframe").length > 0) //iframe is accessible, observer won't catch it
        {
            var editorFrame = $(".cke_contents iframe");
            var qtnts = editorFrame.contents();

            //bind observer for new children (text)
            if (qtnts.length > 0) //the contents are available, iframe loaded
            {
                if (settings.customDefaultStyle.active)
                    observers.insideEditor.observe(editorFrame.contents().find("body")[0], { childList: true });
                if (settings.classicIcons)
                    addStyle(buildOldIconsStylesheet(), "oldIcons", editorFrame.contents().find("head")[0]);
            }
            else //iframe not loaded yet
                editorFrame.load(function ()
                {
                    if (settings.customDefaultStyle.active)
                        observers.insideEditor.observe($(this).contents().find("body")[0], { childList: true });
                    if (settings.classicIcons)
                        addStyle(buildOldIconsStylesheet(), "oldIcons", $(this).contents().find("head")[0]);
                })
        }
        //observe new iframes that might appear if the user quotes
        if ($(".editor_textbox").length > 0)
            observers.texteditor.observe($(".editor_textbox")[0], { childList: true, subtree: true });

        //apply the observer for styling also to the quick comment minimal editor, if possible
        if (settings.customDefaultStyle.active && settings.customDefaultStyle.activeQuickComment)
        {
            if ($(".chat-text-input .send-element div#input-textarea").length > 0)
                observers.insideEditor.observe($(".chat-text-input .send-element div#input-textarea")[0], { childList: true });
        }

        //shortcut to toggle night mode
        if (settings.nightmodeShortcut)
        {
            var img;
            var balloonText;
            if (localStorage.getItem("nightmodeEnabled") == "true")
            {
                img = chrome.extension.getURL("images/nightmode-on.svg");
                balloonText = "כבה מצב לילה";
            }
            else
            {
                img = chrome.extension.getURL("images/nightmode-off.svg");
                balloonText = "הפעל מצב לילה";
            }
            $("body").append(
                $("<div>", { id: "nightmodeShortcut", class: "balloonNoBorder", style: "background-image: url(" + img + ")", "data-balloon": balloonText, "data-balloon-pos": "left" })
                );

            //toggle night mode
            $("#nightmodeShortcut").click(function ()
            {
                var state = localStorage.getItem("nightmodeEnabled") === "true";
                localStorage.setItem("nightmodeEnabled", !state);

                if (state)
                    disableNightmode();
                else
                    activateNightmode();

                localStorage.setItem("nightmodeOverride", true); //prevent auto nightmode to change the mode

                chrome.runtime.sendMessage({ nightmodeState: !state, ttl: 1});
            })
        }

        //auto night mode enabled
        if (settings.autoNightmode.active)
        {
            debug.info("autoNightmode is enabled");
            var lastChange = localStorage.getItem("lastAutoNightChange");

            var rangeActive = false;
            var minutesStart = timeInMinutes(settings.autoNightmode.start);
            var minutesEnd = timeInMinutes(settings.autoNightmode.end);

            var d = new Date();
            //get the current time in minutes since midnight
            var minutesCurrent = d.getHours() * 60 + d.getMinutes();

            //check if the current time is in range
            if (minutesEnd < minutesStart) //time overflows to next day
                rangeActive = minutesStart <= minutesCurrent || minutesCurrent < minutesEnd;
            else
                rangeActive = minutesCurrent <= minutesCurrent && minutesCurrent < minutesEnd;

            if (lastChange == "night") //was changed to night last change
            {
                if (!rangeActive) //no longer night time
                {
                    localStorage.setItem("nightmodeEnabled", false);
                    disableNightmode();
                    localStorage.setItem("lastAutoNightChange", "day");
                }
            }
            else //was changed to day last change
            {
                if (rangeActive) //it is night time
                {
                    localStorage.setItem("nightmodeEnabled", true);
                    activateNightmode();
                    localStorage.setItem("lastAutoNightChange", "night");
                }
            }
        }

        //hide typing from other users
        if (settings.disableLiveTyping)
        {
            debug.info("disableLiveTyping is enabled");
            injectScript("js/disable_typing.js");
        }

        //add easy credit to signature
        if (window.location.href.search("editsignature") > -1 || window.location.href.search("updatesignature") > -1)
        {
            var publishedThreadUrl = "https://www.fxp.co.il/showthread.php?t=16859147";
            debug.info("adding signature credit buttons");
            var element = $("<div>", { id: "creditAddon" }).append(
                    $("<div>").text(" שתף את הכיף!™ והוסף קרדיט לתוסף +FxPlus בחתימה שלך:")
                ).append(
                    $("<div>", { class: "addCreditBtn", id: "addXLimg" }).append(
                        $("<img>", { src: "http://signavatar.com/47618_s.jpg" })
                    ).append(
                        $("<span>", { class: "addCreditDesc" }).text("500x276 (מתחלף)")
                    ).click(function() {
                        $(".cke_contents iframe").contents().find("body").append(
                                $("<a>", { href: publishedThreadUrl, target: "_blank" }).append(
                                    $("<img>", { border: 0, src: $(this).find("img").attr("src") })
                                )
                            )
                    })
                ).append(
                    $("<div>", { class: "addCreditBtn", id: "addLimg" }).append(
                        $("<img>", { src: "http://i.imgur.com/bsVtJ5o.png" })
                    ).append(
                        $("<span>", { class: "addCreditDesc" }).text("128x128")
                    ).click(function() {
                        $(".cke_contents iframe").contents().find("body").append(
                                $("<a>", { href: publishedThreadUrl, target: "_blank" }).append(
                                    $("<img>", { border: 0, src: $(this).find("img").attr("src") })
                                )
                            )
                    })
                ).append(
                    $("<div>", { class: "addCreditBtn", id: "addMimg" }).append(
                        $("<img>", { src: "http://i.imgur.com/O7FsbY8.png" })
                    ).append(
                        $("<span>", { class: "addCreditDesc" }).text("48x48")
                    ).click(function() {
                        $(".cke_contents iframe").contents().find("body").append(
                                $("<a>", { href: publishedThreadUrl, target: "_blank" }).append(
                                    $("<img>", { border: 0, src: $(this).find("img").attr("src") })
                                )
                            )
                    })
                ).append(
                    $("<div>", { class: "addCreditBtn", id: "addTextCredit" }).append(
                        $("<span>", { class: "addCreditDesc" }).text("טקסט")
                    ).click(function() {
                        $(".cke_contents iframe").contents().find("body").append(
                                $("<a>", { href: publishedThreadUrl, target: "_blank" }).text("+FxPlus")
                            )
                    })
                )
            $('form[action*="signature"] .editor_smiliebox').before(element);
        }

        $(".cats.hi5 .ct[title='אירוחים כללי']").click(function () { eyesPopup(); });

        //custom user notes
        chrome.storage.local.get("userNotes", function (data)
        {
            var notes = data.userNotes || defaultNotes;
            if (window.location.href.indexOf("member.php") > -1) //on a user's page
            {
                var currentProfileId = getUserIdInProfile();

                //add tab
                var tabParent = $("#userprof_content_container .tabslight");
                var sampleTab = tabParent.find(".userprof_module:first").clone();
                sampleTab.attr("class", "userprof_moduleinactive");
                sampleTab.find("a")
                    .attr("id", "usernotes-tab")
                    .attr("href", "#usernotes-content")
                    .text("הערות");
                sampleTab.appendTo(tabParent);

                //add tab content
                $("#userprof_content_container .profile_content.userprof").append(
                    $("<div>", { id: "view-usernotes-content", class: "view_section" }).append(
                        $("<h4>", { class: "subsectionhead userprof_title" }).text("הערות")
                    ).append(
                        $("<textarea>", { class: "userNotesEditor", "data-user": currentProfileId }).on('input selectionchange propertychange', function ()
                        {
                            userNotesEditorSaveChanges($(this), parseInt($(this).attr("data-user")));
                        }).each(function ()
                        {
                            //set the content to the user's note
                            var editor = $(this);
                            getNoteByUserId(currentProfileId, function (noteText)
                            {
                                editor.val(noteText);
                            })
                        })
                        ).append(
                        $("<span>").text("הערות שיכתבו כאן ישמרו רק עבור דפדפן זה.")
                    )
                )

            }
        });
        


        handleRatingSuggestion();

        setTimeout(function ()
        {
            if ($("#bottomCard").css("display") == "none") //card not shown, 5 seconds since page is ready
                cardSlideSteps($("#bottomCard"));
        }, 5000);


        var endDate = new Date();
        var elapsed = endDate.getTime() - beginDate.getTime();

        $("#footer_copyright").append($("<div>", { id: "bottomfxplusplusstats" }).append(
                $("<div>").text("FxPlus+ @ " + chrome.runtime.getManifest().version)
            ).append(
                $("<div>").text("+FxPlus שיפר את דף זה תוך " + elapsed + "ms")
            ));

        $(window).on('load', function ()
        {
            if ($(".signaturecontainer img[src='clear.gif']").length == 0) //there are no images in signatures that can change their src
            {
                if (observers.hasOwnProperty("signatures"))
                {
                    debug.notice("signature mutation observers disconnected");
                    observers.signatures.disconnect(); //disconnect signature observer
                }
            }

            if ($("#bottomCard").css("display") == "none") //card not shown, page loaded
                cardSlideSteps($("#bottomCard"));
        })
    })
})



//receive night mode state changes
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse)
    {
        if (request.hasOwnProperty("nightmodeState"))
        {
            if (request.nightmodeState)
                activateNightmode();
            else
                disableNightmode();
        }
    }
);

//returns the pagination argument depending on how many comments there are
function getPagination(comments)
{
    if (comments > 15)
        return "&page=" + Math.ceil(comments / 15);
    else
        return "";
}

//handler for key combinations
function keyPress(e)
{
    var evtobj = window.event ? event : e

    if (evtobj.keyCode == 81 && evtobj.altKey || evtobj.keyCode == 191 && evtobj.altKey)
    { //check for key combination ALT+Q and activate quick access, 191 for macs.

        openQuickAccess();
    }
}
document.onkeydown = keyPress;

//opens the quick access menu if its closed. If its open - closes it
function openQuickAccess()
{
    if (!removePopupWindow("quickAccess")) //remove window if present, if not, add it
    {
        //get the unread comments of each thread
        chrome.storage.sync.get("settings", function (data2)
        {
            //update the settings
            settings = data2.settings;

            chrome.storage.local.get("threadComments", function (data)
            {
                var threadComments = data.threadComments || [];

                var imgUrl = chrome.extension.getURL("images/mouse.svg");

                var content = $("<div>");
                content.append($("<div>").text("אשכולות ששמרת ואשכולות שעקבת אחריהם יופיעו כאן."));

                var threadList = $("<div>", { class: "quickThreadList" });
                //add threads
                for (var i = 0; i < settings.quickAccessThreads.length; i++)
                {
                    threadList.append(
                        $("<div>", { class: "miniQuickThread", id: "mqt_" + settings.quickAccessThreads[i].threadId }).append(
                            $("<div>", { style: "display: flex;" }).append(
                                $("<span>", { class: "mdi mdi-email-open qMsgIcon" })
                            ).append(
                                $("<div>").append(
                                $("<a>", { class: "qTitle", href: fxpDomain + "showthread.php?t=" + settings.quickAccessThreads[i].threadId }).append(
                                        $("<span>").text(settings.quickAccessThreads[i].prefix + " ")
                                    ).append(
                                        $("<b>").text(settings.quickAccessThreads[i].title)
                                        )
                                ).append(
                                    $("<a>", { class: "qAuthor", href: fxpDomain + "member.php?u=" + settings.quickAccessThreads[i].authorId })
                                        .text("...").each(function ()
                                        {
                                            var e = $(this); //update user id
                                            userNameById(settings.quickAccessThreads[i].authorId, function (name)
                                            {
                                                e.text(name);
                                            });
                                        })
                                    )
                                )
                        ).append(
                            $("<div>", { class: "deleteQuickThread" }).append(
                                $("<span>", { class: "mdi mdi-delete" }).click(function ()
                                {
                                    //remove quick access thread
                                    var parent = $(this).parents(".miniQuickThread");
                                    var id = parseInt(parent.attr("id").substr(4)); //structure mqt_XXX
                                    removeThreadFromQuickAccess(id, function ()
                                    {
                                        parent.slideUp(300, function () //slide up and remove
                                        {
                                            $(this).remove();
                                        })
                                    });
                                })
                            )
                            )
                    );
                }


                var commentNum;
                for (var i = 0; i < settings.trackedThreads.list.length; i++)
                {
                    threadList.append(
                        $("<div>", { class: "miniQuickThread", id: "mtt_" + settings.trackedThreads.list[i].threadId }).append(
                            $("<div>", { style: "display: flex;" }).append(
                                $("<span>", { class: "mdi mdi-comment-alert qMsgIcon" })
                            ).append(
                                $("<div>").append(
                                    $("<a>", { class: "qTitle", href: fxpDomain + "showthread.php?t=" + settings.trackedThreads.list[i].threadId + getPagination(settings.trackedThreads.list[i].totalComments) }).append(
                                        $("<span>").text(settings.trackedThreads.list[i].prefix + " ")
                                    ).append(
                                        $("<b>").text(settings.trackedThreads.list[i].title)
                                        )
                                ).append(
                                    $("<span>", { class: "qUnread" })
                                        .text("0 הודעות חדשות").each(function ()
                                        {
                                            commentNum = 0; //search for the comment number
                                            for (var j = 0; j < threadComments.length; j++)
                                            {
                                                if (threadComments[j].id == settings.trackedThreads.list[i].threadId)
                                                {
                                                    commentNum = settings.trackedThreads.list[i].totalComments - threadComments[j].comments;

                                                    if (commentNum < 0)
                                                    {
                                                        //there have been new comments since the last check for new comments
                                                        //the user may have entered the thread before the check interval had been run

                                                        //update the comment number
                                                        settings.trackedThreads.list[i].totalComments = threadComments[j].comments;
                                                        chrome.storage.sync.set({ "settings": settings });
                                                        debug.info("corrected tracked thread number");
                                                        commentNum = 0;
                                                    }
                                                    break;
                                                }
                                            }

                                            //update text
                                            if (commentNum == 1)
                                                $(this).text("תגובה חדשה אחת");
                                            else
                                                $(this).text(commentNum + " תגובות חדשות");

                                            if (commentNum > 0)
                                                $(this).addClass("newCommentsTracked");
                                        })
                                    )
                                )
                        ).append(
                            $("<div>", { class: "deleteTrackedThread" }).append(
                                $("<span>", { class: "mdi mdi-message-bulleted-off" }).click(function ()
                                {
                                    //remove quick access thread
                                    var parent = $(this).parents(".miniQuickThread");
                                    var id = parseInt(parent.attr("id").substr(4)); //structure mtt_XXX
                                    removeThreadFromTrackList(id, function ()
                                    {
                                        parent.slideUp(300, function () //slide up and remove
                                        {
                                            $(this).remove();
                                        })
                                    });
                                })
                            )
                            )
                    );
                }

                content.append(threadList);

                if (settings.trackedThreads.list.length > 0)
                {
                    var timeDiff = new Date() - settings.trackedThreads.lastRefreshTime;
                    content.append(
                        $("<div>", { class: "timeSinceUpdateTracker" }).append(
                            $("<span>").text("מספר התגובות עודכן לפני " + getTimeStr(timeDiff) + ", והוא מתעדכן אוטומטית כל ")
                        ).append(
                            $("<select>", { class: "borderelssSelect", id: "setTrackedThreadsRefresh" }).append(
                                $("<option>", { value: 5 }).text("5 דקות")
                            ).append(
                                $("<option>", { value: 15 }).text("15 דקות")
                                ).append(
                                $("<option>", { value: 30 }).text("30 דקות")
                                ).append(
                                $("<option>", { value: 60 }).text("שעה")
                                ).append(
                                $("<option>", { value: 180 }).text("3 שעות")
                                ).append(
                                $("<option>", { value: 30 }).text("5 שעות")
                                ).append(
                                $("<option>", { value: 720 }).text("12 שעות")
                                )
                            )
                    );

                    content.find("#setTrackedThreadsRefresh").val(settings.trackedThreads.refreshRate).change(function ()
                    {
                        //change the refresh rate
                        changeTrackedThreadsRefresh(parseInt($(this).val()));
                    });
                }

                openPopupWindow("quickAccess",
                    imgUrl,
                    $("<div>").text("גישה מהירה").append($("<div>", { class: "subtitle" }).text("[ALT+Q]")),
                    content, "greenTopPopup");
            });
        });

        
    }
}

//resize signature bigger than 295px
function resizeSignature(j_signatureElement)
{
    if (j_signatureElement.css("display") == "none") //don't process hidden signatures
        return;

    //reset style, in case this signature was already processed
    j_signatureElement.css({
        "height": "auto",
        "transform": "scale(1,1)"
    });
    j_signatureElement.attr("title", "");
    j_signatureElement.parents(".signature").css({
        "overflow": "visible",
        "height": "auto"
    });
    var signHeight = j_signatureElement.height();
    if (signHeight > 295)
    {
        var outByScale = 295 / signHeight;
        j_signatureElement.css({
            "transform-origin": "top",
            "transform": "scale(" + outByScale + ", " + outByScale + ")"
        });
        j_signatureElement.parents(".signature").css({
            "overflow": "hidden",
            "height": "295px"
        });
        j_signatureElement.attr("title", "חתימה זו הוקטנה באופן אוטומטי."); //show that this has been shrinked
        debug.print("signature resized");
    }
}

//get the number of days since the thread was commented in (at least 3)
function getDaysSinceComment(threadlistItem)
{
    var dateElement = threadlistItem.find(".threadlastpost").find("dd:eq(1)"); //finds the element in which the date is in
    var date = dateElement.text().match(/[0-9]{2}-[0-9]{2}-[0-9]{4}/g); //get the date from structure DD-MM-YYYY
    if (date == null)
        return 3;
    else
    {
        date = date[0].split("-"); //split to day, month, and year
        var nowDate = new Date(); //get the date right now
        var daysSince = 0;
        daysSince += (nowDate.getDate() - date[0]); //calculate days difference
        daysSince += (nowDate.getMonth() + 1 - date[1]) * 30; //calculate months difference
        daysSince += (nowDate.getFullYear() - date[2]) * 365; //calculate years difference

        return daysSince;
    }
}

//returns the most frequent entry/entries in the array in array form
function mostFrequent(arr)
{
    if (arr.length == 0)
        return {
            mostFrequent: [],
            count: 0
        }
    else
    {
        var frequencies = {},
            mostFrequent = [],
            mostFrequentCount = 1;
        for (var i = 0; i < arr.length; i++)
        {
            if (frequencies[arr[i]] == null)
                frequencies[arr[i]] = 1;
            else
                frequencies[arr[i]]++;
            if (frequencies[arr[i]] > mostFrequentCount)
            {
                mostFrequent = [arr[i]];
                mostFrequentCount = frequencies[arr[i]];
            }
            else if (frequencies[arr[i]] == mostFrequentCount)
            {
                mostFrequent.push(arr[i]);
            }
        }
        return {
            mostFrequent: mostFrequent,
            count: mostFrequentCount
        }
    }
}

//loads a minithread at the given element
function loadMinithread(threadLink, element, pm)
{
    var fullUrl = fxpDomain + threadLink;

    //get the thread
    httpGetAsync(fullUrl, function (response)
    {
        var doc = $(domParser.parseFromString(response, "text/html"));

        element.empty().css("background-image", "none"); //remove loading background
        element.append($("<div>", { class: "commentsContainer" }));
        var comments = element.find(".commentsContainer");

        if (doc.find(".postbit").length == 0)
        {
            comments.append(
                $("<div>", { class: "miniComment" })
                .text("לא נמצאו תגובות! ייתכן שהתוכן שאתה מנסה לגשת אליו הוסר.")
                )
        }
        else
        {
            //deal with polls
            doc.find("#pollinfo").each(function ()
            {
                var polltitle = $(this).find(".polltitle").text().trim();
                //user voted on the poll
                var options = [];
                var name, votes;
                var totalVotes = 0;
                //find the options and add to the array

                //user did not vote on poll, get stats by results url
                if ($(this).find("#polloptions li").length > 0)
                {
                    var resultsHref = fxpDomain + $(this).find("a[href*='&do=showresults']").attr("href");
                    httpGetAsync(resultsHref, function (response)
                    {
                        var doc = $(domParser.parseFromString(response, "text/html"));
                        doc.find("#pollresults li").each(function ()
                        {
                            if ($(this).find("p").text().length > 0) //if there is a name
                            {
                                options.push({
                                    name: $(this).find("p").text().trim(),
                                    votes: parseInt($(this).find(".numvotes").text()),
                                    bars: $(this).find(".pollbarwrapper")
                                });
                                totalVotes += parseInt($(this).find(".numvotes").text());
                            }
                        });
                        comments.prepend(buildMiniPoll(polltitle, options, totalVotes, false));
                        comments.find(".minipoll").slideDown();
                    });
                }
                else
                {
                    //all of the stats are available, collect and display
                    $(this).find("#pollresults li").each(function ()
                    {
                        if ($(this).find("p").text().length > 0) //if there is a name
                        {
                            options.push({
                                name: $(this).find("p").text().trim(),
                                votes: parseInt($(this).find(".numvotes").text()),
                                bars: $(this).find(".pollbarwrapper")
                            });
                            totalVotes += parseInt($(this).find(".numvotes").text());
                        }
                    });
                    comments.prepend(buildMiniPoll(polltitle, options, totalVotes, true));
                    comments.find(".minipoll").slideDown();
                }
               
            });
            doc.find(".postbit").each(function () //process each thread comment
            {
                var content = $(this).find(".content");
                var author = $(this).find(".username").text().trim();
                var likes = parseInt($(this).find(".countlike").text());
                var link;
                if ($(this).find(".postcounter").length == 0) //no comment id, default to the thread url (mainly for PMs)
                    link = fullUrl;
                else
                    link = fxpDomain + $(this).find(".postcounter").attr("href");

                //fix for twitter embeds
                content.find(".twitter-tweet a").each(function ()
                {
                    $(this).text($(this).attr("href"));
                })

                //fix for voice comments
                content.find(".voice_recorder").each(function ()
                {
                    $(this).find("audio").attr("controls", true);
                    $(this).find(".fxpplayer").remove();
                })

                //fix for lazy image loading
                content.find("img[data-src]").each(function ()
                {
                    $(this).attr("src", $(this).attr("data-src"));
                    $(this).removeAttr("data-src");
                    $(this).removeClass("lazy");
                });

                var comment = buildMiniComment(author, content, likes, link);
                //add comments to new element
                comments.append(comment);
            });
            //link to quick comment at the end of the comments
            if (pm) //private message
            {
                //element.addClass("flexible");
                comments.append($("<a>", {
                    href: fullUrl + "#message_form",
                    target: "_blank",
                    class: "miniComment endingComment"
                }).text("השב"));
            }
            else
            {
                if (doc.find(".pagination").length > 0)
                { //multiple pages
                    comments.append($("<a>", {
                        href: fullUrl + "#quick_reply",
                        target: "_blank",
                        class: "miniComment endingComment balloonNoBorder",
                        "data-balloon-pos": "up",
                        "data-balloon": "לאשכול זה יש תגובות נוספות בעמודים הבאים שלו."
                    }).text("- תגובות נוספות -"));
                }
                else
                { //1 page
                    comments.append($("<a>", {
                        href: fullUrl + "#quick_reply",
                        target: "_blank",
                        class: "miniComment endingComment balloonNoBorder",
                        "data-balloon-pos": "up",
                        "data-balloon": "התגובה מעל להודעה זו היא התגובה האחרונה באשכול זה."
                    }).text("- סוף האשכול -"));
                }
            }

        }
    });
}

//helper function that builds a comment for the loadMinithread function
function buildMiniComment(author, content, likes, link)
{
    content.find(".videoyoudiv").parent().css("width", "auto");
    content.find(".videoyoudiv").remove();

    var comment =
        $("<div>", { class: "miniComment" }).append(
            $("<a>", { class: "linkToComment", href: link, target: "_blank" }).append(
                $("<div>", { class: "miniUser" }).append(
                    $("<b>").text(author)
                )
            )
        ).append(content);

    comment.find(".miniUser").append($("<div>", { class: "userColorIndicator", style: "background-color: " + generateRandomColor(author) }));

    if (likes > 0)
    {
        var text = likes + " לייק"
        if (likes > 1)
            text += "ים";

        comment.find(".miniUser").append($("<span>", { style: "display: inline-block" }).text("(" + text + ")"));
    }
    return comment;
}

//helper function that builds a poll for the loadMinithread function
function buildMiniPoll(title, options, totalVotes, voted)
{
    var element =
        $("<div>", { class: "minipoll" }).append(
            $("<div>", {class: "minipollTitleContainer"}).append(
                $("<span>").text("סקר: ")
            ).append(
                $("<span>", { style: "font-weight: bold" }).text(title)
                )
        ).append(
            $("<ul>", { class: "minipollOptions" })
            );
    var optionsElement = element.find("ul.minipollOptions");
    var percent;
    //add options
    for (var i = 0; i < options.length; i++)
    {
        if (options[i].votes)
        {
            percent = Math.round(options[i].votes / totalVotes * 10000) / 100; //round to 2 decimal places
            optionsElement.append(
                $("<li>").append(
                    $("<div>", {class: "minipollOptionContainer"}).append(
                        $("<span>", {class: "voteOption"}).text(options[i].name)
                    ).append(
                        $("<div>", { class: "voteBar", style: "width: " + percent +"%; background-color: hsla("+i*110+", 100%, 80%, 1);" }).append(
                            $("<span>", {class: "voteCount"}).text(options[i].votes + " הצבעות (" + percent + "%)")
                        )
                    )
                )
            );
        }
        else
        {
            optionsElement.append(
                $("<li>").text(options[i].name)
            );
        }
    }

    if (!voted)
    {
        element.append($("<div>", { class: "voteStatusFooter" }).text("עוד לא הצבעת בסקר זה."));
    }

    element.hide();

    return element;
}

//returns a stylesheet that changes new icons to look like old ones
function buildOldIconsStylesheet()
{
    var styleStr = "";
    //change the element that gets the border in the smiles menu (because of box-sizing)
    styleStr += '.cke_skin_kama a.cke_smile img {border: none !important;} .cke_skin_kama a.cke_smile {border: 2px solid #eaead1 !important;}';

    for (var i = 0; i < classicIconsDict.length; i++)
    {
        styleStr += 'img[src*="' + classicIconsDict[i].old + '"] {' +
            'box-sizing: border-box;' +
            'background-image: url("' + chrome.extension.getURL(classicIconsDict[i].new) + '");' +
            'background-repeat: no-repeat;' +
            'background-position: center;' +
            'width: ' + classicIconsDict[i].width + 'px;' +
            'height: ' + classicIconsDict[i].height + 'px;' +
            'padding-left: ' + classicIconsDict[i].width + 'px;' +
            '}' +
            '#smilies ul.smilielist li div.smilie img[src*="' + classicIconsDict[i].old + '"], .editor_smiliebox ul.smiliebox li img[src*="' + classicIconsDict[i].old + '"] {' +
            'width: ' + classicIconsDict[i].width + 'px !important;' +
            'height: ' + classicIconsDict[i].height + 'px !important;' +
            '}'
            ;
    }
    return styleStr;
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

//peek to thread by envelope
function peekToThread(e, closeMethod)
{
    var pm = false;
    var threadbit = e.parents(".threadbit"); //parent thread line
    if (threadbit.length == 0) //the parent is actually a PM
    {
        threadbit = e.parents(".pmbit");
        pm = true;
    }
    var threadLink = threadbit.find(".title").attr("href");
    var threadUniqueIdentifier;
    if (threadLink == null)
    {
        debug.warning("No link for clicked thread!");
        threadLink = "showthread.php?t=1";
        threadUniqueIdentifier = 1;
    }
    else
    {
        threadUniqueIdentifier = threadLink.match(/=[0-9]+/g);
        if (threadUniqueIdentifier != null)
            threadUniqueIdentifier = threadUniqueIdentifier[0].substr(1); //remove =
    }
    var id = "mini" + threadUniqueIdentifier;
    if ($("#" + id).length > 0)
    {
        $("#" + id).slideUp(400, function ()
        {
            $(this).remove();
        });
    }
    else
    {
        if (pm)
        {
            e.parents(".pmbit").after($("<li>", { class: "pmbit minithread", id: id }).append(loadingElement));
            e.parents(".pmbit").find(".unread").removeClass("unread"); //remove unread marker
            e.attr("src", "//images.fxp.co.il/images_new/statusicon/pm_old.png"); //change to old message icon
        }
        else
            e.parents(".threadbit").after($("<li>", { class: "threadbit minithread", id: id }).append(loadingElement));
        loadMinithread(threadLink, $("#" + id), pm);
        $("#" + id).hide().slideDown(400);
        //if (settings.peekCloseMethod != "double")
        if (closeMethod != "double")
        { //close on mouseleave
            $("#" + id).mouseleave(function ()
            {
                $(this).slideUp(400, function ()
                {
                    $(this).remove();
                });
            });
        }
    }

}

//generate a "random" (bright) color from a seed
function generateRandomColor(seed)
{
    if (typeof seed === 'string') //deal with string seeds
        seed = stringToNumber(seed);

    var h = Math.floor((Math.abs(Math.cos(seed / 2 * 3) * 3600)) % 3600) / 10;
    var s = (Math.floor((Math.abs(Math.cos(seed / 2 * 3) * 800)) % 800) + 200) / 10;
    var l = (Math.floor((Math.abs(Math.cos(seed / 2 * 3) * 500)) % 500) + 300) / 10;
    return "hsl(" + h + "," + s + "%," + l + "%)"
}

//convert a string to an arbitrary number
function stringToNumber(str)
{
    var num = 0;
    for (var i = 0; i < str.length; i++)
    {
        num += str.charCodeAt(i);
    }
    return num;
}

//adds a <style> tag with the given css rule
function addStyle(style, specialId, container)
{
    var css = document.createElement('style'); //create element
    css.type = 'text/css';

    if (css.styleSheet) css.styleSheet.cssText = style; //insert the style to the element
    else css.appendChild(document.createTextNode(style));

    if (specialId)
        css.id = specialId;

    if (container)
        container.appendChild(css); //append element to container
    else
        document.getElementsByTagName("head")[0].appendChild(css); //append element to head
}

//safely injects a script to the head
function injectScript(filename)
{
    var s = $("<script>", { type: "text/javascript", src: chrome.extension.getURL(filename) });
    //This is SAFE, since only web_accessible_resources which are part of the addon can be run.
    $("head").append(s);
}

//change the count of comments
function updateThreadCommentCount(threadId, comments)
{
    //track only if thread is not ignored by user
    if (checkTrackThreadUnread(threadId))
    {
        localStorage.setItem("tempTcount", JSON.stringify({ id: threadId, comments: comments })); //store the value in localstorage if the browser does not complete operation
        chrome.storage.local.get("threadComments", function (data)
        {
            var threadComments = data.threadComments || [];
            if (!isNaN(threadId))
            {
                for (var i = 0; i < threadComments.length; i++)
                {
                    if (threadComments[i].id == threadId) //remove thread if it's already been tracked
                        threadComments.splice(i, 1);
                }
                var threadTrack = {
                    id: threadId,
                    comments: comments
                }
                threadComments.unshift(threadTrack); //add the thread to the beginning of the tracked threads list
                var threadLimit = 300;
                while (threadComments.length > threadLimit) //limit number of trackers
                {
                    debug.print("threw away " + threadComments[threadComments.length - 1].id);
                    threadComments.pop();
                }
                debug.big("thread " + threadId + " count " + comments);
                chrome.storage.local.set({ "threadComments": threadComments }, function ()
                {
                    localStorage.removeItem("tempTcount"); //can remove temporary variable, changes were applied.
                });
            }
            else
            {
                debug.warning("the thread id is not a number!");
                localStorage.removeItem("tempTcount");
            }
        })
    }
}

//handle temporary variable of updateThreadCommentCount
var tempTcount = localStorage.getItem("tempTcount");
if (tempTcount != null)
{
    tempTcount = JSON.parse(tempTcount);
    updateThreadCommentCount(tempTcount.id, tempTcount.comments);
    debug.warning("used localstorage tempTcount - operation not complete last session.");
}

//gets a thread's id from a showthread.php?t=XXXXXXXXX address
function getThreadIdFromLink(link)
{
    if (!link)
        return NaN;
    var id = link.match(/t=[0-9]+/g); //match t=XXXX
    if (id == null)
        return NaN;
    else
        return parseInt(id[0].substr(2)); //remove t= and return
}

//gets a users's id from a member.php?u=XXXXXXXXX address
function getUserIdFromLink(link)
{
    if (!link)
        return NaN;
    var id = link.match(/u=[0-9]+/g); //match u=XXXX
    if (id == null)
        return NaN;
    else
        return parseInt(id[0].substr(2)); //remove u= and return
}

//returns the id of the user who uses the extension
function getMyUserId()
{
    return getUserIdFromLink($(".logedintop .log_in6 a").attr("href"));
}

//gets the number of comments of a threadbit element
function getThreadbitComments(threadbit)
{
    return parseInt(threadbit.find(".threadstats > li:eq(0)").text().replace(regex.notNumber, ""));
}

//gets the number of views of a threadbit element
function getThreadbitViews(threadbit)
{
    return parseInt(threadbit.find(".threadstats > li:eq(1)").text().replace(regex.notNumber, ""));
}

//returns if the track should be tracked for its comments
function checkTrackThreadUnread(threadId)
{
    //get threads that should not be tracked
    var noTrackThreads = JSON.parse(localStorage.getItem("noTrackThreads")) || [];
    //check if the thread should be ignored
    for (var i = 0; i < noTrackThreads.length; i++)
    {
        if (noTrackThreads[i] == threadId)
            return false;
    }
    return true;
}

//changes a thread's tracking status
function setTrackThreadUnread(threadId, track)
{
    var noTrackThreads = JSON.parse(localStorage.getItem("noTrackThreads")) || [];

    //remove the thread from the dnt list
    for (var i = 0; i < noTrackThreads.length; i++)
    {
        if (noTrackThreads[i] == threadId)
            noTrackThreads.splice(i, 1);
    }

    //add the thread back if it should still not be tracked
    if (!track)
    {
        noTrackThreads.push(threadId);
    }

    //apply changes
    localStorage.setItem("noTrackThreads", JSON.stringify(noTrackThreads));
}

//adds a "x new comments" tag to threads with new comments
function checkNewComments(threadbit)
{
    chrome.storage.local.get("threadComments", function (data)
    {
        var threadComments = data.threadComments || [];

        var id = getThreadIdFromLink(threadbit.find(".title").attr("href")); //get the id of the thread
        var commentNum = -1;

        //add tag if thread should be tracked
        if (checkTrackThreadUnread(id))
        {
            //search for the thread in storage
            for (var i = 0; i < threadComments.length; i++)
            {
                if (threadComments[i].id == id)
                {
                    commentNum = threadComments[i].comments;
                    break;
                }
            }
            if (commentNum > -1) //comments have been tracked and found
            {
                var commentDifference = getThreadbitComments(threadbit) - commentNum;
                if (commentDifference > 0) //there are new comments
                {
                    tagNewComments(threadbit, commentDifference);
                }
            }
        }
    });
}

//adds a new comments tag to threadbits that have them
function tagNewComments(threadbit, num)
{
    var balloonText = "יש ";
    if (num == 1)
        balloonText += "תגובה אחת חדשה ";
    else
        balloonText += num + " תגובות חדשות ";
    balloonText += "שלא קראת באשכול זה.\nלחץ כדי לסמן כנקרא."


    threadbit.find(".title").after( //add new comments indicator
        $("<span>", {
            class: "newCommentsIndicator balloonNoBorder",
            "data-balloon-pos": "left",
            "data-balloon": balloonText,
            "data-balloon-length": "medium"
        }).text("(" + num + ")").click(function () { removeNewCommentTag($(this)) })
    );
}

//returns the number of comments that are read in a thread
function getCommentsReadCountOfThread(id, callback)
{
    chrome.storage.local.get("threadComments", function (data)
    {
        var threadComments = data.threadComments || [];
        var commentNum = -1;

        //search for the thread in storage
        for (var i = 0; i < threadComments.length; i++)
        {
            if (threadComments[i].id == id)
            {
                commentNum = threadComments[i].comments;
                break;
            }
        }
        callback(commentNum);
    });
}

//remove the new comments in brackets
function removeNewCommentTag(tagElement)
{
    var threadbit = tagElement.parents(".threadbit");
    var comments = getThreadbitComments(threadbit);
    var id = getThreadIdFromLink(threadbit.find(".title").attr("href"));
    updateThreadCommentCount(id, comments);
    tagElement.slideUp(300, function ()
    {
        tagElement.remove();
    })
}

//compares the comment given with the number of read comments already tracked, and updates accordingly
function compareReadCommentsWithLast(threadId, lastIndex)
{
    chrome.storage.local.get("threadComments", function (data)
    {
        var threadComments = data.threadComments || [];
        var knownComments = -1;
        for (var i = 0; i < threadComments.length; i++) //search for the thread in the storage
        {
            if (threadComments[i].id == threadId)
            {
                knownComments = threadComments[i].comments;
                break;
            }
        }
        if (knownComments < lastIndex - 1) //there are more comments read than tracked comments
        {
            updateThreadCommentCount(threadId, lastIndex - 1); //update the number of comments to the actual number
            debug.notice("updated comment num " + threadId + " to " + (lastIndex - 1));
        }
        else
        {
            debug.print("index is good!");
        }
    });
}

//returns how many read comments there are for a thread
function getReadComments(threadId, callback)
{
    chrome.storage.local.get("threadComments", function (data)
    {
        var threadComments = data.threadComments || [];
        //search for the thread in storage
        var commentNum = -1;
        for (var i = 0; i < threadComments.length; i++)
        {
            if (threadComments[i].id == threadId)
            {
                commentNum = threadComments[i].comments;
                break;
            }
        }
        callback(commentNum);
    });
}

//returns how many comments there are in a thread
function getLastCommentDataForThreadById(threadId, callback)
{
    //url of the last page (fxp automatically redirects, assuming there are no more than 999999 pages)
    var fullUrl = fxpDomain + "showthread.php?t=" + threadId + "&page=999999";

    //get the thread
    httpGetAsync(fullUrl, function (response)
    {
        var doc = $(domParser.parseFromString(response, "text/html"));

        var commentCount = parseInt(doc.find(".postbit:last .postcounter").text().substr(1)) - 1; //extract the number of comments from the index of the last post
        var last = doc.find(".postbit:last .username").text().trim();
        callback({
            comments: commentCount,
            lastCommentor: last
        });
    });
}


//calculates the time in minutes it would take to read a thread's first comment
function calcThreadReadTime(threadLink, callback)
{
    var fullUrl = fxpDomain + threadLink;

    //get the thread
    httpGetAsync(fullUrl, function (response)
    {
        var doc = $(domParser.parseFromString(response, "text/html"));
        var txt = doc.find(".postbit:first .content").text();
        if (txt.length == 0)
        {
            callback(-1);
        }
        else
        {
            var endIndex = txt.indexOf("יש לכם שאלות? רוצים לדעת עוד? בואו לפורום"); //articles end with this specific phrase, stop the word count here, no one is going to read this

            if (endIndex > 10) //cut the length if needed
                txt = txt.substr(0, endIndex);

            //count the full words
            var words = txt.match(regex.fullWord);
            if (words == null)
                words = 1;
            else
                words = words.length;

            var readTime = words / readTimeSpeed;
            callback(readTime);
        }
    });
}

//format the readtime to minutes or seconds
function formatReadTime(time, short)
{
    if (short)
    {
        if (time < 1) //less than a minute
        {
            time = Math.round(time * 60);
            if (time == 0)
                return (">1 שנ'");
            else
                return (time + " שנ'");
        }
        else
        {
            time = Math.round(time * 10) / 10; //round to 1 decimal digit
            return (time + " דק'");
        }
    }
    else
    {
        if (time < 1) //less than a minute
        {
            time = Math.round(time * 60);
            if (time == 0)
                return (">1 שניות");
            else
                return (time + " שניות");
        }
        else
        {
            time = Math.round(time * 10) / 10; //round to 1 decimal digit
            return (time + " דקות");
        }
    }
}

var readTimeQueue = []; //queue for thread elements to calculate the read time for
var readTimeQueueBusy = false;

var readTimeKnown = [];
chrome.storage.local.get("readTimeKnown", function (data)
{
    readTimeKnown = data.readTimeKnown || [];
})

//add to known read times
function newKnownTime(threadId, time)
{
    var thread = {
        id: threadId,
        time: time
    }
    readTimeKnown.unshift(thread);
    var threadLimit = 200;
    while (readTimeKnown.length > threadLimit) //limit number of trackers
    {
        debug.print("threw away " + readTimeKnown[readTimeKnown.length - 1].id + " readtime");
        readTimeKnown.pop();
    }
    chrome.storage.local.set({ "readTimeKnown": readTimeKnown });
}

//push to the queue
function pushToReadTimeQueue(textElement, threadLink, short)
{
    readTimeQueue.push({ element: textElement, link: threadLink, short: short }); //add to queue
    runReadTimeQueue(); //make the queue run
}

//run the queue
function runReadTimeQueue()
{
    if (!readTimeQueueBusy)
    {
        readTimeQueueBusy = true;
        var turn = readTimeQueue[0]; //select the first on queue
        var threadId = getThreadIdFromLink(turn.link);
        var knownTime = -1;
        for (var i = 0; i < readTimeKnown.length && knownTime == -1; i++) //search for the thread's id in the known read times
        {
            if (readTimeKnown[i].id == threadId)
                knownTime = readTimeKnown[i].time;
        }
        if (knownTime > -1) //thread is known
        {
            turn.element.text(formatReadTime(knownTime, turn.short));

            readTimeQueue.shift(); //remove the first element from the queue
            readTimeQueueBusy = false;
            if (readTimeQueue.length > 0)
            {
                runReadTimeQueue(); //automatically run the next iteration if the queue is full
            }
        }
        else //thread is not known
        {
            calcThreadReadTime(turn.link, function (time) //calculate the time
            {
                turn.element.text(formatReadTime(time, turn.short)); //display the time
                newKnownTime(threadId, time); //add time to known times
                readTimeQueue.shift(); //remove the first element from the queue
                readTimeQueueBusy = false;
                if (readTimeQueue.length > 0)
                {
                    setTimeout(runReadTimeQueue, 250); //automatically run the next iteration if the queue is full
                }
            });
        }

    }
}

//returns the name of the forum of the current page
function getForumName()
{
    var name = $(".pagetitle .ntitle").text().trim(); //try by forum thread list title
    if (name == "")
    {
        $("#breadcrumb .navbit a[href*='?f=']:last").text().trim(); //try by breadcrumb navigation tree
    }
    return name;
}

//returns if the filter is active based on  forum
function filterActiveByForum(filter, forumName)
{
    forumName = forumName.toLowerCase(); //change forum name to lowercase to ignore case sensitivity

    var activeFilter = false;
    if (filter.type == "everyForum") //filter, forum does not matter
        activeFilter = true;
    else
    {
        if (filter.type == "notForum")
            activeFilter = true;
        for (var i = 0; i < filter.forums.length; i++)
        {
            if (filter.forums[i].length > 0)
                if (forumName.indexOf(filter.forums[i].toLowerCase()) > -1) //found the current forum in the forum list
                {
                    if (filter.type == "notForum") //the rule is except the forum
                    {
                        activeFilter = false;
                    }
                    else //the rule is only the forum
                    {
                        activeFilter = true;
                    }
                    break;
                }
        }
    }
    return activeFilter;
}

//returns if the thread is an exception according to the given filter
function threadHasException(filter, threadElement)
{
    var exception = false;
    var threadTitle = threadElement.find(".threadtitle").text().trim().toLowerCase(); //change title to lowercase to ignore case sensitivity
    for (var i = 0; i < filter.exception.length; i++)
    {
        if (filter.exception[i].length > 0)
            if (threadTitle.indexOf(filter.exception[i].toLowerCase()) > -1) //exception in the title
            {
                exception = true;
                break;
            }
    }
    return exception;
}

//apply a style to the thread given if conditions of filter are met
function filterThread(filter, threadElement)
{
    var basicFilterPass = false;
    var addClass = "yellowMarkedThread";
    if (filter.words != undefined) //filter by words
    {
        addClass = "blueTitleThread";
        var threadTitle = threadElement.find(".threadtitle").text().trim();
        for (var i = 0; i < filter.words.length; i++)
        {
            if (filter.words[i].length > 0)
                if (threadTitle.indexOf(filter.words[i]) > -1) //found the word in the title
                {
                    debug.info("filter " + filter.words[i]);
                    basicFilterPass = true;
                    break;
                }
        }
    }
    else if (filter.id != undefined) //filter by id
    {
        addClass = "yellowMarkedThread";
        var userId = getUserIdFromLink(threadElement.find(".author a").attr("href"));
        basicFilterPass = (filter.id == userId); //the user fits the filter
    }

    if (basicFilterPass)
        if (filterActiveByForum(filter, getForumName())) //the forum fits the filter
            if (!threadHasException(filter, threadElement)) //the thread does not fit the exception filter
            {
                //passed all conditions
                if (filter.action == "bold")
                {
                    threadElement.removeClass("hideThread").addClass("boldThread");
                    threadElement.addClass(addClass);
                }
                else
                {
                    if (!threadElement.hasClass("boldThread")) //prefer to bold threads
                        threadElement.addClass("hideThread");
                }
            }
}

//go over all filters for the specific thread
function checkAllFilters(userFilters, keywordFilters, threadElement)
{
    userFilters.forEach(function (filter)
    {
        filterThread(filter, threadElement);
    });
    keywordFilters.forEach(function (filter)
    {
        filterThread(filter, threadElement);
    })
}

//returns true if the string given is a url
function isURL(str)
{
    var pattern = /(https?:\/\/[^\s]+)/g;
    return pattern.test(str);
}

//disables the style of QUOTES of users
function disableStyleInComments(userId)
{
    if (globalKnownIds[userId] != undefined)
    {
        var username = globalKnownIds[userId]; //get the username from the id
        $(".quote_container .bbcode_postedby").each(function ()
        {
            var quotedName = $(this).text().trim().substr("פורסם במקור על ידי ".length); //cut the text before the quote
            if (quotedName == username)
            {
                $(this).parents(".quote_container").find(".message").find("span, u, i, b, font").contents().unwrap(); //remove all style elements
            }
        })
    }
}

//updates the known ids with a new id
function updateKnownIds(id, name)
{
    debug.notice("updated known id: " + id + "=" + name);
    globalKnownIds[id] = name;
    chrome.storage.local.set({ "knownIds": globalKnownIds });
}

//get a user name from user ID
function userNameById(id, callback)
{
    if (id != "" && id != 0)
    {
        if (globalKnownIds[id] == undefined)
        { //user's name is not already known
            httpGetAsync("https://www.fxp.co.il/member.php?u=" + id, function (response)
            { //request user's page
                var doc = $(domParser.parseFromString(response, "text/html"));
                var userName = doc.find("#userinfo .member_username").text().trim()
                if (userName.length > 0)
                { //found user's name
                    debug.print("new user in memory: " + userName + "#" + id);
                    globalKnownIds[id] = userName;
                    chrome.storage.local.set({ "knownIds": globalKnownIds }); //store new name
                    if (typeof callback === "function")
                        callback(userName);
                }
                else
                { //did not find name, user probably does not exist
                    debug.warning("failed to find name by id: " + id);
                    if (typeof callback === "function")
                        callback(null);
                }
            });
        }
        else
        {
            if (typeof callback === "function")
                callback(globalKnownIds[id]);
        }
    }
    else
        if (typeof callback === "function")
            callback(null);
}

//hides a comment that can be opened when clicking the userbar
function hideComment(comment)
{
    comment.addClass("hiddenPostbit");
    comment.find(".postbody").hide();

    comment.find(".userinfo").click(function ()
    {
        var parentCmnt = $(this).parents(".postbit");
        if (parentCmnt.hasClass("active"))
        {
            parentCmnt.find(".postbody").slideUp(400);
            parentCmnt.removeClass("active");
        }
        else
        {
            parentCmnt.find(".postbody").slideDown(400);
            parentCmnt.addClass("active");
        }
    })
}

//applies the filter given to the postbits
function applyCommentsFilter(filter, userPostbits)
{
    if (filter.subnick.value.length > 0) //a subnick is set
    {
        var subnickContainer = userPostbits.find(".usertitle");
        setSubnickContainer(filter.subnick, subnickContainer);
    }

    if (filter.hideSignature)
    {
        userPostbits.find(".signaturecontainer").hide();
        userPostbits.find(".signature").css("height", "auto");
    }
    if (filter.disableStyle)
    {
        userPostbits.find(".postcontent").find("span, u, i, b, font").contents().unwrap(); //remove all style elements
        disableStyleInComments(filter.id);
    }
    if (filter.hideComments)
        hideComment(userPostbits);
}

//applies a filter to a userbar - in FXP's chat system
function applyCommentFilterInChat(filter, chatTitle)
{
    if (filter.subnick.value.length > 0) //a subnick is set
    {
        var subnickContainer = chatTitle.find(".user-title");
        setSubnickContainer(filter.subnick, subnickContainer);
    }

    //the rest is irrelevant for this kind of container
}

//sets the content of the subnick container
function setSubnickContainer(subnick, subnickContainer)
{
    if (isURL(subnick.value)) //if it's a url, place as an image/video, not text
    {
        subnickContainer.empty()
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

//checks and calls to apply filters to a comment
function checkCommentFilter(commentFilters, commentElement)
{
    var userId = getUserIdFromLink(commentElement.find(".username").attr("href")); //get the comment user's id
    for (var i = 0; i < commentFilters.length; i++)
    {
        if (commentFilters[i].id == userId) //match in filters
        {
            applyCommentsFilter(commentFilters[i], commentElement);
        }
    }
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

//updates the storage to the new subnick. returns the settings with the changes
function updateSubnick(userId, subnick)
{
    chrome.storage.sync.get("settings", function (data)
    {
        settings = data.settings; //update to the newest settings

        var createNew = true;
        for (var i = 0; i < settings.commentFilters.length && createNew; i++)
        {
            if (settings.commentFilters[i].id == userId) //the user is already on record, update the values
            {
                settings.commentFilters[i].subnick = subnick;
                createNew = false;
            }
        }

        if (createNew) //create a new entry
        {
            settings.commentFilters.push(
                {
                    id: userId,
                    subnick: subnick,
                    hideSignature: false,
                    disableStyle: false,
                    hideComments: false
                })
        }

        chrome.storage.sync.set({ "settings": settings });
    })
}

//edit a subnick quickly by opening a textbox where the subnick is
function quickEditSubnick(subnickElement)
{
    var postbit = subnickElement.parents(".postbit");

    subnickElement.find("a").each(function ()
    {
        $(this).parents(".usertitle").attr("style", $(this).attr("style"));
        $(this).removeAttr("href").contents().unwrap();
    });

    var prevNick = subnickElement.text().trim();
    if (prevNick.length == 0) //try to find an image if can't find text
    {
        prevNick = subnickElement.find("img").attr("src") ? subnickElement.find("img").attr("src") : "";
    }
    var color = subnickElement.css("color");
    var size = subnickElement.css("font-size");
    var innerReference = subnickElement.find("*"); //find inner place for reference of color in case of special sub nick
    if (innerReference.length > 0)
    { //have the correct color and size if has special sub nick
        color = innerReference.css("color");
        size = innerReference.css("font-size");
    }

    color = convertRgbToHex(color);

    debug.print(color + " " + size);

    subnickElement.hide().after(
        $("<input>", { class: "quickSubnickInput", style: "color: " + color + "; font-size: " + size + "; width: " + subnickElement.width() + "px;", placeholder: prevNick })
        )
    postbit.find(".quickSubnickInput").focus();

    postbit.find(".quickSubnickInput").focusout(function ()
    {
        if ($(this).val().length > 0)
        {
            var userId = getUserIdFromLink($(this).parents(".postbit").find(".username").attr("href")); //get the comment user's id
            var userName = $(this).parents(".postbit").find(".username").text().trim();
            var subnick = {
                value: $(this).val(),
                color: convertRgbToHex($(this).css("color")),
                size: parseInt($(this).css("font-size"))
            }
            debug.print(subnick);
            updateSubnick(userId, subnick);
            updateKnownIds(userId, userName);
            setSubnickContainer(subnick, $(this).parents(".postbit").find(".usertitle"));
        }
        $(this).parents(".postbit").find(".usertitle").show();
        $(this).remove();
    }).on('keydown', function (e)
    {
        if (e.which === 13) //enter key
        {
            $(this).focusout();
            return false; //dont submit
        }
    });
}

//returns the height of elements, even if their display is none
function getActualHeight(element)
{
    // find the closest visible parent and get it's hidden children
    var visibleParent = element.closest(':visible').children(),
        height;

    visibleParent.addClass('temp-show');
    height = element.height();
    visibleParent.removeClass('temp-show');

    return height;
}

//changes the badge in the browser navbar
function changeBadge(str)
{
    str = "" + str; //make sure it's a string
    chrome.browserAction.setBadgeText({ text: str });
}


//returns the deepest child of the element
function getDeepestChild(element)
{
    if (element.children().length == 0)
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

//force activates night mode
function activateNightmode()
{
    //remove previous stylesheets
    $("style#customBg, link#nightmodeStyle").remove();
    //add nightmode stylesheet
    $("body").append($("<link>", { id: "nightmodeStyle", rel: "stylesheet", href: chrome.extension.getURL("css/nightmode.css") }));

    //custom background handler
    if (settings.customBg.night.length > 0)
    {
        var bgStyle = "body { background: url('" + settings.customBg.night + "') #000 }";
        addStyle(bgStyle, "customBg");
    }

    //change shortcut logo
    $("#nightmodeShortcut").css({
        "background-image": "url(" + chrome.extension.getURL("images/nightmode-on.svg") + ")"
    }).attr("data-balloon", "כבה מצב לילה");

    $("body").addClass("nightmodeActive");
}

//force disables night mode
function disableNightmode()
{
    //remove previous stylesheets
    $("style#customBg, link#nightmodeStyle").remove();

    //custom background handler
    if (settings.customBg.day.length > 0)
    {
        var bgStyle = "body { background: url('" + settings.customBg.day + "') }";
        addStyle(bgStyle, "customBg");
    }

    //change shortcut logo
    $("#nightmodeShortcut").css({
        "background-image": "url(" + chrome.extension.getURL("images/nightmode-off.svg") + ")"
    }).attr("data-balloon", "הפעל מצב לילה");

    $("body").removeClass("nightmodeActive");
}

//binds the load events for ckeeditor iframes
function bindEditorFrameLoad(editorFrame, settings)
{
    debug.print(editorFrame);
    editorFrame.load(function ()
    {
        debug.print("FRAME LOADED...");
        if (settings.customDefaultStyle.active)
        {
            observers.insideEditor.observe($(this).contents().find("body")[0], { childList: true });
        }
        if (settings.classicIcons)
            addStyle(buildOldIconsStylesheet(), "oldIcons", $(this).contents().find("head")[0]);
    });

    debug.print(editorFrame[0].contentDocument.readyState);
    if (editorFrame[0].contentDocument.readyState == 'complete')
    {
        debug.print("already complete");
        editorFrame.load();
    }
}

var saveNotesTimeout;
//saves the changes made in the notes'
function userNotesEditorSaveChanges(editor, id)
{
    if (saveNotesTimeout) window.clearTimeout(saveNotesTimeout);
    //debounce of 0.8secs for the saving
    saveNotesTimeout = setTimeout(function ()
    {
        //always use the latest and greatest notes
        chrome.storage.local.get("userNotes", function (data)
        {
            var notes = data.userNotes || defaultNotes;
            for (var i = 0; i < notes.length; i++)
            {
                if (notes[i].id == id) //remove dupes
                {
                    debug.print("removing:");
                    debug.print(notes[i]);
                    notes.splice(i, 1);
                    break;
                }
            }
            //add the note to the beginning of the note list
            notes.unshift({ id: id, content: editor.val() });
            chrome.storage.local.set({ "userNotes": notes }, function () { debug.info("saved note"); }); //save
        });
    }, 800);
}

//returns the text of a note for a user
function getNoteByUserId(id, callback)
{
    var foundNote = false;
    chrome.storage.local.get("userNotes", function (data)
    {
        var notes = data.userNotes || defaultNotes;
        for (var i = 0; i < notes.length && !foundNote; i++) //search for the note
        {
            if (notes[i].id == id)
            {
                callback(notes[i].content);
                foundNote = true;
            }
        }
        if (!foundNote)
            callback("");

    });

}

//returns the id from the viewed profile. only works on member.php pages
function getUserIdInProfile()
{
    var userLinkElement = $("a[href*='userid='"); //look for a URL with the user's id
    return userLinkElement.attr("href").match(/userid=[0-9]+/g)[0].substr("userid=".length); //extract the ID from the url
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

    debug.info("caret moved");
}

//fixes the ordering of minithreads so each minithread appears below its parent
function fixMinithreadOrdring()
{
    var threadId, parent, scrollPos;
    $(".minithread").each(function ()
    {
        //get the thread's id by cutting off the prefix (miniXXXXX)
        threadId = $(this).attr("id").substr("mini".length);
        scrollPos = this.scrollTop; //store the scroll position so it doesn't change while the element moves
        //place after the matching thread (if it's still present)
        parent = $(".threadbit#thread_" + threadId);
        
        if (parent.length > 0)
            if (parent.index() != $(this).index() - 1) //check if reordering is really necessary
                $(this).insertAfter(parent)[0].scrollTop = scrollPos;
    });
}


//returns a dictionary with [value: count] pairs, sorted in descending order
function getDupeSortedDictionary(arr)
{
    var counts = {}; //count each one
    for (var i = 0; i < arr.length; i++)
    {
        counts[arr[i]] = (counts[arr[i]] || 0) + 1;
    }

    var sortedArr = []; //add all properties to an array
    for (var prop in counts)
    {
        sortedArr.push({ value: prop, count: counts[prop] });
    }
    sortedArr.sort(function (a, b) //sort the array according to the counts or alphabetically
    {
        if (b.count == a.count)
        {
            if (b.value < a.value)
                return 1;
            else if (b.value > a.value)
                return -1;
            else
                return 0;
        }
        else
            return b.count - a.count;
    }); 
    return sortedArr;
}

//returns the id of a thread's author by its id
function getAuthorIdByThreadId(id, callback)
{
    var fullUrl = fxpDomain + "showthread.php?t=" + id;

    //get the thread
    httpGetAsync(fullUrl, function (response)
    {
        var doc = $(domParser.parseFromString(response, "text/html"));

        var userId = getUserIdFromLink(doc.find(".postbit:first a.username").attr("href"));
        callback(userId);
    });
}

//add a thread to quick access
function addThreadToQuickAccess(prefix, title, author, id, callback)
{
    chrome.storage.sync.get("settings", function (data)
    {
        settings = data.settings; //update to the newest settings

        var t = { prefix: prefix, title: title, authorId: author, threadId: id };

        //remove dupes
        for (var i = 0; i < settings.quickAccessThreads.length; i++)
        {
            if (settings.quickAccessThreads[i].threadId == id)
            {
                settings.quickAccessThreads.splice(i, 1); //remove dupe
                i--;
            }
        }

        //push new thread
        settings.quickAccessThreads.push(t);
        //save
        chrome.storage.sync.set({ "settings": settings }, function ()
        {
            if (typeof callback === "function")
                callback();
        });
    });
}

//check if a thread exists in quick access
function checkThreadExistsQuickAccess(id)
{
    for (var i = 0; i < settings.quickAccessThreads.length; i++)
    {
        if (settings.quickAccessThreads[i].threadId == id)
        {
            return true; //thread exists
        }
    }
    return false;
}

//update the title of the thread if it was changed
function updateQuickAccessTitle(prefix, title, id)
{
    chrome.storage.sync.get("settings", function (data)
    {
        settings = data.settings; //update to the newest settings

        var changed = false;

        //search and update 
        for (var i = 0; i < settings.quickAccessThreads.length && !changed; i++)
        {
            if (settings.quickAccessThreads[i].threadId == id)
            {
                //update titles
                if (settings.quickAccessThreads[i].prefix != prefix)
                {
                    settings.quickAccessThreads[i].prefix = prefix;
                    changed = true;
                }
                if (settings.quickAccessThreads[i].title != title)
                {
                    settings.quickAccessThreads[i].title = title;
                    changed = true;
                }
            }
        }

        //save if something changed
        if (changed)
        {
            chrome.storage.sync.set({ "settings": settings });
            debug.info("updated thread's title in quick access");
        }
    });
}

//remove a thread from quick access
function removeThreadFromQuickAccess(id, callback)
{
    chrome.storage.sync.get("settings", function (data)
    {
        settings = data.settings; //update to the newest settings

        //remove 
        for (var i = 0; i < settings.quickAccessThreads.length; i++)
        {
            if (settings.quickAccessThreads[i].threadId == id)
            {
                settings.quickAccessThreads.splice(i, 1); //remove dupe
                i--;
            }
        }

        //save
        chrome.storage.sync.set({ "settings": settings }, function ()
        {
            if (typeof callback === "function")
                callback();
        });
    });
}

//adds a thread to the track list
function addThreadToTrackList(id, prefix, title, comments, lastCommentor)
{
    chrome.storage.sync.get("settings", function (data)
    {
        settings = data.settings; //update to the newest settings

        //remove dupes
        for (var i = 0; i < settings.trackedThreads.list.length; i++)
        {
            if (settings.trackedThreads.list[i].threadId == id)
            {
                settings.trackedThreads.list.splice(i, 1); //remove dupe
                i--;
            }
        }

        //push new thread
        settings.trackedThreads.list.push({
            threadId: id,
            prefix: prefix,
            title: title,
            totalComments: comments,
            lastCommentor: lastCommentor
        });
        //save
        chrome.storage.sync.set({ "settings": settings });
    });
}

//check if a thread exists in the tracking list
function checkThreadExistsTrackList(id)
{
    for (var i = 0; i < settings.trackedThreads.list.length; i++)
    {
        if (settings.trackedThreads.list[i].threadId == id)
        {
            return true; //thread exists
        }
    }
    return false;
}

//remove a thread from tracking list
function removeThreadFromTrackList(id, callback)
{
    chrome.storage.sync.get("settings", function (data)
    {
        settings = data.settings; //update to the newest settings

        //remove 
        for (var i = 0; i < settings.trackedThreads.list.length; i++)
        {
            if (settings.trackedThreads.list[i].threadId == id)
            {
                settings.trackedThreads.list.splice(i, 1); //remove dupe
                i--;
            }
        }

        //save
        chrome.storage.sync.set({ "settings": settings }, function ()
        {
            if (typeof callback === "function")
                callback();
        });
    });
}

//changes the refresh rate of tracked threads
function changeTrackedThreadsRefresh(refresh)
{
    chrome.storage.sync.get("settings", function (data2)
    {
        var uptodateSettings = data2.settings || {};
        uptodateSettings.trackedThreads.refreshRate = refresh;
        chrome.storage.sync.set({ "settings": uptodateSettings });
    })
}


//popup that opens once the eye is clicked
function eyesPopup()
{
    openPopupWindow("infrontofeyes",
        chrome.extension.getURL("images/omelette.svg"),
        "זה היה מול העיניים שלי כל הזמן הזה...",
        "watch?v=De4c9SkMNDA", "orangeTopPopup");
}

//replaces time strings (HH:MM) with time in seconds from midnight
function timeInSeconds(timeStr)
{
    if (!timeStr)
        return 0;
    var parts = timeStr.split(":");
    var hours = parseInt(parts[0]);
    var minutes = parseInt(parts[1]);

    return (hours * 60 * 60) + (minutes * 60);
}

//replaces time strings (HH:MM) with time in minutes from midnight
function timeInMinutes(timeStr)
{
    if (!timeStr)
        return 0;
    var parts = timeStr.split(":");
    var hours = parseInt(parts[0]);
    var minutes = parseInt(parts[1]);

    return (hours * 60) + (minutes);
}

//toggles the manage thread topdown that appears next to titles
function toggleManageThreadDropdown(open)
{
    if (open)
    {
        $(".manageThreadDropdown .dropdownLContent").slideDown(200);
        $(".manageThreadPP").addClass("opened");
    }
    else
    {
        $(".manageThreadDropdown .dropdownLContent").slideUp(200);
        $(".manageThreadPP").removeClass("opened");
    }
}

//returns true if the manage thread dropdown is opened
function getManageThreadDropdownOpened()
{
    return $(".manageThreadDropdown .dropdownLContent").css("display") != "none";
}

//slides a card up from the bottom of the screen, shows only the title and shortly afterwards the rest of the card
function cardSlideSteps(cardElement)
{
    cardElement.css({
        "margin-bottom": "-100%",
        "transition": "0.6s cubic-bezier(0.23, 1, 0.32, 1)"
    });

    cardElement.show(); //show the card for a split moment just to get the heights
    var cardHeight = cardElement.outerHeight();
    var titleHeight = cardElement.find(".cardTop").outerHeight();
    cardElement.hide();

    debug.info("showing card in steps");
    //hide the card from below
    cardElement.css("margin-bottom", (-1 * cardHeight) + "px");
    fixSpaceChat();
    cardElement.show(); //make element visible, (but still under the screen)
    var delay = 1000;
    if (titleHeight == 0) //remove delay if there is no title
        delay = 0;

    //show card title
    fixSpaceChat();
    cardElement.css("margin-bottom", (-1 * cardHeight + titleHeight) + "px");
    setTimeout(function ()
    {
        //show whole card
        fixSpaceChat();
        cardElement.css({
            "margin-bottom": "0"
            //"transition": "0.6s cubic-bezier(0.075, 0.82, 0.165, 1)"
        });

        if (cardElement.find(".progressBg.shortAutoClose").length > 0)
        {
            var closeAfterMs = parseInt(cardElement.find(".progressBg.shortAutoClose").attr("data-closeAfter"));
            cardElement.find(".progressBg.shortAutoClose").css({
                "transition": (closeAfterMs / 1000) + "s width linear",
                "width": "100%"
            });
            setTimeout(function ()
            {
                var completeAction = cardElement.find(".progressBg.shortAutoClose").attr("data-completeAction");

                if (completeAction == "updateVersion")
                {
                    changeNotificationValue("lastKnownVersion", chrome.runtime.getManifest().version);
                    if (cardElement.find(".progressBg.shortAutoClose").length > 0)
                        chrome.runtime.sendMessage({ event: { cat: "Popup", type: "Close Update Auto" } });
                }
                closeBottomCard();
            }, closeAfterMs)
        }
    }, delay)
}

//closes the bottom card 
function closeBottomCard()
{
    //slide out
    $("#bottomCard").css({
        "transition": "0.2s ease-in",
        "margin-bottom": (-1 * $("#bottomCard").outerHeight()) + "px"
    })
    //remove after slide out
    setTimeout(function ()
    {
        $("#bottomCard").remove();
    }, 210);
}

//decides if to show the rate message
function handleRatingSuggestion()
{
    chrome.storage.local.get("notificationStorage", function (data)
    {
        chrome.storage.sync.get(["backupDataRestored", "backupData"], function (data2)
        {
            var notificationStorage = data.notificationStorage;
            var d = new Date();
            var versionNew = chrome.runtime.getManifest().version;

            var backupDataRestored = data2.backupDataRestored || false; //data was already restored
            var backupData = data2.backupData || []; //the data

            if (notificationStorage == null || notificationStorage == undefined || !notificationStorage) //reset to default if variable does not exist
            {
                notificationStorage = {
                    welcome: false,
                    rateSuggest: false,
                    lastKnownVersion: chrome.runtime.getManifest().version,
                    installTime: d.getTime()
                };
                if (backupData.length > 0 && !backupDataRestored) //there is data from previous versions, force to show update
                {
                    notificationStorage.welcome = true;
                    notificationStorage.rateSuggest = true;
                    notificationStorage.lastKnownVersion = "0.0.0";
                }

                chrome.storage.local.set({ "notificationStorage": notificationStorage });
            }

            if (!notificationStorage.welcome)
            {
                var welcomeCardContent = $("<div>", { class: "cardContent" }).append(
                    $("<span>").text("תודה על שהורדת את +FxPlus!")
                ).append($("<br>")).append(
                    $("<span>", { style: "font-weight: bold" }).text("כדי לפתוח את הגדרות התוסף, לחץ על כפתור גלגל השיניים בבר העליון.")
                ).append(
                    $("<img>", { id: "howToSettingsImg", src: chrome.extension.getURL("images/howtoSettings.png"), height: 44 })
                );

                $("body").append($("<div>", { class: "bottomFloat" }).append(
                    $("<div>", { id: "bottomCard", style: "display: none" }).append(
                        $("<div>", { class: "cardTop" }).append($("<div>", { class: "cardTitle" }).text("ברוכים הבאים!"))
                    ).append(welcomeCardContent.append(
                            $("<div>", { class: "closeBtn" }).text("סגור").click(function ()
                            {
                                changeNotificationValue("welcome", true);
                                closeBottomCard();
                                chrome.runtime.sendMessage({ event: { cat: "Popup", type: "Close Welcome" } });
                            })
                        ))
                    )
                );
            }
            else if (versionNew != notificationStorage.lastKnownVersion)
            {
                if (versionBig) //version deserves big notification
                {
                    var updateContent = $("<div>", { class: "cardContent" }).append(
                                $("<div>", { class: "quotedHeavy" }).text("”" + versionDescription + "”")
                            ).append(
                                $("<div>", { class: "quotedBtw" }).text("(מידע נוסף על עדכוני גרסה מופיע בבלוג של התוסף)")
                            );


                    $("body").append($("<div>", { class: "bottomFloat" }).append(
                        $("<div>", { id: "bottomCard", style: "display: none" }).append(
                                $("<div>", { class: "cardTop" }).append($("<div>", { class: "progressBg", id: "updateLoader" })).append($("<div>", { class: "cardTitle" }).text("+FxPlus: עדכון " + versionNew))
                            ).append(
                                updateContent.append(
                                    $("<a>", { class: "closeBtn", target: "_blank", href: versionHref }).text("גלה מה נשתנה").click(function ()
                                    {
                                        chrome.runtime.sendMessage({ event: { cat: "Popup", type: "See changes" } });
                                    })
                                ).append(
                                    $("<div>", { class: "closeBtn" }).text("סגור").click(function ()
                                    {
                                        changeNotificationValue("lastKnownVersion", versionNew);
                                        closeBottomCard();
                                        chrome.runtime.sendMessage({ event: { cat: "Popup", type: "Close Update" } });
                                    })
                                ))
                        )
                    );

                    //restore option for old users
                    chrome.storage.sync.get(["backupDataRestored", "backupData"], function (data)
                    {
                        var backupDataRestored = data.backupDataRestored || false; //data was already restored
                        var backupData = data.backupData || []; //the data
                        if (backupData.length > 0 && !backupDataRestored) //there is data, and it was not restored
                        {
                            $("#bottomCard .cardContent").prepend(
                                $("<div>", { class: "quotedBtw" }).append(
                                    $("<a>", { href: chrome.extension.getURL("html/settings.html") + "#restoreOld", target: "_blank", style: "color: #da6600; font-weight: bold;" })
                                        .text("יש לך הגדרות מגרסה קודמת. לחץ כאן כדי לשחזר אותן.")
                                )
                            );
                        }
                    });
                }
                else
                {
                    var updateText = "+FxPlus עודכן לגרסה " + versionNew;
                    if (versionDescription.length > 0)
                        updateText += ": " + versionDescription;

                    var updateContent = $("<div>", { class: "cardContent" }).append(
                                $("<a>", { class: "quotedHeavy", target: "_blank", href: versionHref }).text(updateText)
                            )
                    $("body").append($("<div>", { class: "bottomFloat" }).append(
                        $("<div>", { id: "bottomCard", class: "smallCard", style: "display: none" }).append($("<div>", { class: "progressBg shortAutoClose", "data-completeAction": "updateVersion", "data-closeAfter": 15000 })).append(
                                updateContent.append(
                                    $("<div>", { class: "closeBtn" }).text("סגור").click(function ()
                                    {
                                        changeNotificationValue("lastKnownVersion", versionNew);
                                        closeBottomCard();
                                        chrome.runtime.sendMessage({ event: { cat: "Popup", type: "Close Update" } });
                                    })
                                ))
                        )
                    );
                }
                chrome.runtime.sendMessage({ event: { cat: "Passive", type: "Update" } });
            }
            else if (!notificationStorage.rateSuggest)
            {
                //Rating suggestion
                var installTime = notificationStorage.installTime;

                //buffer for the time, if user chooses to delay their rating
                var timeBuffer = parseInt(localStorage.getItem("ratingBuffer"));
                if (isNaN(timeBuffer))
                    timeBuffer = 0;

                var singleDay = 1000 * 60 * 60 * 24; //a single day in milliseconds
                var daysSince = Math.round((d.getTime() - installTime) / singleDay);

                //at least 5 days since install, show rating popup
                debug.print(daysSince - timeBuffer);
                if (daysSince - timeBuffer >= 5)
                {
                    localStorage.removeItem("ratingBuffer"); //remove buffer (if it even exists)

                    var ratingLink;
                    if (chrome.runtime.getManifest().browser == "firefox")
                    {
                        ratingLink = $("<a>", { style: "display: block", target: "_blank", href: "https://addons.mozilla.org/firefox/addon/fxplusplus/" }).append(
                            $("<img>", { src: chrome.extension.getURL("images/firefoxStore.png"), height: 128 })
                        );
                    }
                    else
                    {
                        ratingLink = $("<a>", { style: "display: block", target: "_blank", href: 'https://chrome.google.com/webstore/detail/fxplus%2B-beta/gpfgllaokimfkkbnhiimahpbemmdmobg/reviews' }).append(
                            $("<img>", { src: chrome.extension.getURL("images/chromeStore.png"), height: 128 })
                        );
                    }

                    var rateCardContent = $("<div>", { class: "cardContent" }).append(
                        $("<b>").text("כבר עברו " + daysSince + " ימים מאז שהורדת את התוסף +FxPlus. אני מקווה שאתה מרוצה ממנו ושהוא עמד בציפיות שלך.")
                    ).append(
                        $("<div>", { style: "margin-top: 1em" }).text("אשמח אם תדרג את התוסף בחנות. הדירוג שלך יעזור למשתמשים אחרים לגלות ולהוריד את התוסף, וזה גם אומר לי שמה שאני עושה שווה את זה.")
                    ).append(
                        ratingLink.click(function () { chrome.runtime.sendMessage({ event: { cat: "Popup", type: "Rate" } }); })
                    ).append(
                        $("<div>", { style: "margin: 0.2em 0 1em 0; font-weight: bold;" }).text("תודה!")
                    );

                    $("body").append($("<div>", { class: "bottomFloat" }).append(
                        $("<div>", { id: "bottomCard", style: "display: none" }).append(
                                $("<div>", { class: "cardTop" }).append($("<div>", { class: "cardTitle" }).text("אז.. מה דעתך?"))
                            ).append(
                                rateCardContent.append(
                                    $("<div>", { class: "closeBtn" }).text("הזכר לי מאוחר יותר").click(function ()
                                    {
                                        localStorage.setItem("ratingBuffer", daysSince - 3 + 14); //give extra 14 days
                                        closeBottomCard();
                                        chrome.runtime.sendMessage({ event: { cat: "Popup", type: "Postpone Rate" } });
                                    })
                                ).append(
                                    $("<div>", { class: "closeBtn" }).text("סגור").click(function ()
                                    {
                                        changeNotificationValue("rateSuggest", true);
                                        closeBottomCard();
                                        chrome.runtime.sendMessage({ event: { cat: "Popup", type: "Close Rate" } });
                                    })
                                ))
                        )
                    );
                }
            }
        })
    })
}

//changes the value of a notification handler
function changeNotificationValue(key, value)
{
    chrome.storage.local.get("notificationStorage", function (data)
    {
        var notificationStorage = data.notificationStorage;
        notificationStorage[key] = value;
        chrome.storage.local.set({ "notificationStorage": notificationStorage });
    });
}

//fixes space under card if cometchat is open
function fixSpaceChat()
{
    //the chat is expanded, need to add space to the bottom of the flex
    if ($("#cometchat").css("display") == "block")
    {
        $(".bottomFloat").css("bottom", "25px");
    }
    else
    {
        $(".bottomFloat").css("bottom", "0");
    }
}

//adds a window with a specific id and dims the background
function openPopupWindow(id, img, title, content, additionalClass)
{
    if ($("#popupBox").length == 0)
    {
        $("body").append($("<div>", {id: "popupBox"}));
    }

    //do not open a popup if one already exists
    if ($(".popupContainer").length == 0)
    {
        $("body").append($("<div>", { class: "dimScreen", id: "dim_" + id }).click(function ()
        {
            removePopupWindow(id);
        }));

        var popup =
            $("<div>", { class: "popupContainer", id: id }).append(
                $("<div>", { class: "popupTop" }).append(
                    $("<div>", { class: "popupImg" }).append(
                        $("<img>", { src: img })
                    )
                ).append(
                    $("<div>", { class: "popupTitle" }).append(title)
                    )
            ).append(
                $("<div>", { class: "popupBottom" }).append(content)
                );

        if (additionalClass)
            popup.addClass(additionalClass);

        $("#popupBox").append(popup);

        $("#dim_" + id).fadeIn(300, function ()
        {
            $("#" + id).show();
        });
    }
}

//removes completely a popup window
function removePopupWindow(id)
{
    if ($("#" + id).length > 0)
    {
        $("#" + id).remove();
        $("#dim_" + id).fadeOut(300, function ()
        {
            $(this).remove();
        })
        return true;
    }
    return false;
}


//returns a normal time string from time miliseconds
function getTimeStr(time)
{
    var str = "";
    var times = {
        minutes: 0,
        hours: 0,
        days: 0,
        months: 0
    }
    times.minutes += Math.floor((time / 1000 / 60) % 60);
    if (time / 1000 / 60 >= 60) //more or an hour
    {
        times.hours += Math.floor((time / 1000 / 60 / 60) % 60);
        if (time / 1000 / 60 / 60 >= 24) //more or a day
        {
            times.days += Math.floor((time / 1000 / 60 / 60 / 24) % 30);
            if (time / 1000 / 60 / 60 / 24 >= 30) //more or a month
            {
                times.months += Math.floor((time / 1000 / 60 / 60 / 24 / 30));
            }
        }
    }

    if (times.minutes == 0 || time / 1000 / 60 < 1)
    {
        str = "פחות מדקה";
    }
    else
    {
        var parts = [];
        if (times.minutes > 0)
        {
            if (times.minutes == 1) parts.push("דקה אחת");
            else parts.push(times.minutes + " דקות");
        }
        if (times.hours > 0)
        {
            if (times.hours == 1) parts.push("שעה אחת");
            else parts.push(times.hours + " שעות");
        }
        if (times.days > 0)
        {
            if (times.days == 1) parts.push("יום אחד");
            else parts.push(times.days + " ימים");
        }
        if (times.months > 0)
        {
            if (times.months == 1) parts.push("חודש אחד");
            else parts.push(times.months + " חודשים");
        }

        str += parts[0];
        for (var i = 1; i < parts.length; i++)
        {
            if (i < parts.length - 1) //not last
                str += ", ";
            else
                str += " ו-";

            str += parts[i];
        }
    }

    return str;
}