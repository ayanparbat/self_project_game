// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 	Title 		: Script for Multi player Fish card game
// 	Author 		: Ayan Parbat
// 	Date 		: 19/12/2021
// 	Desclaimer	: DONT use it for gambling purpose,
// 				  DONT USE IT IF YOU ARE NOT 18+ YEARS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var packet = [], cards = {}, deck = [], deck_index = 0, settings = {}, fc = 0, game = [];
var shuffle_max_index = 9999, delay_timespan = 500, dealers_call_intv, serve_cards_intv, serve_cards_count = 1;
// var players_info = { 
// 	sys : {
// 		drawn_cards : [], 
// 		point : 0, 
// 		split_points : [0,0]
// 	}, 
// 	player : {
// 		drawn_cards : [], 
// 		point : 0, 
// 		split_points : [0,0]
// 	} 
// }
var players_info = {
	one : {
		cards : [],
		name : '',
		move : false
	},
	two : {
		cards : [],
		name : '',
		move : false
	},
	three : {
		cards : [],
		name : '',
		move : false
	},
	four : {
		cards : [],
		name : '',
		move : false
	}
};
var clickable_sec = {
	thrown_cards : true,
	deck_cards : true
}
var drawn_deck = [], enable_button = 0, trump_card = '', throw_cards = [], popped_card = '';
var active_player = 'one';
var card_credentials = { 
	names : ['spade', 'heart', 'club', 'diamond'],
	numbers : [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'],
	short_names : ['s', 'h', 'c', 'd']
};
card_credentials["short_names"].forEach((card_short_names, index) => {
	card_credentials["numbers"].forEach((value)=>{
		cards[card_short_names+'-'+value] = [];
		cards[card_short_names+'-'+value][0] = (isNaN(value)) ? 10 : value;
		if(value == 'A'){
			cards[card_short_names+'-'+value][0] = 14;
			cards[card_short_names+'-'+value][1] = 1;
		}
	})
});

initialize();

$(document).ready(function(){

	$('[open-modal]').click(function(){
	    $('body').css('overflow', 'hidden');
	    $('#'+$(this).attr('open-modal')).fadeIn(300); 
	});
	$('[close-modal]').click(function(){
	    $('body').css('overflow', 'initial');
	    $('#'+$(this).attr('close-modal')).fadeOut(300);
	});


	$('#new_game_btn').click(()=>{
		let done = 0;
		$('.set_player_name input').each(function(){
			if($(this).val().trim() != ''){
				players_info[$(this).attr('player')].name = $(this).val().trim();
				done++;
			}
		})
		if(done != 4){
			reset_player(true);
			popup_alert('You need 4 players to start', 'warning');
			return;
		}
		$('.set_player_name').hide();
		$('.new_game_wrapper').hide();
		shuffle_cards();
	});
	
	$('#shuffle_btn').click(()=>{
		if(!enable_button){ return false; }
		shuffle_cards();
	})
	$('.deck_cards .decks').click(()=>{
		if(clickable_sec.deck_cards){
			clickable_sec.deck_cards = false;
			clickable_sec.throw_cards = false;
		} else {
			return;
		}
		if(deck.length >= 0){
			popped_card = deck.pop();
		} else {
			console.log('deck end')
		}
		$('.deck_cards .fetched').html(get_card_layout(popped_card)).fadeIn(500);
		$('.deck_cards .action').fadeIn(500);
		$('#player_card_section > div').each(function(el){
			$(this).attr('onclick', `swap_player_card('deck', this)`);
		})
	})
	$('#throw_deck_card').click(()=>{
		throw_cards.push(popped_card);
		$('.other_card_sec .thrown_card').html(get_card_layout(popped_card)).fadeIn(500)
		popped_card = '';
		$('.deck_cards .action').hide();
		$('.deck_cards .fetched').html('').hide();
		clickable_sec.deck_cards = true;
		clickable_sec.throw_cards = true;
		init_next_player();
	})

});

// $('.player_sec .card').each(function(el){
// 	$(el).click(function(){
// 		swap_card('deck', )
// 	})

// })
function reset_player(all = false){
	for(let k in players_info){
		players_info[k].cards = [];
		players_info[k].move = false;
		if(all){
			players_info[k].name = '';	
		}
	}
}
function initialize(){
	// console.log('init')
	init_settings();
	// shuffle_cards(false);
}
function init_settings(){

}

function start_game(setting = {}){
	console.log('starting game..')
	reset_player();
	if(setting.start_player && ['one','two','three','four'].indexOf(setting.start_player) != -1){
		players_info[setting.start_player].move = true;
		active_player = setting.start_player;
	} else {
		players_info.one.move = true;
		active_player = 'one'
	}
	console.log(players_info)
	distribute_cards();
	$('.table').show();
	serve_cards();
}
function distribute_cards(){
	for(let i = 0; i < 8; i++){
		players_info.one.cards.push(deck.pop());
		players_info.two.cards.push(deck.pop());
		players_info.three.cards.push(deck.pop());
		players_info.four.cards.push(deck.pop());
	}
}
function serve_cards(){
	// for(let k in players_info){
	// 	if(players_info[k].move){
	// 		active_player = k;
	// 	}
	// }
	if(!active_player){
		popup_alert('no active player found');
		return;
	}
	$('.table .player_sec .name').text('Player : ' + players_info[active_player].name);
	$('#player_card_section').html('');
	players_info[active_player].cards.forEach(el => {
		clickable_sec.deck_cards = true;
		clickable_sec.throw_cards = true;
		insert_card(el);
	})

}
function init_next_player(){
	if(active_player == 'one'){
		active_player = 'two';
	} else if(active_player == 'two'){
		active_player = 'three';
	} else if(active_player == 'three'){
		active_player = 'four';
	} else if(active_player == 'four'){
		active_player = 'one';
	}
	players_info[active_player].move = true;
	$('.table .player_sec .name').text('Changing player in 3 secs...');
	setTimeout(()=>{
		serve_cards();
	}, 3000);
}
function swap_player_card(type, player_card){
	let player_card_html = $(player_card).find('.card').html();
	let card_number = $(player_card).find('.card').attr('card-number');
	if(type == 'deck'){
		$('.deck_cards .deck').html('');
		$('#throw_cards').html(get_card_layout(card_number));
		$(player_card).remove();
		$('#player_card_section').append(get_card_layout(popped_card));
		popped_card = '';
		$('.deck_cards .action').hide();
		$('.deck_cards .fetched').html('').hide();
	}
	else if(type == 'thrown'){

	}
	init_next_player();
}
function insert_card(this_card){
	sound('serve', 'play');
	$('#player_card_section').append(get_card_layout(this_card));
	let card = $('#player_card_section .card_container');
	adjust_width = (94 * card.length) - ((card.length - 1) * 44);
	$('#player_card_section').css('width', adjust_width+'px');
	
}
function shuffle_cards(hold_start_game = false){
	let deck_init = [], suff_deck = [], card_set = 1; //settings.deck;
	while(card_set--){
		for(let key in cards){
			deck_init.push((card_set+1)+'-'+key);
		}
	}
	let no_of_cards = deck_init.length;
	// console.log(deck_init)
	deck_init.forEach(value => {
		let rand = Math.round(Math.random()*1000000000000) % no_of_cards;
		while(suff_deck.includes(deck_init[rand])){
			rand = Math.round(Math.random()*1000000000000) % no_of_cards;
		}
		suff_deck.push(deck_init[rand]);
	})
	deck = suff_deck;
	trump_card = deck[0];
	// shuffle_max_index = Math.round(deck.length * 0.65);
	// deck_index = 0;
	// drawn_deck = [];
	if(!hold_start_game){
		call_suffling_animation().then(()=>{ start_game(); })
	}
}
function get_card_layout(this_card){
	let card_number = this_card;
	this_card = this_card.split('-');
	let card_img = card_credentials["names"][card_credentials["short_names"].indexOf(this_card[1])] + '-tr.png';
	let this_card_html = `<div class="card_container" onmouseover="this.style.zIndex=3" onmouseout="this.style.zIndex=0">`
	this_card_html += '<div class="card" card-number="'+card_number+'">'
	this_card_html += '<div class="number up">'
	this_card_html += '<div>'+this_card[2]+'</div>'
	this_card_html += '<img src="../common/img/'+card_img+'">'
	this_card_html += '</div>'
	this_card_html += '<div class="flex img_cont">'
	this_card_html += '<img src="../common/img/'+card_img+'">'
	this_card_html += '</div>'
	this_card_html += '<div class="number down">'
	this_card_html += '<div>'+this_card[2]+'</div>'
	this_card_html += '<img src="../common/img/'+card_img+'">'
	this_card_html += '</div>'
	// this_card_html += '<div class="number down">'+this_card[2]+'</div>'
	this_card_html += '</div> </div>'
	return this_card_html;
}
function get_jokergirl_card_layout(){
	let this_card_html = '<div class="card_container joker_card_cont"> <div class="card">'
	this_card_html += '<div class="flex img_cont jokergirl">'
	this_card_html += '<img src="../common/img/joker-girl.png">'
	this_card_html += '</div>'
	this_card_html += '</div> </div>'
	return this_card_html;
}
function get_shuffle_anim_layout(){
	let html = '<div id="shuflling_anim">'
	html += '<div class="shuffling_anim_cont">'
	html += '<div class="shuffing_anim_card"><img src="../common/img/favicon-spade.png"></div>'
	html += '<div class="shuffing_anim_card"><img src="../common/img/favicon-diamond.png"></div>'
	html += '<div class="shuffing_anim_card"><img src="../common/img/favicon-club.png"></div>'
	html += '<div class="shuffing_anim_card"><img src="../common/img/favicon-heart.png"></div>'
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
function draw_card(){
	let cond = true;
	while(cond){
		let rand = Math.round(Math.random()*1000000000000) % deck.length;
		if(!drawn_deck.includes(deck[rand])){
			drawn_deck.push(deck[rand]);
			return deck[rand];
		}
	}
}






function popup_alert(message, type=''){
    let c = 'style="background-color:#e2631c54;"';
    if(message == '') return false;
    else if(type == 'success') c = 'style="background-color:#42c727;"';
    else if(type == 'warning') c = 'style="background-color:#fd536c;"';
    $('#popup-alert-container').prepend(`<div ${c} class="popup-alert">${message}</div>`).show();
    $('.popup-alert').fadeIn(100).delay(3500).fadeOut(1000, function(){ $(this).remove(); });
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