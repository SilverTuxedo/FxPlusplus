/*
    Copyright 2015-2019 SilverTuxedo

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


//activate night mode, coming from somewhere else
if (localStorage.getItem("nightmodeEnabled") === "true")
{
    var darkElement = document.createElement("div");
    darkElement.setAttribute("style", "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background:black; z-index: 999999999999999;");
    darkElement.setAttribute("id", "happyEyes");
    document.documentElement.appendChild(document.importNode(darkElement, true));

    $(document).ready(function ()
    {
        activateNightmode();
        setTimeout(function ()
        {
            $("#happyEyes").fadeOut(100, function () { $(this).remove(); });
        }, 200);
    });
}

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

//activates night mode
function activateNightmode()
{
    //add nightmode stylesheet
    $("body").append($("<link>", { id: "nightmodeStyle", rel: "stylesheet", href: chrome.extension.getURL("css/iframes_nightmode.css") }));
    $("body").prepend($("<div>", { id: "nightmodeShade" }));
    $("body").addClass("nightmodeActive");
}

//disables night mode
function disableNightmode()
{
    //remove previous stylesheets
    $("style#customBg, link#nightmodeStyle").remove();
    $("#nightmodeShade").remove();
    $("body").removeClass("nightmodeActive");
}