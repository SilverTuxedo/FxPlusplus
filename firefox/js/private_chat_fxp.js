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

//if sync storage not supported, fallback to local.
chrome.storage.sync = (function ()
{
    return chrome.storage.sync ||
        chrome.storage.local;
})();

var fxpDomain = "https://www.fxp.co.il/";

chrome.storage.sync.get("settings", function (data)
{
    $(document).ready(function ()
    {
        var settings = data.settings || {};
        
        var userId = getUserIdFromLink($(".user-name a").attr("href"));

        //add the balloon to edit the subnick in the settings
        $(".profile div.user-title").attr({ "data-balloon": "לחץ כדי לערוך בהגדרות", "data-balloon-pos": "down"}).css("cursor", "pointer").click(function ()
        {
            window.open(chrome.extension.getURL("html/settings.html") + "?userFilter=" + userId);
        });

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
        }

        var styleWrapper; //element to wrap around the text that has the styles
        var wysibbStyleWrapper; // element to wrap around the text in the wysibb box (it does not support certain styles)

        //custom style to comments
        if (settings.customDefaultStyle.active)
        {
            var styleElements = [];
            var wysibbStyleElements = [];
            var styleProp = settings.customDefaultStyle;

            //build the elements according to the style
            if (styleProp.color != "#333333") //disable if the color is the default color
            {
                styleElements.push($("<font>", { color: styleProp.color }));
                wysibbStyleElements.push($("<font>", { color: styleProp.color }));
            }
            if (styleProp.underline)
            {
                styleElements.push($("<u>"));
                wysibbStyleElements.push($("<u>"));
            }
            if (styleProp.italic)
            {
                styleElements.push($("<em>"));
            }
            if (styleProp.bold)
            {
                styleElements.push($("<strong>"));
                wysibbStyleElements.push($("<strong>"));
            }
            if (styleProp.font != "Arial") //disable if default font
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

            if (wysibbStyleElements.length > 0)
            {
                //wrap elements inside each other
                wysibbStyleWrapper = wysibbStyleElements[0];
                for (var i = 1; i < wysibbStyleElements.length; i++)
                {
                    getDeepestChild(wysibbStyleWrapper).append(wysibbStyleElements[i]);
                }
            }

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
                            fixCaret(mutation.addedNodes[0]); //move the caret to the end of the text element
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
    });
});

//applies a filter to a userbar - in FXP's chat system
function applyCommentFilterInChat(filter, chatTitle)
{
    if (filter.subnick.value.length > 0) //a subnick is set
    {
        console.log("applying custom comment filters");
        chatTitle.find(".user-title > span").remove();
        chatTitle.find(".user-title").append($("<span>"));
        var subnickContainer = chatTitle.find(".user-title > span");
        setSubnickContainer(filter.subnick, subnickContainer);
    }

    //other filters are irrelevant for this kind of container
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