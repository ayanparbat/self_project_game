


var pics = [ 
    "💘", "😠", "🐼", "🎂", "🍩", "🍫", "🍭", "🍕", "🍟", "🍆", "🍅", "🍎", "🍒", "🍉", "🍇", "🌿", "🌲", 
    "🌹", "🌺", "🐞", "🐙", "🐠", "🐬", "🐢", "🐧", "🐯", "🐵", "💣", "💜", "💙", "💚", "💛", "❤", "💔", 
    "💕", "👾", "👹", "👻", "😈", "😱", "😮", "😳", "😎", "😵", "😷", "😜", "😍", "😘", "😂", "😀", '🏓', 
    '🖤', '🥵', '🥳', '💩', '💋', '💯', '👋', '👩', '🧔', '🤢', '🤑', '🥰', '🤯', '🤡', '😻', '✌', '🤘', 
    '👊', '🙏', '👄', '🫦', '🧟', '💃', '🏌', '🏄', '🚣', '🚴', '👣', '🐶', '🦊', '🦁', '🐴', '🦄', '🐥', 
    '🐦', '🦜', '🦖', '🐟', '🐌', '🕷', '🦠', '💐', '🌷', '🌵', '🍁', '🪺', '🍄', '🥭', '🍑', '🍓', '🥝', 
    '🥥', '🥕', '🌽', '🥦', '🥜', '🫛', '🌰', '🍞', '🍔', '🥪', '🌮', '🥘', '🥣', '🍤', '🍥', '🥮', '🦀', 
    '🍨', '🍰', '🍬', '🍼', '🫖', '🍾', '🍺', '🥃', '🍷', '🌏', '🧭', '🏖', '🏛', '🏠', '🏪', '🗽', '🗼', 
    '💒', '🚂', '🚑', '🚗', '🛵', '🛺', '🚥', '🚦', '⚓', '🛟', '🪂', '🛩', '🚁', '🚀', '⏰', '⌛', '🌚', 
    '🌝', '🌡', '🪐', '⭐', '🌟', '🌞', '⛅', '🌧', '🌨', '⛈', '🌬', '☂', '☔', '⚡', '❄', '⛄', '💧', 
    '🔥', '🎃', '✨', '🎈', '🎉', '🎁', '🏆', '⚽', '🥊', 
]


var totalPic = pics.length
var gamePics = []
var gameSettings = {
    level : 1,
    score : 0,
    totalItems : 0,
    itemRemains : 0,
    levelTime : 1000,
    startTime : 0,
    endTime : 0,
    draggingEle : null,
    droppedCell : null,
    pointPerCell : 3,
    initGameAnimInterval : null,
    gameTimerInterval : null,
    emojiType : 'twimoji', // 'emo', 'twimoji'
}

var levelData = [
    { level : 1, row : 2, col : 1, time : 20 },
    { level : 2, row : 4, col : 1, time : 40 },
    { level : 3, row : 3, col : 2, time : 60 },
    { level : 4, row : 4, col : 2, time : 90 },
    { level : 5, row : 3, col : 3, time : 110 },
    { level : 6, row : 5, col : 2, time : 130 },
    { level : 7, row : 6, col : 2, time : 150 },
    { level : 8, row : 7, col : 2, time : 170 },
    { level : 9, row : 5, col : 3, time : 180 },
    { level : 10, row : 4, col : 4, time : 190 },
    { level : 11, row : 5, col : 4, time : 230 },
    { level : 12, row : 6, col : 4, time : 260 },
    { level : 13, row : 7, col : 4, time : 270 },
    { level : 14, row : 6, col : 5, time : 330 },
    { level : 15, row : 6, col : 6, time : 350 },
    { level : 16, row : 7, col : 6, time : 380 },
    { level : 17, row : 8, col : 6, time : 390 },
]

// var tableEle = document.querySelector('.table')

