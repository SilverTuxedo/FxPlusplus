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

//helping numbers that get incremented to - used mainly for assuring different ids
var num = 0;
var num2 = 0;

var fxpDomain = "https://www.fxp.co.il/"

//if sync storage not supported, fallback to local.
chrome.storage.sync = (function ()
{
    return chrome.storage.sync ||
        chrome.storage.local;
})();

var customBg = {
    day: "",
    night: ""
}

var tipBox = [
    'אפשר להפעיל ולכבות את מצב הלילה ידנית גם כאשר מצב הלילה הוגדר באופן אוטומטי על-ידי הפעלת קיצור הדרך למצב לילה ולחיצה עליו',
    'לחיצה על מעטפת אשכול בכל מקום, כולל בחיפוש וברשימת האשכולות בפורום, תציג את האשכול בתצוגה מינימלית ללא פתיחת דף חדש',
    'ניתן להגדיר תמונה כתת-ניק: הזן את הקישור בתיבה של תת-הניק והתוסף יציג את התמונה אוטומטית',
    'חישוב זמן קריאה מחדש גם מאפס את הזמנים שכבר חושבו',
    'הסתרת תגובה? ניתן לראות אותה בחזרה על-ידי לחיצה על השורה העליונה (שמופיע בה גם שם המשתמש)',
    'עיצוב התגובות האוטומטי חל בכל מקום שניתן לעצב, כולל הודעות חברים (ללא גופן) והודעות פרטיות',
    'רוצה לדעת מה תת-הניק המקורי של משתמש מסויים? היכנס לפרופיל שלו - תת-הניק אינו משתנה שם',
    'נתקלת בטעות או שגיאה בתוסף? ניתן לדווח דרך הטפסים ב"דיווח באגים ומשוב" או בהודעה פרטית',
    'יש לך רעיון למשהו שתרצה לראות בתוסף? ניתן לספר דרך הטפסים ב"דיווח באגים ומשוב" או בהודעה פרטית',
    'המספרים שמופיעים ליד שמות המשתמשים הם המספר הסידורי של אותו המשתמש. המספר גם מופיע בכתובת הפרופיל שלו',
    'לא בטוח לגבי אותיות גדולות או קטנות בשמות משתמשים? אל דאגה - התוסף יתקן אותן בשבילך אוטומטית',
    'לחיצה על \'T\' בעריכת תת-הניק מאפשרת הגדרה ידנית של הצבע והגודל',
    'ניתן לשנות את הטקסט שמופיע בתיבה של עיצוב התגובות בלחיצה עליו',
    'לחיצה על "בטל" מבטלת את השינויים רק בקטע שערכת',
    'רוצה לדעת מה השתנה בין הגרסה הנוכחית והקודמת? השינויים נמצאים בבלוג של התוסף',
    'רוצה לדעת מתי משתחררת גרסה חדשה או הודעה חשובה? עקוב אחרי התוסף בטוויטר',
    'ביטול חישוב זמן הקריאה של כתבות מפורומי עדכונים יבטל גם את חישוב זמן הקריאה של הכתבות בדף הבית',
    'נהנה מהתוסף? תוכל להוסיף לו קרדיט בקלות דרך הכפתורים בדף עריכת החתימה',
    'גם אם פורום מסוים לא מוצע לך בחוקי הדגשת והסתרת אשכולות, עדיין תוכל להזין ידנית את הפורום שאתה רוצה (למשל היכל התהילה)',
    'לחיצה על תת-ניק בתגובות מאפשרת לערוך אותו בזריזות, גם בלי להיכנס להגדרות'
]
showTip(true);

var forumCompleteCooldown; //cooldown object for inputs of forum names

$('.clockpicker').clockpicker();

//get all the settings
var settings;
chrome.storage.sync.get("settings", function (data)
{
    if (data)
        settings = data.settings || {};
    else
        settings = {};
});

var domParser = new DOMParser();

//selects and displays a random tip
function showTip(allowSame)
{
    var randomIndex = Math.floor(Math.random() * tipBox.length);
    var randomTip = tipBox[randomIndex];
    if (!allowSame)
    {
        if (randomTip == $("#tip").text())
        {
            showTip(allowSame);
            return;
        }
    }
    $("#tip").text(randomTip);

}

var nudgeTimeout;
$("#tipIcon").click(function ()
{
    $("#tipIcon").addClass("nudgeAnimation");
    nudgeTimeout = setTimeout(function ()
    {
        $("#tipIcon").removeClass("nudgeAnimation");
    }, 201);
    showTip(false);
});

var globalKnownIds = {};
chrome.storage.local.get("knownIds", function (data)
{
    globalKnownIds = data.knownIds;
    if (globalKnownIds == undefined) //reset if needed
        globalKnownIds = {};
});


//update the id showed near the name of the user
function updateIdDisplay(element, commonParentSelector)
{
    var name = element.val();
    var idElement = element.parents(commonParentSelector).find(".userNumber");
    idElement.text("#...");
    utils.getUserIdByName(name, function (response)
    {
        if (response.id === null)
        {
            setIdDisplay(idElement, -1); //not found
        }
        else
        {
            setIdDisplay(idElement, response.id);
            element.val(response.name);
        }
    });
}

//sets the id display and makes sure that there's a href to the user
function setIdDisplay(idElement, id)
{
    if (id == -1) //user was not found
        idElement.text("המשתמש לא נמצא");
    else if (id.length == 0) //no id was entered
        idElement.text("#");
    else
        idElement.empty().append(
            $("<a>", { target: "_blank", href: fxpDomain + "member.php?u=" + id })
                .text("#" + id)
        );
}

//make options depend on other options to be enabled
function makeOptionDependency(parent, dependArr)
{
    parent.change(function ()
    {
        for (var i = 0; i < dependArr.length; i++)
        {
            $(dependArr[i]).prop("disabled", !parent.prop("checked"));
        }
    });
    parent.change(); //make the function run at least once
}

makeOptionDependency($("#hidePinned"), ["#hideIncludingRules"]);
makeOptionDependency($("#enableDefaultStyle"), ["#styleQuickComment", "#stylePrivateChat"]);
makeOptionDependency($("#disableLiveTyping"), ["#disableLiveTypingPm"]);

var backgroundNames = [
    "sofa",
    "rainbow",
    "connection",
    "scuffed",
    "wave",
    "fabric",
    "shape",
    "diagonalfabric",
    "latticed",
    "tiles",
    "leather",
    "paper",
    "triangle",
    "shadededge",
    "smallcube",
    "knitting",
    "squashed",
    "rhombus",
    "dottedtiles",
    "dirt",
    "marble",
    "compressedsquashed",
    "animals"
];

var forumPrefixes = [
    "דיון",
    "עזרה",
    "שאלה",
    "כתבה",
    "מדריך",
    "בעיה",
    "מידע",
    "הצעה",
    "פרסום",
    "פתרון",
    "עקיבה",
    "הכרזה",
    "ספוילר",
    "הורדה",
    "בקשה",
    "השוואה",
    "סיקור"
]

function confirmLeave()
{
    //prevent instant close of the tab if there are any unsaved changes
    if (unsavedChanges)
        return "לעזוב? יש שינויים שלא נשמרו!";
    else
        return undefined;
}
window.onbeforeunload = confirmLeave;


//elements that are usually animated but shouldn't be when switching tabs
var animatedElements = [
    ".userCard",
    ".StyleThreadsLine",
    ".StyleThreadsLine input"
]

function changeTab(element)
{
    //changes the tab according to a sidebar option

    var tabId = element.attr("data-tab");

    $("#optionList li.selected").removeClass("selected");
    element.addClass("selected");
    $(".shownTab").removeClass("shownTab");
    $("#" + tabId).addClass("shownTab");

    for (var i = 0; i < animatedElements.length; i++)
    { //prevent animations on switch
        $(animatedElements[i]).addClass("noAnimation");
    }

}

var highlightUser = -1;

if (location.hash.length > 0)
{
    //there is a hashtag in the url specifying a tab
    var tabId = location.hash.substr(1); //remove #
    var tabElement = $('[data-tab="' + tabId + '"]');
    if (tabElement.length > 0)
    {
        //tab actually exists
        changeTab(tabElement);
    }
    else
    {
        //tab does not exist, refer to bug reporting
        changeTab($('[data-tab="report"]'));
    }
}
else
{
    //check if there are other expressions in the title 
    var exp = location.href.match(/userFilter=[0-9]+/g);
    if (exp != null)
    {
        //userFilter query
        var queryId = parseInt(exp[0].substr("userFilter=".length));
        changeTab($('[data-tab="comments"]'));
        highlightUser = queryId;
        //alert(queryId);
    }
    else
        changeTab($("#optionList li:first")); //default tab is the first one
}

