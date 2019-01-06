// prefix for all variables/element-IDs: __BRE__

var __BRE__BASE_URL = "http://45.33.74.38:60101/";
//var __BRE__BASE_URL = "http://0.0.0.0:60101/";

var __BRE__LOGIN_URL = __BRE__BASE_URL+"__BRE__login";
var __BRE__POST_MESSAGE_URL = __BRE__BASE_URL+"post_message";
var __BRE__INBOX_URL = __BRE__BASE_URL+"inbox";
var __BRE__UPDATE_ACCOUNT_URL = __BRE__BASE_URL+"update_account";
var __BRE__ONLINE_STATE_URL = __BRE__BASE_URL+"activity_status";
var __BRE__THEMES_URL = __BRE__BASE_URL+"themes";
var __BRE__SET_THEME_URL = __BRE__BASE_URL+"set_user_theme";
var __BRE__SET_MAX_INBOX_URL = __BRE__BASE_URL+"set_max_inbox";
var __BRE__LOGIN_EMBEDDED_URL = __BRE__BASE_URL+"login_embedded";

var __BRE__FILE_ATTACHMENT_PATH = __BRE__BASE_URL+"static/files/";
var __BRE__THEMES_PATH = __BRE__BASE_URL+"static/embedded/themes/";
var __BRE__BACKGROUNDS_PATH = __BRE__BASE_URL+"static/files/backgrounds/";

var __BRE__DEFAULT_THEME = ["Nature: Clear Droplets", "Nature/clear-droplets.jpg", "nature-clear-droplet.css"];

var __BRE__GROUPS=[];
var __BRE__ACTIVE_GROUP = "";
var __BRE__UNAME = "";
var __BRE__GROUP = "";
var __BRE__CHATS = {}
var __BRE__USER_THEMES = [];

var __BRE__CHECK_ONLINE_STATUS_RATE = 10; // seconds
var __BRE__INBOX_READ_RATE = 1; // in seconds
var __BRE__INBOX_READ_INTERVAL_VAR;

var __BRE__LAST___BRE__ACTIVE_GROUP = ""; // will help us not reload themes when user logs out and __BRE__login again
var __BRE__PARENT_DIV;

/////////////////////////////////////// globals.js /////////////////////////////////////
var __BRE__URLS = {
};

var __BRE__DATA_REFRESH_RATE = 60; // time is in seconds

function __BRE__human_readable(value, dp)
{
    try{
        value/2.3;
        
        if (!isNaN(dp))
            value = value.toFixed(dp);
        else
            value = value.toString();
    }
    catch(e){
        // value already a string as we want it!
    }
    
    if (isNaN(parseFloat(value)))
    {
        return value;
    }

    dp_index = value.indexOf(".");
    dp_index = dp_index<0 ? value.length-1 : dp_index-1;
        
        // array to contain new human-readable value format...
    value_reverse = [];
    for (var i=value.length-1; i!=dp_index; --i)
        value_reverse.push(value[i]);
    
    for (var i=dp_index, counter=1; i>=0; --i)
    {
        value_reverse.push(value[i]);
        if (counter==3 && i)
        {
            value_reverse.push(",");
            counter = 0;
        }

        counter++;
    }

    value_reverse.reverse();

    if (!isNaN(dp) && !dp)
    {
        value = value_reverse.join("");
        if (value.indexOf(".")>=0)
            return value.slice(0, value.indexOf("."));
    }
    
    return value_reverse.join("");

    
}

function __BRE__clear(el)
{
    while (el.childNodes.length)
        el.removeChild(el.childNodes[0]);
}

// the show/__BRE__hide_modal functions rely on jquerry
function __BRE__show_modal(modal_id){$('#'+modal_id).modal('show');}
function __BRE__hide_modal(modal_id){$('#'+modal_id).modal('hide');}

function __BRE__flag_error(error)
{
    swal({
        title: "Error!",
        text: error,
        type: "error",
        confirmButtonText: "Ok"
    });
}

function __BRE__show_info(msg)
{
    swal({
        title: "Info!",
        text:msg,
        type: "info",
        confirmButtonText: "Ok"
    });
}

function __BRE__show_success(msg)
{
    swal({
        title: "Info!",
        text:msg,
        type: "success",
        confirmButtonText: "Ok"
    });
}

function __BRE__stop_loading()
{
    document.getElementById("__BRE__loading_div").style.display = "none";
}

function __BRE__start_loading()
{
    document.getElementById("__BRE__loading_div").style.display = "block";
}