var gameTableEle = document.getElementById('game_table')
var storeEmoEle = document.getElementById('store_emo')
var itemRemainsEle = document.getElementById('item_remains')
var totalItemsEle = document.getElementById('total_items')
var scoreEle = document.getElementById('score')
var levelEle = document.getElementById('level')
var levelUpContEle = document.getElementById('level_up_cont')
var gameStartAnimEle = document.getElementById('game_start_anim_cont')
var nextLevelCounterEle = document.getElementById('next_level_count')
var timerMinEle = document.getElementById('timer_min')
var timerSecEle = document.getElementById('timer_sec')
var gameOverEle = document.getElementById('game_over_cont')
var restartLevelBtn = document.getElementById('restart_level_btn')
var startGameBtn = document.getElementById('start_game_btn')
var playNextLevelBtn = document.getElementById('play_next_level_btn')
var playAgainBtn = document.getElementById('play_again_btn')



// initGame();


window.addEventListener('load', () => {
    
    document.getElementById('restart_game_btn').addEventListener('click', () => {
        clearInterval(gameSettings.gameTimerInterval)
        storeUserDataLocal('', false)
        initGameAnim()
    })
    storeEmoEle.addEventListener('drop', (e) => {
        // console.log('drop hit')
        if( storeEmoEle.querySelector('img') ) {
            popup_alert('Space Not Empty', 'warning');
            return;
        }
        storeEmoEle.innerHTML = gameSettings.draggingEle.parentElement.parentElement.innerHTML
        gameSettings.draggingEle.parentElement.parentElement.innerHTML = ''
        setDragEventOnEle( storeEmoEle.querySelector('.emo_item') )
    })
    storeEmoEle.addEventListener('dragover', (e) => {
        e.preventDefault();
    })
    startGameBtn.addEventListener('click', ()=> {
        hideMessages()
        initGameAnim()
    })
    restartLevelBtn.addEventListener('click', ()=> {
        clearInterval(gameSettings.gameTimerInterval)
        hideMessages()
        initGame();
    })
    playAgainBtn.addEventListener('click', ()=> {
        let searchData = levelData.find((el) => el.level == gameSettings.level)
        gameSettings.score -= searchData.row * searchData.col * gameSettings.pointPerCell
        gameSettings.level--
        storeUserDataLocal({
            level : gameSettings.level,
            score : gameSettings.score
        })
        hideMessages()
        initGameAnim()
    })
    playNextLevelBtn.addEventListener('click', ()=> {
        hideMessages()
        initGameAnim()
    })

    

})

/* ======== functions ======== */

function parseEmoji( emoji ) {
    if(!twemoji) return;
    let img = ''
    twemoji.parse(emoji, {
        callback: (icon, options) => {
            img = ''.concat(
                options.base,
                options.size,
                '/',
                icon,
                '.svg'
            )
        },
        folder: 'svg',
    })   
    return img;
}
function popup_alert( message, type = '' ) {

    console.log(message)
    return

    let c = 'style="background-color:#e2631c54;"';
    if(message == '') return false;
    else if(type == 'success') c = 'style="background-color:#42c727;"';
    else if(type == 'warning') c = 'style="background-color:#fd536c;"';
    $('#popup-alert-container').prepend(`<div ${c} class="popup-alert">${message}</div>`).show();
    $('.popup-alert').fadeIn(100).delay(3500).fadeOut(1000, function(){ $(this).remove(); });
}
function addZeroBefore( num ) {
    if( num > 9 ) return num;
    return '0' + String(num)
}
function storeUserDataLocal( data, stringify = true ) {
    data = stringify ? JSON.stringify(data) : data
    localStorage.setItem('__CMData', data);
}
function setUserData() {
    let data = localStorage.getItem('__CMData')
    data = data ? JSON.parse(data) : {
        level : 1,
        score : 0
    }
    storeUserDataLocal( data )
    gameSettings.level = data.level
    gameSettings.score = data.score
}
function initGame() {
    setUserData()
    let level = gameSettings.level
    let searchData = levelData.find((el) => el.level == level)
    let row = searchData.row
    let col = searchData.col
    gameSettings.levelTime = searchData.time
    gameSettings.startTime = Math.floor(Date.now() / 1000)
    gameSettings.endTime = gameSettings.startTime + gameSettings.levelTime

    createNewPicArr(row, col)
    createTable(row, col)
    setGameTimer()
    gameSettings = {
        ...gameSettings,
        itemRemains : row * col,
        totalItems : row * col,
    }
    scoreEle.innerText = gameSettings.score
    totalItemsEle.innerText = gameSettings.totalItems
    itemRemainsEle.innerText = gameSettings.itemRemains
    levelEle.innerText = gameSettings.level
    storeEmoEle.innerText = ''
}

