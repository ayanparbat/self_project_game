// ++++++++++++++++++++++++++++++++
//  Title   : Script for Bubble
//  Author  : Ayan Parbat
//  Date    : 8/01/2023
// ++++++++++++++++++++++++++++++++

var bubble_interval;
var user = get_user_data();
var settings = {}
reset_setting();

// ++++++++++++++++++++
//     DOM Events
// ++++++++++++++++++++

$(document).ready(function(){

    $('body').append('<div id="popup-alert-container" class="popup-alert-container"></div>');

    if( user.username ) {
        $('.score_cont .player').text(user.username)
        $('.welcome_back .player_name').text(user.username)
        $('#highest_score').text(user.high)
        $('.user_input').hide();
        $('.welcome_back').show();
    }
    else {
        $('.user_input').show();
    }
    $('#user_input_form .submit').click((e)=>{
        e.preventDefault();
        let username = $('#user_input_form [name=player_name]').val();
        update_user_local(username, 0);
        start_game();
        $('#user_input_form [name=player_name]').val('');
    })
    $('#play, .play_again').click(()=>{
        start_game();
    })

})



// +++++++++++++++++++++++
//      Common Functions
// +++++++++++++++++++++++


function popup_alert(message, type=''){
    let c = 'style="background-color:#e2631c54;"';
    if(message == '') return false;
    else if(type == 'success') c = 'style="background-color:#42c727;"';
    else if(type == 'warning') c = 'style="background-color:#fd536c;"';
    $('#popup-alert-container').prepend(`<div ${c} class="popup-alert">${message}</div>`).show();
    $('.popup-alert').fadeIn(100).delay(3500).fadeOut(1000, function(){ $(this).remove(); });
}
function disable_button(selector){
    $(selector).attr('disabled', 'true');
}
function enable_button(selector){
    setTimeout(()=>{ 
        $(selector).removeAttr('disabled'); 
    }, 50);
}



// +++++++++++++++++++++++
//      For game
// +++++++++++++++++++++++



function api_error_msg(data) {
    if(data.status == 200) return;
    (data.response) ? popup_alert(data.response, 'warning') : popup_alert('Something went wrong, please try again later', 'warning');
}
function get_user_data(){
    let ud = localStorage.getItem('bs_ud');
    if( !ud ) return {username : '', high : 0};
    ud = ud.split('.');
    return {username : ud[0], high : ud[1]}
}
    function update_user_local( username = '', point = 0 ){
    user.high = point > user.high ? point : user.high;
    user.username = username;
    localStorage.setItem('bs_ud', user.username + '.' + user.high);
}