function __BRE__scroll_to_bottom(div_id)
{
    var div = document.getElementById(div_id);
    div.scrollTop = div.scrollHeight;
}


function __BRE__notify(msg)
{
    var notification = document.getElementById("__BRE__notification");
    notification.innerHTML = msg;
    notification.style.display="block";
    notification.style.opacity="1";
    setTimeout(function(){
        notification.style.opacity="0";
        setTimeout(function(){
            notification.style.display="none";        
        }, 2000)
    }, 1000);
}

////////////////////////////////////// index.js ///////////////////////////////////////////

function __BRE__activate_grp_chats()
{
    console.log("ACTIVATING CHATS...");
    
    __BRE__ACTIVE_GROUP = this.grp;
    document.getElementById("__BRE___group").value=__BRE__ACTIVE_GROUP;
    
    // scroll div to bottom...
    var objDiv = document.getElementById("__BRE__chats-container-div");
    objDiv.scrollTop = objDiv.scrollHeight;
    
    document.getElementById("__BRE__online_state").style.display = "block";
        
    if (__BRE__ACTIVE_GROUP!=__BRE__LAST___BRE__ACTIVE_GROUP)
    {
        var theme_found = false;
        for(var i=0;i<__BRE__USER_THEMES.length; ++i)
        {
            if(__BRE__USER_THEMES[i][0]==__BRE__ACTIVE_GROUP)
            {
                document.getElementById("__BRE__theme").href = __BRE__THEMES_PATH+__BRE__USER_THEMES[i][1];    
                theme_found = true;
                break;
            }
        }
        
        if(!theme_found)
        {
            document.getElementById("__BRE__theme").href = __BRE__THEMES_PATH+__BRE__DEFAULT_THEME;    
        }
    
        __BRE__LAST___BRE__ACTIVE_GROUP = __BRE__ACTIVE_GROUP;
    }
}

function __BRE__show_groups()
{
    return;
}

function __BRE__media_html(msg)
{
    var innerHTML = "";
    if(
        msg.indexOf(".jpg")>=0 ||
        msg.indexOf(".jpeg")>=0 ||
        msg.indexOf(".gif")>=0 ||
        msg.indexOf(".png")>=0
        // image attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div\" mediatype=\"img\" data=\""+
                         "__BRE__"+msg+"\" "+
                         "onclick=\"__BRE__start_loading_media(this)\">Picture</div>"+
                         "<div id=\""+"__BRE__"+msg+"\" style=\"height:100px;width:150px;border-radius:5px;display:none;\"></div><br>";
    }

    else if(
        msg.indexOf(".3gpp")>=0 ||
        msg.indexOf(".mp3")>=0 ||
        msg.indexOf(".wav")>=0
        // audio attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div\" data=\""+
                         "__BRE__"+msg+"\" "+
                         "onclick=\"__BRE__start_loading_media(this)\">Audio</div>"+
                         "<audio controls style=\"max-width:200px; display:none;\" id=\""+
                         "__BRE__"+msg+
                         "\"><source src=\"\"> {brocken audio}</audio><br>";
    }

    else if(
        msg.indexOf(".mp4")>=0
        // video attachment
        )
    {
        innerHTML += "<div class=\"preload_media_div\" data=\""+
                         "__BRE__"+msg+"\" "+
                         "onclick=\"__BRE__start_loading_media(this)\">Video</div>"+
                         "<video controls style=\"height:100px; display:none; margin-bottom:10px;\" id=\""+
                         "__BRE__"+msg+
                         "\"><source src=\"\" type=\"video/mp4\"> {brocken video}</video><br>";
    }
    
    return innerHTML;

}

