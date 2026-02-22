// ++++++++++++++++++++++++++++++++
//  Title   : Script for Chess
//  Author  : Ayan Parbat
//  Date    : 17/01/2023
// ++++++++++++++++++++++++++++++++

var settings = {}
var moves = [];
reset_setting();






// ++++++++++++++++++++
//     DOM Events
// ++++++++++++++++++++

$(document).ready(function(){

    $('body').append('<div id="popup-alert-container" class="popup-alert-container"></div>');

    $.post('./process.php?act=init', (data) => {});

    $('.replace_pawn_btn').click(()=>{
        let cell_pos = $('.pawn_replace_modal [name=pawn_pos]').val();
        if( !cell_pos ){
            popup_alert('Something went wrong', 'warning');
            return 
        }
        let piece_selected = $('.replace_piece_cont .piece.selected')
        if( !piece_selected.length ) {
            popup_alert('Please select a piece', 'warning');
            return;
        }
        cell_pos = JSON.parse(cell_pos);
        $('.pawn_replace_modal .piece').unbind();
        $(`[x=${cell_pos.x}][y=${cell_pos.y}]`).html(piece_selected[0]);
        $(`[x=${cell_pos.x}][y=${cell_pos.y}] .piece`).removeClass('selected');
        $('.pawn_replace_modal [name=pawn_pos]').val('');
        $('.pawn_replace_modal').addClass('hide-n');
        $('.replace_piece_cont').html('');
        find_set_check_for_current_player();
        save_player_move_local();
    })

    $('.load_previous_game').click(()=>{
        arrange_board_from_last_move_local(); 
        $('.game_start_modal').addClass('hide-n');
    })
    $('#player_details_form button').click((e)=>{
        e.preventDefault();
        e.stopPropagation();
        let white = $('#player_details_form [name=white]').val().trim();
        let black = $('#player_details_form [name=black]').val().trim();
        if( !white || !black ){
            popup_alert('Please enter both players name', 'warning');
            return;
        }
        create_game();
        settings.player.white.name = white;
        settings.player.black.name = black;
        $('.play_info').each(function(){
            $(this).find('.player.white .name').text(white);
            $(this).find('.player.black .name').text(black);
        })
        $('#player_details_form').trigger('reset');
        $('.game_start_modal').addClass('hide-n');
        $.post('./process.php?act=init', {username : `${white}-${black}`}, (data) => {});
    });
    $('.play_again_confirm_modal .yes').click(()=>{
        $('.play_again_confirm_modal').addClass('hide-n');
        let player_info = {...settings.player}
        create_game();
        settings.player.white.name = player_info.white.name;
        settings.player.black.name = player_info.black.name;
    });
    $('.undo_btn').click(undo_move)

    create_game();

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
function open_modal(selector){
    $(selector).removeClass('hide-n');
}
function close_modal(selector){
    $(selector).addClass('hide-n');
}
function copy_obj(obj = {}){
    return JSON.parse(JSON.stringify(obj));
}

// +++++++++++++++++++++++
//      For game
// +++++++++++++++++++++++

function save_move( {...destination_cell}, is_castling = false ){
    let this_move = {}
    let src_piece = $('.cell .piece.selected')
    let src_cell = src_piece.parent();
    let dst_piece = $(`[x=${destination_cell.x}][y=${destination_cell.y}] .piece`);
    this_move.src = {
        pos : { 
            x : parseInt(src_cell.attr('x')), 
            y : parseInt(src_cell.attr('y')) 
        },
        piece : {
            name : src_piece.attr('piece-name'),
            color : src_piece.attr('player')
        },
    }
    this_move.dst = {
        pos : destination_cell,
        piece : dst_piece.length ? {
            name : dst_piece.attr('piece-name'),
            color : dst_piece.attr('player')
        } : undefined
    }
    this_move.is_castling = is_castling;
    this_move.player = copy_obj(settings.player);
    console.log('this_move.player --- ', this_move.player)
    // delete this_move.player.white.name;
    // delete this_move.player.black.name;
    console.log(this_move);
    moves.push({...this_move});
    $('.play_info.big .undo_btn').removeAttr('disabled');
    $('.play_info.small .undo_btn').removeAttr('disabled');
}
function undo_move(){
    if( !moves.length ){
        popup_alert('No previous move available', 'warning');
        return;
    }
    this_move = moves.pop();
    console.log('this_move player undo ', this_move.player)
    if( !moves.length ) {
        $('.play_info.big .undo_btn').attr('disabled', 'disabled');
        $('.play_info.small .undo_btn').attr('disabled', 'disabled');
    }
    let src_cell = $(`[x=${this_move.src.pos.x}][y=${this_move.src.pos.y}]`);
    let dst_cell = $(`[x=${this_move.dst.pos.x}][y=${this_move.dst.pos.y}]`);
    src_cell.html(get_piece_html(this_move.src.piece.color, this_move.src.piece.name));
    dst_cell.html( this_move.dst.piece ? get_piece_html(this_move.dst.piece.color, this_move.dst.piece.name) : '' );
    settings.player = {...this_move.player}
    settings.now_playing = this_move.src.piece.color;
    /* check is the last move was a castling or not */
    if( this_move.is_castling ) {
        if( this_move.src.piece.color == 'white' ) {
            $('[x=1][y=1]').html(get_piece_html(settings.now_playing, 'rook'));
            $('[x=4][y=1]').html('');
        }
        else {
            $('[x=1][y=8]').html(get_piece_html(settings.now_playing, 'rook'));
            $('[x=4][y=8]').html('');
        }
    }
    $('.play_info').each(function(){
        $(this).attr('player', settings.now_playing);
        $(this).removeAttr('winner');
    });
    $('.board').attr('now-playing', settings.now_playing);
    close_modal('.checkmate_popup');

    update_dead_piece();

    settings.now_playing = this_move.src.piece.color == 'white' ? 'black' : 'white';
    if( this_move.player[settings.now_playing].check ) {
        mark_king_as_check();
    } else {
        unmark_king_as_check();
    }
    settings.now_playing = this_move.src.piece.color
}
function update_dead_piece(){
    let length = 0;
    $(`.dead_piece.white`).html('');
    $(`.dead_piece.black`).html('');

    /* white */
    
    length = 8 - $('.cell [player=white][piece-name=pawn]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.black`).append(get_piece_html('white', 'pawn'));
    }
    length = 2 - $('.cell [player=white][piece-name=rook]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.black`).append(get_piece_html('white', 'rook'));
    }
    length = 2 - $('.cell [player=white][piece-name=knight]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.black`).append(get_piece_html('white', 'knight'));
    }
    length = 2 - $('.cell [player=white][piece-name=bishop]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.black`).append(get_piece_html('white', 'bishop'));
    }
    length = 1 - $('.cell [player=white][piece-name=qeen]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.black`).append(get_piece_html('white', 'qeen'));
    }

    /* black */

    length = 8 - $('.cell [player=black][piece-name=pawn]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.white`).append(get_piece_html('black', 'pawn'));
    }
    length = 2 - $('.cell [player=black][piece-name=rook]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.white`).append(get_piece_html('black', 'rook'));
    }
    length = 2 - $('.cell [player=black][piece-name=knight]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.white`).append(get_piece_html('black', 'knight'));
    }
    length = 2 - $('.cell [player=black][piece-name=bishop]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.white`).append(get_piece_html('black', 'bishop'));
    }
    length = 1 - $('.cell [player=black][piece-name=qeen]').length;
    for(let i = 0; i < length; i++){
        $(`.dead_piece.white`).append(get_piece_html('black', 'qeen'));
    }
}

function end_game(){
    $('.checkmate_popup').removeClass('hide-n');
    settings.winner = settings.now_playing == 'white' ? 'black' : 'white';
    $('#winner_name').text(settings.player[settings.winner].name);
    $(`.piece[player=${settings.now_playing}][piece-name=king]`).addClass('checkmate');
    $(`.play_info`).each(function(){
        $(this).attr('winner', settings.winner);
    })
    setTimeout(()=>{ $('.game_result_modal').removeClass('hide-n'); }, 3000);
    setTimeout(()=>{ $('.game_result_modal').addClass('hide-n'); }, 6000);
    setTimeout(()=>{ $(`.piece[player=${settings.now_playing}][piece-name=king]`).removeClass('checkmate'); }, 1300);
    save_player_move_local();
}

function create_game(){
    let html = '';
    for(let row = 8; row > 0; row--) {
        let row_type = row % 2 == 0 ? 'even' : 'odd';
        html += `<div class="row flex ${row_type}">`;
        for(let col = 1; col < 9; col++) {
            html += `<div class="cell flex rel" y="${row}" x="${col}"></div>`;
        }
        html += '</div>';
    }

    $('.board').html(html);

    /* White piece */

    // $('[x=1][y=2]').append(`<div class="piece flex" player="white" piece-name="pawn"><img src="./img/white-pawn.png"></div>`);
    // $('[x=2][y=2]').append(`<div class="piece flex" player="white" piece-name="pawn"><img src="./img/white-pawn.png"></div>`);
    // $('[x=3][y=2]').append(`<div class="piece flex" player="white" piece-name="pawn"><img src="./img/white-pawn.png"></div>`);
    // $('[x=4][y=2]').append(`<div class="piece flex" player="white" piece-name="pawn"><img src="./img/white-pawn.png"></div>`);
    // $('[x=5][y=2]').append(`<div class="piece flex" player="white" piece-name="pawn"><img src="./img/white-pawn.png"></div>`);
    // $('[x=6][y=2]').append(`<div class="piece flex" player="white" piece-name="pawn"><img src="./img/white-pawn.png"></div>`);
    // $('[x=7][y=2]').append(`<div class="piece flex" player="white" piece-name="pawn"><img src="./img/white-pawn.png"></div>`);
    // $('[x=8][y=2]').append(`<div class="piece flex" player="white" piece-name="pawn"><img src="./img/white-pawn.png"></div>`);

    // $('[x=1][y=1]').append(`<div class="piece flex" player="white" piece-name="rook"><img src="./img/white-rook.png"></div>`);
    // $('[x=2][y=1]').append(`<div class="piece flex" player="white" piece-name="knight"><img src="./img/white-knight.png"></div>`);
    // $('[x=3][y=1]').append(`<div class="piece flex" player="white" piece-name="bishop"><img src="./img/white-bishop.png"></div>`);
    // $('[x=4][y=1]').append(`<div class="piece flex" player="white" piece-name="qeen"><img src="./img/white-qeen.png"></div>`);
    // $('[x=5][y=1]').append(`<div class="piece flex" player="white" piece-name="king"><img src="./img/white-king.png"></div>`);
    // $('[x=6][y=1]').append(`<div class="piece flex" player="white" piece-name="bishop"><img src="./img/white-bishop.png"></div>`);
    // $('[x=7][y=1]').append(`<div class="piece flex" player="white" piece-name="knight"><img src="./img/white-knight.png"></div>`);
    // $('[x=8][y=1]').append(`<div class="piece flex" player="white" piece-name="rook"><img src="./img/white-rook.png"></div>`);

    //  Black piece 

    // $('[x=1][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);
    // $('[x=2][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);
    // $('[x=3][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);
    // $('[x=4][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);
    // $('[x=5][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);
    // $('[x=6][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);
    // $('[x=7][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);
    // $('[x=8][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);

    // $('[x=1][y=8]').append(`<div class="piece flex" player="black" piece-name="rook"><img src="./img/black-rook.png"></div>`);
    // $('[x=2][y=8]').append(`<div class="piece flex" player="black" piece-name="knight"><img src="./img/black-knight.png"></div>`);
    // $('[x=3][y=8]').append(`<div class="piece flex" player="black" piece-name="bishop"><img src="./img/black-bishop.png"></div>`);
    // $('[x=4][y=8]').append(`<div class="piece flex" player="black" piece-name="qeen"><img src="./img/black-qeen.png"></div>`);
    // $('[x=5][y=8]').append(`<div class="piece flex" player="black" piece-name="king"><img src="./img/black-king.png"></div>`);
    // $('[x=6][y=8]').append(`<div class="piece flex" player="black" piece-name="bishop"><img src="./img/black-bishop.png"></div>`);
    // $('[x=7][y=8]').append(`<div class="piece flex" player="black" piece-name="knight"><img src="./img/black-knight.png"></div>`);
    // $('[x=8][y=8]').append(`<div class="piece flex" player="black" piece-name="rook"><img src="./img/black-rook.png"></div>`);

    /* -------------------- */

    /* White piece */

    $('[x=1][y=2]').append( get_piece_html('white', 'pawn') );
    $('[x=2][y=2]').append( get_piece_html('white', 'pawn') );
    $('[x=3][y=2]').append( get_piece_html('white', 'pawn') );
    $('[x=4][y=2]').append( get_piece_html('white', 'pawn') );
    $('[x=5][y=2]').append( get_piece_html('white', 'pawn') );
    $('[x=6][y=2]').append( get_piece_html('white', 'pawn') );
    $('[x=7][y=2]').append( get_piece_html('white', 'pawn') );
    $('[x=8][y=2]').append( get_piece_html('white', 'pawn') );

    $('[x=1][y=1]').append( get_piece_html('white', 'rook') );
    $('[x=2][y=1]').append( get_piece_html('white', 'knight') );
    $('[x=3][y=1]').append( get_piece_html('white', 'bishop') );
    $('[x=4][y=1]').append( get_piece_html('white', 'qeen') );
    $('[x=5][y=1]').append( get_piece_html('white', 'king') );
    $('[x=6][y=1]').append( get_piece_html('white', 'bishop') );
    $('[x=7][y=1]').append( get_piece_html('white', 'knight') );
    $('[x=8][y=1]').append( get_piece_html('white', 'rook') );

    //  Black piece 

    $('[x=1][y=7]').append( get_piece_html('black', 'pawn') );
    $('[x=2][y=7]').append( get_piece_html('black', 'pawn') );
    $('[x=3][y=7]').append( get_piece_html('black', 'pawn') );
    $('[x=4][y=7]').append( get_piece_html('black', 'pawn') );
    $('[x=5][y=7]').append( get_piece_html('black', 'pawn') );
    $('[x=6][y=7]').append( get_piece_html('black', 'pawn') );
    $('[x=7][y=7]').append( get_piece_html('black', 'pawn') );
    $('[x=8][y=7]').append( get_piece_html('black', 'pawn') );

    $('[x=1][y=8]').append( get_piece_html('black', 'rook') );
    $('[x=2][y=8]').append( get_piece_html('black', 'knight') );
    $('[x=3][y=8]').append( get_piece_html('black', 'bishop') );
    $('[x=4][y=8]').append( get_piece_html('black', 'qeen') );
    $('[x=5][y=8]').append( get_piece_html('black', 'king') );
    $('[x=6][y=8]').append( get_piece_html('black', 'bishop') );
    $('[x=7][y=8]').append( get_piece_html('black', 'knight') );
    $('[x=8][y=8]').append( get_piece_html('black', 'rook') );


    /* -------------------- */


    // $('[x=1][y=7]').append(`<div class="piece flex" player="black" piece-name="knight"><img src="./img/black-knight.png"></div>`);
    // $('[x=5][y=1]').append(`<div class="piece flex" player="black" piece-name="king"><img src="./img/black-king.png"></div>`);
    // // $('[x=2][y=7]').append(`<div class="piece flex" player="black" piece-name="pawn"><img src="./img/black-pawn.png"></div>`);
    // $('[x=6][y=2]').append(`<div class="piece flex" player="black" piece-name="bishop"><img src="./img/black-bishop.png"></div>`);


    // // $('[x=4][y=8]').append(`<div class="piece flex" player="white" piece-name="knight"><img src="./img/white-knight.png"></div>`);
    // $('[x=5][y=8]').append(`<div class="piece flex" player="white" piece-name="king"><img src="./img/white-king.png"></div>`);
    // $('[x=8][y=8]').append(`<div class="piece flex" player="white" piece-name="qeen"><img src="./img/white-qeen.png"></div>`);
    // $('[x=2][y=2]').append(`<div class="piece flex" player="white" piece-name="rook"><img src="./img/white-rook.png"></div>`);
    

    reset_setting();
    moves = [];
    $('.checkmate_popup').addClass('hide-n');
    $('.dead_piece.white').html('');
    $('.dead_piece.black').html('');
    $('.board').attr('now-playing', settings.now_playing);
    $('.play_info').each(function(){
        $(this).attr('player', settings.now_playing);
        $(this).removeAttr('winner');
    });

    $('.cell').click(cell_clicked);

}

function get_piece_html(piece_color, piece_name){
    return `<div class="piece flex" player="${piece_color}" piece-name="${piece_name}"><img src="./img/${piece_color}-${piece_name}.png"></div>`;
}

function reset_setting() {
    settings = {
        now_playing : 'white',
        winner : null,
        player : {
            white : { 
                check : false, 
                name : 'player 1',
                king_moved : false,
                rook_moved : false,
                can_castling : false
            },
            black : { 
                check : false, 
                name : 'player 2',
                king_moved : false,
                rook_moved : false,
                can_castling : false
            }
        }
    }
}

function cell_clicked(){
    let cell_pos = {
        x : parseInt($(this).attr('x')),
        y : parseInt($(this).attr('y'))
    }
    let piece_ele = $(this).find('.piece');
    let is_cell_empty = piece_ele.length == 0;
    let is_movable = $(this).find('.move_helper').length > 0;

    /* piece check */

    if( is_movable ) {
        // console.log('can move')
        let piece_name = $('.piece.selected').attr('piece-name');
        
        /* castling move - rook pos */
        let castling_done = false;
        if( settings.player[settings.now_playing].can_castling && piece_name == 'king' ) {
            if( settings.now_playing == 'white' && cell_pos.x == 3 && cell_pos.y == 1 ) {
                $('[x=1][y=1]').html('');
                $('[x=4][y=1]').html(get_piece_html(settings.now_playing, 'rook'));
                castling_done = true;
            }
            else if( settings.now_playing == 'black' && cell_pos.x == 3 && cell_pos.y == 8 ) {
                $('[x=1][y=8]').html('');
                $('[x=4][y=8]').html(get_piece_html(settings.now_playing, 'rook'));
                castling_done = true;
            }
        }
        /* castling move */

        console.log('kng mvd 1 - ', settings.player[settings.now_playing].king_moved)

        save_move( cell_pos, castling_done );

        console.log('kng mvd 2 - ', settings.player[settings.now_playing].king_moved)

        let destination_cell = $(`[x=${cell_pos.x}][y=${cell_pos.y}]`);
        destination_cell.find('.move_helper').remove();
        let destination_html = destination_cell.html();
        let source_cell = $('.piece.selected').parent();
        let source_html = source_cell.html();
        $('.piece.selected').remove();
        destination_cell.html(source_html);


        remove_piece_click();
        
        /* find current player check */
        if( find_for_check() ){
            /* got check for current position, reversing back the move */
            setTimeout(()=>{
                source_cell.html(source_html);
                destination_cell.html(destination_html);
                source_cell.find('.piece').removeClass('selected');
                if( !settings.player[settings.now_playing].check ) {
                    $(`[player=${settings.now_playing}][piece-name=king]`).removeAttr('check-detected')
                }
                if( castling_done && settings.now_playing == 'white' ) {
                    $('[x=1][y=1]').html(get_piece_html(settings.now_playing, 'rook'));
                    $('[x=4][y=1]').html('');
                }
                if( castling_done && settings.now_playing == 'black' ) {
                    $('[x=1][y=8]').html(get_piece_html(settings.now_playing, 'rook'));
                    $('[x=4][y=8]').html('');
                }
            }, 1000)
            popup_alert('<p>Cant move as you got a check</p><p>Please save the king</p>', 'warning');
            return
        }
        else {
            if( castling_done ) {
                settings.player[settings.now_playing].king_moved = true;
                settings.player[settings.now_playing].can_castling = false;
                popup_alert('Castling successful', 'success');
            }
            unmark_king_as_check();
            if( destination_html ) {
                $(`.dead_piece.${settings.now_playing}`).append(destination_html);
            }
        }

        /* check_pawn_reach_last_cell */
        // console.log(
        //     piece_ele.attr('piece-name'),
        //     (settings.now_playing == 'white' && cell_pos.y == 8),
        //     (settings.now_playing == 'black' && cell_pos.y == 1)
        // )
        if( $(this).find('.piece').attr('piece-name') == 'pawn' && 
            ( 
                (settings.now_playing == 'white' && cell_pos.y == 8) || 
                (settings.now_playing == 'black' && cell_pos.y == 1) )
            ) {
            init_pawn_replace(cell_pos);
        }

        /* find current player check */
        
        update_castling_data();

        /* switch next player */

        settings.now_playing = settings.now_playing == 'white' ? 'black' : 'white';
        $('.play_info').each(function(){
            $(this).attr('player', settings.now_playing);
        });
        $('.board').attr('now-playing', settings.now_playing);
        find_set_check_for_current_player();
        save_player_move_local();
        return
    }
    if( !is_cell_empty ) {
        let player = piece_ele.attr('player');
        if( settings.now_playing != player ) {
            return
        }
        let is_selected = piece_ele.hasClass('selected');

        remove_piece_click();
        if( !is_selected ) {
            piece_ele.addClass('selected');
            set_move_helper({
                cell_pos : cell_pos,
                piece_name : piece_ele.attr('piece-name'),
                player : player
            })
        }
        return
    }
}

function find_set_check_for_current_player(){
    if( find_for_check() ) {
        mark_king_as_check();
        settings.player[settings.now_playing].check = true;
        if( is_checkmate() ) {
            let winner_color = settings.now_playing == 'white' ? 'black' : 'white';
            popup_alert(`Checkmate..!! ${settings.player[winner_color].name} win`, 'success');
            end_game();
        }
    } else {
        settings.player[settings.now_playing].check = false;
    }
}

function init_pawn_replace({...cell_pos}){
    let html = '';
    html += get_piece_html(settings.now_playing, 'rook');
    html += get_piece_html(settings.now_playing, 'knight');
    html += get_piece_html(settings.now_playing, 'bishop');
    html += get_piece_html(settings.now_playing, 'qeen');
    $('.replace_piece_cont').html(html);
    $('.replace_piece_cont .piece').click(function(){
        $('.replace_piece_cont .piece').each(function(){
            $(this).removeClass('selected');
        })
        $(this).addClass('selected');
    })
    $('.pawn_replace_modal [name=pawn_pos]').val(JSON.stringify(cell_pos));
    $('.pawn_replace_modal').removeClass('hide-n');
}
function save_player_move_local(){
    localStorage.setItem('chess_lmv', JSON.stringify(create_piece_info_obj()));
}
function create_piece_info_obj(){
    let last_move = {
        ...settings,
        white : {
            check : settings.player.white.check,
            info : []
        },
        black : {
            check : settings.player.black.check,
            info : []
        }
    };
    $('.cell .piece').each(function(){
        let piece_info = {}
        let parent = $(this).parent();
        piece_info = {
            pos : {
                x : parseInt(parent.attr('x')),
                y : parseInt(parent.attr('y'))
            },
            name : $(this).attr('piece-name')
        }
        if( $(this).attr('player') == 'white' ) {
            last_move.white.info.push({...piece_info});
        } else {
            last_move.black.info.push({...piece_info});
        }
    });
    return last_move;
}
function arrange_board_from_last_move_local(){
    popup_alert('Game Restored', 'success');
    let last_move = localStorage.getItem('chess_lmv');
    if( !last_move ) {
        create_game();
        return;
    }
    clear_board();
    reset_setting();
    $('.play_info.small').removeAttr('winner');
    $('.play_info.big').removeAttr('winner');
    last_move = JSON.parse(last_move);
    last_move.white.info.forEach((info)=>{
        $(`[x=${info.pos.x}][y=${info.pos.y}]`).html(get_piece_html('white', info.name));
    });
    last_move.black.info.forEach((info)=>{
        $(`[x=${info.pos.x}][y=${info.pos.y}]`).html(get_piece_html('black', info.name));
    });
    settings.now_playing = last_move.now_playing;
    settings.player = {...last_move.player }
    // settings.player.white.name = last_move.player.white.name;
    // settings.player.black.name = last_move.player.black.name;

    $('.play_info.small').attr('player', settings.now_playing);
    $('.play_info.big').attr('player', settings.now_playing);
    $('.play_info').each(function(){
        $(this).attr('player', settings.now_playing);
        $(this).find('.player.white .name').text(last_move.player.white.name);
        $(this).find('.player.black .name').text(last_move.player.black.name);
    })
    $(`.play_info`).each(function(){
        $(this).removeAttr('winner');
    });
    $('.board').attr('now-playing', settings.now_playing);
    update_dead_piece();
    find_set_check_for_current_player();
}

function clear_board(){
    $('.cell').each(function(){
        $(this).html('');
    })
}

/* checkmate */

function is_checkmate(){
    let king_pos = {
        x : parseInt($(`[player=${settings.now_playing}][piece-name=king]`).parent().attr('x')),
        y : parseInt($(`[player=${settings.now_playing}][piece-name=king]`).parent().attr('y'))
    }
    let checker_info = null;
    // console.log('function find_for_check()', king_pos)

    function get_checker_info_from_cell_cord({...cell_pos}) {
        if( !is_valid_cell_cord(cell_pos) ) return;
        let piece_ele = $(`[x=${cell_pos.x}][y=${cell_pos.y}] .piece`);
        if( !piece_ele.length ) return;
        return {
            pos : cell_pos,
            color : piece_ele.attr('player'),
            name : piece_ele.attr('piece-name'),
        }
    }

    /* can checker be eliminated ? */

    /* top */
    let new_pos = {...king_pos}
    let check_found = -1;
    while (!checker_info && check_found == -1 &&  is_valid_cell_cord({x : new_pos.x, y : ++new_pos.y}) ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos);
    }
    if(check_found === true) {
        checker_info = get_checker_info_from_cell_cord({...new_pos});
    }
    /* bottom */
    new_pos = {...king_pos}
    check_found = -1;
    while (!checker_info && check_found == -1 &&  is_valid_cell_cord({x : new_pos.x, y : --new_pos.y}) ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos);
    }
    if(check_found === true) {
        checker_info = get_checker_info_from_cell_cord({...new_pos});
    }
    /* right */
    new_pos = {...king_pos}
    check_found = -1;
    while (!checker_info && check_found == -1 &&  is_valid_cell_cord({x : ++new_pos.x, y : new_pos.y}) ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos);
    }
    if(check_found === true) {
        checker_info = get_checker_info_from_cell_cord({...new_pos});
    }
    /* left */
    new_pos = {...king_pos}
    check_found = -1;
    while (!checker_info && check_found == -1 &&  is_valid_cell_cord({x : --new_pos.x, y : new_pos.y}) ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos);
    }
    if(check_found === true) {
        checker_info = get_checker_info_from_cell_cord({...new_pos});
    }
    /* top-right */
    new_pos = {...king_pos}
    check_found = -1;
    while (!checker_info && check_found == -1 && is_valid_cell_cord({x : ++new_pos.x, y : ++new_pos.y}) ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos);
    }
    if(check_found === true) {
        checker_info = get_checker_info_from_cell_cord({...new_pos});
    }
    /* top-left */
    new_pos = {...king_pos}
    check_found = -1;
    while (!checker_info && check_found == -1 && is_valid_cell_cord({x : --new_pos.x, y : ++new_pos.y}) ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos);
    }
    if(check_found === true) {
        checker_info = get_checker_info_from_cell_cord({...new_pos});
    }
    /* bottom-right */
    new_pos = {...king_pos}
    check_found = -1;
    while (!checker_info && check_found == -1 && is_valid_cell_cord({x : ++new_pos.x, y : --new_pos.y}) ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos);
    }
    if(check_found === true) {
        checker_info = get_checker_info_from_cell_cord({...new_pos});
    }
    /* bottom-left */
    new_pos = {...king_pos}
    check_found = -1;
    while (!checker_info && check_found == -1 && is_valid_cell_cord({x : --new_pos.x, y : --new_pos.y}) ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos);
    }
    if(check_found === true) {
        checker_info = get_checker_info_from_cell_cord({...new_pos});
    }

    /* for knight move check */

    /* top-right */
    if( !checker_info ) {
        new_pos = {...king_pos}
        new_pos.x++;
        new_pos.y += 2;
        if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
            checker_info = get_checker_info_from_cell_cord({...new_pos});
        }
    }
    /* top-left */
    if( !checker_info ) {
        new_pos = {...king_pos}
        new_pos.x--;
        new_pos.y += 2;
        if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
            checker_info = get_checker_info_from_cell_cord({...new_pos});
        }
    }
    /* bottom-right */
    if( !checker_info ) {
        new_pos = {...king_pos}
        new_pos.x++;
        new_pos.y -= 2;
        if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
            checker_info = get_checker_info_from_cell_cord({...new_pos});
        }
    }
    /* bottom-left */
    if( !checker_info ) {
        new_pos = {...king_pos}
        new_pos.x--;
        new_pos.y -= 2;
        if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
            checker_info = get_checker_info_from_cell_cord({...new_pos});
        }
    }
    /* right-top */
    if( !checker_info ) {
        new_pos = {...king_pos}
        new_pos.x += 2;
        new_pos.y++;
        if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
            checker_info = get_checker_info_from_cell_cord({...new_pos});
        }
    }
    /* right-bottom */
    if( !checker_info ) {
        new_pos = {...king_pos}
        new_pos.x += 2;
        new_pos.y--;
        if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
            checker_info = get_checker_info_from_cell_cord({...new_pos});
        }
    }
    /* left-top */
    if( !checker_info ) {
        new_pos = {...king_pos}
        new_pos.x -= 2;
        new_pos.y++;
        if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
            checker_info = get_checker_info_from_cell_cord({...new_pos});
        }
    }
    /* left-bottom */
    if( !checker_info ) {
        new_pos = {...king_pos}
        new_pos.x -= 2;
        new_pos.y--;
        if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
            checker_info = get_checker_info_from_cell_cord({...new_pos});
        }
    }

    /* for knight move check */
    // console.log('find checkmate', checker_info)


    let can_king_move_self = can_king_move({pos : king_pos})
    console.log('can_king_move_self', can_king_move_self)
    if( can_king_move_self ) return false;
    // let last_move = JSON.parse(localStorage.getItem('chess_lmv'));
    let last_move = create_piece_info_obj();
    let can_save_king = false;
    // console.log('last_move', last_move)

    /* finding if any other piece can eliminate the checker or can be placed betweenn checker and king ? */

    last_move[settings.now_playing].info.every((attacker_info) => {
        // console.log('loop find other attacks, attacker_info', attacker_info)
        let can_eliminate = can_attacker_eliminate_this_piece(attacker_info, checker_info)
        let can_place_between = can_place_piece_between_check_path(attacker_info, checker_info, king_pos)
        can_save_king = can_eliminate || can_place_between ? true : false;
        console.log('can_eliminate', can_eliminate)
        console.log('can_place_between', can_place_between)
        return !can_save_king;
    })
    console.log('can_save_king', can_save_king)
    return can_save_king ? false : true;
}
function can_king_move({...king_info}) {
    king_info.color = king_info.color || settings.now_playing;
    let possible_move = [
        {x : king_info.pos.x + 1, y : king_info.pos.y + 1},
        {x : king_info.pos.x - 1, y : king_info.pos.y + 1},
        {x : king_info.pos.x, y : king_info.pos.y + 1},
        {x : king_info.pos.x + 1, y : king_info.pos.y - 1},
        {x : king_info.pos.x - 1, y : king_info.pos.y - 1},
        {x : king_info.pos.x + 1, y : king_info.pos.y},
        {x : king_info.pos.x - 1, y : king_info.pos.y},
    ];
    // console.log(possible_move)
    let king_html = $(`[x=${king_info.pos.x}][y=${king_info.pos.y}]`).html();
    $(`[x=${king_info.pos.x}][y=${king_info.pos.y}]`).html('');
    let empty_cell_found = false;
    possible_move.every(({x, y}) => {
        // console.log(x,y)
        if( !is_valid_cell_cord({x, y}) ) return true;
        let piece_ele = $(`[x=${x}][y=${y}] .piece`)
            // console.log('find_for_check({x, y})', x, y, find_for_check({x, y}))
        if( (!piece_ele.length || piece_ele.attr('player') != king_info.color) && !find_for_check({x, y}) ) {
            /* ** need to find whether this cell already in check or not */
            // console.log('find_for_check({x, y})', x, y, find_for_check({x, y}))
            empty_cell_found = true;
            return false
        }
        return true;
    });
    $(`[x=${king_info.pos.x}][y=${king_info.pos.y}]`).html(king_html);
    return empty_cell_found;
}
function can_attacker_eliminate_this_piece({...attacker_info}, {...piece_info}){
    /* return true / false */

    // console.log('piece_info === ')
    // console.log(piece_info)
    // console.log('attacker_info ===')
    // console.log(attacker_info)

    // let {king_pos, piece_pos, piece_name, piece_color} = info;

    let king_pos = piece_info.pos
    let piece_pos = attacker_info.pos
    let piece_name = attacker_info.name
    let piece_color = settings.now_playing

    // console.log(king_pos, piece_pos, piece_name, piece_color)

    if( piece_name == 'pawn' ) {
        if( piece_color == 'white' ) {
            return ( (piece_pos.y + 1 == king_pos.y) && ( piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) ? true : false;
        }
        else {
            return ( (piece_pos.y - 1 == king_pos.y) && ( piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) ? true : false;
        }
    }
    else if( piece_name == 'rook' ) {
        return can_piece_attack_king_linear_move(piece_pos, king_pos);
    }
    else if( piece_name == 'knight' ) {
        // console.log('attack knight hit',  piece_pos.x + 1, king_pos.x)
        // console.log(  ((piece_pos.x + 1 == king_pos.x) || (piece_pos.x - 1 == king_pos.x)) )

        /* top =>>> */
        if( piece_pos.y + 2 == king_pos.y && (piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x) ) {
            return true;
        } /* bottom =>>> */
        else if( (piece_pos.y - 2 == king_pos.y) && ((piece_pos.x + 1 == king_pos.x) || (piece_pos.x - 1 == king_pos.x)) ) {
            return true;
        } /* right =>>> */
        else if( piece_pos.x + 2 == king_pos.x && (piece_pos.y + 1 == king_pos.y || piece_pos.y - 1 == king_pos.y) ) {
            return true;
        } /* left =>>> */
        else if( piece_pos.x - 2 == king_pos.x && (piece_pos.y + 1 == king_pos.y || piece_pos.y - 1 == king_pos.y) ) {
            return true;
        }
        return false;
    }
    else if( piece_name == 'bishop' ) {
        return can_piece_attack_king_diagonal_move(piece_pos, king_pos);
    }
    else if( piece_name == 'king' ) {

        return false; 
        // as king-can-move function determine this with better precision. 
        // (target cell can be attack by another oppenent piece or not)
        // below code not needed. have to remove after test.

        /* top 3 cell =>>> */
        if( piece_pos.y + 1 == king_pos.y && ( piece_pos.x == king_pos.x || piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) {
            return true;
        } /* bottom 3 cell =>>> */
        if( piece_pos.y - 1 == king_pos.y && ( piece_pos.x == king_pos.x || piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) {
            return true;
        } /* right and left cell =>>> */
        if( piece_pos.y == king_pos.y && (piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) {
            return true;
        }
        return false;
    }
    else if( piece_name == 'qeen' ) {
        if( can_piece_attack_king_linear_move(piece_pos, king_pos) ) {
            return true;
        } else if( can_piece_attack_king_diagonal_move(piece_pos, king_pos) ) {
            return true;
        } else {
            return false;
        }
    }
}
function can_piece_placed_linear({...piece_info}, {...checker_info}, {...king_pos}){
    let check_align = '';
    if( king_pos.y == checker_info.pos.y ) {
        check_align = 'horz';
        if( piece_info.pos.y == king_pos.y ) return false;
    } else if( king_pos.x == checker_info.pos.x ) {
        check_align = 'vert';
        if( piece_info.pos.x == king_pos.x ) return false;
    } else {
        check_align = 'diag';
    }
    let checker_pos_from_king = { x : '', y : '' };
    if( check_align == 'horz' ) {
        checker_pos_from_king.x = checker_info.pos.x > king_pos.x ? 'right' : 'left';
    } else if( check_align == 'vert' ) {
        checker_pos_from_king.y = checker_info.pos.y > king_pos.y ? 'top' : 'bottom';
    } else {
        checker_pos_from_king.x = checker_info.pos.x > king_pos.x ? 'right' : 'left';
        checker_pos_from_king.y = checker_info.pos.y > king_pos.y ? 'top' : 'bottom';
    }
    let piece_pos_from_king = { x : '', y : '' };
    if( piece_info.pos.x != king_pos.x ){
        piece_pos_from_king.x = piece_info.pos.x < king_pos.x ? 'left' : 'right'
    }
    if( piece_info.pos.y != king_pos.y ){
        piece_pos_from_king.y = piece_info.pos.y < king_pos.y ? 'top' : 'bottom'
    }
    if( check_align == 'vert' ){
        if( checker_pos_from_king.y == 'top' && (piece_pos_from_king.y != 'top' || piece_info.pos.y > checker_info.y) ) return false;
        if( checker_pos_from_king.y == 'bottom' && (piece_pos_from_king.y != 'bottom' || piece_info.pos.y < checker_info.y) ) return false;
        if( piece_pos_from_king.x == 'left' ) {
            for(let x = piece_info.pos.x; is_cell_empty({x, y : piece_info.pos.y}) && (x <= king_pos.x); x++){
                if( x == king_pos.x ) return true;
            }
        }
        else if( piece_pos_from_king.x == 'right' ) {
            for(let x = piece_info.pos.x; is_cell_empty({x, y : piece_info.pos.y}) && (x >= king_pos.x); x--){
                if( x == king_pos.x ) return true;
            }
        }
    }
    else if( check_align == 'horz' ){
        if( checker_pos_from_king.x == 'right' && (piece_pos_from_king.x != 'right' || piece_info.pos.x > checker_info.x) ) return false;
        if( checker_pos_from_king.x == 'left' && (piece_pos_from_king.x != 'left' || piece_info.pos.x < checker_info.x) ) return false;
        if( piece_pos_from_king.y == 'bottom' ) {
            for(let y = piece_info.pos.y; is_cell_empty({x : piece_info.pos.x, y}) && (y <= king_pos.y); y++){
                if( y == king_pos.y ) return true;
            }
        }
        else if( piece_pos_from_king.y == 'top' ) {
            for(let x = piece_info.pos.x; is_cell_empty({x, y : piece_info.pos.y}) && (x >= king_pos.x); x--){
                if( x == king_pos.x ) return true;
            }
        }
    }
    return false;
}
function can_piece_placed_diagonal({...piece_info}, {...checker_info}, {...king_pos}){    
    let new_pos = {};
    let possible_move = [];

    /* top-right */
    new_pos = {...piece_info.pos}
    while ( is_valid_cell_cord({x : ++new_pos.x, y : ++new_pos.y}) && is_cell_empty(new_pos) ) {
        possible_move.push({...new_pos})
    }
    /* top-left */
    new_pos = {...piece_info.pos}
    while ( is_valid_cell_cord({x : --new_pos.x, y : ++new_pos.y}) && is_cell_empty(new_pos) ) {
        possible_move.push({...new_pos})
    }
    /* bottom-right */
    new_pos = {...piece_info.pos}
    while ( is_valid_cell_cord({x : ++new_pos.x, y : --new_pos.y}) && is_cell_empty(new_pos) ) {
        possible_move.push({...new_pos})
    }
    /* bottom-left */
    new_pos = {...piece_info.pos}
    while ( is_valid_cell_cord({x : --new_pos.x, y : --new_pos.y}) && is_cell_empty(new_pos) ) {
        possible_move.push({...new_pos})
    }
    return can_piece_placed_from_possible_move(piece_info, checker_info, king_pos, possible_move)
}
function can_piece_placed_from_possible_move({...piece_info}, {...checker_info}, {...king_pos}, [...possible_move]){
    // console.log('can_piece_placed_from_possible_move - possible_move - ', possible_move)
    // console.log('piece_info', piece_info)
    if( Math.abs(checker_info.pos.x - king_pos.x) == 1 || Math.abs(checker_info.pos.y - king_pos.y) == 1 ) {
        return false;
    }
    let check_align = '';
    if( king_pos.y == checker_info.pos.y ) {
        check_align = 'horz';
        if( piece_info.pos.y == king_pos.y ) return false;
    } else if( king_pos.x == checker_info.pos.x ) {
        check_align = 'vert';
        if( piece_info.pos.x == king_pos.x ) return false;
    } else {
        check_align = 'diag';
    }
    let checker_pos_from_king = { x : '', y : '' };
    if( check_align == 'horz' ) {
        checker_pos_from_king.x = checker_info.pos.x > king_pos.x ? 'right' : 'left';
    } else if( check_align == 'vert' ) {
        checker_pos_from_king.y = checker_info.pos.y > king_pos.y ? 'top' : 'bottom';
    } else {
        checker_pos_from_king.x = checker_info.pos.x > king_pos.x ? 'right' : 'left';
        checker_pos_from_king.y = checker_info.pos.y > king_pos.y ? 'top' : 'bottom';
    }
    if( check_align == 'horz' ){
        if( checker_pos_from_king.x == 'right' ) {
            for(let x = king_pos.x + 1; x < checker_info.pos.x; x++) {
                if( possible_move.find((pos) => pos.x == x && pos.y == king_pos.y) ) return true;
            }
        }
        else if( checker_pos_from_king.x == 'left' ) {
            for(let x = king_pos.x - 1; x > checker_info.pos.x; x--) {
                if( possible_move.find((pos) => pos.x == x && pos.y == king_pos.y) ) return true;
            }
        }
    }
    else if( check_align == 'vert' ) {
        if( checker_pos_from_king.y == 'top' ) {
            for(let y = king_pos.y + 1; y < checker_info.pos.y; y++) {
                if( possible_move.find((pos) => pos.x == king_pos.x && pos.y == y) ) return true;
            }
        }
        else if( checker_pos_from_king.y == 'bottom' ) {
            for(let y = king_pos.y - 1; y > checker_info.pos.y; y--) {
                if( possible_move.find((pos) => pos.x == king_pos.x && pos.y == y) ) return true;
            }
        }
    }
    else if( check_align == 'diag' ) {
        let new_pos = {...king_pos};
        if( checker_pos_from_king.y == 'top' ) {
            if( checker_pos_from_king.x == 'right' ) {
                for( new_pos.x++, new_pos.y++; new_pos.y < checker_info.pos.y; new_pos.x++, new_pos.y++ ) {
                    if( possible_move.find((pos) => pos.x == new_pos.x && pos.y == new_pos.y) ) return true;
                }
            }
            else if( checker_pos_from_king.x == 'left' ) {
                for( new_pos.x--, new_pos.y++; new_pos.y < checker_info.pos.y; new_pos.x--, new_pos.y++ ) {
                    if( possible_move.find((pos) => pos.x == new_pos.x && pos.y == new_pos.y) ) return true;
                }
            }
        }
        else if( checker_pos_from_king.y == 'bottom' ) {
            if( checker_pos_from_king.x == 'right' ) {
                for( new_pos.x++, new_pos.y--; new_pos.y > checker_info.pos.y; new_pos.x++, new_pos.y-- ) {
                    if( possible_move.find((pos) => pos.x == new_pos.x && pos.y == new_pos.y) ) return true;
                }
            }
            else if( checker_pos_from_king.x == 'left' ) {
                for( new_pos.x--, new_pos.y--; new_pos.y > checker_info.pos.y; new_pos.x--, new_pos.y-- ) {
                    if( possible_move.find((pos) => pos.x == new_pos.x && pos.y == new_pos.y) ) return true;
                }
            }
        }
    }
    return false;
}
function can_place_piece_between_check_path({...piece_info}, {...checker_info}, {...king_pos}) {
    if( piece_info.name == 'king' || checker_info.name == 'knight' ) return false;

    // if king and checker are in connected cell, no piece can be placed between them :--
    
    if( Math.abs(checker_info.pos.x - king_pos.x) == 1 || Math.abs(checker_info.pos.y - king_pos.y) == 1 ) {
        return false;
    }

    let check_align = '';
    if( king_pos.y == checker_info.pos.y ) {
        check_align = 'horz';
        if( piece_info.pos.y == king_pos.y ) return false;
    } else if( king_pos.x == checker_info.pos.x ) {
        check_align = 'vert';
        if( piece_info.pos.x == king_pos.x ) return false;
    } else {
        check_align = 'diag';
    }

    console.log('can_place_piece_between_check_path ====')
    console.log('piece_info', piece_info)
    console.log('checker_info', checker_info)
    console.log('king_pos', king_pos)

    piece_info.color = piece_info.color ? piece_info.color : settings.now_playing;
    let checker_pos_from_king = { x : '', y : '' };
    if( check_align == 'horz' ) {
        checker_pos_from_king.x = checker_info.pos.x > king_pos.x ? 'right' : 'left';
    } else if( check_align == 'vert' ) {
        checker_pos_from_king.y = checker_info.pos.y > king_pos.y ? 'top' : 'bottom';
    } else {
        checker_pos_from_king.x = checker_info.pos.x > king_pos.x ? 'right' : 'left';
        checker_pos_from_king.y = checker_info.pos.y > king_pos.y ? 'top' : 'bottom';
    }
    let piece_pos_from_king = { x : '', y : '' };
    if( piece_info.pos.x != king_pos.x ){
        piece_pos_from_king.x = piece_info.pos.x < king_pos.x ? 'left' : 'right'
    }
    if( piece_info.pos.y != king_pos.y ){
        piece_pos_from_king.y = piece_info.pos.y < king_pos.y ? 'top' : 'bottom'
    }

    // console.log('checker_pos_from_king == ', `${checker_pos_from_king.x}-${checker_pos_from_king.y}`)
    // console.log('piece_pos_from_king == ', `${piece_pos_from_king.x}-${piece_pos_from_king.y}`)

    if( piece_info.name == 'pawn' ) {
        if( check_align == 'horz' ) {
            if( piece_info.color == 'white' && piece_info.pos.y + 1 != king_pos.y )  return false;
            if( piece_info.color == 'black' && piece_info.pos.y - 1 != king_pos.y )  return false;
            return ( (piece_info.pos.x > king_pos.x && piece_info.pos.x < checker_info.pos.x ) || 
                     (piece_info.pos.x < king_pos.x && piece_info.pos.x > checker_info.pos.x )
                    ) ? true : false;
        }
        else if( check_align == 'diag' ) {
            piece_info.pos.y = piece_info.color == 'white' ? ++piece_info.pos.y : --piece_info.pos.y;
            if( `${checker_pos_from_king.x}-${checker_pos_from_king.y}` == 'right-top' ) {
                for(let x = king_pos.x, y = king_pos.y; x < checker_info.pos.x; x++, y++ ) {
                    if( !is_cell_empty({x, y}) ) return false;
                    if( x == piece_info.pos.x && y == piece_info.pos.y ) return true;
                }
            }
            else if( `${checker_pos_from_king.x}-${checker_pos_from_king.y}` == 'right-bottom' ) {
                for(let x = king_pos.x, y = king_pos.y; x < checker_info.pos.x; x++, y-- ) {
                    if( !is_cell_empty({x, y}) ) return false;
                    if( x == piece_info.pos.x && y == piece_info.pos.y ) return true;
                }
            }
            else if( `${checker_pos_from_king.x}-${checker_pos_from_king.y}` == 'left-top' ) {
                for(let x = king_pos.x, y = king_pos.y; x < checker_info.pos.x; x--, y++ ) {
                    if( !is_cell_empty({x, y}) ) return false;
                    if( x == piece_info.pos.x && y == piece_info.pos.y ) return true;
                }
            }
            else if( `${checker_pos_from_king.x}-${checker_pos_from_king.y}` == 'left-bottom' ) {
                for(let x = king_pos.x, y = king_pos.y; x < checker_info.pos.x; x--, y-- ) {
                    if( !is_cell_empty({x, y}) ) return false;
                    if( x == piece_info.pos.x && y == piece_info.pos.y ) return true;
                }
            }
        }
        return false;
    }
    else if( piece_info.name == 'rook') {
        return can_piece_placed_linear(piece_info, checker_info, king_pos);
        // return can_piece_attack_king_linear_move(piece_info.pos, king_pos);
    }
    else if( piece_info.name == 'knight' ) {
        // console.log('attack knight hit',  piece_info.pos.x + 1, king_pos.x)
        // console.log(  ((piece_info.pos.x + 1 == king_pos.x) || (piece_info.pos.x - 1 == king_pos.x)) )
        // if( check_align == 'horz' ) {

        // }

        let possible_move = [
            { x : piece_info.pos.x + 1, y : piece_info.pos.y + 2 },
            { x : piece_info.pos.x - 1, y : piece_info.pos.y + 2 },
            { x : piece_info.pos.x + 1, y : piece_info.pos.y - 2 },
            { x : piece_info.pos.x - 1, y : piece_info.pos.y - 2 },
            { x : piece_info.pos.x + 2, y : piece_info.pos.y + 1 },
            { x : piece_info.pos.x + 2, y : piece_info.pos.y - 1 },
            { x : piece_info.pos.x - 2, y : piece_info.pos.y + 1 },
            { x : piece_info.pos.x - 2, y : piece_info.pos.y - 1 }
        ];

        // console.log('knite moves', possible_move)
        // console.log('--checker_pos_from_king--', checker_pos_from_king)

        return can_piece_placed_from_possible_move(piece_info, checker_info, king_pos, possible_move);

        // /* top =>>> */
        // if( piece_info.pos.y + 2 == king_pos.y && 
        //     (piece_info.pos.x + 1 == king_pos.x || piece_info.pos.x - 1 == king_pos.x) ) {
        //     return true;
        // } /* bottom =>>> */
        // else if( (piece_info.pos.y - 2 == king_pos.y) && ((piece_info.pos.x + 1 == king_pos.x) || (piece_info.pos.x - 1 == king_pos.x)) ) {
        //     return true;
        // } /* right =>>> */
        // else if( piece_info.pos.x + 2 == king_pos.x && (piece_info.pos.y + 1 == king_pos.y || piece_info.pos.y - 1 == king_pos.y) ) {
        //     return true;
        // } /* left =>>> */
        // else if( piece_info.pos.x - 2 == king_pos.x && (piece_info.pos.y + 1 == king_pos.y || piece_info.pos.y - 1 == king_pos.y) ) {
        //     return true;
        // }
        // return false;
    }
    else if( piece_info.name == 'bishop' ) {
        return can_piece_placed_diagonal(piece_info, checker_info, king_pos);
    }
    else if( piece_info.name == 'qeen' ) {
        if( can_piece_placed_linear(piece_info, checker_info, king_pos) ) {
            return can_piece_placed_diagonal(piece_info, checker_info, king_pos);
        }
    }
    return false;
}

function is_cell_empty({...cell_pos}) {
    return $(`[x=${cell_pos.x}][y=${cell_pos.y}] .piece`).length == 0;
}

/* checkmate */

function find_for_check(psudo_king_pos = null){
    let king_pos = {}
    if( psudo_king_pos ) {
        king_pos = {...psudo_king_pos}
    } else {
        king_pos = {
            x : parseInt($(`[player=${settings.now_playing}][piece-name=king]`).parent().attr('x')),
            y : parseInt($(`[player=${settings.now_playing}][piece-name=king]`).parent().attr('y'))
        }
    }
    // console.log('function find_for_check()', king_pos)
    
    /* top */

    let new_pos = {...king_pos}
    let check_found = -1;
    while ( is_valid_cell_cord({x : new_pos.x, y : ++new_pos.y}) && check_found == -1 ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos)
    }
    if( check_found === true ) {
        return true;
    }

    /* bottom */

    new_pos = {...king_pos}
    check_found = -1;
    while ( is_valid_cell_cord({x : new_pos.x, y : --new_pos.y}) && check_found == -1 ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos)
    }
    if( check_found === true ) {
        return true;
    }

    /* right */

    new_pos = {...king_pos}
    check_found = -1;
    while ( is_valid_cell_cord({x : ++new_pos.x, y : new_pos.y}) && check_found == -1 ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos)
    }
    if( check_found === true ) {
        return true;
    }

    /* left */

    new_pos = {...king_pos}
    check_found = -1;
    while ( is_valid_cell_cord({x : --new_pos.x, y : new_pos.y}) && check_found == -1 ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos)
    }
    if( check_found === true ) {
        return true;
    }

    /* top-right */

    new_pos = {...king_pos}
    check_found = -1;
    while ( is_valid_cell_cord({x : ++new_pos.x, y : ++new_pos.y}) && check_found == -1 ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos)
    }
    if( check_found === true ) {
        return true;
    }

    /* top-left */

    new_pos = {...king_pos}
    check_found = -1;
    while ( is_valid_cell_cord({x : --new_pos.x, y : ++new_pos.y}) && check_found == -1 ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos)
    }
    if( check_found === true ) {
        return true;
    }

    /* bottom-right */

    new_pos = {...king_pos}
    check_found = -1;
    while ( is_valid_cell_cord({x : ++new_pos.x, y : --new_pos.y}) && check_found == -1 ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos)
    }
    if( check_found === true ) {
        return true;
    }

    /* bottom-left */

    new_pos = {...king_pos}
    check_found = -1;
    while ( is_valid_cell_cord({x : --new_pos.x, y : --new_pos.y}) && check_found == -1 ) {
        check_found = get_opponent_piece_info_king_check(new_pos, king_pos)
    }
    if( check_found === true ) {
        return true;
    }

    /* --- for knight move check --- */

    /* top-right */
    new_pos = {...king_pos}
    new_pos.x++;
    new_pos.y += 2;
    if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
        return true;
    }
    /* top-left */
    new_pos = {...king_pos}
    new_pos.x--;
    new_pos.y += 2;
    if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
        return true;
    }
    /* bottom-right */
    new_pos = {...king_pos}
    new_pos.x++;
    new_pos.y -= 2;
    if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
        return true;
    }
    /* bottom-left */
    new_pos = {...king_pos}
    new_pos.x--;
    new_pos.y -= 2;
    if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
        return true;
    }
    /* right-top */
    new_pos = {...king_pos}
    new_pos.x += 2;
    new_pos.y++;
    if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
        return true;
    }
    /* right-bottom */
    new_pos = {...king_pos}
    new_pos.x += 2;
    new_pos.y--;
    if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
        return true;
    }
    /* left-top */
    new_pos = {...king_pos}
    new_pos.x -= 2;
    new_pos.y++;
    if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
        return true;
    }
    /* left-bottom */
    new_pos = {...king_pos}
    new_pos.x -= 2;
    new_pos.y--;
    if( is_valid_cell_cord(new_pos) && get_opponent_piece_info_king_check(new_pos, king_pos) === true) {
        return true;
    }

    /* ---for knight move check--- */

    return false;
}
function get_opponent_piece_info_king_check({...new_pos}, {...king_pos}){
    let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    let piece_name = $(`[x=${new_pos.x}][y=${new_pos.y}] .piece`).attr('piece-name');
    if( piece_name == 'knight' && player == 'white' ) {
        // console.log({
        //     king_pos,
        //     piece_pos : new_pos,
        //     piece_name,
        //     piece_color : player
        // });
        // console.log('now_playing', 'white')
    }
    if( player == settings.now_playing ) {
        return false;
    }
    if( player != false && player != settings.now_playing ) {
        // let piece_name = $(`[x=${new_pos.x}][y=${new_pos.y}] .piece`).attr('piece-name');
        // console.log('checking king attack', {
        //     king_pos,
        //     piece_pos : new_pos,
        //     piece_name,
        //     piece_color : player
        // })
        let can_attack_king = can_piece_attack_king({
            king_pos,
            piece_pos : new_pos,
            piece_name,
            piece_color : player
        })
        // console.log('can_attack_king', can_attack_king)
        return can_attack_king;
    }
    return -1;
}