//one of the sidebar options was clicked, switch to the tab
$("#optionList li").click(function ()
{
    changeTab($(this));
});


var customBgButtonPreview = localStorage.getItem("customBgButtonImage");
if (customBgButtonPreview != null)
{ //show the custom BG image from "cache", since it takes a while to load it from memory
    $("#changeBgBtn").css("background-image", customBgButtonPreview);
}

function setTabs()
{
    chrome.storage.sync.get("settings", function (data)
    {
        var settings = data.settings || {};

        loadGeneral(settings);
        loadThreads(settings);
        loadComments(settings);
    });
    loadMultiuser();
}
setTabs(); //initial tab setting

function loadGeneral(settings)
{
    $("#backgroundNotifications").prop("checked", settings.backgroundNotifications);
    $("#signatureResize").prop("checked", settings.resizeSignatures);
    $("#unreadComments").prop("checked", settings.trackUnreadComments);
    if (settings.peekCloseMethod == "double")
    {
        $("#manualCollapse").prop("checked", true);
    }
    else
    {
        $("#automaticCollapse").prop("checked", true);
    }
    $("#enableSpoilers").prop("checked", settings.showSpoilers);
    $("#hidePinned").prop("checked", settings.hideSticky.active).change();
    $("#hidePinnedDays").val(settings.hideSticky.days);
    $("#hideIncludingRules").prop("checked", settings.hideSticky.includingRules);
    $("#showAutoPinned").prop("checked", settings.showAutoPinned);
    $("#hideSuggested").prop("checked", settings.hideSuggested);
    $("#oldEmoji").prop("checked", settings.classicIcons);
    $("#nightShortcut").prop("checked", settings.nightmodeShortcut);
    $("#autoNight").prop("checked", settings.autoNightmode.active);
    $("#nightStartTime").val(settings.autoNightmode.start);
    $("#nightEndTime").val(settings.autoNightmode.end);
    $("#showForumStats").prop("checked", settings.showForumStats);
    $("#hideAccessibilityMenu").prop("checked", settings.hideAccessibilityMenu);
    $("#disableLiveTyping").prop("checked", settings.disableLiveTyping).change();
    $("#disableLiveTypingPm").prop("checked", settings.disableLiveTypingPm);

    var customBg = settings.customBg || { day: "", night: "" };

    if (customBg.day != "" && customBg.night != "")
    {
        var dayUrl = 'url("' + customBg.day + '")';
        var nightUrl = 'url("' + customBg.night + '")';

        $(".customBackground").each(function ()
        { //check if background is one that id default
            if ($(this).find(".lightBG").css("background-image") == dayUrl &&
                $(this).find(".darkBG").css("background-image") == nightUrl)
                $(this).addClass("selected");
        });

        if ($(".customBackground.selected").length == 0)
        { //no background selected after check, it is a custom BG
            $(".bgInput[name='lightBG']").val(customBg.day);
            $("#customBGTile .lightBG").css("background-image", dayUrl);
            $(".bgInput[name='darkBG']").val(customBg.night);
            $("#customBGTile .darkBG").css("background-image", nightUrl);
            $("#customBGTile").addClass("selected");
        }

        updateBackgroundButtonImg(); //update the button
    }
}

function loadThreads(settings)
{
    $("#filterSticky").prop("checked", settings.threadFilters.filterSticky);
    //set readtime speed
    $("#readSpeed").text(settings.readtime.speed);
    //check needed readtime tags
    for (var i = 0; i < settings.readtime.activePrefixes.length; i++)
    {
        $(".prefixControl[name='" + settings.readtime.activePrefixes[i] + "']").prop("checked", true);
    }
    if (settings.readtime.newsForums)
        $(".prefixControl[name='" + newsForumToggleName + "']").prop("checked", true);
    sub_loadThreadFilterLines(settings);
}
function sub_loadThreadFilterLines(settings)
{
    //add thread selectors by users table lines
    settings.threadFilters.users.forEach(function (user, index)
    {
        utils.getUserNameById(user.id, globalKnownIds, function (userName)
        {
            addStyleThreadsRow(
                "user",
                {
                    name: userName,
                    id: user.id
                },
                {
                    type: user.type,
                    forums: user.forums,
                    excludeTitles: buildCommaSeperatedString(user.exception)
                },
                user.action
            )
        })
    });

    //add thread selectors by keywords table lines
    settings.threadFilters.keywords.forEach(function (keyword, index)
    {
        addStyleThreadsRow(
            "keyword",
            {
                words: buildCommaSeperatedString(keyword.words)
            },
            {
                type: keyword.type,
                forums: keyword.forums,
                excludeTitles: buildCommaSeperatedString(keyword.exception)
            },
            keyword.action
        );
    });
}

function loadComments(settings)
{
    sub_loadCommentFilters(settings);
    sub_loadDefaultStyle(settings);
}
function sub_loadCommentFilters(settings)
{
    //add comment filters cards
    for (var i = 0; i < settings.commentFilters.length; i++)
    {
        addUserCard(
            settings.commentFilters[i].id,
            settings.commentFilters[i].subnick.value,
            {
                color: settings.commentFilters[i].subnick.color,
                size: settings.commentFilters[i].subnick.size,
            },
            settings.commentFilters[i].hideSignature,
            settings.commentFilters[i].disableStyle,
            settings.commentFilters[i].hideComments
        );
    }

    if (highlightUser > 0 && $(".userCard.highlight").length == 0)
    {
        addUserCard(highlightUser, "", { color: "#333333", size: 11 }, false, false, false);
    }
}
function sub_loadDefaultStyle(settings)
{
    //set style of default style editor
    $("#enableDefaultStyle").prop("checked", settings.customDefaultStyle.active).change();
    $("#styleQuickComment").prop("checked", settings.customDefaultStyle.activeQuickComment);
    $("#stylePrivateChat").prop("checked", settings.customDefaultStyle.activePrivateChat);

    if (settings.customDefaultStyle.bold)
        $(".toggleStyle[data-styleaction='bold']").addClass("selected");
    else
        $(".toggleStyle[data-styleaction='bold']").removeClass("selected");
    if (settings.customDefaultStyle.italic)
        $(".toggleStyle[data-styleaction='italic']").addClass("selected");
    else
        $(".toggleStyle[data-styleaction='italic']").removeClass("selected");
    if (settings.customDefaultStyle.underline)
        $(".toggleStyle[data-styleaction='underline']").addClass("selected");
    else
        $(".toggleStyle[data-styleaction='underline']").removeClass("selected");

    $("#selectFont").val(settings.customDefaultStyle.font);
    if (settings.customDefaultStyle.size)
        $("#selectSize").val(settings.customDefaultStyle.size);
    $("#editorTextColor").val(settings.customDefaultStyle.color);
    //update editor to show set styles
    updateDefaultStyleAppearance();
}

function loadMultiuser()
{
    chrome.storage.local.get("savedUserData", function (data)
    {
        var savedUserData = data.savedUserData || [];

        var table = $("#userlistContainer tbody");

        var row;
        for (var i = 0; i < savedUserData.length; i++)
        {
            row = buildMultiuserRow(savedUserData[i].user)
            bindMultiuserRow(row);
            table.append(row);
        }
    })
}

$("#addMultiuserRow").click(function ()
{
    var row = buildMultiuserRow()
    bindMultiuserRow(row);
    editMultiuserRow(row);
    $("#userlistContainer tbody").append(row);
})

function bindMultiuserRow(row)
{
    row.find(".editMultiuser").unbind().click(function ()
    {
        editMultiuserRow($(this).parents("tr"))
        $(this).removeClass("error");
    })

    row.find(".deleteMultiuser").unbind().click(function ()
    {
        var oldUsername = row.find(".multiuserName").text();
        if (oldUsername.length > 0)
            saveUserData("", "", oldUsername); //this deletes the user
        row.fadeOut(200, function () { row.remove(); });
    });

    row.removeClass("editMode");
    row.find(".actionBtn").text("התחבר").removeClass("blue red").addClass("darkGreen");
    row.find("input").each(function ()
    {
        $(this).removeClass("close");
    });
    row.find(".actionBtn").unbind().click(function ()
    {
        logIntoUser(row.find(".multiuserName").text(), $(this));
    })
}