function __BRE__attempted_login()
{
    __BRE__stop_loading();

    if (this.status===200)
    {
        
        var reply = JSON.parse(this.responseText);
        
        
        if (!reply.status)
        {
            __BRE__flag_error(reply.log);
            return;
        }
        
        var chats_div = document.getElementById("__BRE__chats");
        var chat_div, date_div;

        __BRE__GROUPS = [__BRE__GROUP];
        for (var i=0; i<__BRE__GROUPS.length; i++)
        {
            if(__BRE__CHATS[__BRE__GROUPS[i]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                ////chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                __BRE__CHATS[__BRE__GROUPS[i]] = {
                    "chat-div":chat_div, 
                    'data':[],
                    'dates':[],
                    'times':[]
                };
                
                document.getElementById("__BRE__chats-container-div").appendChild(chat_div);
            }
        }

        __BRE__UNAME = reply.uname;
        document.getElementById("__BRE___sender").value = __BRE__UNAME;
        
        var inbox = JSON.parse(reply.inbox).inbox;
        
        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        var looped = false;
        for(var i=0; i<inbox.length; ++i)
        {
            looped = true;

            if(__BRE__CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                //chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                __BRE__CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("__BRE__chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                __BRE__CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                __BRE__CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }
            
            if(__BRE__CHATS[inbox[i][0]].dates.indexOf(inbox[i][3])<0) // new major date found...
            {
                __BRE__CHATS[inbox[i][0]].dates.push(inbox[i][3]);
                
                date_div = document.createElement("div");
                date_div.setAttribute("class","date");
                date_div.innerHTML = inbox[i][3];
                
                __BRE__CHATS[inbox[i][0]]["chat-div"].appendChild(date_div);
            }
            
            chat = document.createElement("div");
            sender = document.createElement("div"); sender.setAttribute("class","sender");
            msg = document.createElement("div"); msg.setAttribute("class","msg");
            time_div = document.createElement("div"); time_div.setAttribute("class","time");
            
            if (inbox[i][1]==__BRE__UNAME) // outgoing message...
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
                msg.innerHTML += __BRE__media_html(_msg_data[j]);
            } msg.innerHTML += _msg_data[_msg_data.length-1];
            
            chat.appendChild(sender);
            chat.appendChild(msg);
            chat.appendChild(time_div);
      
            __BRE__CHATS[inbox[i][0]]["chat-div"].appendChild(chat);
        }
        
        if(looped)
        {
            var objDiv = document.getElementById("__BRE__chats-container-div");
            objDiv.scrollTop = objDiv.scrollHeight;
        }


        __BRE__USER_THEMES = reply.user_themes;
                
        var theme_div = document.getElementById("__BRE__themes"); __BRE__clear(theme_div);
        var theme;
        // all themes...
        for (var i=0; i<reply.all_themes.length; ++i)
        {
            theme = document.createElement("div");
            theme.setAttribute("class","theme");
            theme.themeBg = reply.all_themes[i][1];
            theme.theme = reply.all_themes[i][2];
            theme.innerHTML = ((i+1)>9?"":"0")+(i+1)+") "+reply.all_themes[i][0];
            theme.reset_dimensions = true;
            theme.onclick = __BRE__set_theme;
            
            if(i==(reply.all_themes.length-1)) // last theme
                theme.style.marginBottom = "0px";
            
            theme_div.appendChild(theme);
        }

        __BRE__INBOX_READ_INTERVAL_VAR = setInterval(__BRE__get_inbox, __BRE__INBOX_READ_RATE*1000);

        __BRE__show_groups();
        
    }
    else
    {
        __BRE__flag_error("[logging in] status code "+this.status);
    }
}

function __BRE__done_setting_theme()
{
    __BRE__stop_loading();
    
    if(this.status===200)
    {
        reply = JSON.parse(this.responseText);
        if(!reply.status)
        {
            __BRE__flag_error(reply.log);
            return;
        }

        __BRE__notify("updating theme...");
        document.getElementById("__BRE__theme").href = __BRE__THEMES_PATH+this.theme;    

    }
    else
    {
        __BRE__flag_error("[setting theme] status code "+this.status);
    }
}

function __BRE__set_theme()
{
    __BRE__hide_modal("__BRE__themes_modal");

    var req = new XMLHttpRequest();
        
    req.theme = this.theme;
    req.open("post", __BRE__SET_THEME_URL, true);
    
    req.onload = __BRE__done_setting_theme;
    
    var form = new FormData();
    form.append("uname", __BRE__UNAME);
    form.append("group", __BRE__ACTIVE_GROUP);
    form.append("theme", this.theme);
    
    req.send(form);

    if (this.reset_dimensions)
    {
        document.getElementById("__BRE__parent_div_bgImg").style.height = __BRE__PARENT_DIV.offsetHeight+"px"//"100%";
        document.getElementById("__BRE__parent_div_bgImg").style.width = __BRE__PARENT_DIV.offsetWidth+"px";
    }
    document.getElementById("__BRE__parent_div_bgImg").src = __BRE__BACKGROUNDS_PATH+this.themeBg;

    __BRE__start_loading();

}