function can_piece_attack_king({...info}) {
    let {king_pos, piece_pos, piece_name, piece_color} = info;
    if( piece_name == 'pawn' ) {
        if( piece_color == 'white' ) {
            return ( (piece_pos.y + 1 == king_pos.y) && ( piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) ? true : false;
        }
        else {
            return ( (piece_pos.y - 1 == king_pos.y) && ( piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) ? true : false;
        }
    }
    else if( piece_name == 'rook' ) {
        return can_piece_attack_king_linear_move(piece_pos, king_pos);
    }
    else if( piece_name == 'knight' ) {
        // console.log('attack knight hit',  piece_pos.y - 2, piece_pos.x - 1)
        // console.log((piece_pos.y - 2 == king_pos.y) && ((piece_pos.x + 1 == king_pos.x) || (piece_pos.x - 1 == king_pos.x)))

        /* top =>>> */
        if( piece_pos.y + 2 == king_pos.y && (piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x) ) {
            return true;
        } /* bottom =>>> */
        else if( (piece_pos.y - 2 == king_pos.y) && ((piece_pos.x + 1 == king_pos.x) || (piece_pos.x - 1 == king_pos.x)) ) {
            return true;
        } /* right =>>> */
        else if( piece_pos.x + 2 == king_pos.x && (piece_pos.y + 1 == king_pos.y || piece_pos.y - 1 == king_pos.y) ) {
            return true;
        } /* left =>>> */
        else if( piece_pos.x - 2 == king_pos.x && (piece_pos.y + 1 == king_pos.y || piece_pos.y - 1 == king_pos.y) ) {
            return true;
        }
        return false;
    }
    else if( piece_name == 'bishop' ) {
        return can_piece_attack_king_diagonal_move(piece_pos, king_pos);
    }
    else if( piece_name == 'king' ) {
        /* top 3 cell =>>> */
        if( piece_pos.y + 1 == king_pos.y && ( piece_pos.x == king_pos.x || piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) {
            return true;
        } /* bottom 3 cell =>>> */
        if( piece_pos.y - 1 == king_pos.y && ( piece_pos.x == king_pos.x || piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) {
            return true;
        } /* right and left cell =>>> */
        if( piece_pos.y == king_pos.y && (piece_pos.x + 1 == king_pos.x || piece_pos.x - 1 == king_pos.x ) ) {
            return true;
        }
        return false;
    }
    else if( piece_name == 'qeen' ) {
        if( can_piece_attack_king_linear_move(piece_pos, king_pos) ) {
            return true;
        } else if( can_piece_attack_king_diagonal_move(piece_pos, king_pos) ) {
            return true;
        } else {
            return false;
        }
    }
}


function can_piece_attack_king_linear_move({...piece_pos}, {...king_pos}){
    // console.log(piece_pos, king_pos)
    let new_pos = {};
    /* top */
    new_pos = {...piece_pos}
    for( new_pos.y++; new_pos.x == king_pos.x && new_pos.y <= king_pos.y; new_pos.y++ ){
        if( new_pos.y != king_pos.y && !is_cell_empty(new_pos) ) return false;
        if( new_pos.y == king_pos.y ) return true;
    }
    /* bottom */
    new_pos = {...piece_pos}
    for( new_pos.y--; new_pos.x == king_pos.x && new_pos.y >= king_pos.y; new_pos.y-- ){
        if( new_pos.y != king_pos.y && !is_cell_empty(new_pos) ) return false;
        if( new_pos.y == king_pos.y ) return true;
    }
    /* right */
    new_pos = {...piece_pos}
    for( new_pos.x++; new_pos.y == king_pos.y && new_pos.x <= king_pos.x; new_pos.x++ ){
        if( new_pos.x != king_pos.x && !is_cell_empty(new_pos) ) return false;
        if( new_pos.x == king_pos.x ) return true;
    }
    /* left */
    new_pos = {...piece_pos}
    for( new_pos.x--; new_pos.y == king_pos.y && new_pos.x >= king_pos.x; new_pos.x-- ){
        if( new_pos.x != king_pos.x && !is_cell_empty(new_pos) ) return false;
        if( new_pos.x == king_pos.x ) return true;
    }
    return false;
}
function can_piece_attack_king_diagonal_move({...piece_pos}, {...king_pos}){
    /* top-right */
    new_pos = {...piece_pos}
    for(new_pos.x++, new_pos.y++; new_pos.x <= king_pos.x && new_pos.y <= king_pos.y; new_pos.x++, new_pos.y++ ){
        if( new_pos.x != king_pos.x && new_pos.y != king_pos.y && !is_cell_empty(new_pos) ) return false;
        if( new_pos.x == king_pos.x && new_pos.y == king_pos.y ) return true;
    }
    /* bottom-right */
    new_pos = {...piece_pos}
    for(new_pos.x++, new_pos.y--; new_pos.x <= king_pos.x && new_pos.y >= king_pos.y; new_pos.x++, new_pos.y-- ){
        if( new_pos.x != king_pos.x && new_pos.y != king_pos.y && !is_cell_empty(new_pos) ) return false;
        if( new_pos.x == king_pos.x && new_pos.y == king_pos.y ) return true;
    }
    /* bottom-left */
    new_pos = {...piece_pos}
    for( new_pos.x--, new_pos.y--; new_pos.x >= king_pos.x && new_pos.y >= king_pos.y; new_pos.x--, new_pos.y-- ){
        if( new_pos.x != king_pos.x && new_pos.y != king_pos.y && !is_cell_empty(new_pos) ) return false;
        if( new_pos.x == king_pos.x && new_pos.y == king_pos.y ) return true;
    }
    /* top-left */
    new_pos = {...piece_pos}
    for( new_pos.x--, new_pos.y++; new_pos.x >= king_pos.x && new_pos.y <= king_pos.y; new_pos.x--, new_pos.y++ ){
        if( new_pos.x != king_pos.x && new_pos.y != king_pos.y && !is_cell_empty(new_pos) ) return false;
        if( new_pos.x == king_pos.x && new_pos.y == king_pos.y ) return true;
    }
    return false;
}
function mark_king_as_check() {
    popup_alert('check found', 'warning');
    $(`.piece[player=${settings.now_playing}][piece-name=king]`).attr('check-detected', 'true');
}
function unmark_king_as_check() {
    $(`.piece[player=${settings.now_playing}][piece-name=king]`).removeAttr('check-detected');
}



/* move helper */

function set_move_helper({ cell_pos, piece_name, player }) {
    if( !cell_pos || !piece_name || !player ) return;
    if( piece_name == 'pawn' ) {
        player == 'white' ? set_move_helper_white_pawn(cell_pos) : set_move_helper_black_pawn(cell_pos);
    }
    else if( piece_name == 'rook' ) {
        set_move_helper_rook(cell_pos);
    }
    else if( piece_name == 'knight' ) {
        set_move_helper_knight(cell_pos);
    }
    else if( piece_name == 'bishop' ) {
        set_move_helper_bishop(cell_pos);
    }
    else if( piece_name == 'qeen' ) {
        set_move_helper_qeen(cell_pos);
    }
    else if( piece_name == 'king' ) {
        set_move_helper_king(cell_pos);
    }
}

function set_move_helper_black_pawn({...cell_pos}) {
    if( !cell_pos.x || !cell_pos.y ) return;
    let new_pos = {...cell_pos}
    let movable_pos_arr = []
    let this_cell_player = '';
    if( cell_pos.y == 7 ){
        let obstracle_found = false;
        for( let i = 0; i < 2; i++ ) {
            new_pos.y--;
            if( !obstracle_found && get_player_color_by_cell_cord(new_pos.x, new_pos.y) ){
                obstracle_found = true;
            }
            if( !obstracle_found ) {
                movable_pos_arr.push({...new_pos});
                // console.log('push', new_pos, obstracle_found, movable_pos_arr)
            }
            if( i == 0 ) {
                /* check corner opponent */
                let this_player = get_player_color_by_cell_cord(new_pos.x + 1, new_pos.y);
                if( this_player && this_player != settings.now_playing ){
                    movable_pos_arr.push({x : new_pos.x + 1, y : new_pos.y});
                }
                this_player = get_player_color_by_cell_cord(new_pos.x - 1, new_pos.y);
                if( this_player && this_player != settings.now_playing ){
                    movable_pos_arr.push({x : new_pos.x - 1, y : new_pos.y});
                }
                /* check corner opponent */
            }
        }
    }
    else {
        new_pos.y--;
        if( new_pos.y < 1 ) return;
        if( !get_player_color_by_cell_cord(new_pos.x, new_pos.y) ){
            movable_pos_arr.push({...new_pos});
        }

        /* check corner opponent */
        let this_player = get_player_color_by_cell_cord(new_pos.x + 1, new_pos.y);
        if( this_player && this_player != settings.now_playing ){
            movable_pos_arr.push({x : new_pos.x + 1, y : new_pos.y});
        }
        this_player = get_player_color_by_cell_cord(new_pos.x - 1, new_pos.y);
        if( this_player && this_player != settings.now_playing ){
            movable_pos_arr.push({x : new_pos.x - 1, y : new_pos.y});
        }
        /* check corner opponent */
    }
    movable_pos_arr.forEach((pos) => {
        $(`[x=${pos.x}][y=${pos.y}]`).append(get_move_helper_html());
    })
}
function set_move_helper_white_pawn({...cell_pos}) {
    if( !cell_pos.x || !cell_pos.y ) return;
    let new_pos = {...cell_pos}
    let movable_pos_arr = []
    let this_cell_player = '';
    if( cell_pos.y == 2 ){
        let obstracle_found = false;
        for( let i = 0; i < 2; i++ ) {
            new_pos.y++;
            if( !obstracle_found && get_player_color_by_cell_cord(new_pos.x, new_pos.y) ){
                obstracle_found = true;
            }
            if( !obstracle_found ) {
                movable_pos_arr.push({...new_pos});
                // console.log('push', new_pos, obstracle_found, movable_pos_arr)
            }
            if( i == 0 ) {
                /* check corner opponent */
                let this_player = get_player_color_by_cell_cord(new_pos.x + 1, new_pos.y);
                if( this_player && this_player != settings.now_playing ){
                    movable_pos_arr.push({x : new_pos.x + 1, y : new_pos.y});
                }
                this_player = get_player_color_by_cell_cord(new_pos.x - 1, new_pos.y);
                if( this_player && this_player != settings.now_playing ){
                    movable_pos_arr.push({x : new_pos.x - 1, y : new_pos.y});
                }
                /* check corner opponent */
            }
        }
    }
    else {
        new_pos.y++
        if( new_pos.y > 8 ) return;
        if( !get_player_color_by_cell_cord(new_pos.x, new_pos.y) ) {
            movable_pos_arr.push(new_pos);
        }
        /* check corner opponent */
        let this_player = get_player_color_by_cell_cord(new_pos.x + 1, new_pos.y);
        // console.log(this_player)
        if( this_player && this_player != settings.now_playing ){
            movable_pos_arr.push({x : new_pos.x + 1, y : new_pos.y});
        }
        this_player = get_player_color_by_cell_cord(new_pos.x - 1, new_pos.y);
        // console.log(this_player, ' - 2')
        if( this_player && this_player != settings.now_playing ){
            movable_pos_arr.push({x : new_pos.x - 1, y : new_pos.y});
        }
        /* check corner opponent */
    }
    movable_pos_arr.forEach((pos) => {
        $(`[x=${pos.x}][y=${pos.y}]`).append(get_move_helper_html());
    });
}

function set_move_helper_rook({...cell_pos}) {
    set_move_helper_linear_move(cell_pos);
}

function set_move_helper_knight({...cell_pos}) {
    let movable_pos_arr = [];
    let new_pos = {...cell_pos}

    /* top move */

    new_pos.y += 2;
    new_pos.x++;
    if( is_valid_cell_cord(new_pos) && get_player_color_by_cell_cord(new_pos.x, new_pos.y) != settings.now_playing ) {
        movable_pos_arr.push({...new_pos})
    }
    new_pos.x -= 2;
    if( is_valid_cell_cord(new_pos) && get_player_color_by_cell_cord(new_pos.x, new_pos.y) != settings.now_playing ) {
        movable_pos_arr.push({...new_pos})
    }

    /* right move */

    new_pos = {...cell_pos}
    new_pos.x += 2;
    new_pos.y++;
    if( is_valid_cell_cord(new_pos) && get_player_color_by_cell_cord(new_pos.x, new_pos.y) != settings.now_playing ) {
        movable_pos_arr.push({...new_pos})
    }
    new_pos.y -= 2;
    if( is_valid_cell_cord(new_pos) && get_player_color_by_cell_cord(new_pos.x, new_pos.y) != settings.now_playing ) {
        movable_pos_arr.push({...new_pos})
    }

    /* bottom move */

    new_pos = {...cell_pos}
    new_pos.y -= 2;
    new_pos.x++;
    if( is_valid_cell_cord(new_pos) && get_player_color_by_cell_cord(new_pos.x, new_pos.y) != settings.now_playing ) {
        movable_pos_arr.push({...new_pos})
    }
    new_pos.x -= 2;
    if( is_valid_cell_cord(new_pos) && get_player_color_by_cell_cord(new_pos.x, new_pos.y) != settings.now_playing ) {
        movable_pos_arr.push({...new_pos})
    }

    /* left move */
    
    new_pos = {...cell_pos}
    new_pos.x -= 2;
    new_pos.y++;
    if( is_valid_cell_cord(new_pos) && get_player_color_by_cell_cord(new_pos.x, new_pos.y) != settings.now_playing ) {
        movable_pos_arr.push({...new_pos})
    }
    new_pos.y -= 2;
    if( is_valid_cell_cord(new_pos) && get_player_color_by_cell_cord(new_pos.x, new_pos.y) != settings.now_playing ) {
        movable_pos_arr.push({...new_pos})
    }

    movable_pos_arr.forEach((pos) => {
        $(`[x=${pos.x}][y=${pos.y}]`).append(get_move_helper_html());
    })
}

function set_move_helper_bishop({...cell_pos}) {
    set_move_helper_diagonal_move(cell_pos);
}

function set_move_helper_qeen({...cell_pos}) {
    set_move_helper_linear_move(cell_pos);
    set_move_helper_diagonal_move(cell_pos);
}

function set_move_helper_king({...cell_pos}) {
    let movable_pos_arr = [];

    /* top */
    check_and_insert_move_helper({x : cell_pos.x, y : cell_pos.y + 1})
    /* right */
    check_and_insert_move_helper({x : cell_pos.x + 1, y : cell_pos.y})
    /* bottom */
    check_and_insert_move_helper({x : cell_pos.x, y : cell_pos.y - 1})
    /* left */
    check_and_insert_move_helper({x : cell_pos.x - 1, y : cell_pos.y})
    /* top-right */
    check_and_insert_move_helper({x : cell_pos.x + 1, y : cell_pos.y + 1})
    /* bottom-right */
    check_and_insert_move_helper({x : cell_pos.x + 1, y : cell_pos.y - 1})
    /* bottom-left */
    check_and_insert_move_helper({x : cell_pos.x - 1, y : cell_pos.y - 1})
    /* top-left */
    check_and_insert_move_helper({x : cell_pos.x - 1, y : cell_pos.y + 1})

    // console.log( 'can_castling', settings.player[settings.now_playing].can_castling )
    if( settings.player[settings.now_playing].can_castling ) {
        check_and_insert_move_helper({x : cell_pos.x - 2, y : cell_pos.y});
    }

    // movable_pos_arr.forEach((pos) => {
    //     $(`[x=${pos.x}][y=${pos.y}]`).append(get_move_helper_html());
    // })

}

function check_and_insert_move_helper({...new_pos}){
    let obstracle_found = false;
    if( !is_valid_cell_cord(new_pos) ) return true;
    let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    if( player == false ) {
        $(`[x=${new_pos.x}][y=${new_pos.y}]`).append(get_move_helper_html());
    } else if( player == settings.now_playing ) {
        obstracle_found = true;
    } else {
        obstracle_found = true;
        $(`[x=${new_pos.x}][y=${new_pos.y}]`).append(get_move_helper_html());
    }
    return obstracle_found;
}

function set_move_helper_linear_move({...cell_pos}) {
    let new_pos = {...cell_pos}
    while( !check_and_insert_move_helper({x : new_pos.x, y : ++new_pos.y}) );
    new_pos = {...cell_pos}
    while( !check_and_insert_move_helper({x : ++new_pos.x, y : new_pos.y}) );
    new_pos = {...cell_pos}
    while( !check_and_insert_move_helper({x : new_pos.x, y : --new_pos.y}) );
    new_pos = {...cell_pos}
    while( !check_and_insert_move_helper({x : --new_pos.x, y : new_pos.y}) );


    // let movable_pos_arr = [];
    // /* top move */
    // let new_pos = {...cell_pos}
    // let obstracle_found = false;
    // while( !obstracle_found && is_valid_cell_cord({x : new_pos.x, y : ++new_pos.y}) ) {
    //     let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    //     if( player == false ) {
    //         movable_pos_arr.push({...new_pos});
    //     } else if( player == settings.now_playing ) {
    //         obstracle_found = true;
    //     } else {
    //         obstracle_found = true;
    //         movable_pos_arr.push({...new_pos});
    //     }
    // }
    // /* right move */
    // new_pos = {...cell_pos}
    // obstracle_found = false;
    // while( !obstracle_found && is_valid_cell_cord({x : ++new_pos.x, y : new_pos.y}) )  {
    //     let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    //     if( player == false ) {
    //         movable_pos_arr.push({...new_pos});
    //     } else if( player == settings.now_playing ) {
    //         obstracle_found = true;
    //     } else {
    //         obstracle_found = true;
    //         movable_pos_arr.push({...new_pos});
    //     }
    // }
    // /* bottom move */
    // new_pos = {...cell_pos}
    // obstracle_found = false;
    // while( !obstracle_found && is_valid_cell_cord({x : new_pos.x, y : --new_pos.y}) )  {
    //     let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    //     if( player == false ) {
    //         movable_pos_arr.push({...new_pos});
    //     } else if( player == settings.now_playing ) {
    //         obstracle_found = true;
    //     } else {
    //         obstracle_found = true;
    //         movable_pos_arr.push({...new_pos});
    //     }
    // }
    // /* left move */
    // new_pos = {...cell_pos}
    // obstracle_found = false;
    // while( !obstracle_found && is_valid_cell_cord({x : --new_pos.x, y : new_pos.y}) )  {
    //     let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    //     if( player == false ) {
    //         movable_pos_arr.push({...new_pos});
    //     } else if( player == settings.now_playing ) {
    //         obstracle_found = true;
    //     } else {
    //         obstracle_found = true;
    //         movable_pos_arr.push({...new_pos});
    //     }
    // }

    // movable_pos_arr.forEach((pos) => {
    //     $(`[x=${pos.x}][y=${pos.y}]`).append(get_move_helper_html());
    // })
}

function set_move_helper_diagonal_move({...cell_pos}) {
    let new_pos = {...cell_pos}
    while( !check_and_insert_move_helper({x : ++new_pos.x, y : ++new_pos.y}) );
    new_pos = {...cell_pos}
    while( !check_and_insert_move_helper({x : ++new_pos.x, y : --new_pos.y}) );
    new_pos = {...cell_pos}
    while( !check_and_insert_move_helper({x : --new_pos.x, y : --new_pos.y}) );
    new_pos = {...cell_pos}
    while( !check_and_insert_move_helper({x : --new_pos.x, y : ++new_pos.y}) );



    // let movable_pos_arr = [];
    // /* top-right move */
    // let new_pos = {...cell_pos}
    // let obstracle_found = false;
    // while( !obstracle_found && is_valid_cell_cord({x : ++new_pos.x, y : ++new_pos.y}) ) {
    //     let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    //     if( player == false ) {
    //         movable_pos_arr.push({...new_pos});
    //     } else if( player == settings.now_playing ) {
    //         obstracle_found = true;
    //     } else {
    //         obstracle_found = true;
    //         movable_pos_arr.push({...new_pos});
    //     }
    // }
    // /* bottom-right move */
    // new_pos = {...cell_pos}
    // obstracle_found = false;
    // while( !obstracle_found && is_valid_cell_cord({x : ++new_pos.x, y : --new_pos.y}) )  {
    //     let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    //     if( player == false ) {
    //         movable_pos_arr.push({...new_pos});
    //     } else if( player == settings.now_playing ) {
    //         obstracle_found = true;
    //     } else {
    //         obstracle_found = true;
    //         movable_pos_arr.push({...new_pos});
    //     }
    // }
    // /* bottom-left move */
    // new_pos = {...cell_pos}
    // obstracle_found = false;
    // while( !obstracle_found && is_valid_cell_cord({x : --new_pos.x, y : --new_pos.y}) )  {
    //     let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    //     if( player == false ) {
    //         movable_pos_arr.push({...new_pos});
    //     } else if( player == settings.now_playing ) {
    //         obstracle_found = true;
    //     } else {
    //         obstracle_found = true;
    //         movable_pos_arr.push({...new_pos});
    //     }
    // }
    // /* top-left move */
    // new_pos = {...cell_pos}
    // obstracle_found = false;
    // while( !obstracle_found && is_valid_cell_cord({x : --new_pos.x, y : ++new_pos.y}) )  {
    //     let player = get_player_color_by_cell_cord(new_pos.x, new_pos.y);
    //     if( player == false ) {
    //         movable_pos_arr.push({...new_pos});
    //     } else if( player == settings.now_playing ) {
    //         obstracle_found = true;
    //     } else {
    //         obstracle_found = true;
    //         movable_pos_arr.push({...new_pos});
    //     }
    // }

    // movable_pos_arr.forEach((pos) => {
    //     $(`[x=${pos.x}][y=${pos.y}]`).append(get_move_helper_html());
    // })
}

function get_move_helper_html() {
    return `<div class="move_helper flex">•</div>`
}

/* move helper */

function is_valid_cell_cord({ ...cell_pos }){
    return !( cell_pos.x > 8 || cell_pos.y > 8 || cell_pos.x < 1 || cell_pos.y < 1 )
}
function get_player_color_by_cell_cord(x, y){
    let piece_ele = $(`[x=${x}][y=${y}] .piece`);
    // console.log(piece_ele)
    if( piece_ele.length > 0 ) {
        return piece_ele.attr('player');
    }
    return false;
}

function remove_piece_click(){
    $('.piece.selected').each(function(){
        $(this).removeClass('selected');
    })
    $('.move_helper').each(function(){
        $(this).remove();
    })
}
function remove_move_helper(){
    $('.move_helper').each(function(){
        $(this).remove();
    })
}

function update_castling_data(){
    /* fire after move & before player change */

    if( settings.player[settings.now_playing].rook_moved || settings.player[settings.now_playing].king_moved ) {
        return;
    }
    if(settings.now_playing == 'white') {
        settings.player.white.rook_moved = $(`[x=1][y=1] .piece[player=white][piece-name=rook]`).length == 0;
        settings.player.white.king_moved = $(`[x=5][y=1] .piece[player=white][piece-name=king]`).length == 0;
        settings.player.white.can_castling = 
                        ! settings.player.white.rook_moved && 
                        ! settings.player.white.king_moved && 
                        $(`[x=2][y=1] .piece`).length == 0 &&
                        $(`[x=3][y=1] .piece`).length == 0 &&
                        $(`[x=4][y=1] .piece`).length == 0
    }
    else {
        settings.player.black.rook_moved = $(`[x=1][y=8] .piece[player=black][piece-name=rook]`).length == 0;
        settings.player.black.king_moved = $(`[x=5][y=8] .piece[player=black][piece-name=king]`).length == 0;
        settings.player.black.can_castling = 
                        ! settings.player.black.rook_moved && 
                        ! settings.player.black.king_moved && 
                        $(`[x=2][y=8] .piece`).length == 0 &&
                        $(`[x=3][y=8] .piece`).length == 0 &&
                        $(`[x=4][y=8] .piece`).length == 0
    }
}




/*

        O O O
        O # O
        O O O


1. find direct checker can be eleminated or not.
2. find is king movable? 
3. find check directions (both direct and partial).
4. find whether any piece (not present in partial check) can be placed between direct check or not.

checkmate = 1. false, 2. false. 4. false...

## todo :-- can_king_move() >> function, cell checkable or not

*/










