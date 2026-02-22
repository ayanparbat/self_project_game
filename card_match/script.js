// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//  Title    :  Card Matching Game
//  Author   :  Ayan Parbat
//  Date     :  20/10/2020
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++



var pics = ['💘', '😠', '🐼', '🎂', '🍩', '🍫', '🍭', '🍕', '🍟', '🍆', '🍅', '🍎', '🍒', '🍉', '🍇', '🌿', '🌲', '🌹', '🌺', '🐞', '🐙', '🐠', '🐬', '🐢', '🐧', '🐯', '🐵', '💣', '💜', '💙', '💚', '💛', '❤', '💔', '💕', '👾', '👹', '👻', '😈', '😱', '😮', '😳', '😎', '😵', '😷', '😜', '😍', '😘', '😂', '😀'];
var click_counter = 0, clicked_index = 0, click_enabled = false; 
var game_data = {
        level : get_level(),
        level_completed : get_level(),
        total_cards : 4,
        card_matched : 0
}
Array.prototype.shuffle = function(){
    let a = this, n = a.length;
    for(let i = n - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a;
}


var crd = '';


$(document).ready(function(){

    $('body').append('<div id="popup-alert-container" class="popup-alert-container"></div>');
    $('[open-modal]').click(function(){
        $('body').css('overflow', 'hidden');
        $('#'+$(this).attr('open-modal')).fadeIn(300); 
    });
    $('[close-modal]').click(function(){
        $('body').css('overflow', 'initial');
        $('#'+$(this).attr('close-modal')).fadeOut(300);
    });


    refresh_previous_level();
    $('#startup_modal [start-lvl-msg]').text(game_data.level);
    $('[btn-reset-level]').click(()=>{
        reset_level();
        popup_alert('Level has been reset', 'success');
    });
    $('#startup_modal button, #levelup_modal button, [btn-reload-cards]')
    .click(start_game);

    $('#previous_level_modal .previous_levels').click(function(e){
        e.stopPropagation();
        if(e.target.tagName.toLowerCase() != 'section') return false;
        game_data.level = parseInt(e.target.innerText);
        close_modal('previous_level_modal');
        start_game();
    });
    $('.game_container').click(function(e){ 
        e.stopPropagation();
        if(click_enabled) return;
        let this_card;
        if($(e.target).hasClass('front') || $(e.target).hasClass('back')){
            this_card = $(e.target.parentElement);
        }
        else if($(e.target).hasClass('card')){
            this_card = $(e.target);
        }
        else return;
        if(this_card.attr('choose') == 'true') return;

        
        click_enabled = true;
        click_counter++;
        let front_sec = this_card.find('.front');
        let back_sec = this_card.find('.back');
        back_sec.fadeOut(300);
        this_card.attr('choose', 'true');
        if(click_counter % 2 == 1){
            clicked_index = this_card.attr('card-index');
            click_enabled = false;
        }
        else if(clicked_index != 0){
            if(front_sec.text() == $(`[card-index=${clicked_index}] .front`).text()){
                setTimeout(()=>{
                    $(`[card-index=${clicked_index}]`).attr('done', '');
                    this_card.attr('done', '');
                    clicked_index = 0;
                    click_enabled = false;
                }, 600);
                game_data.card_matched += 2;
            }
            else{
                setTimeout(function(){
                    $(`[card-index=${clicked_index}]`).attr('choose', 'false');
                    $(`[card-index=${clicked_index}]`).find('.back').fadeIn(300);
                    this_card.attr('choose', 'false');
                    back_sec.fadeIn(300);
                    click_enabled = false;
                    clicked_index = 0;
                }, 1000);
            }
        }
        if(game_data.total_cards == game_data.card_matched){
            setTimeout(()=>{ level_up(); }, 700);
        }
    })

})





// common functions



function popup_alert(message, type=''){
    let c = 'style="background-color:#e2631c54;"';
    if(message == '') return false;
    else if(type == 'success') c = 'style="background-color:#42c727;"';
    else if(type == 'warning') c = 'style="background-color:#fd536c;"';
    $('#popup-alert-container').prepend(`<div ${c} class="popup-alert">${message}</div>`).show();
    $('.popup-alert').fadeIn(100).delay(3500).fadeOut(1000, function(){ $(this).remove(); });
}
function remove_px(value){ return parseInt(value.substr(0, value.lastIndexOf('p'))); }
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
function delete_cookie(name, path = '/'){ document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=${path};`; }
function open_modal(id){
    $('body').css('overflow-y','hiden');
    $('#' + id).fadeIn(200);
}
function close_modal(id){
    $('body').css('overflow-y','hiden');
    $('#' + id).fadeOut(200);
}



// custom functions


function refresh_previous_level(){
    $('#previous_level_modal .previous_levels').html('');
    for(let i = 1; i <= game_data.level_completed; i++){
        $('#previous_level_modal .previous_levels').append('<section>'+i+'</section>');
    }
}
function disable_buttons(){
    $('[btn-reload-cards]').attr('disabled', '');
    $('[btn-reset-level]').attr('disabled', '');
    $('[btn-open-level-modal]').attr('disabled', '');
}
function enable_button(time_delay){
    setTimeout(()=>{
        $('[btn-reload-cards]').removeAttr('disabled');
        $('[btn-reset-level]').removeAttr('disabled');
        $('[btn-open-level-modal]').removeAttr('disabled');
    }, time_delay);
}
function start_game(){
    close_modal('startup_modal');
    close_modal('levelup_modal');
    $('.level_heading').text(`Level : ${game_data.level}`);
    click_enabled = false;
    disable_buttons();
    create_level_cards();
}
function create_level_cards(){
    $('.game_container').html('');
    game_data.total_cards = game_data.level * 2 + 2;
    game_data.card_matched = 0;
    click_counter = 0;
    clicked_index = 0;
    let intv_arr = [];
    let invalid_card = false;
    let served_index = 0;
    let time_delay = 150; // 3000 / game_data.total_cards
    let total_unique_cards = game_data.total_cards / 2;
    let old_pics = [], this_pic = '', cards_html = '';
    for(let i = 0, this_pic = ''; i < total_unique_cards; i++){
        this_pic = get_unique_pic(old_pics);
        old_pics.push(this_pic);
        old_pics.push(this_pic);
    }
    old_pics.shuffle();
    old_pics.every((el, i) => {
        if(el === undefined){
            invalid_card = true;
            return false;
        }
        let k = setTimeout(()=>{
            $('.game_container').append(get_card(el, i));
        }, i * time_delay + time_delay);
        intv_arr.push(k);
        return true;
    });
    if(invalid_card){
        //popup_alert('Error detected, Reloading cards', 'warning');
        intv_arr.forEach((el)=>{
            clearTimeout(el);
        })
        setTimeout(start_game(), 300);
    }
    else{
        enable_button((old_pics.length + 1) * time_delay);
    }
}
function get_unique_pic(old_pics){
    let rand = Math.floor(Math.random()*10000) % pics.length;
    if(old_pics.indexOf(pics[rand]) == -1){ return pics[rand]; }
    else get_unique_pic(old_pics);
}
function get_card(card_ele, index){
    if(!card_ele) return false;
    return `<div class="card flex" choose="false" card-index="${index + 1}">
                <div class="front">${card_ele}</div>
                <div class="back"></div>
            </div>`;
}
function level_up(){
    popup_alert('Level Cleared', 'success');
    if(game_data.level == game_data.level_completed){
        game_data.level_completed++;
        set_level();
        refresh_previous_level();
    }
    game_data.level++;
    open_modal('levelup_modal');
}
function get_level(){
    return localStorage.getItem('__msrp_lvl') || 1;
}
function set_level(){
    localStorage.setItem('__msrp_lvl', game_data.level_completed);
}
function reset_level(){
    game_data.level_completed = 1;
    game_data.level = 1;
    set_level();
}