function __BRE__sent_message()
{
    __BRE__stop_loading();

    if (this.status===200)
    {
        if(this.has_attachments)
            document.getElementById("__BRE__caption").value = "";
        
        document.getElementById('__BRE__form').reset();
        
        var reply = JSON.parse(this.responseText);
        
        if (!reply.status)
        {
            __BRE__flag_error(reply.log);
            return;
        }

        var chats_div = document.getElementById("__BRE__chats");
        var chat_div, date_div;

        var inbox = [reply.msg];
        
        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        for(var i=0; i<inbox.length; ++i)
        {
            if(__BRE__CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                //chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                __BRE__CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("__BRE__chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                if(__BRE__CHATS[inbox[i][0]].times.indexOf(inbox[i][2])>=0) // this message has already been received
                    continue;
                    
                __BRE__CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                __BRE__CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }
            
            if(__BRE__CHATS[inbox[i][0]].dates.indexOf(inbox[i][3])<0) // new major date found...
            {
                __BRE__CHATS[inbox[i][0]].dates.push(inbox[i][3]);
                
                date_div = document.createElement("div");
                date_div.setAttribute("class","date");
                date_div.innerHTML = inbox[i][3];
                
                __BRE__CHATS[inbox[i][0]]["chat-div"].appendChild(date_div);
            }
            
            chat = document.createElement("div");
            sender = document.createElement("div"); sender.setAttribute("class","sender");
            msg = document.createElement("div"); msg.setAttribute("class","msg");
            time_div = document.createElement("div"); time_div.setAttribute("class","time");
            
            if (inbox[i][1]==__BRE__UNAME) // outgoing message...
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
                msg.innerHTML += __BRE__media_html(_msg_data[j]);
            } msg.innerHTML += _msg_data[_msg_data.length-1];

            chat.appendChild(sender);
            chat.appendChild(msg);
            chat.appendChild(time_div);
      
            __BRE__CHATS[inbox[i][0]]["chat-div"].appendChild(chat);

        }
        
        // scroll div to bottom...
        var objDiv = document.getElementById("__BRE__chats-container-div");
        objDiv.scrollTop = objDiv.scrollHeight;
        
    }
    else
    {
        __BRE__flag_error("[sending message] status code "+this.status);
    }
}


function __BRE__send_message()
{

    var grp = __BRE__GROUP;
    grp = ":embedded:"+grp;  

    msg = document.getElementById("__BRE__entry").value;
    document.getElementById("__BRE___group").value = __BRE__GROUP;
    document.getElementById("__BRE___sender").value = __BRE__UNAME+grp;
    
    if(!msg.length)
    {
        return;
    }

    document.getElementById('__BRE___msg').value = msg;

    var req = new XMLHttpRequest();
    
    req.open("post", __BRE__POST_MESSAGE_URL, true);
    
    req.has_attachments = false;
    req.onload = __BRE__sent_message;
    
    var form = document.getElementById("__BRE__form");
    req.send(new FormData(form));
    
    document.getElementById("__BRE__entry").value = "";
    __BRE__start_loading();
}

function __BRE__send_attachment()
{
    var grp = __BRE__GROUP;
    grp = ":embedded:"+grp;  

    __BRE__hide_modal("__BRE__attachment_modal");
    msg = document.getElementById("__BRE__caption").value;
    document.getElementById("__BRE___group").value = __BRE__GROUP;
    document.getElementById("__BRE___sender").value = __BRE__UNAME+grp;
    
    if(!msg.length)
        msg = " "; // there MUST be a message

    document.getElementById('__BRE___msg').value = msg;

    var req = new XMLHttpRequest();
    
    req.open("post", __BRE__POST_MESSAGE_URL, true);
    
    req.has_attachments = true;
    req.onload = __BRE__sent_message;
    
    var got_attachments = document.getElementById("__BRE__files").files.length;
    
/*
    if (got_attachments)
    {
        req.onloadstart = function (e) {
            document.getElementById("__BRE__upload_progress").innerHTML = "0.00%";
            document.getElementById("__BRE__uploading").style.display = "block";
        }
        req.onloadend = function (e) {
            document.getElementById("__BRE__uploading").style.display = "none";
        }

        req.upload.addEventListener("progress", function(evt){
              if (evt.lengthComputable) {
                var progress = __BRE__human_readable((evt.loaded/evt.total)*100,2);
                document.getElementById("__BRE__upload_progress").innerHTML = progress+"%";

                if (progress>=100)
                    document.getElementById("__BRE__upload_progress").innerHTML = "finalising...";

              }
            }, false);
    }
*/    
    var form = document.getElementById("__BRE__form");
    req.send(new FormData(form));    

    __BRE__start_loading();
}

