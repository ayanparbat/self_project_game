var game = { started:0, type:'single', mode:'1', random:0, draw:0, win:0, loss:0 };
var marker = { player:1, sys:0, icon : ['<i class="icon ion-android-radio-button-off"></i>', '<i class="icon ion-close-round"></i>'] };
var move = [['','',''],['','',''],['','','']];
var win_cell_cord = [
	[ [0,0], [0,1], [0,2] ],
	[ [1,0], [1,1], [1,2] ],
	[ [2,0], [2,1], [2,2] ],
	[ [0,0], [1,0], [2,0] ],
	[ [0,1], [1,1], [2,1] ],
	[ [0,2], [1,2], [2,2] ],
	[ [0,0], [1,1], [2,2] ],
	[ [0,2], [1,1], [2,0] ]
];
var slicer_class = ['hor_1', 'hor_2', 'hor_3', 'vir_1', 'vir_2', 'vir_3', 'diag_ltr', 'diag_rtl'];


$(document).ready(function(){
	if(get_cookie('__ttts')){
		let setting = JSON.parse(get_cookie('__ttts'));
		game.mode = parseInt(setting.gm);
		game.random = parseInt(setting.r);
		$('#game_mode').val(game.mode);
		if(game.random){ $('#random').prop('checked', true); }
	}
	else{
		set_cookie('__ttts', '{"gm":1,"r":0}');
	}
	init_cell();

	$('.cell').on('click', function(){
		if(!game.started){ return false; }
		if(game.mode == 3){
			popup_alert('Under developement', 'warning');
			return false;
		} 
		if(move[$(this).attr('i')][$(this).attr('j')] == ''){
			move[$(this).attr('i')][$(this).attr('j')] = 'p';
			$(this).html(marker.icon[marker.player]);
			$(this).attr('cell-selected', 'true');
			let continue_game = check_game_result(); //console.log('g');
			if(game.type != 'double' && continue_game){
				sys_move();
			}
		}
		else{
			popup_alert('This area has been choosen', 'warning');
		}
	})

	$('#random').click(function(){
		game.random = ($(this).prop('checked')) ? 1 : 0; console.log(game.random);
		set_cookie('__ttts', `{"gm":${game.mode},"r":${game.random}}`);
	});
	$('#game_mode').change(function(){
		game.mode = $(this).val();
		set_cookie('__ttts', `{"gm":${game.mode},"r":${game.random}}`);
	})
	$('.end_game_cont button').click(()=>{ 
		$('.end_game_cont').hide();
		init_cell();
	})
	$('.game_stat i').click(()=>{ console.log(11)
		game.draw = game.win = game.loss = 0;
		$('.game_stat .draw').text('Draw : 0');
		$('.game_stat .win').text('Win : 0');
		$('.game_stat .loss').text('Loss : 0');
	});

})

