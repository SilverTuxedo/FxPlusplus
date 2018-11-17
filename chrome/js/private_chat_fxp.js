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

//if sync storage not supported, fallback to local.
chrome.storage.sync = (function ()
{
    return chrome.storage.sync ||
        chrome.storage.local;
})();

var fxpDomain = "https://www.fxp.co.il/";

//selectors for elements which can have special colors, used for nightmode
var colorfulElementSelectors = [
    "[color]",
    "[style^='color:']",
    "[style*=' color:']",
    "[style*=';color:']",
    ".talktext",
    ".usertitle",
    ".usertitle *",
    ".username",
    "#fxplusplus_custom_usernick"
];

//observer for the default subnick container, used for when the user is typing
var typingObserver = new MutationObserver(function (mutations)
{
    mutations.forEach(function (mutation)
    {
        //switch between the custom subnick and the typing notice
        if (mutation.addedNodes.length > 0)
        {
            if (mutation.addedNodes[0].className == "typing-animation") //typing started
                switchSubnick(true);
        }
        else if (mutation.removedNodes.length > 0)
        {
            if (mutation.removedNodes[0].className == "typing-animation") //typing stopped
                switchSubnick(false);
        }
    });
});

//observer for new content like PMs and the PM sidebar.
var newContentObserver = new MutationObserver(function (mutations)
{
    mutations.forEach(function (mutation)
    {
        mutation.addedNodes.forEach(function (addedNode)
        {
            var addedEl = $(addedNode);
            if (addedEl.hasClass("talk-bubble") || addedEl.hasClass("pm"))
            {
                //brighten new pm content if nightmode is active
                if (localStorage.getItem("nightmodeEnabled") == "true")
                {
                    utils.brightenBySelectors(addedEl, colorfulElementSelectors);
                }
            }
        })
    });
});

//build an animated loading element
var loadingElement = $("<div>", { class: "sk-cube-grid" });
for (var i = 1; i <= 9; i++)
{
    loadingElement.append($("<div>", { class: ("sk-cube sk-cube" + i) }))
}


if (localStorage.getItem("nightmodeEnabled") === "true")
{
    var darkElement = document.createElement("div");
    darkElement.setAttribute("style", "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background:black; z-index: 999999999999999;");
    darkElement.setAttribute("id", "happyEyes");
    darkElement.appendChild(loadingElement[0]);
    document.documentElement.appendChild(document.importNode(darkElement, true));

    $(document).ready(function ()
    {
        activateNightmode();
        setTimeout(function ()
        {
            $("#happyEyes").fadeOut(100, function () { $(this).remove() });
        }, 200);
    });
}