function __BRE__cancel_attachment()
{
    document.getElementById("__BRE__caption").value = "";
    document.getElementById('__BRE__form').reset();
    __BRE__hide_modal("__BRE__attachment_modal");
}

function __BRE__got_inbox()
{
    if (this.status===200)
    {        
        var reply = JSON.parse(this.responseText);
        
        if (!reply.status)
        {
            __BRE__flag_error(reply.log);
            return;
        }

        var chats_div = document.getElementById("__BRE__chats");
        var chat_div, date_div;

        var inbox = reply.inbox;
        
        if (!inbox.length)
            return
        
        var chat, sender, msg, time_div;
        var _msg_data;
        var ext;
        
        for(var i=0; i<inbox.length; ++i)
        {
            if(__BRE__CHATS[inbox[i][0]]==undefined) // entry wasnt present...
            {
                chat_div = document.createElement("div");
                chat_div.setAttribute("class","chats_div");
                //chat_div.style.display = "none";
                chats_div.appendChild(chat_div);
                
                __BRE__CHATS[inbox[i][0]] = {
                    "chat-div":chat_div, 
                    'data':[inbox[i].slice(1,inbox[i].length)],
                    'dates':[],
                    'times':[inbox[i][2]]
                };

                document.getElementById("__BRE__chats-container-div").appendChild(chat_div);
            }
            
            else
            {
                if(__BRE__CHATS[inbox[i][0]].times.indexOf(inbox[i][2])>=0) // this message has already been received
                    continue;
                    
                __BRE__CHATS[inbox[i][0]].data.push(inbox[i].slice(1,inbox[i].length));
                __BRE__CHATS[inbox[i][0]].times.push(inbox[i][2]);
            }
            
            if(__BRE__CHATS[inbox[i][0]].dates.indexOf(inbox[i][3])<0) // new major date found...
            {
                __BRE__CHATS[inbox[i][0]].dates.push(inbox[i][3]);
                
                date_div = document.createElement("div");
                date_div.setAttribute("class","date");
                date_div.innerHTML = inbox[i][3];
                
                __BRE__CHATS[inbox[i][0]]["chat-div"].appendChild(date_div);
            }
            
            chat = document.createElement("div");
            sender = document.createElement("div"); sender.setAttribute("class","sender");
            msg = document.createElement("div"); msg.setAttribute("class","msg");
            time_div = document.createElement("div"); time_div.setAttribute("class","time");
            
            if (inbox[i][1]==__BRE__UNAME) // outgoing message...
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
                msg.innerHTML += __BRE__media_html(_msg_data[j]);
            } msg.innerHTML += _msg_data[_msg_data.length-1];

            chat.appendChild(sender);
            chat.appendChild(msg);
            chat.appendChild(time_div);
      
            __BRE__CHATS[inbox[i][0]]["chat-div"].appendChild(chat);
            
        }
        
        // scroll div to bottom...
        var objDiv = document.getElementById("__BRE__chats-container-div");
        objDiv.scrollTop = objDiv.scrollHeight;
        
    }
    else
    {
        __BRE__flag_error("[fetching inbox] status code "+this.status);
    }
}


function __BRE__get_inbox()
{
    
    var grp = __BRE__GROUP;
    grp = ":embedded:"+grp;  
    
    var req = new XMLHttpRequest();
    
    req.open("post", __BRE__INBOX_URL, true);
    
    req.onload = __BRE__got_inbox;
    
    var form = new FormData();
    form.append("uname", __BRE__UNAME+grp);
    
    req.send(form);
    
}

function __BRE__back()
{
    if (document.getElementById("__BRE__preview_div").style.display == "block");
    {
        __BRE__done_previewing();
        return;
    }
        
}

function __BRE__start_loading_media(media_div)
{
    var target = media_div.getAttribute("data");
    __BRE__notify("loading media...");
    media_div.style.display = "none";
    
    if(media_div.getAttribute("mediatype"!="img"))
        document.getElementById(target).src=__BRE__FILE_ATTACHMENT_PATH+target.slice(7,target.length);
    else
    {
        var bgImg = new Image();
        bgImg.mom = document.getElementById(target);
        bgImg.onload = __BRE__img_loaded;
        bgImg.src = __BRE__FILE_ATTACHMENT_PATH+target.slice(7,target.length); 
        
        //bgImg.style.height = bgImg.mom.style.height;
        //bgImg.style.width = bgImg.mom.style.width;
        //bgImg.mom.appendChild(bgImg);       
    }
    document.getElementById(target).style.display = "block";
    document.getElementById(target).style.border = "1px solid black";

}

