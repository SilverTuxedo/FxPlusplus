
if (window.location.href.split("&")[1] == "getUserOnly") { //turn member page to name only for usuage in settings
    var username = $(".member_username").text();
    $("html").html("");
    $("body").html("").html('<div class="userOnly" style="width: 95px; height: 14px;">' + username + '</div>');
    $("body").css({ "background": "#f3f3f3", "overflow": "hidden", "width": "95px", "height": "14px", "text-align": "center", "font-family": "Arial", "font-size": "13px", "margin": "0" });
    if (username === "") { $("body").html('<div class="userOnly" style="width: 95px; height: 14px;">? ? ?</div>'); }
}

if (window.location.href.split("&")[1] == "getIdOnly") { //turn member page to id only for usuage in settings
    if ($(".usermenu li:nth-child(3) a").attr("href") !== undefined) {
        var userId = $(".usermenu li:last-child a").attr("href").split("&userid=")[1].split("&")[0];
    } else {
        var userId = "? ? ?";
    }
    $("html").html("");
    $("body").html("").html('<div class="userOnly" style="width: 95px; height: 14px;">' + userId + '</div>');
    $("body").css({ "background": "#f3f3f3", "overflow": "hidden", "width": "95px", "height": "14px", "text-align": "center", "font-family": "Arial", "font-size": "13px", "margin": "0" });
}
