/*
    Copyright 2016 SilverTuxedo

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

chrome.storage.sync = (function () {
    return chrome.storage.sync ||
           chrome.storage.local;
})();

chrome.storage.sync.get("readTimeUser", function (data) {
    var readTimeUser = data.readTimeUser;
    if (isNaN(readTimeUser)) {
        chrome.storage.sync.set({ "readTimeUser": 220 }, function () { location.reload() });
    } else {
        var msg = "";
        var readtime = 0;

        var interval;
        $(document).ready(function () {
            $("script").remove();
            $("img").remove();
            if ($(".navbit:eq(2)").text().search("עדכוני") > -1) { //verify that this is from an "update" forum
                if ($(".postcontent:eq(0) table[width=950]").length > 1) { //FxP's dumb table design
                    msg = $(".postcontent:eq(0) table[width=950] table[width=950] > tbody > tr:first > td:eq(1)").text().replace(/\n/g, " ").replace(/  /g, " ");
                } else {
                    for (i = 2; i < 11; i++) {
                        if ($(".postbit:eq(0) .postcontent").text().split("\n")[i].split(" ").length > 15) {
                            msg = $(".postbit:eq(0) .postcontent").text().split("\n")[i];
                            i = 200;
                        } else if (i == 10) {
                            msg = $(".postbit:eq(0) .postcontent").text();
                        }
                    }
                }
            }
            else msg = $(".postbit:eq(0) .postcontent").text();


            var words = msg.split(" ").length;
            readtime = Math.round(words / readTimeUser * 10) / 10; //round to 1 decimal place
            var output = "";
            if (readtime >= 1) output += readtime + " דק'";
            else if (Math.round(readtime * 60) > 0) output += Math.round(readtime * 60) + " שנ'";
            else output += ">1 שנ'"
            interval = setInterval(function () { $("html").html('<head></head><body><div class="timeInText">' + output + '</div></body>'); }, 100);
        })
        $(window).load(function () {
            window.clearInterval(interval);
            $("body").css("background", "#00ff00")
        })
    }

});