// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 	Title 		: Script for single player Blackjack
// 	Author 		: Ayan Parbat
// 	Date 		: 22/05/2020
// 	Desclaimer	: DONT use it for gambling purpose,
// 				  DONT USE IT IF YOU ARE NOT 18+ YEARS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var packet = [], cards = {}, deck = [], deck_index = 0, settings = {}, fc = 0, game = [], shuffle_max_index = 9999, delay_timespan = 500, dealers_call_intv, serve_cards_intv, serve_cards_count = 1;
var players_info = { sys : {drawn_cards : [], point : 0, split_points : [0,0]}, player : {drawn_cards : [], point : 0, split_points : [0,0]} }
var card_credentials = 
{ 
	"names" : ["spade", "heart", "club", "diamond"],
	"numbers" : [2,3,4,5,6,7,8,9,10,"A","K","Q","J"],
	"short_names" : ["s", "h", "c", "d"]
};
card_credentials["short_names"].forEach((card_short_names, index) => {
	card_credentials["numbers"].forEach((value)=>{
		cards[card_short_names+'-'+value] = [];
		cards[card_short_names+'-'+value][0] = (isNaN(value)) ? 10 : value;
		if(value == 'A'){
			cards[card_short_names+'-'+value][0] = 11;
			cards[card_short_names+'-'+value][1] = 1;
		}
	})
});

initialize();

$(document).ready(function(){

	setInterval(()=>{ $('#favicon').attr('href', `img/favicon-${card_credentials['names'][(++fc % 4)]}.png`);},5000);

	$('[open-modal]').click(function(){
	    $('body').css('overflow', 'hidden');
	    $('#'+$(this).attr('open-modal')).fadeIn(300); 
	});
	$('[close-modal]').click(function(){
	    $('body').css('overflow', 'initial');
	    $('#'+$(this).attr('close-modal')).fadeOut(300);
	});
	$('#change_mode').click(()=>{
		if(settings.mode == 'day') mode_change_to('night');
		else mode_change_to('day');
	});
	$('#playing_rules').click(()=>{
		if($('.game_rules').attr('area-hidden') == 'true'){
			$('.game_rules').attr('area-hidden', 'false').slideDown(1000);
		}
		else{
			$('.game_rules').attr('area-hidden', 'true').slideUp(1000);
		}
	});
	$('#save_setting').click(()=>{
		if($('#setting_sound').prop('checked')){ settings.sound = 1; }
		else{ settings.sound = 0; }
		settings.deck = $('#setting_deck').val();
		set_cookie('__bjsps', JSON.stringify(settings));
		$('#sound_setting_word').text((settings.sound) ? 'Sound on' : 'Sound off');
		$('#volume_icon')
		.removeClass((settings.sound)?'ion-android-volume-off':'ion-android-volume-up')
		.addClass((settings.sound)?'ion-android-volume-up':'ion-android-volume-off');
		$('#save_setting').text('Setting Saved').fadeOut(2000, ()=>{
			$('#save_setting').text('Save').show();
		});
	});

	$('#new_game_btn').click(()=>{ start_game(); });
	$('#hit_btn').click(()=>{
		setTimeout(function(){
			players_info.player.drawn_cards.push(deck[deck_index]);
			register_points('player');
			insert_card('player', deck[deck_index]);
			deck_index++;
			if(players_info.player.point > 21){
				end_game();
			}
		}, 300);
	});
	$('#stand_btn').click(()=>{
		open_dealers_second_card().then(()=>{
			dealers_call_intv = setInterval(dealers_call, delay_timespan);
		});
	});
	$('#shuffle_btn').click(()=>{ shuffle_cards(); })

});


