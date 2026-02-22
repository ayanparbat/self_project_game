/*
//	file_name: main_js.js
//	author: Ayan Parbat
*/

const   

time_interval_span = 10,
ap_xhr = {"X-Requested-With" : "XMLHttpRequest"},
ap_apiHost = 'http://apsp.ekofeatlearning.co.in/api',
ap_apiAuthKey = 'ad79bfbf2cfd87f027516f9c4c410af9',
host = document.location.origin+'/php/self_project', //'http://localhost/php/self_project',
unknownError = 'Something went wrong, please try again later',
ap_callback = 'ap_api_callback';

startup_block_uri = [
    '/games/blackjack',
    '/games/tictactoe',
    '/corona/'
];
if(startup_block_uri.filter((v)=> document.URL.match(v) == -1)[0]){
    startup_functions();
}
// fetch(ap_processFile()+'f=status&s=get_all_user_status&usernames=~ayanparbat~ayanparbat~ayanparbat',
//     {headers: {"X-Requested-With" : "XMLHttpRequest"}
// })
// .then(res => res.json())
// .then(data => console.log(data))




$(document).ready(function(){
//document.ready start

$('body').append('<div id="popup_alert_container" class="popup_alert_container"></div>');
$('[open-modal]').click(function(){
    $('body').css('overflow', 'hidden');
    $('#'+$(this).attr('open-modal')).fadeIn(300); 
});
$('[close-modal]').click(function(){
    $('body').css('overflow', 'initial');
    $('#'+$(this).attr('close-modal')).fadeOut(300);
});
$('[data-ref]').click(function(){ console.log(11);
    if($(this).attr('open') == 'new'){
        window.open(host+'/'+$(this).attr('data-ref'));
    }
    else if($(this).attr('data-ref') == 'home'){
        location.href = host;
    }
    else{console.log(host+'/'+$(this).attr('data-ref'));
        location.href = host+'/'+$(this).attr('data-ref');
    }
});
$('[hover-data]').on('mouseover', function(e){
    let ex = e.clientX, ey = e.clientY, c = '_hopd'+(new Date).getTime(), ele = $(this)[0];
    let ele_top = ey /*ele.getBoundingClientRect().top*/, ele_left = ex;//ele.getBoundingClientRect().left;
    $(this).attr('hopd', c);
    $(this).parent().append('<div id='+c+' class="hover_popup_cont">'+$(this).attr('hover-data')+'</div>');
    let  msg = $('#'+c)[0];
    //console.log(ex+'-'+ey);

    if($(this).attr('hover-data-pos') == 'right'){
        msg.style.top = (ey - (msg.offsetHeight / 2) ) + 'px';
        msg.style.left = (ex + 20 ) + 'px';
    }
    else if($(this).attr('hover-data-pos') == 'left'){
        msg.style.top = (ey - (msg.offsetHeight / 2) ) + 'px';
        msg.style.left = (ex - msg.offsetWidth - 20 ) + 'px';
    }
    else{
        if(window.innerHeight - ey - msg.offsetHeight > 25){
            msg.style.top = (ey + 20 ) + 'px';
        }
        else{
            msg.style.top = (ey - msg.offsetHeight - 20) + 'px';
        }
        if(window.innerWidth - ex - (msg.offsetWidth / 2) > 20){
            msg.style.left = (ex  - (msg.offsetWidth / 2)) + 'px';
        }
        else{
            msg.style.right = '20px';
        }
    }
//console.log(ey+'-'+ex);
//console.log(msg.style.top+'-'+msg.style.right+' - ' + msg.style.left);

    // if($(this).attr('hover-data-pos') == 'right'){
    //     msg.style.top = (ele_top + (ele.offsetHeight / 2) - (msg.offsetHeight / 2) ) + 'px';
    //     msg.style.left = (ele_left + ele.offsetWidth + 10 ) + 'px';
    // }
    // else if($(this).attr('hover-data-pos') == 'left'){
    //     msg.style.top = (ele_top + (ele.offsetHeight / 2) - (msg.offsetHeight / 2) ) + 'px';
    //     msg.style.left = (ele_left - msg.offsetWidth - 10 ) + 'px';
    // }
    // else{
    //     if(window.innerHeight - ele_top - ele.offsetHeight > msg.offsetHeight + 15){
    //         msg.style.top = (ele_top + ele.offsetHeight + 10 ) + 'px';
    //     }
    //     else{
    //         msg.style.top = (ele_top - ele.offsetHeight - 10) + 'px';
    //     }
    //     if(window.innerWidth - ele_left - (ele.offsetWidth / 2) > (msg.offsetWidth / 2) + 10){
    //         msg.style.left = (ele_left + (ele.offsetWidth / 2) - (msg.offsetWidth / 2) + 10 ) + 'px';
    //     }
    //     else{
    //         msg.style.right = '10px';
    //     }
    // }



    $('#'+c).css('visibility', 'initial').delay(500).fadeIn(500);
});
$('[hover-data]').on('mouseout', function(){ //return false;
    let id = $(this).attr('hopd');
    if(id){
        $('#'+id).remove();
    }
});
$('[mode-icon]').click(function(){
    if($(this).attr('mode-icon') == 'day' && $('#nightmode_css')[0] != undefined){
        $('#nightmode_css').remove();
        $(this).parent().attr('hover-data', 'Relax Mode');
        $(this).removeClass('fa-sun').addClass('fa-moon').attr('mode-icon', 'night');
        delete_cookie('ap_nm');
    }
    else if($(this).attr('mode-icon') == 'night' && $('#nightmode_css')[0] == undefined){
        $('head').append('<link rel="stylesheet" id="nightmode_css" type="text/css" href="css/general_style_dark.css">');
        $(this).removeClass('fa-moon').addClass('fa-sun').attr('mode-icon', 'day');
        $(this).parent().attr('hover-data', 'Brighten the page');
        set_cookie('ap_nm', 1);
    }
});
/*$('#nav_prof_img, #nav_prof_drop').mouseover(()=>{
    if($('#nav_prof_drop').css('display') == 'block') return false;
    $('#nav_prof_drop').fadeIn(500);
});
$('#nav_prof_img').mouseout(()=>{
    if($('#nav_prof_drop').css('display') == 'none') return false;
    $('#nav_prof_drop').fadeOut(500);
});
$('#nav_prof_drop').mouseout(()=>{
    $('#nav_prof_drop').fadeOut(500);
});*/
$('[logoff]').click(()=>{
    delete_cookie('__tk');
    set_cookie('ack_lo', '1');
    location.href = host+'/welcome.php';
});




// end of document.ready
});

