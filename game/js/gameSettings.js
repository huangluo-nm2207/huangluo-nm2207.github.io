//---- container start ----
const container = document.getElementById("game-container");
const noticeDiv = document.getElementById("notice");
var containerStyle = window.getComputedStyle(container);
// containerstyle window means is the thing that is displayed 
// pareInt is to change containerWidth to number
var containerWidth = parseInt(containerStyle.width);

//derive grid size from initial container size
// 切一下高度让container里面看起来大小合适
const gridDivider = 20;
// math 是个library, floor means always round down
// containerStyle.height 要用parseInt because it is written by css aka str -> so need to make it integar
const gridSize = Math.floor(parseInt(containerStyle.height) / gridDivider);
const containerHeight = gridSize * gridDivider;

//step is the step taken to break down every movement
//move half grid at a time
//set step to gridSize/4 to avoid failing to check for collision， if dont have will just ignore the gaps lol

// 每掉1/4格，都需要check collision, 要不然会掉出去卡在格子里面
const step = Math.floor(gridSize / 4);
// const step = gridSize*2

//---- container end ----

//---- player start ----
//player object will be initialized in Map Class when player is rendered
var player;
player = new Player();

//---- player end ----//

//---- map start ----//

//game initial settings
//render the html with the respective char
/*
"=" : concret
"@" : player
"T" : target

*/
const LEVELS = {
    0: [
        "=",
        "                                 == ",
        "                                   == ",
        " @ =                            T== ",
        "====  ===================================",
        "====  ==================================="
    ]
};

const map = new Map();
map.renderLevel();
//---- map end ----//

//start moving when key pressed
document.addEventListener("keydown", (event) => {
    //Boolean value of left and right to the variable isToRight
    // consloe log 可以看是什么key被按了
    console.log(event.key)
    if (!event.repeat) {
        switch (event.key) {
            case "ArrowLeft":
                // Left
                player.moving("LEFT");
                break;
            case "ArrowRight":
                // Right
                player.moving("RIGHT");
                break;
            case "ArrowUp":
                // Up
                player.jump();
                break;
        }
    }
})

//stop moving when stop pressing key
document.addEventListener("keyup", (event) => {
    //Boolean value of left and right to the variable isToRight
    //Do not respond to keydown event if the event is triggered automatically by pressing the key

    switch (event.key) {
        case "ArrowLeft":
            // Left
            player.stopMoving("LEFT");
            break;
        case "ArrowRight":
            // Right
            player.stopMoving("RIGHT");
            break;
    }

})

//general functions that changes the display
// 把notice放出来，“graduation blabla"
function notice(content) {
    noticeDiv.innerHTML = content;
    noticeDiv.style.display = "block";
}

// 把notice 藏起来
function noticeDown() {
    noticeDiv.innerHTML = "";
    noticeDiv.style.display = "none";
}
