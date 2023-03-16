var dials = $(".dials div button");
var index;
var number = $('input[name="number"]');
var txtCall = $(".pad-call p sup");
/**
 * @type {SIPml.Session.Call}
 */
var callSession;
/**
 * @type {SIPml.Stack}
 */
var stack;
/**
 * @type {SIPml.Session.Registration}
 */
var registerSession;
var phone_number;

dials.click(function () {

    index = dials.index(this);

    if (index == 9) {

        number.val(number.val() + '*');
        if (callSession != null) {
            callSession.dtmf('*');
        }

    } else if (index == 10) {

        number.val(number.val() + 0);
        if (callSession != null) {
            callSession.dtmf('0');
        }

    } else if (index == 11) {

        number.val(number.val() + '#');
        if (callSession != null) {
            callSession.dtmf('#');
        }

    } else if (index == 12) {
        if (callSession == null) {
            call();
        } else {
            callSession.accept({
                audio_remote: document.getElementById('audio-remote')
            });
        }

    } else if(index != 13) {
        typeInTextarea(number, index +1);
    }
});

/** Đây là hàm post event lên iframe cha */
function sendMessageIframe (data) {
    var windowObj = window.parent;
    if(windowObj) {
      windowObj.postMessage(data, "*");
    }
}

//function send

function handleIncomingEvents(e) {
    switch (e.type) {
        case "started":
            registerSession = stack.newSession('register', {
                events_listener: {
                    events: '*', listener: function (e) {
                        switch (e.type) {
                            case 'connected':
                                //txtStatus.text('Sẵn sàng');
                                //txtStatus.addClass("status")
                                //txtStatus.text('')
                                $('.status').css("background-image", "linear-gradient(#008a59, #28d094)")
                                if (e.session == registerSession) {
                                    $(document).on('unload', () => {
                                        registerSession.unregister();
                                    });
                                }
                                console.log("=================================Đã kết nối");
                                break;
                            case 'transport_error':
                            case 'global_error':
                            case 'message_error':
                            case 'webrtc_error':
                                txtStatus.text("Mất kết nối. Đang kết nối lại...");
                                stack.start();
                                break;
                        }
                    }
                }
            });
            registerSession.register();
            break;

        case "i_new_call":
            console.log("======có cuộc gọi đến======");
            //txtStatus.text("Cuộc gọi đến");
            callSession = e.newSession;
            callSession.addEventListener("*", onCall);
            //$('body').append(callSession.getRemoteFriendlyName());
            sendMessageIframe({action: "new_call", dnid_id : callSession.getRemoteFriendlyName()});
            $('.remote-friendly').text(callSession.getRemoteFriendlyName());
            //$('.remote-friendly').text("0378262465");

            // callSession.accept({
            //     audio_remote: document.getElementById('audio-remote'),
            //     video_local: document.getElementById('localVideo'),
            //     video_remote: document.getElementById('remoteVideo')
            // });

            break;

        case "i_new_message":
            e.newSession.accept();
            let message = e.getContentString();
            var sender = e.newSession.getRemoteFriendlyName();
            console.log("=======tin nhan den=========");
            message = decodeURIComponent(message);
            console.log("==message=="+message,sender);
            if(sender == 'push_notification'){
                
            }else{
                
            }
            break;

        case "stopped":
            txtStatus.text("Mất kết nối. Đang kết nối lại...");
            stack.start();
            $('.status').css("background-image", "linear-gradient(#8a1300, #8f0202)")
            break;
    }
}

function call(dnid) {
    /** call-audiovideo : call video
     *  call-audio : call audio
     */
    callSession = stack.newSession('call-audio', {
        audio_remote: document.getElementById('audio-remote'),
            video_local: document.getElementById('localVideo'),
            video_remote: document.getElementById('remoteVideo'),
        events_listener: { events: '*', listener: onCall }
    });
    console.log("số nhận=================" + dnid);
    callSession.call(dnid);
    $('body').attr('data-dnid',dnid);
}


function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function delete_cookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a target="_blank" style="color:#751f1f" href="' + url + '">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}


function sendMessage(receive,message) {
    var msgSession = stack.newSession('message');
    console.log(message)
    //msgSession.send($('#txtRecipients').val(), message, 'text/plain;charset=utf-8');
        msgSession.send(receive, encodeURIComponent(message), 'text/plain;charset=utf-8');
   /* $("#txtMessage").val("");

    $('#tabMessages').append('<p class="a">'+urlify(message)+'</p>');
    $('#tabMessages').scrollTop($('#tabMessages')[0].scrollHeight);*/
}

