// +++++++++++++++++++++++++++++++++++++++++++++++++
//  Title   : Script for Ludo Snake Ladder Game
//  Author  : Ayan Parbat
//  Date    : 02/01/2023
// +++++++++++++++++++++++++++++++++++++++++++++++++

var settings = {}
var snake = [
    {head : 82, tail : 14},
    {head : 76, tail : 53},
    {head : 70, tail : 35},
    {head : 55, tail : 33},
    {head : 59, tail : 4},
]
var ladder = [
    {start : 5, end : 25},
    {start : 29, end : 69},
    {start : 36, end : 96},
    {start : 38, end : 63},
    {start : 47, end : 74},
]

// ++++++++++++++++++++
//     DOM Events
// ++++++++++++++++++++

$(document).ready(function(){

    $('body').append('<div id="popup-alert-container" class="popup-alert-container"></div>');

    $('#game_setting_form [name=player_count]').change(function(){
        let player_count = $(this).val();
        $('#game_setting_form [area=player_details_cont]').html('');
        for(let i = 0; i < player_count; i++) {
            $('#game_setting_form [area=player_details_cont]').append(get_setting_player_input_html(i+1));
        }
    })
    $('#game_setting_form .submit').click((e)=>{
        e.preventDefault();
        let player_count = parseInt($('#game_setting_form [name=player_count]').val());
        if( player_count > 4 || player_count < 2 ) {
            popup_alert('Please choose player', 'warning');
            return;
        }
        settings = {
            total_player : player_count,
            now_playing : 1,
            player_data: []
        }
        let name_found = true   
        for(let i = 0; i < player_count; i++) {
            let elem = $(`#game_setting_form [area=player] [player-id=${i+1}]`)
            if( !elem.val() ) {
                popup_alert('Enter all player name', 'warning');
                return
            }
            settings.player_data.push({
                id : i + 1,
                current_cell : 1,
                name : elem.val().trim(),
                dice_cue : []
            });
        }
        let players = settings.player_data.map(el => el.name);
        for(let i = 0; i < player_count - 1; i++) {
            let name = players[i];
            for(let j = i + 1; j < player_count; j++) {
                if( name == players[j] ) {
                    popup_alert(`"${name}" - name used multiple times<br>Please enter different name`, 'warning');
                    return
                }
            }
        }
        create_game();
        $('.game_table_cont').fadeIn(2000);
        $('.player_data_outer').fadeIn(2000);
        $('#game_setting_form').hide();

    })
    $('.play_again').click(()=>{
        $('#game_setting_form').trigger('reset');
        settings = {}
        $('.game_table_cont').hide();
        $('.player_data_outer').hide();
        $('#game_setting_form').fadeIn(1000);
        $('.game_result').addClass('hide-n');
        $('.cell .coin').each((i,el) => {
            $(el).remove();
        })
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
function copy_object(obj){
    return JSON.parse(JSON.stringify(obj));
}


// +++++++++++++++++++++++
//      For snake game
// +++++++++++++++++++++++


function reset_setting_obj( total_player = 2 ){
    total_player = total_player > 4 ? 4 : total_player;
    settings = {
        total_player : total_player,
        now_playing : 1,
        player_data: []
    }
    for(let i = 0; i < total_player; i++) {
        settings.player_data.push({
            id : i + 1,
            current_cell : 1,
            dice_cue : []
        });
    }
}
function create_game(){
/*
    html = ''
    for(let row = 10; row > 0; row--) {
        let row_type = row % 2 == 0 ? 'even' : 'odd';
        html += `<div class="row flex ${row_type}">`;
        if(row_type == 'even') {
            for(let col = 1; col < 11; col++) {
                let cell_val = row * 10 - col + 1;
                html += `
                        <div class="cell rel" cell-val="${cell_val}">
                            <div class="coin_cont_outer flex">
                                <div class="coin_cont flex"></div>
                            </div>
                            <span>${cell_val}</span>
                        </div>
                `;
            }
        } else {
            for(let col = 10; col > 0; col--) {
                let cell_val = row * 10 - col + 1;
                html += `
                        <div class="cell rel" cell-val="${cell_val}">
                            <div class="coin_cont_outer flex">
                                <div class="coin_cont flex"></div>
                            </div>
                            <span>${cell_val}</span>
                        </div>
                `;
            }
        }
        html += '</div>';
    }
    $('.grid_cont').html(html);
    $('[cell-val="1"] span').html('Start');
    $('[cell-val="100"] span').html('Home');
*/
    settings.player_data.forEach((el) => {
        $(`[cell-val=1] .coin_cont`).append(get_player_coin_html(el.id));
    })
    create_player_controls();
}
function create_player_controls(){
    let html = '';
    settings.player_data.forEach((el, i) => {
        let disabled = i == 0 ? '' : 'disabled';
        html += `
                <div class="flx flx_vc margin-b20" player="${el.id}">
                    <div class="name margin-r5">${el.name}</div>
                    <div class="coin margin-r10" player="${el.id}"></div>
                    <button class="margin-x5" onclick="player_move()" ${disabled}>Play</button>
                </div>
        `;
    })
    $('.player_control').html(html)
}
function get_player_coin_html(player = 0){
    return `<div class="coin" player="${player}"></div>`;
}
function get_dice_html(dice_val){
    if( dice_val == 1 ) {
        return `
                <div class="dice flex">
                    <div class="dice_inner">
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                    </div>
                </div>
        `;
    }
    if( dice_val == 2 ) {
        return `
                <div class="dice flex">
                    <div class="dice_inner">
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                    </div>
                </div>
        `;
    }
    if( dice_val == 3 ) {
        return `
                <div class="dice flex">
                    <div class="dice_inner">
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                    </div>
                </div>
        `;
    }
    if( dice_val == 4 ) {
        return `
                <div class="dice flex">
                    <div class="dice_inner">
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                    </div>
                </div>
        `;
    }
    if( dice_val == 5 ) {
        return `
                <div class="dice flex">
                    <div class="dice_inner">
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"></div>
                        <div class="flex"><span></span></div>
                    </div>
                </div>
        `;
    }
    if( dice_val == 6 ) {
        return `
                <div class="dice flex">
                    <div class="dice_inner">
                        <div class="flex"><span></span></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"><span></span></div>
                        <div class="flex"><span></span></div>
                    </div>
                </div>
        `;
    }
}
function get_setting_player_input_html(player = 0){
    return `
            <div area="player" class="flx flx_vc">
                <input class="margin-r5 margin-b10" type="text" placeholder="Player Name" player-id="${player}">
                <div class="margin-r5">Color</div>
                <div class="coin" player="${player}"></div>
            </div>
    `;
}
function roll_dice(){
    let dice_val = (Math.floor(Math.random() * 1000) % 6) + 1;
    $('.rolling_dice').addClass('spinner').html(get_dice_html(dice_val));
    setTimeout(()=>{
        $('.rolling_dice').removeClass('spinner');
        $('.rolled_dice_cont').append(get_dice_html(dice_val));

    }, 500);
    return dice_val;
}
function player_move(){
    disable_button(`.player_control [player=${settings.now_playing}] button`);
    let time = 50;
    let dice_val = roll_dice();
    let current_player = settings.player_data.find(el => el.id == settings.now_playing);
    let cue_count = current_player.dice_cue.length;
    if( !cue_count ) {
        $('.rolled_dice_cont').html('');
    }
    if( cue_count == 2 && dice_val == 1 ) {
        popup_alert('dice cancelled. play again', 'success');
        reset_player_dice_cue();
        enable_button(`.player_control [player=${settings.now_playing}] button`)
        return
    }
    if( dice_val == 1){
        current_player.dice_cue.push(1);
        settings.player_data = settings.player_data.map((el) => { return el.id == current_player.id ? current_player : el })
        popup_alert('You got 1. Play again.', 'success');
        enable_button(`.player_control [player=${settings.now_playing}] button`)
        return
    }
    if( current_player.current_cell == 1 ) {
        if( cue_count != 0 ) {
            current_player.dice_cue.push(dice_val);
            settings.player_data = settings.player_data.map((el) => { return el.id == current_player.id ? current_player : el })
            time += move_coin();

        }
        move_to_next_player(time);
        return
    }
    else if( current_player.current_cell + dice_val > 100 ) {
        popup_alert(`Opss.. You need ${100 - current_player.current_cell} to win`, 'warning');
        move_to_next_player(time);
        return;
    }
    else {
        current_player.dice_cue.push(dice_val);
        settings.player_data = settings.player_data.map((el) => { return el.id == current_player.id ? current_player : el })
        time += move_coin();
        move_to_next_player(time);
        return
    }
}
function move_to_next_player(time = 100){
    time = time ? time : 100;
    setTimeout(function(){
        settings.now_playing = settings.total_player == settings.now_playing ? 1 : ++settings.now_playing;
        let current_player = settings.player_data.find(el => el.id == settings.now_playing);
        popup_alert(`${current_player.name}'s turn`, 'success');
        reset_player_dice_cue();
        enable_button(`.player_control [player=${settings.now_playing}] button`);
        check_winner();
    }, time);
}
function reset_player_dice_cue(){
    settings.player_data = settings.player_data.map((el) => {
        el.dice_cue = [];
        return el;
    });
}
function is_point_exceed_max_point(){
    let current_player = settings.player_data.find(el => el.id == settings.now_playing);
    let point = current_player.current_cell;
    let cue = [...current_player.dice_cue];
    while( cue.length ) {
        point += cue.shift();
        let snake_found = false, ladder_found = false;
        if( point > 100 ) return true;
        snake.every((el) => {
            if( el.head == point ) {
                point = el.tail;
                return false;
            }
            return true;
        });
        ladder.every((el) => {
            if( el.start == point ) {
                point = el.end;
                return false;
            }
            return true;
        });
        if( point > 100 ) return true;
    }
    return false;
}
function move_coin(){
    let current_player = settings.player_data.find(el => el.id == settings.now_playing);
    let time = 1000;
    if( is_point_exceed_max_point() ){
        let points = current_player.dice_cue.join(', ');
        popup_alert(`Opss your points ${points} exceed 100. Move cancelled.`, 'warning');
        return time;
    }
    while( val = current_player.dice_cue.shift() ) {
        let snake_found = false, ladder_found = false;
        snake.every((el) => {
            if( el.head == val + current_player.current_cell ) {
                snake_found = true;
                time = move_coin_anim({
                    player_id : current_player.id, 
                    from_cell : current_player.current_cell,
                    to_cell : el.tail,
                    move_type : 'snake',
                    time : time
                })
                current_player.current_cell = el.tail
            }
            return !snake_found;
        });
        if( snake_found ) {
            popup_alert('Opss..!! got a snake bite.', 'warning');
            $('.snake_popup_cont').removeClass('hide-n');
            $('.snake_popup').addClass('blink');
            setTimeout(()=>{ 
                $('.snake_popup_cont').addClass('hide-n');
                $('.snake_popup').removeClass('blink');
            }, 4000);
            continue;
        }
        ladder.every((el) => {
            if( el.start == val + current_player.current_cell ) {
                ladder_found = true;
                time = move_coin_anim({
                    player_id : current_player.id, 
                    from_cell : current_player.current_cell,
                    to_cell : el.end,
                    move_type : 'ladder',
                    time : time
                })
                current_player.current_cell = el.end
            }
            return !ladder_found;
        });
        if( ladder_found ) {
            popup_alert('WOW..!! you got a ladder', 'success');
            $('.ladder_popup_cont').removeClass('hide-n');
            $('.ladder_popup').addClass('blink');
            setTimeout(()=>{ 
                $('.ladder_popup_cont').addClass('hide-n');
                $('.ladder_popup').removeClass('blink');
            }, 4000);
            continue;
        }
        time = move_coin_anim({
            player_id : current_player.id, 
            from_cell : current_player.current_cell,
            to_cell : current_player.current_cell + val,
            move_type : 'normal',
            time : time
        })
        current_player.current_cell += val;
    }
    settings.player_data = settings.player_data.map((el) => { return el.id == current_player.id ? current_player : el })
    return time;
}
function move_coin_anim( config = {} ) {
    let from_cell = config.from_cell
    let time_interval = 300
    if( config.move_type == 'snake' || config.move_type == 'ladder' ) {
        time_interval = 50
    }
    if( config.move_type == 'snake' ) {
        for(; config.from_cell >= config.to_cell; config.from_cell--) {
            setTimeout(()=>{
                $(`.cell [player=${config.player_id}]`).remove();
                $(`[cell-val=${from_cell}] .coin_cont`).append(get_player_coin_html(config.player_id));
                from_cell--;
            }, config.time);
            config.time += time_interval;
        }
    }
    else {
        for(; config.from_cell <= config.to_cell; config.from_cell++) {
            setTimeout(()=>{
                $(`.cell [player=${config.player_id}]`).remove();
                $(`[cell-val=${from_cell}] .coin_cont`).append(get_player_coin_html(config.player_id));
                from_cell++;
            }, config.time);
            config.time += time_interval;
        }
    }
    return config.time + 500;
}
function check_winner(){
    let winner = {}, winner_found = false;
    settings.player_data.every((el) => {
        if( el.current_cell == 100 ) {
            winner = el;
            winner_found = true;
        }
        return !winner_found;
    })
    if( winner_found ) {
        $('.game_result .winner_name').text(winner.name);
        $('.game_result').removeClass('hide-n');
    }
}

