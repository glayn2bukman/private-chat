/*
    Author: Bukman, glayn2bukman@gmail.com
    About : This is a private and simple chatting application fi di wolz
*/

var HOST = "http://45.33.6.237:60101/";
var LOGIN_URL = HOST+"login";
var POST_MESSAGE_URL = HOST+"post_message";
var INBOX_URL = HOST+"inbox";
var UPDATE_ACCOUNT_URL = HOST+"update_account";
var ONLINE_STATE_URL = HOST+"activity_status";
var THEMES_URL = HOST+"themes";
var SET_THEME_URL = HOST+"set_user_theme";
var SET_MAX_INBOX_URL = HOST+"set_max_inbox";
var LOGIN_EMBEDDED_URL = HOST+"../login_embedded";

var FILE_ATTACHMENT_PATH = HOST+"static/files/";
var THEMES_PATH = "static/themes/";
var DEFAULT_THEME = "base.css";

var EMOJI_PATH = "static/emoji/";

var GROUPS=[];
var ACTIVE_GROUP = "";
var UNAME = "";
var CHATS = {}
var USER_THEMES = [];

var CHECK_ONLINE_STATUS_RATE = 10; // seconds
var INBOX_READ_RATE = 1; // in seconds
var INBOX_READ_INTERVAL_VAR;

var LAST_ACTIVE_GROUP = ""; // will help us not reload themes when user logs out and login again

var __EMBEDDED__ = false; // set to true if application is embedded in another app

var CALC_EXIT_CODE = "1.000.1";

var _notification_uname="";

var SUPPORTS_EMOJIS = true;

function activate_grp_chats()
{
    for (var i=0; i<GROUPS.length; i++)
    {
        CHATS[GROUPS[i]]["chat-div"].style.display = "none";
    }
    
    document.getElementById("groups-div").style.display = "none";

    CHATS[this.grp]["chat-div"].style.display = "block";
    
    document.getElementById("chats").style.display = "block";
    
    ACTIVE_GROUP = this.grp;
    document.getElementById("_group").value=ACTIVE_GROUP;
    
    // scroll div to bottom...
    var objDiv = document.getElementById("chats-container-div");
    objDiv.scrollTop = objDiv.scrollHeight;
    
    document.getElementById("online_state").style.display = "block";
    
    check_online_status();
    
    if (ACTIVE_GROUP!=LAST_ACTIVE_GROUP)
    {
        var theme_found = false;
        for(var i=0;i<USER_THEMES.length; ++i)
        {
            if(USER_THEMES[i][0]==ACTIVE_GROUP)
            {
                document.getElementById("theme").href = THEMES_PATH+USER_THEMES[i][1];    
                theme_found = true;
                break;
            }
        }
        
        if(!theme_found)
        {
            document.getElementById("theme").href = THEMES_PATH+DEFAULT_THEME;    
        }
    
        LAST_ACTIVE_GROUP = ACTIVE_GROUP;
    }
}

function show_groups()
{
    if (!GROUPS.length)
    {
        flag_error("sorry, you are not in any active group!");
        return;
    }

    div = document.getElementById("groups-div");
    document.getElementById("login-div").style.display = "none";
    document.getElementById("chats").style.display = "none";

    clear(div);
    
    div.style.display = "";
    
    var grp_div;
    for (var i=0; i<GROUPS.length; i++)
    {
        grp_div = document.createElement("div");
        grp_div.setAttribute("class","group");
        grp_div.innerHTML = GROUPS[i];
        
        grp_div.grp = GROUPS[i];
        
        grp_div.onclick = activate_grp_chats;
        
        div.appendChild(grp_div);
    }

    if(GROUPS.length==1)
    {
        grp_div.onclick();
        check_online_status();
    }
}