function __BRE__img_loaded()
{
    this.mom.style.background = "#333 url(\"" + this.src + "\") no-repeat";
    this.mom.style.backgroundPosition = "center";
    this.mom.style.backgroundSize = "cover";
    this.mom.bgImg = this;
    this.mom.onclick = __BRE__preview_img;
}

function __BRE__preview_img()
{
    document.getElementById("__BRE__main_div").style.opacity = "0.1";
    document.getElementById("__BRE__preview-img").src = this.bgImg.src;
    document.getElementById("__BRE__preview_div").style.display = "block";
    document.getElementById("__BRE__logout").style.display = "block";
}

function __BRE__done_previewing()
{
    document.getElementById("__BRE__main_div").style.opacity = "1"
    document.getElementById("__BRE__preview_div").style.display = "none";
    document.getElementById("__BRE__logout").style.display = "none";
}

function __BRE__checked_online_status()
{
    if (this.status===200)
    {
        if (this.responseText=="online") 
        {
            document.getElementById("__BRE__online_state").style.background = "green";
        }

        if (this.responseText=="offline")
        {
            document.getElementById("__BRE__online_state").style.background = "red";
        }
    }
}

function __BRE__check_online_status()
{
    var online_state = document.getElementById("__BRE__online_state");
    if(!online_state) // not yet initialized system
        return;
        
    online_state.style.display = "block";

    var req = new XMLHttpRequest();
    
    req.open("post", __BRE__ONLINE_STATE_URL, true);
    
    req.onload = __BRE__checked_online_status;
    
    var form = new FormData();
    form.append("uname", __BRE__UNAME);
    form.append("group", __BRE__GROUP);
    
    req.send(form);

    
}

function __BRE__edited_account()
{
    __BRE__stop_loading();
    
}

function __BRE__edit_account()
{
    __BRE__hide_modal("__BRE__settings_modal");

}

function __BRE__edited_max_inbox()
{
    __BRE__stop_loading();
    
    if (this.status===200)
    {
        var reply = JSON.parse(this.responseText);
        if(!reply.status)
        {
            __BRE__flag_error(reply.log);
            return;
        }
        
        __BRE__show_success("updated max-inbox. the update will be effected when you __BRE__login the next time");
    }
    
    else
    {
        __BRE__flag_error("[updating max-inbox] reply code: "+this.status);
    }
}

function __BRE__edit_max_inbox()
{
    __BRE__hide_modal("__BRE__settings_modal");

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

            req.open("POST", __BRE__SET_MAX_INBOX_URL, true);

            req.onload = __BRE__edited_max_inbox;

            var form = new FormData();

            // our form is built in such a way that we only edit the user's password
            form.append("uname", __BRE__UNAME);
            form.append("max_inbox", limit);

            req.send(form);
            __BRE__start_loading();
        }
    );          

}

function __BRE__login_embedded(uname, grp)
{
    var req = new XMLHttpRequest();

    req.open("POST", __BRE__LOGIN_EMBEDDED_URL, true);

    req.onload = __BRE__attempted_login;

    var form = new FormData();

    // our form is built in such a way that we only edit the user's password
    form.append("uname", uname);
    form.append("group", grp);

    req.send(form);
    __BRE__start_loading();

}