function editMultiuserRow(row)
{
    var oldUsername = row.find(".multiuserName").text();

    row.find("input[name=multiuserName]").val(oldUsername);
    row.find("input[name=multiuserPass]").val("");

    if (oldUsername.length > 0)
    {
        row.find("input[name=multiuserName]").attr("placeholder", "השאר ריק כדי למחוק");
        row.find("input[name=multiuserPass]").attr("placeholder", "הזן כדי לשנות");
    }
    row.find(".actionBtn").text("שמור").removeClass("red darkGreen").addClass("blue");

    //save click
    row.find(".actionBtn").unbind().click(function ()
    {
        var username = row.find("input[name=multiuserName]").val();
        var password = row.find("input[name=multiuserPass]").val();
        var passmd5 = "";
        if (password.length > 0)
            passmd5 = hex_md5(password);

        saveUserData(username, passmd5, oldUsername);

        if (username.length == 0) //username not given, remove row
            row.remove();
        else
        {
            row.find(".multiuserName").text(username);
            row.find("input").each(function ()
            {
                $(this).css("width", $(this).parent().find(".userDisplay").width() + "px");
            })
            var button = $(this);
            setTimeout(function ()
            {
                row.removeClass("editMode");
                button.text("התחבר").removeClass("blue red").addClass("darkGreen");
                button.unbind();
                bindMultiuserRow(row);
                row.find("input").removeClass("smooth").css("width", "");
            }, 200);
        }
    })

    row.find("input").keypress(function (e)
    {
        if (e.which == 13) //blur and save on enter
        {
            $(this).blur();
            row.find(".actionBtn").click();
        }
    });

    row.find("input").each(function ()
    {
        $(this).css("width", $(this).parent().find(".userDisplay").width() + "px");
    })

    row.find("input").addClass("smooth");
    setTimeout(function () { row.find("input").css("width", "") }, 20); //slide into width

    row.addClass("editMode");
}

//logs into a user and shows progress in the button
function logIntoUser(user, btn)
{
    var passmd5 = "";
    var row = btn.parents("tr");
    row.addClass("inProgress");
    btn.unbind();
    btn.text("טוען...");
    chrome.storage.local.get("savedUserData", function (data)
    {
        var savedUserData = data.savedUserData || [];
        var changed = false;
        for (var i = 0; i < savedUserData.length && !changed; i++)
        {
            if (savedUserData[i].user == user)
                passmd5 = savedUserData[i].passmd5;
        }

        if (passmd5.length > 0)
        {
            btn.text("מתנתק...");
            logout(function (success)
            {
                btn.text("מתחבר...");
                login(user, passmd5, function (status)
                {
                    if (status == 1)
                    {
                        btn.text("מחובר!");
                        $("#rateLimitLoginNotice").slideUp(200); //hide rate limit notice if visible
                        setTimeout(function ()
                        {
                            bindMultiuserRow(row);
                            row.removeClass("inProgress");
                        }, 2000);
                        chrome.runtime.sendMessage({ sendTotalNotifications: true }); //update and notify notification count
                    }
                    else if (status == 0)
                    {
                        row.removeClass("inProgress");
                        btn.text("שגיאת התחברות!");
                        btn.removeClass("blue darkGreen").addClass("red");
                        row.find(".editMultiuser").addClass("error");
                    }
                    else
                    {
                        $("#rateLimitLoginNotice").slideDown(500);
                        btn.text("ההתחברות מוגבלת!");
                        btn.removeClass("blue darkGreen").addClass("red");
                        setTimeout(function ()
                        {
                            bindMultiuserRow(row);
                            row.removeClass("inProgress");
                        }, 5000);
                    }
                });
            })
        }
    });
    chrome.runtime.sendMessage({ event: { cat: "Click", type: "MultiUser" } });
}

//saves username and password hashes to memory
function saveUserData(username, passmd5, oldUsername)
{
    chrome.storage.local.get("savedUserData", function (data)
    {
        var savedUserData = data.savedUserData || [];
        var changed = false;
        if (oldUsername.length > 0)
        {
            for (var i = 0; i < savedUserData.length && !changed; i++)
            {
                if (savedUserData[i].user == oldUsername)
                {
                    if (username.length == 0) //remove user
                    {
                        savedUserData.splice(i, 1);
                        i--;
                    }
                    else
                    {
                        savedUserData[i].user = username;
                        if (passmd5.length > 0)
                            savedUserData[i].passmd5 = passmd5;
                    }
                    changed = true;
                }
            }
        }
        if (!changed && username.length > 0)
        {
            savedUserData.push({
                user: username,
                passmd5: passmd5
            });
        }

        chrome.storage.local.set({ "savedUserData": savedUserData });
    });
}


//Makes the user log out.
function logout(callback)
{
    $.get(fxpDomain, function (data, status)
    {
        //get logout URL
        var doc = domParser.parseFromString(data, "text/html");
        var logoutA = doc.querySelector("a[href*='do=logout']");
        if (logoutA === null)
        {
            callback(false);
        }
        else
        {
            var outUrl = fxpDomain + logoutA.getAttribute("href");
            //request to log out
            $.get(outUrl, function (data, status)
            {
                callback(true);
            });
        }
    });
}

//log the user into FXP using their password's md5 hash
function login(username, passmd5, callback)
{
    var loginUrl = "https://www.fxp.co.il/login.php?do=login";

    $.post(loginUrl, {
        vb_login_username: username,
        vb_login_md5password: passmd5,
        vb_login_md5password_utf: passmd5,

        vb_login_password_hint: "סיסמה",
        vb_login_password: "",
        s: "",
        securitytoken: "guest",
        do: "login",
        cookieuser: 1
    }, function (data, status)
        {
            var response = 0;
            if (data.indexOf("התחברת בהצלחה") > -1) response = 1;
            else if (data.indexOf("ניסית להתחבר במספר הפעמים המרבי") > -1) response = 2;

            callback(response);
        });
}

$("#logoutCurrent").click(function ()
{
    logoutCurrent($(this));
})

function logoutCurrent(btn)
{
    var originalText = btn.text();
    btn.unbind();
    btn.text("מתנתק...");
    logout(function (success)
    {
        if (success)
            btn.text("התנתקת!");
        else
            btn.text("לא היית מחובר!");

        setTimeout(function ()
        {
            $("#logoutCurrent").click(function ()
            {
                logoutCurrent($(this));
            }).text(originalText);
        }, 2000)
    })
}

//suggests forums for tags in the filtering section
function suggestForumTag(inputElement)
{
    var search = inputElement.val().trim();
    if (search.length > 0)
    {
        $.ajax({
            url: fxpDomain + 'ajax.php',
            dataType: "json",
            data: {
                do: 'forumdisplayqserach',
                name_startsWith: inputElement.val().trim()
            },
            success: function (data)
            {
                var suggContainer = inputElement.parent().find(".tagSuggestionsContainer");

                var singleSuggestion;
                if (data.length == 0)
                {
                    suggContainer.hide();
                    console.log("warning: no suggestions for entered forum");
                }
                else
                {
                    suggContainer.empty();
                    for (var i = 0; i < data.length; i++)
                    {
                        if (i > 10)
                        {
                            suggContainer.append(
                                $("<div>", { class: "tagSuggestion" }).text("...")
                            );
                            break;
                        }
                        singleSuggestion = data[i].title_clean;
                        suggContainer.append(
                            $("<div>", { class: "tagSuggestion", tabindex: 0 }).text(singleSuggestion)
                        );
                    }
                    suggContainer.show();
                }
            }
        });
    }
}

//open a popup that darkens the screen, by id
function openPopup(popupName)
{
    var blackScreen = $("#blackScreen");
    var blackContent = $("#aboveBlack");
    if (blackScreen.is(':visible'))
    {
        blackContent.children().hide();
        blackContent.find("#" + popupName).show();
    }
    else
    {
        blackScreen.fadeIn(300, function ()
        {
            blackContent.find("#" + popupName).show();
        });
    }
}

//close all open popups
function closePopups()
{
    var blackScreen = $("#blackScreen");
    var blackContent = $("#aboveBlack");
    blackContent.children().hide();
    blackScreen.fadeOut(300, function ()
    {
        blackContent.children().hide();
    });
}
$("#blackScreen").click(closePopups);

$("#changeBgBtn").click(function ()
{
    openPopup("bgPopup");
});