function register_points(this_player){ 
	let drawn_last_card = players_info[this_player].drawn_cards[players_info[this_player].drawn_cards.length - 1];
	let unique_card = drawn_last_card.split('-')[1]+'-'+drawn_last_card.split('-')[2];
	players_info[this_player].split_points[0] += cards[unique_card][0];
	if(cards[unique_card][1]){
		players_info[this_player].split_points[1] += cards[unique_card][1];
	}
	else{
		players_info[this_player].split_points[1] += cards[unique_card][0];
	}
	if(players_info[this_player].split_points[0] > 21){
		players_info[this_player].point = players_info[this_player].split_points[1];
	}
	else if(players_info[this_player].split_points[1] > 21){ 
		players_info[this_player].point = players_info[this_player].split_points[0];
	}
	else if(players_info[this_player].split_points[1] > players_info[this_player].split_points[0]){
		players_info[this_player].point = players_info[this_player].split_points[1];
	}
	// else if(players_info[this_player].split_points[0] > players_info[this_player].split_points[1]){ 
	// 	players_info[this_player].point = players_info[this_player].split_points[0];
	// }
	else{
		players_info[this_player].point = players_info[this_player].split_points[0];
	}
}
function initialize(){
	init_settings();
	shuffle_cards(true);
}
function init_settings(){
	if(get_cookie('__bjsps')){ settings = JSON.parse(get_cookie('__bjsps')); }
	else{ settings = {deck : 4, sound : 1, mode : "night"}; }
	mode_change_to(settings.mode);
	$('#sound_setting_word').text((settings.sound) ? 'Sound on' : 'Sound off');
	$('#setting_sound').prop('checked', (settings.sound)? true : false);
	$('#volume_icon')
	.removeClass((settings.sound)?'ion-android-volume-off':'ion-android-volume-up')
	.addClass((settings.sound)?'ion-android-volume-up':'ion-android-volume-off');
	$('#setting_deck').val(settings.deck);
}
function mode_change_to(mode_change_to){
	settings.mode = mode_change_to;
	set_cookie('__bjsps', JSON.stringify(settings));
	if(mode_change_to == 'night'){
		$('#css_mode').remove();
		$('.view_mode .icon').removeClass('ion-ios-moon').addClass('ion-ios-sunny');
		$('#change_mode').text('Switch to day mode');
	}
	else{
		$('head').append('<link id="css_mode" rel="stylesheet" href="css/day.css">');
		$('.view_mode .icon').removeClass('ion-ios-sunny').addClass('ion-ios-moon');
		$('#change_mode').text('Switch to night mode');
	}
}
function start_game(){
	sound('loss', 'stop');
	if(deck_index > shuffle_max_index){
		shuffle_cards();
		return false;
	}
	players_info = { sys : {drawn_cards : [], point : 0, split_points : [0,0]}, player : {drawn_cards : [], point : 0, split_points : [0,0]} }
	$('.player_area .button_area').show();
	$('#new_game_btn').text('Play Again');
	$('#player_card_section').html('');
	$('#dealer_card_section').html('');
	$('.dealer_area .point').fadeIn(500);
	$('.player_area .point').fadeIn(500);
	$('#game_result').hide().html('');
	$('#game_result_msg').hide().html('');
	$('#players_point').text('0');
	$('.new_game_wrapper').fadeOut(200);
	serve_cards_count = 1;
	serve_cards_intv = setInterval(serve_cards, delay_timespan);
}
function serve_cards(){
	if(serve_cards_count < 3){
		players_info.sys.drawn_cards.push(deck[deck_index]);
		register_points('sys');
		insert_card('dealer', deck[deck_index]);
	} 
	else{
		players_info.player.drawn_cards.push(deck[deck_index]);
		register_points('player');
		insert_card('player', deck[deck_index]);
	} 
	deck_index++;
	if(serve_cards_count == 4){
		clearInterval(serve_cards_intv);
		if(players_info.sys.point == 21 || players_info.player.point == 21){
			$('#dealers_point').text('21');
			end_game();
			return false;
		}
	}
	serve_cards_count++;
}
function dealers_call(){
	if(players_info.sys.point > players_info.player.point || players_info.sys.point > 16){
		end_game();
		clearInterval(dealers_call_intv);
		return false;
	}
	players_info.sys.drawn_cards.push(deck[deck_index]);
	register_points('sys');
	insert_card('dealer', deck[deck_index]);
	deck_index++;
}
function end_game(){
	let end_game = false;
	if(players_info.sys.point == players_info.player.point){
		$('#game_result').html('Draw').show();
		$('#game_result_msg').html('Draw').show();
		players_info.winner = 'draw';
		end_game = true;
	}
	else if(players_info.player.point == 21 && players_info.player.drawn_cards.length == 2){
		$('#game_result').html('Winner Winner Chicken Dinner').show();
		$('#game_result_msg').html('You got the Blackjack..!!').show();
		players_info.winner = 'player';
		end_game = true;
	}
	else if(players_info.sys.point == 21 && players_info.sys.drawn_cards.length == 2){
		$('#game_result').html('Better Luck Next Time').show();
		$('#game_result_msg').html('Dealer got the Blackjack..!!').show();
		players_info.winner = 'sys';
		end_game = true;
	}
	else if(players_info.sys.point > 21){
		$('#game_result').html('Winner Winner Chicken Dinner').show();
		$('#game_result_msg').html('Dealer busted..!!').show();
		players_info.winner = 'player';
		end_game = true;
	}
	else if(players_info.player.point > 21){
		$('#game_result').html('Better Luck Next Time').show();
		$('#game_result_msg').html('You busted..!!').show();
		players_info.winner = 'sys';
		end_game = true;
	}
	else if(players_info.player.point > players_info.sys.point){
		$('#game_result').html('Winner Winner Chicken Dinner').show();
		$('#game_result_msg').html('You win..!!').show();
		players_info.winner = 'player';
		end_game = true;
	}
	else if(players_info.sys.point > players_info.player.point){
		$('#game_result').html('Better Luck Next Time').show();
		$('#game_result_msg').html('Dealer win..!!').show();
		players_info.winner = 'sys';
		end_game = true;
	}
	if(end_game){
		if(players_info.winner == 'sys') sound('loss', 'play');
		else sound('win', 'play');
		open_dealers_second_card().then(()=>{
			$('.new_game_wrapper').fadeIn(500);
		});
	}
}
function insert_card(area, this_card){ 
	sound('serve', 'play');
	if(area == 'dealer'){
		if(serve_cards_count == 2){
			$('#dealer_card_section').append(get_jokergirl_card_layout());
		}
		else{
			$('#dealer_card_section').append(get_card_layout(this_card));
			$('#dealers_point').text(players_info.sys.point);
		}
		let card = $('.dealer_card_section .card_container');
		adjust_width = (94 * card.length) - ((card.length - 1) * 44);
		$('#dealer_card_section').css('width', adjust_width+'px');
	}
	else{
		$('#player_card_section').append(get_card_layout(this_card));
		if( players_info.player.split_points[0] > 21 || players_info.player.split_points[1] > 21 || players_info.player.split_points[0] == players_info.player.split_points[1] ){
			$('#players_point').text(players_info.player.point);
		}
		else{
			$('#players_point').text(`(${players_info.player.split_points[1]}, ${players_info.player.split_points[0]})`);
		}
		let card = $('.player_card_section .card_container');
		adjust_width = (94 * card.length) - ((card.length - 1) * 44);
		$('#player_card_section').css('width', adjust_width+'px');
	}
}
function shuffle_cards(hold_start_game = false){
	clearInterval(dealers_call_intv);
	clearInterval(serve_cards_intv);
	let deck_init = [], suff_deck = [], card_set = settings.deck;
	while(card_set--){
		for(let key in cards){
			deck_init.push((card_set+1)+'-'+key);
		}
	} 
	let no_of_cards = deck_init.length;
	deck_init.forEach(value => {
		let rand = Math.round(Math.random()*1000000000000) % no_of_cards;
		while(suff_deck.includes(deck_init[rand])){
			rand = Math.round(Math.random()*1000000000000) % no_of_cards;
		}
		suff_deck.push(deck_init[rand]);
	})
	deck = suff_deck;
	shuffle_max_index = Math.round(deck.length * 0.65);
	deck_index = 0;
	if(!hold_start_game){
	call_suffling_animation().then(()=>{ start_game(); })
	}
}
function get_card_layout(this_card){
	this_card = this_card.split('-');
	let card_img = card_credentials["names"][card_credentials["short_names"].indexOf(this_card[1])] + '.png';
	let this_card_html = '<div class="card_container"> <div class="card">'
	this_card_html += '<div class="number up">'+this_card[2]+'</div>'
	this_card_html += '<div class="flex img_cont">'
	this_card_html += '<img src="img/'+card_img+'">'
	this_card_html += '</div>'
	this_card_html += '<div class="number down">'+this_card[2]+'</div>'
	this_card_html += '</div> </div>'
	return this_card_html;
}
function get_jokergirl_card_layout(){
	let this_card_html = '<div class="card_container joker_card_cont"> <div class="card">'
	this_card_html += '<div class="flex img_cont jokergirl">'
	this_card_html += '<img src="img/joker-girl.png">'
	this_card_html += '</div>'
	this_card_html += '</div> </div>'
	return this_card_html;
}
function open_dealers_second_card(){
	return new Promise(function(resolve, reject){
		if($('.joker_card_cont')[0] != undefined){
			$('.joker_card_cont').addClass('flip_joker_card');
			setTimeout(()=>{
				$('.joker_card_cont').remove();
				insert_card('dealer', players_info.sys.drawn_cards[1]);
				resolve();
			}, delay_timespan);
		}
		else{ resolve(); }
	});
}
function get_shuffle_anim_layout(){
	let html = '<div id="shuflling_anim">'
	html += '<div class="shuffling_anim_cont">'
	html += '<div class="shuffing_anim_card"><img src="img/favicon-spade.png"></div>'
	html += '<div class="shuffing_anim_card"><img src="img/favicon-diamond.png"></div>'
	html += '<div class="shuffing_anim_card"><img src="img/favicon-club.png"></div>'
	html += '<div class="shuffing_anim_card"><img src="img/favicon-heart.png"></div>'
	html += '</div>'
	html += '<div class="center">Shuffling...</div>'
	html += '</div>'
	return html;
}
function call_suffling_animation(){
	return new Promise((resolve, reject)=>{
		sound('shuffle', 'play');
		$('.shuffle_wrapper .flex').html(get_shuffle_anim_layout());
		$('.shuffle_wrapper').fadeIn(200);
		setTimeout(()=>{
			$('.shuffle_wrapper .flex').html('');
			$('.shuffle_wrapper').fadeOut(200);
			resolve();
		},2010)
	})
}
function sound(type = '', action = ''){
	if(!type || !action || !settings.sound) return false;
	let id = '';
	if(type == 'win') id = 'game_win_sound';
	else if(type == 'loss') id = 'game_loss_sound';
	else if(type == 'shuffle') id = 'card_shuffle_sound';
	else if(type == 'serve') id = 'card_serve_sound';
	if(!id) return false;
	let audio = document.getElementById(id);
	if(action == 'play'){
		audio.play();
	}
	else if(action == 'stop'){
		audio.pause();
		audio.currentTime = 0;
	}
}

function set_cookie(name, value){
    let d = new Date; 
    d.setFullYear(d.getFullYear()+10);
    exp = d.toUTCString();
    document.cookie = `${name}=${value}; Expires=${exp}; Path=/;`;
}
function get_cookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
}
function delete_cookie(name){ document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=/;`; }