function __BRE__setup(parent_div, uname, group, dimensions)
    // initialize embedded bug report in div
    // this function should be called in your window.onload...
{
    console.log("initiating JERM-BUG-REPORT embedding into "+parent_div+"...");
    console.log("note that this version of JERM-BUG-REPORT depends on bootstrap-3.3.7, jquery-3.3.1 and sweetalert")

    parent_div = document.getElementById(parent_div);
    if(!parent_div)
    {
        console.log("error initializing JERM-BUG-REPORT, could not get provided parent-div");
        return
    }

    __BRE__PARENT_DIV = parent_div;

    parent_div.style.background = "#1f1212";

    parent_div.innerHTML = `
        <style>
            .rotate {
                -animation: spin .5s infinite linear;
                -ms-animation: spin .5s infinite linear;
                -webkit-animation: spinw .5s infinite linear;
                -moz-animation: spinm .5s infinite linear;
            }

            @keyframes spin {
                from { transform: scale(1) rotate(0deg);}
                to { transform: scale(1) rotate(360deg);}
            }
              
            @-webkit-keyframes spinw {
                from { -webkit-transform: rotate(0deg);}
                to { -webkit-transform: rotate(360deg);}
            }

            @-moz-keyframes spinm {
                from { -moz-transform: rotate(0deg);}
                to { -moz-transform: rotate(360deg);}
            }        
        </style>
        
        <style>
            #__BRE__preview_div{
                display: none;
                position: fixed;
                height:100%;
                width: 100%;
                
                left: 0%;
                top:0%;
                
                z-index: 1;
                overflow:auto;
            }

            #__BRE__logout{
                position: fixed;
                height: 16px;
                width: 16px;
                
                left:2px;
                top:2px;
                
                border-radius: 8px;
                
                background: orange;
                
                z-index:100;
            }

            #__BRE__online_state{
                position: fixed;
                height: 10px;
                width: 10px;
                
                right:2px;
                top:2px;
                
                border-radius: 5px;
                
                background: red;
                
                z-index:100;
            }

            .__BRE__blink{
                transition: opacity 0.5s ease-out;
                -moz-transition: opacity 0.5s ease-out;
                -webkit-transition: opacity 0.5s ease-out;
                -o-transition: opacity 0.5s ease-out;
            }

            #__BRE__uploading{
                display: none;
                position:fixed;
                
                width: 90%;
                height:30px;
                line-height:30px;
                border-radius:15px;
                
                left:5%;
                top: 5%;
                
                font-weight:bold;
                text-align:center;
                
                color:white;
                background: black;
                
                z-index:3;
            }


            p{color:#1f1212;}

            .group{
                font-size:1.2em; 
                color:#999; 
                position:relative; 
                width:95%; 
                left:2.5%;

                border-bottom: 1px solid #666;
                border-radius: 5px;
                
                margin-bottom: 15px;
            }

            #__BRE__chats {
                position: absolute;
                height: 100%;
                width:98%;
                left:1%;
            /*    
                border:1px solid white;
            */
            }

            .bottom {
                position: absolute;
                width: 98%;
                left: 1%;
                top: 93%;
            }

            .chats-container-div {
                position: absolute;
                width:99%;
                height:92%;
            /*    
                border: 1px solid red;
            */    
                overflow:auto;
            }

            .chats_div {
                width: 100%;
            }

            .chat{
                width:80%;
                margin-top: 10px;
            }

            .incoming{
                color: #ddd;    
                border: 1px solid orange;
                margin-left: 5px;
            }

            .outgoing{
                color: #ddd;
                border: 1px solid green;
            }

            .sender{
                color: #aaa;
                opacity: 0.5;
            }

            .msg{
            }

            .time{
                color: #aaa;
                opacity: 0.5;
            }

            .date{
                color: #ad8;
            }

            .incoming{
                border-radius:0px 10px 0px 10px;
            }

            .outgoing{
                position:relative;left:20%;

                border-radius:10px 0px 10px 0px;
            }

            .sender{
                margin-bottom: 5px;
                opacity: 0.5;
                margin-left:5px;
                font-weight: bold;
            }

            .attachment{
                height:100px;
            }

            .msg{
                margin-bottom: 3px;
                margin-left:5px;
                margin-right:5px;
            }

            .time{
                margin-right: 5px;
                text-align:right;
                opacity: 0.5;
            }

            .date{
                margin-top: 10px;
                text-align: center;
                font-weight: bold;
            }

            .theme{
                color: #23a;
                border-bottom: 1px solid #aaa;
                margin-bottom: 10px;
            }

            #__BRE__notification{
                position: fixed;
                top:48%;
                left: 5%;
                
                width: 90%;
                height: 30px;
                
                line-height: 30px;
                
                background: #000;
                color: #fff;
                
                font-weight: bold;
                
                text-align: center;
                
                border-radius: 10px;
                
                z-index: 4;


                transition: opacity 1.5s ease-out;
                -moz-transition: opacity 1.5s ease-out;
                -webkit-transition: opacity 1.5s ease-out;
                -o-transition: opacity 1.5s ease-out;
            }

            .setting{
                color: #23a; 
                /*border-bottom: 1px solid #aaa;*/
                margin-bottom: 10px;
            }

            .preload_media_div{
                height: 100px;
                width:150px;
                
                background-color: #333;
                
                line-height: 100px;
                text-align: center;
                
                color: #fff;
                
                border-radius: 5px;
            }        
        </style>

        <link id="__BRE__theme" rel="stylesheet" href="">

        <div id="__BRE__preview_div" style="
            display:none; 
            position:fixed; 
            width: 100%; 
            height: 100%;">
                <img id="__BRE__preview-img" class="img-responsive" style="margin:0 auto;"/>
            </div>
        
        <div id="__BRE__logout" onclick="__BRE__back()" style="display:none;"></div>
        <div id="__BRE__online_state" class="__BRE__blink"></div>
        
        <div id="__BRE__uploading" style="display:none">Uploading Files: <span id="__BRE__upload_progress">0.00%</span></div>
        <div id="__BRE__notification" style="display:none"></div>

        <div class="modal fade" id="__BRE__attachment_modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div class="modal-dialog" style="width:90%;" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="__BRE__myModalLabel">Media Caption</h4>
              </div>
              <div class="modal-body">
                    <div class="form-group">
                        <input id="__BRE__caption" type="text" class="form-control" 
                            placeholder="type caption here">
                    </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-danger" 
                    data-dismiss="modal" onclick="__BRE__cancel_attachment()">Cancel</button>
                <button type="button" class="btn btn-success" onclick="__BRE__send_attachment()">Send</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal fade" id="__BRE__themes_modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div class="modal-dialog" style="width:90%;" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="__BRE__myModalLabel">Themes</h4>
              </div>
              <div class="modal-body" style="overflow: auto; max-height: 250px;">
                    <div id="__BRE__themes"></div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-success" data-dismiss="modal">Done</button>
              </div>
            </div>
          </div>
        </div>
        
        <div id="__BRE__main_div">
            
            <div id="__BRE__chats">
                <div id="__BRE__chats-container-div" class="chats-container-div">
                    
                    <div class="chats_div">
                    </div>
                          
                </div>
                
                <div class="input-group bottom">
                    <form id="__BRE__form" method="POST" enctype="multipart/form-data">
                        <input id="__BRE__files" name="files" type="file" multiple 
                            style="display:none;" onchange="__BRE__show_modal('__BRE__attachment_modal')">
                        <input type="hidden" id="__BRE___group" name="group">
                        <input type="hidden" id="__BRE___sender" name="sender">
                        <input type="hidden" id="__BRE___msg" name="msg">

                    </form>
                    <span class="input-group-addon">
                        <i class="glyphicon glyphicon-cog"
                            onclick="__BRE__show_modal('__BRE__themes_modal');"></i>
                    </span>
                    <span class="input-group-addon">
                        <i class="glyphicon glyphicon-paperclip"
                            onclick="document.getElementById('__BRE__files').click()"></i>
                    </span>
                    <input id="__BRE__entry" type="text" class="form-control" placeholder="type here...">
                    <span class="input-group-addon">
                        <i class="glyphicon glyphicon-chevron-right"
                            onclick="__BRE__send_message()"></i>
                    </span>
                </div>
            </div>
        </div>
        
        <div class="rotate" id="__BRE__loading_div"
            style="
                position:fixed; 
                left:45%; 
                top:45%; 
                z-index:1000000; 
                font-size:2em;
                color:#0f0;
                display: none;
                ">
            <strong>......</strong>
        </div>
        
        <script>
            setTimeout(function _f(state){
                document.getElementById("__BRE__online_state").style.opacity=state?".1":"1";
                setTimeout(_f,1000,!state);
            }, 2000, true);
        </script>
    `;

    var img = document.createElement("img");
    img.setAttribute("id", "__BRE__parent_div_bgImg");
    img.style.zIndex = "-10";
    img.style.position = "fixed";
    img.style.left = "0px";
    img.style.top = "0px";
    
    if(dimensions) // parent-dic had a display of none...
    {
        img.style.width = dimensions[0]+"px";
        img.style.height = dimensions[1]+"px"//"100%";
    }
    else
    {
        img.style.height = __BRE__PARENT_DIV.offsetHeight+"px"//"100%";
        img.style.width = __BRE__PARENT_DIV.offsetWidth+"px";
    }
    __BRE__PARENT_DIV.appendChild(img);

    var theme = {theme:__BRE__DEFAULT_THEME[2], themeBg:__BRE__DEFAULT_THEME[1]}
    theme._set = __BRE__set_theme;
    theme._set();

    __BRE__GROUP = group;
    __BRE__UNAME = uname;

    setInterval(__BRE__check_online_status, __BRE__CHECK_ONLINE_STATUS_RATE*1000);
    
    __BRE__login_embedded(uname, group);

    console.log("done initializing JERM-BUG-REPORT");
}