//add prefixes to prefix list in threads tab
for (var i = 0; i < forumPrefixes.length; i++)
{
    addPrefixTag(forumPrefixes[i], true);
}
var newsForumToggleName = "כתבות מפורומי עדכונים"
addPrefixTag(newsForumToggleName, false);

//add backgrounds to background lists in background popup
for (var i = 0; i < backgroundNames.length; i++)
{
    $("#bgList").append(
        $("<div>", { class: "customBackground" }).append(
            $("<div>", { class: "lightBG", style: "background-image: url(" + chrome.extension.getURL("images/bgs/light/" + backgroundNames[i] + ".png") + ");" })
        ).append(
            $("<div>", { class: "darkBG", style: "background-image: url(" + chrome.extension.getURL("images/bgs/dark/" + backgroundNames[i] + ".png") + ");" })
            )
    )
}

function updateBackgroundButtonImg()
{
    var button = $("#changeBgBtn")
    var activeBg = $(".customBackground.selected");
    if (activeBg.length == 0)
    {
        button.css("background-image", "");
    }
    else
    {
        var img = activeBg.find(".lightBG").css("background-image");
        button.css("background-image", img);
    }
}

$(".customBackground").click(function ()
{
    $(".customBackground.selected").removeClass("selected");
    $(this).addClass("selected");
    updateBackgroundButtonImg();
});

$("#resetCustomBG").click(function ()
{
    $(".customBackground.selected").removeClass("selected");
    updateBackgroundButtonImg();
    closePopups();
})

$(".bgInput").change(function ()
{
    var name = $(this).attr("name");
    var url = $(this).val();
    $(this).parents("." + name).css("background-image", "url(" + url + ")");
    if ($(this).parents(".customBackground").hasClass("selected"))
        updateBackgroundButtonImg();
});

//update style editor when a button is clicked
$(".toggleStyle").click(function ()
{
    $(this).toggleClass("selected");
    updateDefaultStyleAppearance();
})
//update style editor when a value is changed
$(".changeStyle").change(function ()
{
    updateDefaultStyleAppearance();
})


//change the editor in the comments section when needed
function updateDefaultStyleAppearance()
{
    var editorSettings = $("#styleControls");
    var preview = $("#editableStyleText");

    var fontFamily = editorSettings.find("#selectFont").val(),
        bold = $('[data-styleAction=bold]').hasClass('selected'),
        italic = $('[data-styleAction=italic]').hasClass('selected'),
        underline = $('[data-styleAction=underline]').hasClass('selected'),
        size = parseInt(editorSettings.find("#selectSize").val()),
        color = editorSettings.find("#editorTextColor").val();

    var fontSizesPx = [13.9, 18, 22.1, 24.9, 33.2, 44.3, 66.4];

    preview.css({
        "font-family": fontFamily,
        "color": color,
        "font-size": fontSizesPx[size - 1] + "px"
    });

    if (bold)
        preview.css("font-weight", "bold");
    else
        preview.css("font-weight", "normal");
    if (italic)
        preview.css("font-style", "italic");
    else
        preview.css("font-style", "normal");
    if (underline)
        preview.css("text-decoration", "underline");
    else
        preview.css("text-decoration", "none");
}
updateDefaultStyleAppearance(); //first update

function buildPrefixTag(name, addLine)
{ //builds a tag for read time
    var displayName = name;
    if (addLine)
        displayName += "|"
    var tag =
        $("<label>").append(
            $("<input>", { type: "checkbox", class: "prefixControl", name: name })
        ).append(
            $("<div>", { class: "prefixItem" }).text(displayName)
            )
    return tag;
}

function addPrefixTag(name, addLine)
{ //adds a read time tag
    $("#tagList").append(buildPrefixTag(name, addLine));
}

//builds an element for a tag
function buildGeneralTag(name)
{
    return $("<div>", { class: "tagBody" }).append(
        $("<span>", { class: "tagName" }).text(name)
    ).append(
        $("<span>", { class: "tagRemove mdi mdi-close" }).click(function ()
        {
            $(this).parents(".tagBody").fadeOut(200, function () { $(this).remove() }); //fade out and remove
        })
        );
}

//builds an element for adding tags
function buildGeneralTagAdder()
{
    return $("<div>", { class: "addTagBody" }).append(
        $("<input>", { class: "tagInput" }).focusin(function ()
        {
            $(this).css("width", "10em"); //expand on focus in
            forumCompleteCooldown = -1;
        }).focusout(function (e)
        {
            if (e.relatedTarget && $(e.relatedTarget).hasClass("tagSuggestion"))
            {
                //if clicked on suggestion, change the value to the suggestion clicked on
                $(this).val($(e.relatedTarget).text());
                window.clearTimeout(forumCompleteCooldown); //cancel future suggestions
            }

            if ($(this).val().trim().length > 0) //add tag on focus out
            {
                var tagName = $(this).val();
                $(this).parents(".addTagBody").before(buildGeneralTag(tagName));
            }
            $(this).val("");
            $(this).css("width", "");
            $(this).parent().find(".tagSuggestionsContainer").hide();
        }).keypress(function (e)
        {
            if (e.which == 13) //blur on enter
                $(this).blur();
            else if (forumCompleteCooldown == -1) //first edit, ignore
            {
                var inputElement = $(this);
                forumCompleteCooldown = setTimeout(function ()
                {
                    suggestForumTag(inputElement);
                    forumCompleteCooldown = -1;
                }, 900); //cooldown of 0.9s
            }
        })
    ).append(
        $("<span>", { class: "tagAdd mdi mdi-plus" })
        ).append(
        $("<div>", { class: "tagSuggestionsContainer" })
        );;
}

function showSaveSuccess()
{
    console.info("settings saved")
    $("#savedIndicator").show();
    setTimeout(function ()
    {
        $("#savedIndicator").fadeOut(2000);
    }, 4000);
}
function showResetSuccess()
{
    console.info("settings in tab reset");
    $("#resetIndicator").show();
    setTimeout(function ()
    {
        $("#resetIndicator").fadeOut(1000);
    }, 2000);
}

$("#sendTestNotification").click(function ()
{
    chrome.runtime.sendMessage(
        {
            notification:
            {
                title: "הודעת בדיקה!",
                message: "הידעת? הגולש הממוצע באינטרנט ממצמץ רק 7 פעמים בדקה! ממוצע המצמוץ הנורמלי הוא 20 - כמעט פי 3.",
                url: ""
            }
        });
})