// startup functions
function startup_functions(){
    update_timestamp();
    setInterval(update_timestamp, 10000);
    setInterval(get_all_user_status, 10000);
}

// startup functions

function popup_alert(message, type=''){
	let ele, c;
    if(message == '') return false;
    else if(type == 'success') c = 'puc_g';
    else if(type == 'warning') c = 'puc_r';
    else c = 'puc_o';
    $('#popup_alert_container').prepend(`<div class="popup_alert ${c}">${message}</div>`).show();
    $('.popup_alert').fadeIn(100).delay(3000).fadeOut(500, function(){ $(this).remove(); });
    	// if($('#popup_alert_container').html() == ''){
    	// 	$('#popup_alert_container').hide();
    	// }
}
function remove_px(value){ return parseInt(value.substr(0, value.lastIndexOf('p'))); }
function clearInputFields(select_area, clr_lists = []){ 
    let field = $(select_area + ' input');
    for(let key in field){
        if(isNaN(key)) continue;
        clr_lists.forEach((p, i)=>{
            if(p == 'border'){
                field[key].style.border = 'none';
            }
            else if(p == 'value'){
                field[key].value = '';
            }
            else if(p == 'all'){
                field[key].style.border = 'none';
                field[key].value = '';
            }

        });
    }
}
function ap_getApiUrl(){ return ap_apiHost+'/?authKey='+ap_apiAuthKey+'&'; }
function set_cookie(name, value, time = 60*60*24*365*5){
    let d = new Date; 
    d.setSeconds(d.getSeconds() + time);
    exp = d.toUTCString();
    document.cookie = `${name}=${value}; Expires=${exp}; Path=/;`;
}
function get_cookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
}
function delete_cookie(name){ document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=/;`; }
function update_timestamp(){
    let times = document.getElementsByClassName('time');
    for(let i=0; i < times.length; i++){
        let t = Math.round((new Date()).getTime()/1000) - parseInt(times[i].getAttribute('time'));
        let t_txt = get_time_string(t) +' ago';
        if(times[i].getAttribute('check-online') == 'true'){
            let icon = times[i].parentNode.parentNode.getElementsByClassName('online-icon')[0];
            if(t > time_interval_span*2){
                if(times[i].innerHTML != t_txt){
                    times[i].innerHTML = t_txt;
                }
                icon.classList.remove('online');
                times[i].classList.remove('online');
            }
            else{
                if(times[i].innerHTML != 'online'){
                    times[i].innerHTML = 'online';
                }
                icon.classList.add('online');
                times[i].classList.add('online');
            }
        }
        else{
            if(t > time_interval_span){
                if(times[i].innerHTML != t_txt){
                    times[i].innerHTML = t_txt;
                }
            }
        }
    }
}
function get_time_string(t){
    if(t >= 60*60*24*30*12){
        let r = parseInt(t / (60*60*24*30*12));
        return (r > 1)? (r+' Years'):(r+' Year');
    }
    else if(t >= 60*60*24*30){
        let r = parseInt(t / (60*60*24*30));
        return (r > 1)? (r+' Months'):(r+' Month');
    }
    else if(t >= 60*60*24){
        let r = parseInt(t / (60*60*24));
        return (r > 1)? (r+' Days'):(r+' Day');
    }
    else if(t >= 60*60){
        let r = parseInt(t / (60*60));
        return (r > 1)? (r+' Hours'):(r+' Hour');
    }
    else if(t >= 60){
        let r = parseInt(t / 60);
        return (r > 1)? (r+' Mins'):(r+' Min');
    }
    else{
        return t+' Sec';
    }
}
function get_all_user_status(){
    let times = $('[check-online=true]'), usernames_string = '', usernames = {};
    for(let i = 0; i < times.length; i++){
        usernames_string += '~'+times[i].getAttribute('username');
        // usernames[i] = {};
        // usernames[i].username = times[i].getAttribute('username');
    }
    // let data = JSON.parse($.ajax({ url: ap_processFile()+'f=status&s=get_all_user_status&usernames='+usernames_string, async: false }).responseText).result;
    // for(let i = 0; i < times.length; i++){
    //     if(times[i].getAttribute('time') != data[i]){
    //         times[i].setAttribute('time', data[i]);
    //     }
    // }
    $.get(ap_processFile()+'f=status&s=get_all_user_status&usernames='+usernames_string, (data)=>{
        for(let i = 0; i < times.length && times[i].getAttribute('time') != data.result[i]; i++){
            times[i].setAttribute('time', data.result[i]);
        }
    });
}
function toggle_addfriend(id){
    if(!id) return false;
    $.get(ap_processFile()+'f=status&s=get_all_user_status&friend_id='+id, (data)=>{
        if(data.status == 200){
            popup_alert('Friend request sent', 'success');
            btn.innerHTML = data.change_state;
        }
        else{
            popup_alert(unknownError, 'warning');
        }
    });
}
