function setGameTimer() {
    clearInterval(gameSettings.gameTimerInterval)
    loopGameTimer()
    gameSettings.gameTimerInterval = setInterval(loopGameTimer, 1000)

}
function loopGameTimer() {
    let now = Math.floor(Date.now() / 1000)
    let remaining = gameSettings.endTime - Math.floor(Date.now() / 1000)
    let m, s;
    if( remaining < 0 ) {
        gameOver();
        return
    }
    if( remaining < 0 ) {
        m = 0;
        s = addZeroBefore(remaining)
    }
    else {
        m = parseInt(remaining / 60)
        s = addZeroBefore(remaining % 60)
    }
    timerMinEle.innerText = m
    timerSecEle.innerText = s
}

function createNewPicArr( row = 2, col = 2 ) {
    let indexArr = [], thisIndex, totalCell = row * col, picArrTemp = [];
    for( let i = 0; i < totalCell; i++ ) {
        while( true ) {
            thisIndex = getRandomNumber() % totalPic
            if( indexArr.indexOf(thisIndex) == -1  ) break;
        }
        if( gameSettings.emojiType == 'emo' ) {
            gamePics.push( pics[thisIndex] )
            gamePics.push( pics[thisIndex] )
            gamePics.push( pics[thisIndex] )
        }
        else if( gameSettings.emojiType == 'twimoji' ) {
            gamePics.push( parseEmoji(pics[thisIndex]) )
            gamePics.push( parseEmoji(pics[thisIndex]) )
            gamePics.push( parseEmoji(pics[thisIndex]) )
        }
    }
    for (let i = gamePics.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gamePics[i], gamePics[j]] = [gamePics[j], gamePics[i]];
    }
}

function getRandomNumber() {
    return parseInt( Math.random() * 100000000 )
}

function createTable( row, col) {
    let html = ''
    for( let cR = 0; cR < row; cR++ ) {
        html += `<div class="row">`
        for( let cC = 0; cC < col; cC++ ) {
            if( gameSettings.emojiType == 'emo' ) {
                html += `
                    <div class="cell_cont">
                        <div class="cell flex" row="${cR + 1}" col="${cC + 1}" pos="1">
                            <span class="emo_item" draggable="true">${gamePics.pop()}</span>
                        </div>
                        <div class="cell flex" row="${cR + 1}" col="${cC + 1}" pos="2">
                            <span class="emo_item" draggable="true">${gamePics.pop()}</span>
                        </div>
                        <div class="cell flex" row="${cR + 1}" col="${cC + 1}" pos="3">
                            <span class="emo_item" draggable="true">${gamePics.pop()}</span>
                        </div>
                    </div>
                `
            }
            else if( gameSettings.emojiType == 'twimoji' ) {
                html += `
                    <div class="cell_cont">
                        <div class="cell flex" row="${cR + 1}" col="${cC + 1}" pos="1">
                            <span class="emo_item flex" draggable="true">
                                <img src="${gamePics.pop()}">
                            </span>
                        </div>
                        <div class="cell flex" row="${cR + 1}" col="${cC + 1}" pos="2">
                            <span class="emo_item flex" draggable="true">
                                <img src="${gamePics.pop()}">
                            </span>
                        </div>
                        <div class="cell flex" row="${cR + 1}" col="${cC + 1}" pos="3">
                            <span class="emo_item flex" draggable="true">
                                <img src="${gamePics.pop()}">
                            </span>
                        </div>
                    </div>
                `
            }
        }
        html += `</div>`
    }
    gameTableEle.innerHTML = html
    document.querySelectorAll('.emo_item').forEach((tableEmoji) => {
        setDragEventOnEle(tableEmoji)
    })
}