//save settings
$(".saveSettings").click(function ()
{
    var category = $(this).attr("data-category");
    chrome.storage.sync.get("settings", function (data)
    {
        var settings = data.settings || {};

        //save settings in general
        if (category == "general")
        {
            settings.backgroundNotifications = $("#backgroundNotifications").prop("checked");
            settings.resizeSignatures = $("#signatureResize").prop("checked");
            settings.trackUnreadComments = $("#unreadComments").prop("checked");
            if ($("#manualCollapse").prop("checked"))
                settings.peekCloseMethod = "double";
            else
                settings.peekCloseMethod = "auto";
            settings.showSpoilers = $("#enableSpoilers").prop("checked");
            settings.hideSticky.active = $("#hidePinned").prop("checked");
            if (parseInt($("#hidePinnedDays").val()) < 5)
                $("#hidePinnedDays").val(5);
            settings.hideSticky.days = parseInt($("#hidePinnedDays").val());
            settings.hideSticky.includingRules = $("#hideIncludingRules").prop("checked");
            settings.showAutoPinned = $("#showAutoPinned").prop("checked");
            settings.hideSuggested = $("#hideSuggested").prop("checked");
            settings.classicIcons = $("#oldEmoji").prop("checked");
            settings.nightmodeShortcut = $("#nightShortcut").prop("checked");
            settings.autoNightmode.active = $("#autoNight").prop("checked");
            settings.autoNightmode.start = $("#nightStartTime").val();
            settings.autoNightmode.end = $("#nightEndTime").val();
            settings.showForumStats = $("#showForumStats").prop("checked");
            settings.hideAccessibilityMenu = $("#hideAccessibilityMenu").prop("checked");
            settings.disableLiveTyping = $("#disableLiveTyping").prop("checked");
            settings.disableLiveTypingPm = $("#disableLiveTypingPm").prop("checked");

            var customBg = {
                day: "",
                night: ""
            }
            if ($(".customBackground.selected").length > 0)
            {
                var selectedBgElement = $(".customBackground.selected");
                if (selectedBgElement.attr("id") == "customBGTile")
                { //custom bg
                    customBg.day = $(".bgInput[name='lightBG']").val();
                    customBg.night = $(".bgInput[name='darkBG']").val();
                }
                else
                { //bg from the list
                    var lightBG = selectedBgElement.find(".lightBG").css("background-image");
                    lightBG = lightBG.substr('url("'.length, lightBG.length - 'url("'.length - '")'.length); //cut to get only url
                    var darkBG = selectedBgElement.find(".darkBG").css("background-image");
                    darkBG = darkBG.substr('url("'.length, darkBG.length - 'url("'.length - '")'.length); //cut to get only url

                    customBg.day = lightBG;
                    customBg.night = darkBG;
                }
            }
            settings.customBg = customBg;

            //save changes
            localStorage.setItem("customBgButtonImage", 'url("' + customBg.day + '")');
            chrome.storage.sync.set({ "settings": settings }, showSaveSuccess);

        }
        else if (category == "threads")
        { //save settings in threads
            settings.readtime.activePrefixes = [];
            $(".prefixControl[name!='" + newsForumToggleName + "']:checked").each(function ()
            {
                settings.readtime.activePrefixes.push($(this).attr("name"));
            })
            settings.readtime.newsForums = $(".prefixControl[name='" + newsForumToggleName + "']").prop("checked");

            settings.threadFilters.users = [];
            $("#StyleThreadsUser .StyleThreadsLine").each(function ()
            {
                var id = parseInt($(this).find(".userNumber").text().substr(1));
                if (!isNaN(id))
                {
                    var type = $(this).find(".forumTarget:checked").val();
                    var forums = [];
                    $(this).find(".tagsContainer.forums .tagName").each(function ()
                    {
                        forums.push($(this).text());
                    });
                    var exception = buildArrayFromCommaString($(this).find("input[name='excludeTitles']").val());
                    var action = $(this).find("[name='boldPost']").prop("checked") ? "bold" : "hide";
                    settings.threadFilters.users.push({
                        id: id,
                        type: type,
                        forums: forums,
                        exception: exception,
                        action: action
                    });
                    utils.getUserNameById(id, globalKnownIds); //make sure the name is known now
                }

            });

            settings.threadFilters.keywords = [];
            $("#StyleThreadsKeyword .StyleThreadsLine").each(function ()
            {
                var words = buildArrayFromCommaString($(this).find("textarea[name='keyword']").val());
                var type = $(this).find(".forumTarget:checked").val();
                var forums = [];
                $(this).find(".tagsContainer.forums .tagName").each(function ()
                {
                    forums.push($(this).text());
                });
                var exception = buildArrayFromCommaString($(this).find("input[name='excludeTitles']").val());
                var action = $(this).find("[name='boldPost']").prop("checked") ? "bold" : "hide";
                settings.threadFilters.keywords.push({
                    words: words,
                    type: type,
                    forums: forums,
                    exception: exception,
                    action: action
                });
            });
            settings.threadFilters.filterSticky = $("#filterSticky").prop("checked");

            //save changes
            chrome.storage.sync.set({ "settings": settings }, showSaveSuccess);
        }
        else if (category == "comments")
        { //save settings in comments
            //style of default style editor
            settings.customDefaultStyle.active = $("#enableDefaultStyle").prop("checked");
            settings.customDefaultStyle.activeQuickComment = $("#styleQuickComment").prop("checked");
            settings.customDefaultStyle.activePrivateChat = $("#stylePrivateChat").prop("checked");

            settings.customDefaultStyle.bold = $(".toggleStyle[data-styleaction='bold']").hasClass("selected");
            settings.customDefaultStyle.italic = $(".toggleStyle[data-styleaction='italic']").hasClass("selected");
            settings.customDefaultStyle.underline = $(".toggleStyle[data-styleaction='underline']").hasClass("selected");

            settings.customDefaultStyle.font = $("#selectFont").val();
            settings.customDefaultStyle.size = parseInt($("#selectSize").val());
            settings.customDefaultStyle.color = $("#editorTextColor").val();

            settings.commentFilters = [];
            $("#commentsCards .userCard").each(function ()
            {
                var id = parseInt($(this).find(".userNumber").text().substr(1));
                if (!isNaN(id))
                {
                    var subnick = {
                        value: $(this).find(".subnick").val(),
                        color: $(this).find(".subnickColor").val(),
                        size: $(this).find(".subnickSize").val()
                    }
                    var hideSignature = $(this).find("[name='hideSignature']").prop("checked");
                    var disableStyle = $(this).find("[name='disableStyle']").prop("checked");
                    var hideComments = $(this).find("[name='hideComments']").prop("checked");

                    settings.commentFilters.push({
                        id: id,
                        subnick: subnick,
                        hideSignature: hideSignature,
                        disableStyle: disableStyle,
                        hideComments: hideComments
                    });
                    utils.getUserNameById(id, globalKnownIds); //make sure the name is known now
                }
            })

            //save changes
            chrome.storage.sync.set({ "settings": settings }, showSaveSuccess);
        }

        chrome.runtime.sendMessage({ event: { cat: "Click", type: "Save settings" } });
    });
})

//reset changes
$(".resetChanges").click(function ()
{
    var category = $(this).attr("data-category");
    chrome.storage.sync.get("settings", function (data)
    {
        var settings = data.settings || {};
        switch (category)
        {
            case "general":
                $(".customBackground").removeClass("selected");
                loadGeneral(settings);
                break;
            case "threadLines":
                $(".StyleThreadsLine").remove();
                sub_loadThreadFilterLines(settings);
                break;
            case "commentFilters":
                $("#commentsCards .userCard").remove();
                sub_loadCommentFilters(settings);
                break;
            case "commentStyle":
                sub_loadDefaultStyle(settings);
                break;
        }
        showResetSuccess();
        chrome.runtime.sendMessage({ event: { cat: "Click", type: "Reset settings" } });
    });
})

//sets the version number in the about page
$("#versionNum").text(chrome.runtime.getManifest().version);
$(".communicateSection").click(function ()
{
    var name = $(this).attr("id");
    name = name.substr(0, name.length - 4);
    chrome.runtime.sendMessage({ event: { cat: "Click", type: name + " communication link" } });
});



//combo sequences
var combos = [
    [78, 88, 72, 67, 86]
];
//functions to activate once the combo is made
var comboAction = [
    function ()
    {
        $("body").toggleClass("rotateColor");
    }
]

var maxComboLength = combos[0].length;
for (var i = 1; i < combos.length; i++)
{
    if (combos[i].length > maxComboLength)
        maxComboLength = combos[i].length;
}
var currentCombo = new Array(maxComboLength); //array of previous combos user made
for (var i = 0; i < maxComboLength; i++)
{
    currentCombo[i] = -1;
}

//combo detection logic
$(document).on('keydown', function (e)
{
    var tag = e.target.tagName.toLowerCase();
    var contenteditable = e.target.getAttribute("contenteditable") == "true";
    if (tag != 'input' && tag != 'textarea' && !contenteditable)
    {
        var keycode = e.which; //get key code

        for (var i = 1; i < currentCombo.length; i++) //push at the end of the current combo
        {
            currentCombo[i - 1] = currentCombo[i];
        }
        currentCombo[currentCombo.length - 1] = keycode;

        var pass = true;
        for (var i = 0; i < combos.length; i++) //check if matches a combo
        {
            pass = true;
            for (var j = 1; j < combos[i].length && pass; j++)
            {
                if (combos[i][combos[i].length - j] != currentCombo[currentCombo.length - j])
                    pass = false;
            }
            if (pass) //matches, activate combo action
            {
                comboAction[i]();
            }
        }
    }
});