function sys_move(){
	if(game.mode == 1){
		let i_val, j_val;
		do{
			i_val = parseInt(Math.random()*100000) % 3;
			j_val = parseInt(Math.random()*100000) % 3;
		}while(move[i_val][j_val] != '')
		make_sys_move(i_val, j_val);
	}
	else if(game.mode == 2){
		let normal_move = true, critical_move = ['',''];
		for(let i=0; i<win_cell_cord.length; i++){ //console.log(win_cell_cord[i]);
			let player_mark_count = 0, sys_mark_count = 0, empty_cell_i = '', empty_cell_j = '';
			win_cell_cord[i].forEach((winning_cell)=>{ //console.log(winning_cell);
				if(move[winning_cell[0]][winning_cell[1]] == 'p') player_mark_count++;
				else if(move[winning_cell[0]][winning_cell[1]] == 's') sys_mark_count++;
				else if(move[winning_cell[0]][winning_cell[1]] == ''){
					empty_cell_i = winning_cell[0];
					empty_cell_j = winning_cell[1];
				}
				//console.log(winning_cell[0]);
			})
			//console.log(`pc=${player_mark_count}, sc=${sys_mark_count}, eci=${empty_cell_i}, ecj=${empty_cell_i}`);
			//console.log(player_mark_count, sys_mark_count)
			if(player_mark_count == 2 && sys_mark_count == 0){ 
				//console.log(`pc- ${empty_cell_i}-${empty_cell_i}`);
				critical_move[0] = empty_cell_i;
				critical_move[1] = empty_cell_j;
			}
			else if(sys_mark_count == 2 && player_mark_count == 0){
				//console.log(`sc- ${empty_cell_i}-${empty_cell_i}`);
				make_sys_move(empty_cell_i, empty_cell_j);
				normal_move = false;
				break;
			}
		}
		//console.log(`cm- ${critical_move[0]}-${critical_move[1]}`);
		if(normal_move && typeof critical_move[0] == 'number'){//console.log(`cm if-- ${critical_move[0]}-${critical_move[1]}`);
			make_sys_move(critical_move[0], critical_move[1]);
			normal_move = false;
		}
		if(normal_move){
			let i_val, j_val;
			do{
				i_val = parseInt(Math.random()*100000) % 3;
				j_val = parseInt(Math.random()*100000) % 3;
			}while(move[i_val][j_val] != '')
			//console.log(`nm- ${i_val}-${i_val}`)
			make_sys_move(i_val, j_val);
		}

	}
	else if(game.mode == 3){
		popup_alert('Coming soon', 'warning');
	}
	check_game_result()
}
function init_cell(){
	move = [['','',''],['','',''],['','','']];
	$('#slicer').hide();
	game.started = 1;
	game.mode = $('#game_mode').val();
	if($('#random').prop('checked')){ game.random = 1; }
	else{ game.random = 0; }
	$('.cell').each(function(i, v){
		i_val = parseInt(i / 3);
		j_val = i % 3;
		$(this).attr('cell-selected', 'false');
		$(this).attr('i', i_val);
		$(this).attr('j', j_val);
		$(this).html('')
	})
}
function make_sys_move(i_val, j_val){ //console.log(`msm- ${i_val}-${i_val}`);
	//cell_no = (i_val * 3) + j_val;
	move[i_val][j_val] = 's';
	$('.cell').each(function(){
		if($(this).attr('i') == i_val && $(this).attr('j') == j_val){
			$(this).html(marker.icon[marker.sys]);
			$(this).attr('cell-selected', 'true');
		}
	})
}
function check_game_result(){ //console.log('gr');
	let continue_game = true, winner = false, winning_cell_index = '';
	let cell_selected = $('[cell-selected=true]');
	
	//winner check

	//win_cell_cord.every((winning_row, i)=>{ console.log(winning_row);
	for(let i=0; i<win_cell_cord.length; i++){ //console.log(win_cell_cord[i]);
		let player_mark_count = 0, sys_mark_count = 0;
		win_cell_cord[i].forEach((winning_cell)=>{ //console.log(winning_cell);
			if(move[winning_cell[0]][winning_cell[1]] == 'p') player_mark_count++;
			else if(move[winning_cell[0]][winning_cell[1]] == 's') sys_mark_count++;
		})
		//console.log(player_mark_count, sys_mark_count)
		if(player_mark_count == 3){
			winning_cell_index = i;
			winner = 'player';
			break;
		}
		else if(sys_mark_count == 3){
			winning_cell_index = i;
			winner = 'sys';
			break;
		}
	}

	//winner check

	if(winner != false || cell_selected.length == 9){ //console.log('wnf');
		continue_game = false;
		if(winner != false){ //console.log('slice');
			$('#slicer').attr('class', 'slicer '+slicer_class[winning_cell_index]);
			$('#slicer').fadeIn(500);
		}
	}
	if(winner == 'player'){
		show_game_result('w');
	}
	else if(winner == 'sys'){
		show_game_result('l');
	}
	else if(cell_selected.length == 9){
		show_game_result('d');
	}

	if($('#random').prop('checked') && !continue_game){ setTimeout(init_cell, 1500); }
	else if(!continue_game){ $('.end_game_cont').fadeIn(500); }
	return continue_game;
}
function show_game_result(result){
	game.started = 0;
	if(result == 'd'){
		$('.game_stat .draw').text('Draw : '+(++game.draw));
		popup_alert('Match Draw');
	}
	else if(result == 'w'){
		$('.game_stat .win').text('Win : '+(++game.win));
		popup_alert('You Win', 'success');
	}
	else if(result == 'l'){
		$('.game_stat .loss').text('Loss : '+(++game.loss));
		popup_alert('You Lose', 'warning');
	}
}