chrome.storage.sync.get("settings", function (data)
{
    $(document).ready(function ()
    {
        var settings;
        if (data)
            settings = data.settings || {};
        else
            settings = {};

        var userId = getUserIdFromLink($(".user-name a").attr("href"));

        //add the button to edit the subnick in the settings
        $(".profile div.user-title #cp-color-picker").after($("<div>", {
            id: "fxplusplus_quick_subnick",
            "data-balloon": "ערוך משתמש זה בהגדרות",
            "data-balloon-pos": "right"
        }).append(
            $("<img>", {
                src: chrome.extension.getURL("images/pencil.svg"),
                class: "dayImg"
            })
            ).append(
            $("<img>", {
                src: chrome.extension.getURL("images/pencil_light.svg"),
                class: "nightImg",
                style: "display: none"
            })
            )

        );
        $("#fxplusplus_quick_subnick").click(function ()
        {
            window.open(chrome.extension.getURL("html/settings.html") + "?userFilter=" + userId);
        });


        //hide typing from other users
        if (settings.disableLiveTypingPm)
        {
            injectScript("js/disable_typing.js");
        }

        //apply subnick filters
        if (settings.commentFilters)
        {
            for (var i = 0; i < settings.commentFilters.length; i++)
            {
                if (settings.commentFilters[i].id == userId) //match in filters
                {
                    applyCommentFilterInChat(settings.commentFilters[i], $(".profile"));
                }
            }
            //brighten the new subnick if needed
            if (localStorage.getItem("nightmodeEnabled") == "true")
            {
                utils.brightenBySelectors($(".profile"), colorfulElementSelectors);
            }
        }

        var styleWrapper; //element to wrap around the text that has the styles
        var wysibbStyleWrapper; // element to wrap around the text in the wysibb box (it does not support certain styles)

        //custom style to comments
        if (settings.customDefaultStyle.active)
        {

            styleWrapper = utils.buildStyleWrapper(settings.customDefaultStyle, false, false);
            wysibbStyleWrapper = utils.buildStyleWrapper(settings.customDefaultStyle, false, true);

            //observer to new text, to wrap with style
            var observerCustomDefaultStyle = new MutationObserver(function (mutations)
            {
                mutations.forEach(function (mutation)
                {
                    if (mutation.addedNodes.length > 0)
                    {
                        if (mutation.addedNodes[0].nodeName == "#text")
                        {
                            //new text node, wrap with the style
                            if ($(mutation.addedNodes[0]).parents(".wysibb-text-editor.wysibb-body").length > 0)
                            {
                                if (wysibbStyleWrapper)
                                    $(mutation.addedNodes[0]).wrap(wysibbStyleWrapper);
                            }
                            else
                                $(mutation.addedNodes[0]).wrap(styleWrapper);
                            utils.fixCaret(mutation.addedNodes[0]); //move the caret to the end of the text element
                            debug.info("editor style applied");
                        }
                    }
                })
            });

            //add observer to minimal designers
            if (settings.customDefaultStyle.activePrivateChat)
            {
                if ($(".chat-text-input .send-element div#input-textarea").length > 0)
                    observerCustomDefaultStyle.observe($(".chat-text-input .send-element div#input-textarea")[0], { childList: true });
                if ($("#qrfastfxp .wysibb-text-editor.wysibb-body").length > 0)
                    observerCustomDefaultStyle.observe($("#qrfastfxp .wysibb-text-editor.wysibb-body")[0], { childList: true });
            }
        }

        if ($(".chat-data").length) //observe new PMs (if view exists)
        {
            newContentObserver.observe($(".chat-data")[0], { childList: true });
        }

        if ($("ul.pm-list").length) //observe PMs list (if view exists)
        {
            newContentObserver.observe($("ul.pm-list")[0], { childList: true });
        }
    });
});

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

//applies a filter to a userbar - in FXP's chat system
function applyCommentFilterInChat(filter, chatTitle)
{
    if (filter.subnick.value.length > 0) //a subnick is set
    {
        var oldUsertitle = chatTitle.find(".user-title span.user_title");
        oldUsertitle.after($("<span>", { id: "fxplusplus_custom_usernick" }));
        oldUsertitle.hide();
        var subnickContainer = chatTitle.find("#fxplusplus_custom_usernick");
        utils.setSubnickContainer(filter.subnick, subnickContainer);

        typingObserver.observe(oldUsertitle[0], { childList: true });
    }

    //other filters are irrelevant for this kind of container
}

//switches between showing the typing indicator container and the custon subnick container
function switchSubnick(typing)
{
    if (typing)
    {
        $("#fxplusplus_custom_usernick").hide();
        $(".user-title span.user_title").show();
    }
    else
    {
        $("#fxplusplus_custom_usernick").show();
        $(".user-title span.user_title").hide();
    }
}

//activates night mode
function activateNightmode()
{
    //add nightmode stylesheet
    $("body").append($("<link>", { id: "nightmodeStyle", rel: "stylesheet", href: chrome.extension.getURL("css/private_chat_nightmode.css") }));
    $("body").prepend($("<div>", { id: "nightmodeShade" }));

    var dynamicContentContainers = [
        ".talktext",
        ".user-name",
        ".user-title",
        ".pm-list .user-name"
    ];
    utils.brightenBySelectors($(dynamicContentContainers.join(", ")), colorfulElementSelectors);

    $("body").addClass("nightmodeActive");
}

//disables night mode
function disableNightmode()
{
    //remove previous stylesheets
    $("style#customBg, link#nightmodeStyle").remove();
    $("#nightmodeShade").remove();

    utils.reverseBrightening($("body"));
    
    $("body").removeClass("nightmodeActive");
}

//safely injects a script to the head
function injectScript(filename)
{
    var s = $("<script>", { type: "text/javascript", src: chrome.extension.getURL(filename) });
    //This is SAFE, since only web_accessible_resources which are part of the addon can be run.
    $("head").append(s);
}

//returns true if the string given is a url
function isURL(str)
{
    var pattern = /(https?:\/\/[^\s]+)/g;
    return pattern.test(str);
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