//add user cards for the comments section
function addUserCard(id, subnick, subnickStyle, hideSignature, disableStyle, hideComments)
{
    var card = buildUserCard();
    utils.getUserNameById(id, globalKnownIds, function (userName)
    {
        card.find("input.username").val(userName); //set the username
        setIdDisplay(card.find(".userNumber"), id);
        card.find("input.subnick").val(subnick)
            .css({ color: subnickStyle.color, fontSize: subnickStyle.size * 1.2 + "px" }); //set the subnick
        card.find(".styleSubnick").css("color", subnickStyle.color); //set color of editor opener
        card.find("input.subnickColor").val(subnickStyle.color); //set color input's color
        card.find("input.subnickSize").val(subnickStyle.size); //set size input's value
        card.find("input[name=hideSignature]").prop("checked", hideSignature); //set hideSignature
        card.find("input[name=disableStyle]").prop("checked", disableStyle); //set disableStyle
        card.find("input[name=hideComments]").prop("checked", hideComments); //set hideComments

        card.find(".subnickStyleEditor").hide();
        card.find(".styleSubnick").click(function ()
        { //style button clicked, show style menu
            $(this).parents(".userCard").find(".subnickStyleEditor").slideToggle(300);
        });

        card.find(".subnickColor").change(function ()
        { //color changed in style menu
            $(this).parents(".userCard").find(".subnick").css("color", $(this).val());
            $(this).parents(".userCard").find(".styleSubnick").css("color", $(this).val());
        });
        card.find(".subnickSize").change(function ()
        { //size changed in style menu
            $(this).parents(".userCard").find(".subnick").css("font-size", $(this).val() * 1.2 + "px");
        });

        card.find("span.delete").click(function ()
        { //delete button
            var card = $(this).parents(".userCard");
            card.removeClass("noAnimation").css({ animation: "sizedownfade 0.4s forwards" })
            setTimeout(function ()
            {
                card.remove()
            }, 400);
        });

        if (id == highlightUser)
            card.addClass("highlight");

        $("#commentsCards").append(card);
    })
}

//add style row for the threads section
function addStyleThreadsRow(type, selector, validation, action)
{
    var row = buildStyleThreadsRow(type);

    switch (validation.type)
    {//select the validation type
        case "justForum":
            row.find("input[value=justForum]").prop("checked", true);
            break;
        case "notForum":
            row.find("input[value=notForum]").prop("checked", true);
            break;
        default:
            row.find("input[value=everyForum]").prop("checked", true);
            row.find(".tagsContainer").addClass("disabled");
            break;
    }

    for (var i = 0; i < validation.forums.length; i++)
    {
        row.find(".tagsContainer").append(buildGeneralTag(validation.forums[i]));
    }
    row.find(".tagsContainer").append(buildGeneralTagAdder());
    row.find("input[name=excludeTitles]").val(validation.excludeTitles); //exclude titles text
    if (action == "bold")
    {
        row.find("input[name=boldPost]").prop("checked", true);
    }
    else
    {
        row.find("input[name=boldPost]").prop("checked", false);
    }

    row.find("input.forumTarget").change(function ()
    { //disable/enable forum textbox
        var row = $(this).parents("tr");
        if (row.find("input[value=everyForum]").prop("checked"))
        {
            row.find(".tagsContainer").addClass("disabled");
        }
        else
        {
            row.find(".tagsContainer").removeClass("disabled");
        }
    });

    row.find("span.delete").click(function ()
    { //delete button
        var row = $(this).parents("tr");
        row.css({ transition: "font-size 0.3s", fontSize: 0 })
        row.find("input").css({ transition: "font-size 0.3s", fontSize: 0 })
        row.find("textarea").css({ transition: "font-size 0.3s", fontSize: 0 })
        setTimeout(function ()
        {
            row.remove()
        }, 250);
    });

    row.find(".seperateByCommaText").focus(function ()
    {
        $(this).parent().attr("data-balloon", "הפרד בפסיקים");
    }).blur(function ()
    {
        $(this).parent().removeAttr("data-balloon");
    })

    if (type == "user")
    {
        row.find("input[name=username]").val(selector.name);
        setIdDisplay(row.find(".userNumber"), selector.id);
        $("#StyleThreadsUser").append(row);
    }
    else
    {
        row.find("textarea[name=keyword]").val(selector.words);
        $("#StyleThreadsKeyword").append(row);
    }

}

function buildCommaSeperatedString(list)
{
    var str = "";
    for (var i = 0; i < list.length; i++)
    {
        if (i > 0)
            str += ", ";
        str += list[i];
    }
    return str;
}
function buildArrayFromCommaString(str)
{
    if (str.length > 0)
    {
        var arr = str.split(",");
        for (var i = 0; i < arr.length; i++)
        {
            arr[i] = arr[i].trim();
        }
        return arr;
    }
    else
        return [];
}

$("#addCardComments").click(function ()
{
    addUserCard("", "", { color: "#333333", size: 11 }, false, false, false);
})

$(".addStyleThreadsLine").click(function ()
{
    var type = $(this).parents(".StyleThreads").attr("data-tag");
    addStyleThreadsRow(type, { name: "", id: "", words: "" }, { type: "everyForum", forums: "", excludeTitles: "" }, "bold");
})

$("#recalcReadSpeed").click(function ()
{
    var popup = $("#readtimePopup");
    //reset popup to start of test
    $("#readtimeText").empty();
    $("#readtimeText").append(
        $("<span>").text('בעוד רגעים ספורים יוצג בפניך קטע קצר שלקוח מויקיפדיה. קרא אותו עד סופו, ובסיום הקריאה לחץ על הכפתור בתחתית הדף.')
    ).append(
        $("<br>")
        ).append(
        $("<span>").text('התוסף יחלק את מספר המילים בקטע בזמן שלקח לך לקרוא אותו, ובכך יקבע את מהירות הקריאה שלך.')
        )
    popup.find(".button:first").attr({ class: "button blue", id: "startReadtime" }).text("התחל");
    $("#cancelReadtime").show();
    $("#startReadtime").unbind().click("presentText", function ()
    { //start read time calculation

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
        var randomIndex = Math.floor(Math.random() * readTimeTexts.length);
        var randomPassage = readTimeTexts[randomIndex];
        var wordCount = randomPassage.split(" ").length; //count words
        $("#readtimeText").text(randomPassage);
        var readStartTime = new Date().getTime(); //time the text was presented

        //set stop button
        $(this).attr("id", "stopReadtime")
            .removeClass("blue").addClass("red").text("קראתי!");

        $(this).unbind("click").click(function ()
        {
            var totalTimeMinutes = (new Date().getTime() - readStartTime) / 60000; //calculate time in minutes
            var speed = Math.round(wordCount / totalTimeMinutes); //calculate speed
            $("#readtimeText").empty();

            $("#readtimeText").append(
                $("<span>").text("מהירות הקריאה שלך היא:")
            ).append(
                $("<div>", { id: "timeResult" }).text(speed)
                ).append(
                $("<b>").text("מילים לדקה.")
                )

            $(this).attr("id", "")
                .removeClass("red").addClass("blue").text("סגור");
            $("#cancelReadtime").hide();

            chrome.storage.sync.get("settings", function (data)
            {
                var settings = data.settings || {};
                settings.readtime.speed = speed;
                chrome.storage.sync.set({ "settings": settings });
                chrome.storage.local.set({ "readTimeKnown": [] }); //clear known read times
            });
            $("#readSpeed").text(speed);

            $(this).unbind("click").click(closePopups);
        })

    });
    openPopup("readtimePopup");
})

$(".closePopupButton").click(closePopups);

function buildUserCard()
{
    var card =
        $("<table>", { class: "userCard" }).append(
            $("<tr>").append(
                $("<td>").append(
                    $("<input>", { type: "text", class: "username", placeholder: "שם משתמש" }).change(function ()
                    {
                        updateIdDisplay($(this), "tr");
                    })
                )
            ).append(
                $("<td>", { class: "userNumber" }).text("#")
                )
        ).append(
            $("<tr>").append(
                $("<td>").append(
                    $("<input>", { type: "text", class: "subnick", placeholder: "תת-ניק או כתובת תמונה..." })
                )
            ).append(
                $("<td>", { class: "styleSubnick" }).append(
                    $("<span>", { class: "mdi mdi-format-size" })
                )
                )
            ).append(
            $("<tr>").append(
                $("<td>", { colspan: "2" }).append(
                    $("<div>", { class: "subnickStyleEditor" }).append(
                        $("<span>").text("px")
                    ).append(
                        $("<input>", { type: "number", value: "11", class: "subnickSize" })
                        ).append(
                        $("<input>", { type: "color", class: "subnickColor" })
                        )
                )
            )
            ).append(
            $("<tr>").append(
                $("<td>", { class: "option" }).append(
                    $("<div>", { class: "switch" }).append(
                        $("<input>", { type: "checkbox", name: "hideSignature", id: "swtc" + num })
                    ).append(
                        $("<label>", { for: "swtc" + (num++) })
                        )
                ).append(
                    $("<span>").text("הסתר חתימה")
                    )
            ).append(
                $("<td>", { rowspan: "3", class: "delete" }).append(
                    $("<span>", { class: "mdi mdi-delete delete" })
                )
                )
            ).append(
            $("<tr>").append(
                $("<td>", { class: "option" }).append(
                    $("<div>", { class: "switch" }).append(
                        $("<input>", { type: "checkbox", name: "disableStyle", id: "swtc" + num })
                    ).append(
                        $("<label>", { for: "swtc" + (num++) })
                        )
                ).append(
                    $("<span>").text("נטרל עיצוב תגובות")
                    )
            )
            ).append(
            $("<tr>").append(
                $("<td>", { class: "option" }).append(
                    $("<div>", { class: "switch" }).append(
                        $("<input>", { type: "checkbox", name: "hideComments", id: "swtc" + num })
                    ).append(
                        $("<label>", { for: "swtc" + (num++) })
                        )
                ).append(
                    $("<span>").text("הסתר תגובות")
                    )
            )
            )
    return card;
}