function start_game(){
    reset_setting();
    $('.user_input').hide();
    $('.game_cont').show();
    $('#score').text(0);
    $('.game_result').addClass('hide-n');
    $('.welcome_back').hide();
    $('.life_remain').text(settings.maxMissedBall - settings.missedBall)
    push_bubble();
    bubble_interval = setInterval(push_bubble, settings.bubblePushInterval);
}
function reset_setting(){
    settings = {
        winHeight : window.innerHeight,
        winWidth : window.innerWidth,
        level : 1,
        levelUpTime : 40000,
        startTime : Date.now(),
        endTime : Date.now(),
        endGame : false,
        score : 0,
        missedBall : 0,
        minMissedBall : 20,
        maxMissedBall : 0,
        colorClass : ['red','green','yellow','blue','aqua'],
        pointsArr : [10,10,10,10,10,10,10,10,10,10,10,20,20,20,20,20,20,50,50,50,100,-1,-1,-1],
        bubblePushInterval : 4000,
        bubbleFallDuration : 4
    }
    settings.maxMissedBall = count_max_missed_ball();
    settings.colorLength = settings.colorClass.length;
    settings.pointsArrLength = settings.pointsArr.length;
    settings.endTime = Date.now() + settings.levelUpTime;
    document.documentElement.style.setProperty('--bubble-fall-duration', settings.bubbleFallDuration + 's');
}
function count_max_missed_ball() {
    return Math.floor(settings.maxMissedBall * 0.3) + settings.minMissedBall + Math.floor(settings.level * 2.25);
}
function push_bubble(){
    if( Date.now() > settings.endTime ) {
        level_up()
    }
    setTimeout(push_bubble_final, settings.bubbleFallDuration * 1000);
    // console.log('prev = ', settings.level);
    // console.log('now = ', Math.floor(settings.level * settings.bubblePushInterval / 5000));
    // let push_count = Math.floor(Math.random() * 100000) % 4 + settings.level;
    let push_count = Math.floor(Math.random() * 100000) % 3 + Math.floor(settings.level * settings.bubblePushInterval / 5000);
    for(let i = 0; i < push_count; i++) {
        // let new_int = Math.floor(Math.random() * 1000000000) % Math.floor(settings.bubblePushInterval * 0.5);
        let new_int = Math.floor(Math.random() * 1000000000) % settings.bubblePushInterval;
        // setTimeout(push_bubble, new_int);
        setTimeout(push_bubble_final, new_int);
    }

}
function push_bubble_final(){
    if( settings.endGame ) {
        return;
    }
    let this_point = settings.pointsArr[Math.floor(Math.random() * 100000) % settings.pointsArrLength]
    let color = settings.colorClass[Math.floor(Math.random() * 100000) % settings.colorLength]
    let pos_left = (Math.floor(Math.random() * 100000) % settings.winWidth) + 10;
    if( pos_left + 45 > settings.winWidth ) {
        pos_left = settings.winWidth - 50;
    }
    let rnd_class = 'kasi_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    let html = '';
    if( this_point == -1 ) {
        html = `<div class="${rnd_class} bubble ${color} fall" style="left:${pos_left}px;" onmousedown="bubble_clicked(this)" point="${this_point}">
                    <i class="fas fa-bomb"></i>
                </div>
        `;
    } else {
        html = `<div class="${rnd_class} bubble ${color} fall" style="left:${pos_left}px;" onmousedown="bubble_clicked(this)" point="${this_point}">
                    ${this_point}
                </div>
        `;
    }
    $('.game_cont').append(html);
    setTimeout(()=>{
        if( !settings.endGame && $(`.${rnd_class}`).length && parseInt($(`.${rnd_class}`).attr('point')) > 0 ) {
            settings.missedBall++;
            $('.life_remain').text(settings.maxMissedBall - settings.missedBall);
            if( settings.missedBall >= settings.maxMissedBall ) {
                end_game();
            }
        }
        $(`.${rnd_class}`).remove();
    }, settings.bubbleFallDuration * 1000 + 200);
}
function bubble_clicked(bubble_ele){
    let score = parseInt($(bubble_ele).attr('point'));
    if( score == -1 ) {
        end_game();
        return;
    }
    settings.score += score;
    $('#score').text(settings.score);
    $(bubble_ele).remove();
}
function level_up(){
    clearInterval(bubble_interval);
    settings.level++;
    settings.pointsArr.push(-1);
    settings.endTime = Date.now() + settings.levelUpTime;
    settings.maxMissedBall = count_max_missed_ball();
    settings.missedBall = 0;
    $('.life_remain').text(settings.maxMissedBall - settings.missedBall);
    if( settings.bubblePushInterval > 3000 ) {
        settings.bubblePushInterval -= 100;
    }
    else if( settings.bubblePushInterval > 2000 ) {
        settings.bubbleFallDuration -= 0.1;
        settings.bubblePushInterval -= 100;
    }
    else if( settings.bubblePushInterval > 1000 ) {
        settings.bubblePushInterval -= 100;
    }
    else {
        end_game();
    }
    document.documentElement.style.setProperty('--bubble-fall-duration', settings.bubbleFallDuration + 's');
    setTimeout(()=>{
        bubble_interval = setInterval(push_bubble, settings.bubblePushInterval);
        popup_alert('Level Up', 'success');
        popup_alert('New Level ' + settings.level, 'success');
    }, 2000);
}

function end_game(){
    clearInterval(bubble_interval);
    settings.endGame = true;
    update_user_local(user.username, settings.score);
    $('.game_result .score').text(settings.score);
    $('.game_result .high_score').text(user.high);
    $('#highest_score').text(user.high);
}

function get_top_ten_user_html(users = []){
    let html = '';
    users.forEach((el, i) => {
        let self = i > 2 && el.username == user.username ? 'self' : '';
        html += `<div class="top_player top_${i + 1} ${self} flex">
                    <div class="name margin-r10">${el.username}</div>
                    <div class="score">${el.point}</div>
                </div>
        `;
    })
    return html;
}