function setDragEventOnEle( tableEmoji ) {
    tableEmoji.addEventListener('dragstart', (e) => {
        // let isStoreEleEmpty = storeEmoEle.innerText == ''
        gameSettings.draggingEle = e.target
        console.log('gameSettings.draggingEle =>> ', gameSettings.draggingEle)
        let dropFound = false;
        gameTableEle.querySelectorAll('.cell').forEach((dropTableCell) => {
            if( dropFound ) return;
            dropTableCell.addEventListener('dragover', (e) => {
                e.preventDefault();
            })
            dropTableCell.addEventListener('drop', tableCellDropHandler)
        })
    })
}
function tableCellDropHandler(e) {
    let dropTargetEle = e.target
    console.log('drop hit, dropTargetEle ==>> ', dropTargetEle, e, dropTargetEle.hasChildNodes())
    dropFound = true;
    if( 
        dropTargetEle.nodeName != 'DIV' || 
        ( dropTargetEle.nodeName == 'DIV' && dropTargetEle.querySelector('img') )
    ) {
        // console.log('drop hit', e.target, dropTargetEle)
        popup_alert('Space Not Empty', 'warning');
        return;
    }

    let abc = gameSettings.draggingEle.parentElement.parentElement.innerHTML
    console.log('abc =>> ', abc)
    dropTargetEle.innerHTML = gameSettings.draggingEle.parentElement.parentElement.innerHTML
    gameSettings.draggingEle.parentElement.parentElement.innerHTML = ''
    // console.log('dropped emo ==> ', dropTargetEle.querySelector('.emo_item'))
    setDragEventOnEle( dropTargetEle.querySelector('.emo_item') )
    // setDragEventOnEle( document.querySelector('.emo_item') )

    gameSettings.droppedCell = dropTargetEle
    calculateGameScore()

    /* removing handler */

    gameTableEle.querySelectorAll('.cell').forEach((dropTargetEle) => {
        dropTargetEle.removeEventListener('drop', tableCellDropHandler)
    })
}


function calculateGameScore() {
    let droppedCell = gameSettings.droppedCell
    if( ! droppedCell.getAttribute('pos') ) {
        return
    }


    /* ===== checking matches [need to change later] ===== */

    /* -- optimised -- */

    // let emoItems = droppedCell.parentElement.querySelectorAll('.emo_item')
    // if( emoItems.length != 3 ) {
    //     return
    // }
    // if( emoItems[0].innerText != emoItems[1].innerText ||
    //     emoItems[1].innerText != emoItems[2].innerText ||
    //     emoItems[2].innerText != emoItems[0].innerText
    // ) {
    //     console.log('cell not set')
    //     return
    // }

    /* -- optimised -- */

    let itemRemains = gameSettings.totalItems;
    gameTableEle.querySelectorAll('.cell_cont').forEach((cellCont) => {
        let emoItems = cellCont.querySelectorAll('.emo_item')
        if( emoItems.length != 3 ) {
            cellCont.removeAttribute('cell-set');
            return
        }
        if( emoItems[0].innerHTML != emoItems[1].innerHTML ||
            emoItems[1].innerHTML != emoItems[2].innerHTML ||
            emoItems[2].innerHTML != emoItems[0].innerHTML
        ) {
            cellCont.removeAttribute('cell-set');
            return
        }
        itemRemains--
        cellCont.setAttribute('cell-set', "true");
    })    

    /* ===== checking matches [need to change later] ===== */


    gameSettings.itemRemains = itemRemains

    itemRemainsEle.innerText = itemRemains

    if( itemRemains == 0 ) {
        clearInterval(gameSettings.gameTimerInterval)
        setTimeout(endGame, 2000)
    }


}

function endGame() {
    let searchData = levelData.find((el) => el.level == gameSettings.level)
    gameSettings.score += searchData.row * searchData.col * gameSettings.pointPerCell
    gameSettings.level++
    storeUserDataLocal({
        level : gameSettings.level,
        score : gameSettings.score
    })
    levelUpContEle.style.display = 'flex'
    // initGameAnim()
}
function initGameAnim() {
    gameStartAnimEle.style.display = 'flex'
    gameSettings.initGameAnimInterval = setInterval(()=> {
        let count = parseInt(nextLevelCounterEle.innerText)
        count--
        if( count == 0 ) {
            clearInterval( gameSettings.initGameAnimInterval )
            initGame()
            hideMessages()
            nextLevelCounterEle.innerText = '3'
            return
        }
        nextLevelCounterEle.innerText = count
    }, 1000)
}

function gameOver() {
    clearInterval(gameSettings.gameTimerInterval)
    gameOverEle.style.display = 'flex'
    popup_alert('game over', 'warning')
}
function hideMessages() {
    document.querySelectorAll('.end_msg_cont').forEach((ele) => {
        ele.style.display = 'none'
    })
}