function buildHelperThreadsRow(type)
{
    var obj;
    if (type == "user")
    {
        obj = $("<td>").append(
            $("<input>", { type: "text", name: "username" }).change(function ()
            {
                updateIdDisplay($(this), "td");
            })
        ).append(
            $("<div>", { class: "userNumber" }).text("#")
            );
    }
    else
    {
        obj = $("<td>").append(
            $("<div>", { class: "balloonInputContainer", "data-balloon-pos": "down", "data-balloon-visible": true }).append(
                $("<textarea>", { class: "seperateByCommaText", name: "keyword" })
            )
        );
    }
    return obj;
}

function buildStyleThreadsRow(type)
{
    var row =
        $("<tr>", { class: "StyleThreadsLine" }).append(
            buildHelperThreadsRow(type)
        ).append(
            $("<td>").append(
                $("<div>", { class: "flex" }).append(
                    $("<div>", { class: "switch radio" }).append(
                        $("<input>", { type: "radio", class: "forumTarget", name: "forumTarget" + num2, value: "everyForum", id: "forumSel" + num, checked: "checked" })
                    ).append(
                        $("<label>", { for: "forumSel" + num++ })
                        )
                ).append(
                    $("<span>").text(" בכל פורום")
                    )
            ).append(
                $("<div>", { class: "flex" }).append(
                    $("<div>", { class: "switch radio" }).append(
                        $("<input>", { type: "radio", class: "forumTarget", name: "forumTarget" + num2, value: "justForum", id: "forumSel" + num })
                    ).append(
                        $("<label>", { for: "forumSel" + num++ })
                        )
                ).append(
                    $("<span>").text(" רק ב:")
                    )
                ).append(
                $("<div>", { class: "flex" }).append(
                    $("<div>", { class: "switch radio" }).append(
                        $("<input>", { type: "radio", class: "forumTarget", name: "forumTarget" + num2++, value: "notForum", id: "forumSel" + num })
                    ).append(
                        $("<label>", { for: "forumSel" + num++ })
                        )
                ).append(
                    $("<span>").text(" לא ב:")
                    )
                )
            ).append(
            $("<td>").append(
                $("<div>", { class: "tagsContainer forums" })
            )
            ).append(
            $("<td>").append(
                $("<div>", { class: "balloonInputContainer", "data-balloon-pos": "down", "data-balloon-visible": true }).append(
                    $("<input>", { class: "seperateByCommaText", type: "text", name: "excludeTitles" })
                )
            )
            ).append(
            $("<td>").append(
                $("<label>").append(
                    $("<input>", { type: "checkbox", name: "boldPost", checked: "checked" })
                ).append(
                    $("<div>", { class: "showHideToggle boldOn" }).append(
                        $("<span>", { class: "mdi mdi-eye boldHideIcon" })
                    ).append(
                        $("<div>", { class: "boldHideText" }).text("הדגש")
                        )
                    ).append(
                    $("<div>", { class: "showHideToggle hideOn" }).append(
                        $("<span>", { class: "mdi mdi-eye-off boldHideIcon hideIcon" })
                    ).append(
                        $("<div>", { class: "boldHideText" }).text("הסתר")
                        )
                    )
            )
            ).append(
            $("<td>").append(
                $("<span>", { class: "mdi mdi-delete delete" })
            )
            )
    return row;
}
function buildMultiuserRow(username)
{
    var row =
        $("<tr>").append(
            $("<td>").append(
                $("<span>", { class: "userDisplay multiuserName" }).text(username)
            ).append(
                $("<input>", { type: "text", class: "userInput", name: "multiuserName", autocomplete: "off" })
                )
        ).append(
            $("<td>").append(
                $("<span>", { class: "userDisplay multiuserPass" }).text("********")
            ).append(
                $("<input>", { type: "password", class: "userInput", name: "multiuserPass" })
                )
            ).append(
            $("<td>").append(
                $("<div>", { class: "button darkGreen inline actionBtn" }).text("התחבר")
            )
            ).append(
            $("<td>").append(
                $("<div>", { class: "editMultiuser" }).append(
                    $("<span>", { class: "mdi mdi-account-edit" })
                )
            ).append(
                $("<div>", { class: "deleteMultiuser" }).append(
                    $("<span>", { class: "mdi mdi-delete" })
                )
                )
            );
    return row;
}


$("#clearLocalStorage").click(function ()
{
    if (confirm("בטוח?"))
        chrome.storage.local.clear();
})
$("#clearSyncStorage").click(function ()
{
    if (confirm("בטוח?"))
        chrome.storage.sync.clear();
})
$("#printSettingsToConsole").click(function ()
{
    chrome.storage.sync.get("settings", function (data)
    {
        console.log(data.settings);
    })
})
$("#editSettingsJson").click(function ()
{
    chrome.storage.sync.get("settings", function (data)
    {
        var dataJson = JSON.stringify(data.settings);
        if ($("button#saveJsonBtn").length == 0)
        {
            $("#editSettingsJson").after($("<button>", { id: "saveJsonBtn" }).text("שמור").click(function ()
            {
                try
                {
                    var dataParsed = JSON.parse($("#settingsJsonBox").val());
                    $(this).hide();

                    chrome.storage.sync.set({ settings: dataParsed }, function ()
                    {
                        if (chrome.runtime.lastError)
                        {
                            $("#saveJsonBtn").show();
                            throw chrome.runtime.lastError;
                        }
                        else
                        {
                            $("#saveJsonBtn").remove();
                            $("#settingsJsonBox").remove();
                        }
                    })
                }
                catch (err)
                {
                    alert("השמירה נכשלה:\n" + err);
                }
            }));
            $("#editSettingsJson").after($("<textarea>", { id: "settingsJsonBox", style: "display: block; direction: ltr; width: 50%; height: 200px;" }).val(dataJson));
        }
    })
})