function onCall(e) {
    switch (e.type) {
        case 'connecting':
            //txtStatus.text('Đang gọi...');
            console.log("=============Đang thực hiện cuộc gọi==============",e);
            $('.remote-friendly').text($('body').attr('data-dnid'));
            sendMessageIframe({action: "new_call", dnid_id : $('body').attr('data-dnid')});
            /*number.hide();
            $('.remove').hide();
            $('#profile .keyBoard').prepend('<div id="time" style="margin-left: -24px;margin-top:-24px">Đang gọi...</div><div style="margin-bottom:8px;margin-top: -5px;"><img class="imgSupport" style="width: 54px;margin-top: -14px;margin-left: 54px;" src="http://gmobile.tddn.vn/img/support.png"></div>')
            $('.buttonCall button').hide();
            $('.buttonCall').append('<button type="button" style="width: 79%" onclick="endCall()"  class="btn rounded-0 btn-danger btn-red"><img src="http://gmobile.tddn.vn/img/endcall1.png"></button>')*/
            break;

        case 'connected':
            console.log("=========Đã kết nối thành công=========");
            $('#time').html('<span id="minutes">00</span>:<span id="seconds">00</span>').show();
            countTime();
            $('.buttons1').hide();
            $('.buttons2').show();
            // $('#listenCall').empty();
            // $('#listenCall').html('<button style="margin-left:74px" class="btn btn-danger" onclick="endCall()"><img src="http://gmobile.tddn.vn/img/endcall1.png"></div>')
            // $('.skype').remove();
            // $('#avatar').attr('style','margin-left:33px;display:block');
            // $('#caller').attr('style','text-align:center;margin-left:24px;display:block');
            // $('#statusVideoCall').hide();
            break;

        case 'terminated':
            callSession = null;
            console.log("=============Kết thúc cuộc gọi==============");
            sendMessageIframe({action: "end_call"});
            $('#time').hide();
            $('.buttons2').hide();
            $('.buttons1').show();
            // $('#time').text("Kết thúc")
            // setTimeout(function () {
            //     $('#calling').remove();
            //     $('#profile .keyBoard').show();
               
            // }, 1000);
            //  //clearInterval(interval);
            // $('.videoCall').removeClass('show');
            // $('.videoCall').addClass('fade');
            break;
    }
}


function countTime() {
    interval = setInterval(function () {
        $('#seconds').text(Number($('#seconds').text()) + 1);
        if ($('#seconds').text().length == 1) {
            $('#seconds').text("0" + $('#seconds').text())
        }
        if ($('#seconds').text() == "59") {
            $('#minutes').text(Number($('#minutes').text()) + 1);
            $('#seconds').text("00")
        }
        if ($('#minutes').text().length == 1) {
            $('#minutes').text("0" + $('#minutes').text())
        }
    }, 1000);

}

$('#callButton').click(function () {
    if (callSession == null) {
        call();
    } else {
        callSession.accept({
            audio_remote: document.getElementById('audio-remote')/*,
            video_local: document.getElementById('localVideo'),
            video_remote: document.getElementById('remoteVideo')*/
        });
    }
});

$('#sendMessage').click((e) => {
    e.preventDefault();
    sendMessage(dnid,"test");
})

$('.js-accept').click((e) => {
    e.preventDefault();
    callSession.accept({
        audio_remote: document.getElementById('audio-remote')/*,
        video_local: document.getElementById('localVideo'),
        video_remote: document.getElementById('remoteVideo')*/
    });
});

$('.js-decline').click((e) => {
    e.preventDefault();
    if (callSession) {
        callSession.hangup({events_listener: { events: '*', listener: onCall }});
    }
});


function initRTC(username,password) {
    var C =
    {
        debugLevel: "info", //"error"
        websocketServerURL: "wss://rtc.tddn.vn:8089/ws",
        outboundproxyURL: "udp://rtc.tddn.vn:5060",
        iceServers: "[]", // stun của google {url:'stun:stun.l.google.com:19302'} nhưng mà gọi đang bị delay
        enableRTCWebBreaker: false,
        disableEarlyIMS: true,
        enableMediaCaching: true,
        bandwidth: null,
        video_size: null,
        realm: "3gtel.vn",
        privateIdentity: username,
        publicIdentity: "sip:"+username+"@sip.tddn.vn",
        password: password
    };
    SIPml.init(function () {
        stack = new SIPml.Stack({
            realm: C.realm, // mandatory: domain name
            impi: C.privateIdentity, // mandatory: authorization name (IMS Private Identity)
            impu: C.publicIdentity, // mandatory: valid SIP Uri (IMS Public Identity)
            password: C.password, // optional
            websocket_proxy_url: C.websocketServerURL, // optional
            ice_servers: C.iceServers,
            outbound_proxy_url: C.outboundproxyURL, // optional
            enable_rtcweb_breaker: C.enableRTCWebBreaker, // optional
            events_listener: { events: '*', listener: handleIncomingEvents }, // optional: '*' means all events
            sip_headers: [ // optional
                { name: 'User-Agent', value: 'IM-client/OMA1.0 TDDNsip-v1.0.0.0' },
                { name: 'Organization', value: 'TDDN.vn' }
            ]
        });
        stack.start();
    });
};


/** Đây là hàm nhận sự kiện từ iframe cha */
window.addEventListener("message", function(event) {
  console.log("Hello from =======");
  console.log(event);
  var dataReceive = event.data;
  switch(dataReceive.action){
     case "loginRTC":
        var username = dataReceive.username;
        var password = dataReceive.password;
        initRTC(username,password);
     break;
     case "callRTC":
        call(dataReceive.dnid);
        console.log("========call rtc==========", dataReceive, dataReceive.fullname);
        $('.remote-friendly').text(dataReceive.fullname);
        $('.user-photo__wrap img').attr('src','https://webhook.boffice.vn/chat/app-assets/images/avatar/' + dataReceive.image);
     break;
     case "dnid_info":
        console.log(dataReceive);
        $('.remote-friendly').text(dataReceive.data.fullname);
        $('.user-photo__wrap img').attr('src','https://webhook.boffice.vn/chat/app-assets/images/avatar/' + dataReceive.data.image)
     break;
  }
});


   