function media_html(msg)
{
    var innerHTML = "";
    if(
        msg.toLowerCase().indexOf(".jpg")>=0 ||
        msg.toLowerCase().indexOf(".jpeg")>=0 ||
        msg.toLowerCase().indexOf(".gif")>=0 ||
        msg.toLowerCase().indexOf(".png")>=0
        // image attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div clickable\" mediatype=\"img\" data=\""+
                         msg+"\" "+
                         "onclick=\"start_loading_media(this)\">Picture</div>"+
                         "<div id=\""+msg+"\" style=\"height:100px;width:150px;border-radius:5px;display:none;\"></div><br>";
    }

    else if(
        msg.toLowerCase().indexOf(".3gpp")>=0 ||
        msg.toLowerCase().indexOf(".mp3")>=0  ||
        msg.toLowerCase().indexOf(".wav")>=0
        // audio attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div clickable\" data=\""+
                         msg+"\" "+
                         "onclick=\"start_loading_media(this)\">Audio</div>"+
                         "<audio controls style=\"max-width:100%; display:none;\" id=\""+
                         msg+
                         "\"><source src=\""+FILE_ATTACHMENT_PATH+msg+"\"> {brocken audio}</audio><br>";
    }

    else if(
        msg.toLowerCase().indexOf(".mp4")>=0
        // video attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div clickable\" data=\""+
                         msg+"\" "+
                         "onclick=\"start_loading_media(this)\">Video</div>"+
                         "<video controls style=\"width:100%; display:none; margin-bottom:10px;\" id=\""+
                         msg+
                         "\"><source src=\""+FILE_ATTACHMENT_PATH+msg+"\" type=\"video/mp4\"> {brocken video}</video><br>";
    }
    
    return innerHTML;

}