//restore option for old users
chrome.storage.sync.get(["backupDataRestored", "backupData"], function (data)
{
    var backupDataRestored = data.backupDataRestored || false; //data was already restored
    var backupData = data.backupData || []; //the data
    if (backupData.length > 0 && !backupDataRestored) //there is data, and it was not restored
    {
        $("li[data-tab='restoreOld']").show(); //show the tab to restore
        getRestoreList(function (list)
        {
            for (var i = 0; i < list.length; i++)
            {
                $("#restoreList").append($("<li>").text(list[i]));
            }
        });

        //user clicked restore
        $("#restoreSettingsBtn").click(function ()
        {
            chrome.storage.sync.get("backupData", function (data)
            {
                var backupData = data.backupData;

                if (backupData)
                {
                    console.log("restoring old settings...");

                    var exportArray = backupData.split("&*&*&");
                    var exportMatrix = [];
                    for (var j = 0; j < exportArray.length; j++)
                    {
                        var temp = [];
                        temp.push(exportArray[j].split("&*&IS&*&")[0]);
                        temp.push(JSON.parse(exportArray[j].split("&*&IS&*&")[1]));
                        exportMatrix.push(temp);
                    }

                    var oldSettings = {};
                    for (var i = 0; i < exportMatrix.length; i++)
                    {
                        oldSettings[exportMatrix[i][0]] = exportMatrix[i][1]
                    }
                    console.log(oldSettings);

                    var newSettings = {};
                    for (var prop in settings)
                    {
                        newSettings[prop] = settings[prop];
                    }

                    newSettings.hideSuggested = oldSettings.hideOutbrain;
                    newSettings.trackUnreadComments = oldSettings.newMessages;
                    newSettings.showSpoilers = oldSettings.showSpoilers;
                    newSettings.showForumStats = oldSettings.showStats;
                    newSettings.resizeSignatures = oldSettings.signatureResize;
                    newSettings.peekCloseMethod = oldSettings.peekCloseMethod == "doublePress" ? "double" : "auto";
                    if (oldSettings.daysPinned > 90)
                        newSettings.hideSticky.active = false;
                    else
                    {
                        newSettings.hideSticky.active = true;
                        newSettings.hideSticky.days = oldSettings.daysPinned;
                    }
                    newSettings.hideSticky.includingRules = oldSettings.hideRules;
                    newSettings.readtime.activePrefixes = oldSettings.readTimePrefix;
                    newSettings.readtime.newsForums = oldSettings.readTimeNews;

                    var entry;
                    newSettings.commentFilters = [];
                    for (var i = 0; i < oldSettings.commentsAndSubnicks.length; i++)
                    {
                        entry = {
                            id: 0, subnick: { value: "", color: "#333333", size: 11 }, hideSignature: false, disableStyle: false, hideComments: false
                        };
                        entry.id = parseInt(oldSettings.commentsAndSubnicks[i][0]);
                        entry.hideComments = oldSettings.commentsAndSubnicks[i][1];
                        entry.disableStyle = oldSettings.commentsAndSubnicks[i][2];
                        entry.subnick.value = oldSettings.commentsAndSubnicks[i][4];
                        entry.subnick.color = "#" + oldSettings.commentsAndSubnicks[i][5];
                        entry.subnick.size = parseInt(oldSettings.commentsAndSubnicks[i][6]);

                        newSettings.commentFilters.push(entry);
                    }

                    newSettings.customDefaultStyle.active = oldSettings.defaultStyle[0];
                    newSettings.customDefaultStyle.bold = oldSettings.defaultStyle[1];
                    newSettings.customDefaultStyle.italic = oldSettings.defaultStyle[2];
                    newSettings.customDefaultStyle.underline = oldSettings.defaultStyle[3];
                    newSettings.customDefaultStyle.font = oldSettings.defaultStyle[4];
                    newSettings.customDefaultStyle.size = 2;
                    newSettings.customDefaultStyle.color = oldSettings.defaultStyle[5];

                    for (var i = 0; i < oldSettings.importantPost.length; i++)
                    {
                        newSettings.threadFilters.users.push(
                            {
                                action: "bold",
                                exception: [],
                                forums: [],
                                id: parseInt(oldSettings.importantPost[i]),
                                type: "everyForum"
                            });
                    }

                    if (oldSettings.importantWord.length > 0)
                        newSettings.threadFilters.keywords.push(
                            {
                                action: "bold",
                                exception: [],
                                forums: [],
                                words: oldSettings.importantWord,
                                type: "everyForum"
                            });

                    for (var i = 0; i < oldSettings.lowPriorityPost.length; i++)
                    {
                        newSettings.threadFilters.users.push(
                            {
                                action: "hide",
                                exception: [],
                                forums: [],
                                id: parseInt(oldSettings.lowPriorityPost[i]),
                                type: "everyForum"
                            });
                    }

                    if (oldSettings.lowPriorityWord.length > 0)
                        newSettings.threadFilters.keywords.push(
                            {
                                action: "hide",
                                exception: [],
                                forums: [],
                                words: oldSettings.lowPriorityWord,
                                type: "everyForum"
                            });

                    newSettings.autoNightmode.active = oldSettings.nightMode[0];
                    newSettings.autoNightmode.start = oldSettings.nightMode[1] + ":00";
                    newSettings.autoNightmode.end = oldSettings.nightMode[2] + ":00";
                    newSettings.nightmodeShortcut = oldSettings.nightMode[3];

                    chrome.storage.sync.get("customBg", function (data2)
                    {
                        var customBg = data2.customBg;
                        if (customBg)
                        {
                            newSettings.customBg.day = customBg[0];
                            newSettings.customBg.night = customBg[1];
                        }
                        chrome.storage.sync.get("replaceIcons", function (data3)
                        {
                            var replaceIcons = data3.replaceIcons;
                            if (replaceIcons)
                                newSettings.classicIcons = replaceIcons;

                            chrome.storage.sync.get("readTimeUser", function (data4)
                            {
                                var readTimeUser = data4.readTimeUser;
                                if (readTimeUser)
                                    newSettings.readtime.speed = parseInt(readTimeUser);

                                chrome.storage.sync.set({ "settings": newSettings, "backupDataRestored": true }, function ()
                                {
                                    chrome.runtime.sendMessage({ event: { cat: "Click", type: "Restore settings" } });
                                    console.log("restored old settings!");
                                    window.location.hash = ' ';
                                    window.location.reload();
                                });
                            })
                        });
                    });
                }
                else
                {
                    console.log("no old settings to restore");
                }
            })
        });

        //user clicked don't restore
        $("#deleteRestoreBtn").click(function ()
        {
            chrome.storage.sync.set({ "backupDataRestored": true }, function ()
            {
                window.location.hash = ' ';
                window.location.reload();
            });
        })
    }
})

//converts bool to text 
function boolToStr(bool)
{
    if (bool == undefined)
        return "ברירת המחדל";
    if (bool)
        return "פעיל";
    return "כבוי";
}

//returns a list of all previous settings
function getRestoreList(callback)
{
    var list = [];
    chrome.storage.sync.get("backupData", function (data)
    {
        var backupData = data.backupData;

        if (backupData)
        {

            var exportArray = backupData.split("&*&*&");
            var exportMatrix = [];
            for (var j = 0; j < exportArray.length; j++)
            {
                var temp = [];
                temp.push(exportArray[j].split("&*&IS&*&")[0]);
                temp.push(JSON.parse(exportArray[j].split("&*&IS&*&")[1]));
                exportMatrix.push(temp);
            }

            var oldSettings = {};
            for (var i = 0; i < exportMatrix.length; i++)
            {
                oldSettings[exportMatrix[i][0]] = exportMatrix[i][1]
            }
            console.log(oldSettings);

            list.push("הסר את Taboola: " + boolToStr(oldSettings.hideOutbrain));
            list.push("הצג את מספר התגובות שלא נקראו: " + boolToStr(oldSettings.newMessages));
            list.push("הצג ספוילרים: " + boolToStr(oldSettings.showSpoilers));
            list.push("הצג סטטיסטיקות פורומים: " + boolToStr(oldSettings.showStats));
            list.push("הקטן חתימות גדולות: " + boolToStr(oldSettings.signatureResize));

            if (oldSettings.peekCloseMethod == "doublePress")
                list.push("סגירת הצצה לאשכולות: בלחיצה חוזרת")
            else
                list.push("סגירת הצצה לאשכולות: אוטומטית")

            list.push("הסתר נעוצים ישנים: " + boolToStr(oldSettings.daysPinned <= 90));
            list.push("הסתר גם אשכולות חוקים נעוצים: " + boolToStr(oldSettings.hideRules));
            list.push("זמן קריאה: " + boolToStr(oldSettings.readTimePrefix.length > 0 || oldSettings.readTimeNews))

            list.push("חוקי תגובות לפי משתמש: " + oldSettings.commentsAndSubnicks.length + " חוקים");

            list.push("עיצוב תגובות: " + boolToStr(oldSettings.defaultStyle[0]))

            list.push("הדגשת אשכולות: " + oldSettings.importantPost.length + " חוקים");
            list.push("הדגשת מילים: " + oldSettings.importantWord.length + " מילים");
            list.push("הסתרת אשכולות: " + oldSettings.lowPriorityPost.length + " חוקים");
            list.push("הסתרת מילים: " + oldSettings.lowPriorityWord.length + " מילים");

            list.push("מצב לילה אוטומטי: " + boolToStr(oldSettings.nightMode[0]));
            list.push("קיצור דרך למצב לילה: " + boolToStr(oldSettings.nightMode[3]));

            chrome.storage.sync.get("customBg", function (data2)
            {
                var customBg = data2.customBg;
                if (customBg)
                {
                    list.push("שנה את הרקע: " + boolToStr(customBg[0].length > 0 || customBg[1].length > 0));
                }
                chrome.storage.sync.get("replaceIcons", function (data3)
                {
                    var replaceIcons = data3.replaceIcons;
                    list.push("השתמש בסמיילים קלאסיים: " + boolToStr(replaceIcons));

                    callback(list);
                });
            });
        }
    });
}
