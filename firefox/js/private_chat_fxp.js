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

        $(".profile div.user-title").attr({ "data-balloon": "לחץ כדי לערוך בהגדרות", "data-balloon-pos": "down"}).css("cursor", "pointer").click(function ()
        {
            window.open(chrome.extension.getURL("html/settings.html") + "?userFilter=" + userId);
        });

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