function attempted_login()
{
    stop_loading();

    if (this.status===200)
    {
        
        var reply = JSON.parse(this.responseText);
        
        if (!reply.status)
        {
            flag_error(reply.log);
            return;
        }
        
        var chats_div = document.getElementById("chats");
        var chat_div, date_div;

        GROUPS = reply.groups;
        for (var i=0; i<GROUPS.length; i++)
        {
            if(CHATS[GROUPS[i]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                CHATS[GROUPS[i]] = {
                    "chat-div":chat_div, 
                    'data':[],
                    'dates':[],
                    'times':[]
                };
                
                document.getElementById("chats-container-div").appendChild(chat_div);
            }
        }

        UNAME = reply.uname;
        document.getElementById("_sender").value = UNAME;
        
        var inbox = JSON.parse(reply.inbox).inbox;
        
        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        var looped = false;
        for(var i=0; i<inbox.length; ++i)
        {
            looped = true;

            if(CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }
            
            if(CHATS[inbox[i][0]].dates.indexOf(inbox[i][3])<0) // new major date found...
            {
                CHATS[inbox[i][0]].dates.push(inbox[i][3]);
                
                date_div = document.createElement("div");
                date_div.setAttribute("class","date");
                date_div.innerHTML = inbox[i][3];
                
                CHATS[inbox[i][0]]["chat-div"].appendChild(date_div);
            }
            
            chat = document.createElement("div");
            sender = document.createElement("div"); sender.setAttribute("class","sender");
            msg = document.createElement("div"); msg.setAttribute("class","msg");
            time_div = document.createElement("div"); time_div.setAttribute("class","time");
            
            if (inbox[i][1]==UNAME) // outgoing message...
            {
                chat.setAttribute("class","chat outgoing");
                sender.innerHTML = "me";
            }
            else
            {
                chat.setAttribute("class","chat incoming");
                sender.innerHTML = inbox[i][1];
            }
            
            time_div.innerHTML = inbox[i][4];
            
            _msg_data = inbox[i][5].split(":~!.:");
            for (var j=0; j<(_msg_data.length-1); j++)
            {
                msg.innerHTML += media_html(_msg_data[j]);
            } 

            var _msg = _msg_data[_msg_data.length-1];
            if(!SUPPORTS_EMOJIS){msg.innerHTML += _msg;}
            else{
                if(_msg.indexOf("`")<0){msg.innerHTML += _msg;}
                else{ // message has emojis
                    var _msg_parts = _msg.split("`");
                    var finished = [];
                    for(var mi=0; mi<_msg_parts.length;++mi){
                        if(_msg_parts[mi].length && !isNaN(parseInt(_msg_parts[mi])) && finished.indexOf(_msg_parts[mi])<0){
                            while(_msg.indexOf("`"+_msg_parts[mi]+"`")>=0){
                                _msg = _msg.replace("`"+_msg_parts[mi]+"`",
                                    "<img class=\"emoji\" src=\""+EMOJI_PATH+_msg_parts[mi]+".png"+"\">"
                                );
                            }
                            
                            finished.push(_msg_parts[mi]);
                        }
                    }
                    msg.innerHTML += _msg;
                }
            }

            
            chat.appendChild(sender);
            chat.appendChild(msg);
            chat.appendChild(time_div);
      
            CHATS[inbox[i][0]]["chat-div"].appendChild(chat);
        }
        
        if(looped)
        {
            var objDiv = document.getElementById("chats-container-div");
            objDiv.scrollTop = objDiv.scrollHeight;
        }


        USER_THEMES = reply.user_themes;
                
        var theme_div = document.getElementById("themes"); clear(theme_div);
        var theme;
        // all themes...
        for (var i=0; i<reply.all_themes.length; ++i)
        {
            theme = document.createElement("div");
            theme.setAttribute("class","theme");
            theme.theme = reply.all_themes[i][2];
            theme.innerHTML = ((i+1)>9?"":"0")+(i+1)+") "+reply.all_themes[i][0];
            theme.onclick = set_theme;
            
            if(i==(reply.all_themes.length-1)) // last theme
                theme.style.marginBottom = "0px";
            
            theme_div.appendChild(theme);
        }

        INBOX_READ_INTERVAL_VAR = setInterval(get_inbox, INBOX_READ_RATE*1000);

        show_groups();
        
    }
    else
    {
        flag_error("[logging in] status code "+this.status);
    }
}

function done_setting_theme()
{
    stop_loading();
    
    if(this.status===200)
    {
        reply = JSON.parse(this.responseText);
        if(!reply.status)
        {
            flag_error(reply.log);
            return;
        }

        notify("updating theme...");
        document.getElementById("theme").href = THEMES_PATH+this.theme;    

    }
    else
    {
        flag_error("[setting theme] status code "+this.status);
    }
}

function set_theme()
{
    hide_modal("themes_modal");

    var req = new XMLHttpRequest();
    
    req.theme = this.theme;
    req.open("post", SET_THEME_URL, true);
    
    req.onload = done_setting_theme;
    
    var form = new FormData();
    form.append("uname", UNAME);
    form.append("group", ACTIVE_GROUP);
    form.append("theme", this.theme);
    
    req.send(form);
    
    start_loading();

}

function login()
{
    var req = new XMLHttpRequest();
    
    req.open("post", LOGIN_URL, true);
    //req.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    
    req.onload = attempted_login;
    
    var form = new FormData();
    form.append("uname", document.getElementById("uname").value);
    form.append("pswd", document.getElementById("pswd").value);
    
    req.send(form);
    
    start_loading();

}

function sent_message()
{
    close_emoji_div();

    stop_loading();

    if (this.status===200)
    {
        if(this.has_attachments)
            document.getElementById("caption").value = "";
        
        document.getElementById('form').reset();
        
        var reply = JSON.parse(this.responseText);
        
        if (!reply.status)
        {
            flag_error(reply.log);
            return;
        }

        var chats_div = document.getElementById("chats");
        var chat_div, date_div;

        var inbox = [reply.msg];
        
        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        for(var i=0; i<inbox.length; ++i)
        {
            if(CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                if(CHATS[inbox[i][0]].times.indexOf(inbox[i][2])>=0) // this message has already been received
                    continue;
                    
                CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }
            
            if(CHATS[inbox[i][0]].dates.indexOf(inbox[i][3])<0) // new major date found...
            {
                CHATS[inbox[i][0]].dates.push(inbox[i][3]);
                
                date_div = document.createElement("div");
                date_div.setAttribute("class","date");
                date_div.innerHTML = inbox[i][3];
                
                CHATS[inbox[i][0]]["chat-div"].appendChild(date_div);
            }
            
            chat = document.createElement("div");
            sender = document.createElement("div"); sender.setAttribute("class","sender");
            msg = document.createElement("div"); msg.setAttribute("class","msg");
            time_div = document.createElement("div"); time_div.setAttribute("class","time");
            
            if (inbox[i][1]==UNAME) // outgoing message...
            {
                chat.setAttribute("class","chat outgoing");
                sender.innerHTML = "me";
            }
            else
            {
                chat.setAttribute("class","chat incoming");
                sender.innerHTML = inbox[i][1];
            }
            
            time_div.innerHTML = inbox[i][4];

            _msg_data = inbox[i][5].split(":~!.:");
            for (var j=0; j<(_msg_data.length-1); j++)
            {
                msg.innerHTML += media_html(_msg_data[j]);
            }

            var _msg = _msg_data[_msg_data.length-1];
            if(!SUPPORTS_EMOJIS){msg.innerHTML += _msg;}
            else{
                if(_msg.indexOf("`")<0){msg.innerHTML += _msg;}
                else{ // message has emojis
                    var _msg_parts = _msg.split("`");
                    var finished = [];
                    for(var mi=0; mi<_msg_parts.length;++mi){
                        if(_msg_parts[mi].length && !isNaN(parseInt(_msg_parts[mi])) && finished.indexOf(_msg_parts[mi])<0){
                            while(_msg.indexOf("`"+_msg_parts[mi]+"`")>=0){
                                _msg = _msg.replace("`"+_msg_parts[mi]+"`",
                                    "<img class=\"emoji\" src=\""+EMOJI_PATH+_msg_parts[mi]+".png"+"\">"
                                );
                            }
                            
                            finished.push(_msg_parts[mi]);
                        }
                    }
                    msg.innerHTML += _msg;
                }
            }


            chat.appendChild(sender);
            chat.appendChild(msg);
            chat.appendChild(time_div);
      
            CHATS[inbox[i][0]]["chat-div"].appendChild(chat);

        }
        
        // scroll div to bottom...
        var objDiv = document.getElementById("chats-container-div");
        objDiv.scrollTop = objDiv.scrollHeight;
        
        console.log(reply);
        
    }
    else
    {
        flag_error("[sending message] status code "+this.status);
    }
}


function send_message()
{

    var grp = document.getElementById("__group__").value;
    grp = grp.length?":embedded:"+grp:grp;  

    msg = document.getElementById("entry").value;
    document.getElementById("_group").value = ACTIVE_GROUP;
    document.getElementById("_sender").value = UNAME+grp;
    
    if(!msg.length)
    {
        show_info("please type something");
        return
    }

    document.getElementById('_msg').value = msg;

    var req = new XMLHttpRequest();
    
    req.open("post", POST_MESSAGE_URL, true);
    
    req.has_attachments = false;
    req.onload = sent_message;
    
    var form = document.getElementById("form");
    req.send(new FormData(form));
    
    document.getElementById("entry").value = "";
    start_loading();
}

function send_attachment()
{
    var grp = document.getElementById("__group__").value;
    grp = grp.length?":embedded:"+grp:grp;  

    hide_modal("attachment_modal");
    msg = document.getElementById("caption").value;
    document.getElementById("_group").value = ACTIVE_GROUP;
    document.getElementById("_sender").value = UNAME+grp;
    
    if(!msg.length)
        msg = " "; // there MUST be a message

    document.getElementById('_msg').value = msg;

    var req = new XMLHttpRequest();
    
    req.open("post", POST_MESSAGE_URL, true);
    
    req.has_attachments = true;
    req.onload = sent_message;
    
    var got_attachments = document.getElementById("files").files.length;
    
    if (got_attachments)
    {
        req.onloadstart = function (e) {
            document.getElementById("upload_progress").innerHTML = "0.00%";
            document.getElementById("uploading").style.display = "block";
        }
        req.onloadend = function (e) {
            document.getElementById("uploading").style.display = "none";
        }

        req.upload.addEventListener("progress", function(evt){
              if (evt.lengthComputable) {
                var progress = human_readable((evt.loaded/evt.total)*100,2);
                document.getElementById("upload_progress").innerHTML = progress+"%";

                if (progress>=100)
                    document.getElementById("upload_progress").innerHTML = "finalising...";

              }
            }, false);
    }
    
    var form = document.getElementById("form");
    req.send(new FormData(form));    
}

function cancel_attachment()
{
    document.getElementById("caption").value = "";
    document.getElementById('form').reset();
    hide_modal("attachment_modal");
}

function got_inbox()
{
    if (this.status===200)
    {        
        var reply = JSON.parse(this.responseText);
        
        if (!reply.status)
        {
            flag_error(reply.log);
            return;
        }

        var chats_div = document.getElementById("chats");
        var chat_div, date_div;

        var inbox = reply.inbox;
        
        if (!inbox.length)
            return
        
        var vibrated=false, notified=false;

        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        for(var i=0; i<inbox.length; ++i)
        {
            if(CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                if(CHATS[inbox[i][0]].times.indexOf(inbox[i][2])>=0) // this message has already been received
                    continue;
                    
                CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }
            
            if(CHATS[inbox[i][0]].dates.indexOf(inbox[i][3])<0) // new major date found...
            {
                CHATS[inbox[i][0]].dates.push(inbox[i][3]);
                
                date_div = document.createElement("div");
                date_div.setAttribute("class","date");
                date_div.innerHTML = inbox[i][3];
                
                CHATS[inbox[i][0]]["chat-div"].appendChild(date_div);
            }
            
            chat = document.createElement("div");
            sender = document.createElement("div"); sender.setAttribute("class","sender");
            msg = document.createElement("div"); msg.setAttribute("class","msg");
            time_div = document.createElement("div"); time_div.setAttribute("class","time");
            
            if (inbox[i][1]==UNAME) // outgoing message...
            {
                chat.setAttribute("class","chat outgoing");
                sender.innerHTML = "me";
            }
            else
            {
                if((!vibrated) && document.getElementById("vibrate").innerHTML.indexOf(": On")>=0){
                    if(navigator.vibrate){
                        navigator.vibrate(500);
                        vibrated=true;
                    }
                }
                if ((!notified) && "Notification" in window) {
                  _notification_uname = inbox[i][1]
                  Notification.requestPermission(function (permission) {
                    // If the user accepts, let’s create a notification
                    if (permission === "granted") {
                      var notification = new Notification("PChat", {
                           tag: "message", 
                           body: "new msg from "+_notification_uname
                      }); 
                      notification.onshow  = function() { console.log("show"); };
                      notification.onclose = function() { console.log("close"); };
                      notification.onclick = function() { console.log("click"); };
                    }
                    
                    notified = true;

                  });
                }

                chat.setAttribute("class","chat incoming");
                sender.innerHTML = inbox[i][1];
            }
            
            time_div.innerHTML = inbox[i][4];

            _msg_data = inbox[i][5].split(":~!.:");
            for (var j=0; j<(_msg_data.length-1); j++)
            {
                msg.innerHTML += media_html(_msg_data[j]);
            }

            var _msg = _msg_data[_msg_data.length-1];
            if(!SUPPORTS_EMOJIS){msg.innerHTML += _msg;}
            else{
                if(_msg.indexOf("`")<0){msg.innerHTML += _msg;}
                else{ // message has emojis
                    var _msg_parts = _msg.split("`");
                    var finished = [];
                    for(var mi=0; mi<_msg_parts.length;++mi){
                        if(_msg_parts[mi].length && !isNaN(parseInt(_msg_parts[mi])) && finished.indexOf(_msg_parts[mi])<0){
                            while(_msg.indexOf("`"+_msg_parts[mi]+"`")>=0){
                                _msg = _msg.replace("`"+_msg_parts[mi]+"`",
                                    "<img class=\"emoji\" src=\""+EMOJI_PATH+_msg_parts[mi]+".png"+"\">"
                                );
                            }
                            
                            finished.push(_msg_parts[mi]);
                        }
                    }
                    msg.innerHTML += _msg;
                }
            }
            

            chat.appendChild(sender);
            chat.appendChild(msg);
            chat.appendChild(time_div);
      
            CHATS[inbox[i][0]]["chat-div"].appendChild(chat);
            
        }
        
        // scroll div to bottom...
        var objDiv = document.getElementById("chats-container-div");
        objDiv.scrollTop = objDiv.scrollHeight;
        
        console.log(reply);
        
    }
    else
    {
        flag_error("[fetching inbox] status code "+this.status);
    }
}


function get_inbox()
{
    
    var grp = document.getElementById("__group__").value;
    grp = grp.length?":embedded:"+grp:grp;  
    
    var req = new XMLHttpRequest();
    
    req.open("post", INBOX_URL, true);
    
    req.onload = got_inbox;
    
    var form = new FormData();
    form.append("uname", UNAME+grp);
    
    req.send(form);
    
}

function back()
{
    if (document.getElementById("preview_div").style.display == "block")
    {
        done_previewing();
        return;
    }
    
    if (__EMBEDDED__)
        return;
    
    if(GROUPS.length==1 && ACTIVE_GROUP.length)
        ACTIVE_GROUP = "";

    if (!ACTIVE_GROUP) // logout...
    {
        if(document.getElementById("login-div").style.display == "block"){
            document.getElementById("calc_div").style.display = "block";
            document.getElementById("main_div").style.display = "none";
        }else{
            document.getElementById("uname").value="";
            document.getElementById("pswd").value="";
            
            GROUPS=[];
            ACTIVE_GROUP = "";
            UNAME = "";
            CHATS = {}
            
            clearInterval(INBOX_READ_INTERVAL_VAR);
            
            document.getElementById("groups-div").style.display = "none";
            document.getElementById("chats").style.display = "none";
            document.getElementById("login-div").style.display = "block";
        }
    }

    else // return to groups...
    {
        ACTIVE_GROUP = "";

        document.getElementById("chats").style.display = "none";    
        document.getElementById("groups-div").style.display = "block";
    }

    check_online_status();
}

function start_loading_media(media_div)
{
    var target = media_div.getAttribute("data");
    notify("loading media...");
    media_div.style.display = "none";
    
    if(media_div.getAttribute("mediatype"!="img"))
        document.getElementById(target).src=FILE_ATTACHMENT_PATH+target;
    else
    {
        var bgImg = new Image();
        bgImg.mom = document.getElementById(target);
        bgImg.onload = img_loaded;
        bgImg.src = FILE_ATTACHMENT_PATH+target;
    }
    document.getElementById(target).style.display = "block";
}

function img_loaded()
{

    this.mom.style.background = "#333 url(\"" + this.src + "\") no-repeat";
    this.mom.style.backgroundPosition = "center";
    this.mom.style.backgroundSize = "cover";
    this.mom.bgImg = this;
    this.mom.onclick = preview_img;
}

function preview_img()
{
    document.getElementById("main_div").style.opacity = "0.1";
    document.getElementById("preview-img").src = this.bgImg.src;
    document.getElementById("preview_div").style.display = "block";
}

function done_previewing()
{
    document.getElementById("main_div").style.opacity = "1"
    document.getElementById("preview_div").style.display = "none";
}

function checked_online_status()
{
    if (this.status===200)
    {
        if (this.responseText=="online" /*&& 
            document.getElementById("online_state").style.background=="red"*/)
            {
                document.getElementById("online_state").style.background = "green";
            }

        if (this.responseText=="offline" /*&& 
            document.getElementById("online_state").style.background=="green"*/)
            {
                document.getElementById("online_state").style.background = "red";
            }
    }
}

function check_online_status()
{
    if(!ACTIVE_GROUP.length)
    // we only display group statuses not user statuses!
    {
        document.getElementById("online_state").style.background = "red";
        document.getElementById("online_state").style.display = "none";
        return;
    }

    if (document.getElementById("online_state").style.display == "none")
        document.getElementById("online_state").style.display = "block";

    var req = new XMLHttpRequest();
    
    req.open("post", ONLINE_STATE_URL, true);
    
    req.onload = checked_online_status;
    
    var form = new FormData();
    form.append("uname", UNAME);
    form.append("group", ACTIVE_GROUP);
    
    req.send(form);

    
}

function edited_account()
{
    stop_loading();
    
    if (this.status===200)
    {
        var reply = JSON.parse(this.responseText);
        if(!reply.status)
        {
            flag_error(reply.log);
            return;
        }
        
        show_success("password updated!");
    }
    
    else
    {
        flag_error("[updating account info] reply code: "+this.status);
    }
}

function edit_account()
{
    hide_modal("settings_modal");

    swal({
          title: "Current Password",
          text: "Enter current password",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "new password"
        },
        
        function(current_pswd){
            if (current_pswd === false) {return false;} // clicked "cancel"

            if (current_pswd === "") 
            {
                swal.showInputError("Password cant be empty!");
                return false
            }

            swal({
                  title: "New Password",
                  text: "Enter your new password",
                  type: "input",
                  showCancelButton: true,
                  closeOnConfirm: false,
                  animation: "slide-from-top",
                  inputPlaceholder: "new password"
                },
                
                function(new_pswd){
                    if (new_pswd === false) {return false;} // clicked "cancel"

                    if (new_pswd === "") 
                    {
                        swal.showInputError("Password cant be empty!");
                        return false
                    }
                  
                    var req = new XMLHttpRequest();

                    req.open("POST", UPDATE_ACCOUNT_URL, true);

                    req.onload = edited_account;

                    var form = new FormData();

                    // our form is built in such a way that we only edit the user's password
                    form.append("uname", UNAME);
                    form.append("pswd", current_pswd);
                    form.append("new_pswd", new_pswd);

                    req.send(form);
                    start_loading();
                }
            );          
        }
    );
}

function edited_max_inbox()
{
    stop_loading();
    
    if (this.status===200)
    {
        var reply = JSON.parse(this.responseText);
        if(!reply.status)
        {
            flag_error(reply.log);
            return;
        }
        
        show_success("updated max-inbox. the update will be effected when you login the next time");
    }
    
    else
    {
        flag_error("[updating max-inbox] reply code: "+this.status);
    }
}

function edit_max_inbox()
{
    hide_modal("settings_modal");

    swal({
          title: "Inbox Limit",
          text: "enter inbox limit",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "default is 150"
        },
        
        function(limit){
            if (limit === false) {return false;} // clicked "cancel"

            if (limit === "") 
            {
                swal.showInputError("please enter a number");
                return false
            }
          
            var req = new XMLHttpRequest();

            req.open("POST", SET_MAX_INBOX_URL, true);

            req.onload = edited_max_inbox;

            var form = new FormData();

            // our form is built in such a way that we only edit the user's password
            form.append("uname", UNAME);
            form.append("max_inbox", limit);

            req.send(form);
            start_loading();
        }
    );          

}

function login_embedded(uname, grp)
{
    // change urls
    POST_MESSAGE_URL = "../"+POST_MESSAGE_URL;
    INBOX_URL = "../"+INBOX_URL;
    UPDATE_ACCOUNT_URL = "../"+UPDATE_ACCOUNT_URL;
    ONLINE_STATE_URL = "../"+ONLINE_STATE_URL;
    THEMES_URL = "../"+THEMES_URL;
    SET_THEME_URL = "../"+SET_THEME_URL;
    SET_MAX_INBOX_URL = "../"+SET_MAX_INBOX_URL;

    FILE_ATTACHMENT_PATH = "../"+FILE_ATTACHMENT_PATH;
    THEMES_PATH = "../"+THEMES_PATH;


    var req = new XMLHttpRequest();

    req.open("POST", LOGIN_EMBEDDED_URL, true);

    req.onload = attempted_login;

    var form = new FormData();

    // our form is built in such a way that we only edit the user's password
    form.append("uname", uname);
    form.append("group", grp);

    req.send(form);
    start_loading();

}

function edit_vibration(div){
    if(div.innerHTML.indexOf(": On")>=0){
        div.innerHTML = "4) Vibration: Off";
    }else{
        div.innerHTML = "4) Vibration: On";
        if(navigator.vibrate){
            navigator.vibrate(500);
        }
    }
}

function calc_input(){
    var cin = document.getElementById("calc_input");
    if(this.innerHTML=="Del"){
        if(cin.innerHTML.length){
            cin.innerHTML = cin.innerHTML.slice(0, cin.innerHTML.length-1);        
        }
    }else if(this.innerHTML=="="){
        if(cin.innerHTML==CALC_EXIT_CODE){
            cin.innerHTML = "";
            document.getElementById("calc_output").innerHTML = "";
            document.getElementById("calc_div").style.display = "none";
            document.getElementById("main_div").style.display = "block";
        }else{
            var res = eval(cin.innerHTML.replace("x","*"));
            if(isNaN(res)){
                document.getElementById("calc_output").innerHTML = "error!";
            }else{
                document.getElementById("calc_output").innerHTML = res;
                cin.innerHTML = res;
            }
        }
    }else{
        cin.innerHTML += this.innerHTML;
    }
}

function close_emoji_div(){
    document.getElementById("emoji_div").style.display = "none";
}function open_emoji_div(){
    document.getElementById("emoji_div").style.display = "block";
}


window.onload = function() {
    
    function fade_logo()
    {
        document.getElementById("logo").style.opacity = "0.2";
        
        setTimeout(unfade_logo, 1500);
    }
    function unfade_logo()
    {
        document.getElementById("logo").style.opacity = "1";
        setTimeout(fade_logo, 1500);
    }
    
    fade_logo();
    
    setTimeout(function _f(state){
        document.getElementById("online_state").style.opacity=state?".1":"1";
        setTimeout(_f,1000,!state);
    }, 2000, true);
    
    setInterval(check_online_status, CHECK_ONLINE_STATUS_RATE*1000);

    if (document.getElementById("__uname__").value.length)
    {
        login_embedded(document.getElementById("__uname__").value, document.getElementById("__group__").value);
    }


    var calc_btns = document.getElementsByClassName("calc_btn");
    for(var i=0; i<calc_btns.length; ++i){
        calc_btns[i].onclick = calc_input;
    }

    document.addEventListener("keydown", function(e){if(e.keyCode == 27){e.preventDefault();back();}}, false);

    document.getElementById("entry").addEventListener("keyup",function(e){e.preventDefault();if (e.keyCode === 13){send_message();}});

    {
        // emojis. these should be ignored if version doesnt yet support em
        function emoji_clicked(){
            var em = this.src.split("/");
            em = em[em.length-1];
            em = em.split(".png");
            em = "`"+em[0]+"`";

            var entry = document.getElementById("entry");

            if (document.selection) {
                // IE
                entry.focus();
                var sel = document.selection.createRange();
                sel.em = em;
            } else if (entry.selectionStart || entry.selectionStart === 0) {
                // Others
                var startPos = entry.selectionStart;
                var endPos = entry.selectionEnd;
                entry.value = entry.value.substring(0, startPos) +
                em +
                entry.value.substring(endPos, entry.value.length);
                entry.selectionStart = startPos + em.length;
                entry.selectionEnd = startPos + em.length;
                entry.focus();
            } else {
                entry.value += em;
            }

            this.style.backgroundColor = "#aaf";
            setTimeout(function(img){img.style.backgroundColor="";},100,this);
        }
        var emoji_div = document.getElementById("emoji_div");
        var img;
        var em_limit = 88;
        for(var i=1; i<=em_limit; ++i){

            img = document.createElement("img");
            img.src = EMOJI_PATH+i+".png";
            img.setAttribute("class","emoji clickable");
            img.onclick = emoji_clicked;
            
            emoji_div.appendChild(img);
        }
        
        document.getElementById("entry").onclick=close_emoji_div;
    }

};
