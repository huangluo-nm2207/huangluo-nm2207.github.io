//---- container start ----
const container = document.getElementById("game-container");
var containerStyle = window.getComputedStyle(container);
// containerstyle window means is the thing that is displayed 
// pareInt is to change containerWidth to number
var containerWidth = parseInt(containerStyle.width);

//derive grid size from initial container size
// 切一下高度让container里面看起来大小合适
const gridDivider = 20;
// math 是个library, floor means always round down
const gridSize = Math.floor(parseInt(containerStyle.height) / gridDivider);
const containerHeight = gridSize * gridDivider;

//step is the step taken to break down every movement
//move half grid at a time
//set step to gridSize/4 to avoid failing to check for collision， if dont have will just ignore the gaps lol
const step = Math.floor(gridSize / 4);

//---- container end ----

//---- player start ----
//player object will be initialized in Map Class when player is rendered
var player;
player = new Player();

//---- player end ----//

//---- map start ----//

//game initial settings
//available level settings:
//settings{
//    title,
//    titleColor, 
//    tip, 
//    tipColor, 
//    gravity, 
//    backgroundImage, 
//    successText, 
//    bgm, 
//    volume, 
//    healthColor, 
//    outline
//}
//volume is for the bgm, ranging from 0~1
//render the html with the respective char
/*
"=" : concret
"@" : player
"T" : target
"J" : jump box
"M" : regualr monster
"W" : regular monster move in Y direction
"R" : rapid monster
"P" : rapid monster move in Y direction
"F" : range monster
"E" : range monster move in Y direction
"C" : chicken monster

*/
const LEVELS = {
    0: {
        map: [
            "                                   == ",
            "                                   == ",
            "                                   == ",
            "                                   == ",
            "                                   == ",
            "                                   == ",
            "                         Q         == ",
            "                                   == ",
            " @                             M  T== ",
            "===J  ==================================",
            "====  =================================="
        ],
        settings: {
            successText: "Entering Kindergarten..."
        }
    },
    1: {
        map: [
            "                                             == ",
            "                                             == ",
            "                                             == ",
            "                                             == ",
            "                                      T      == ",
            "                                             == ",
            "                                      Q      ==",
            "                                             ==",
            " @                                           == ",
            "===================================== =====",
            "====  =  =  =   ==  =  =   =  =  =  =    ====="
        ],
        settings: {
            title: "You are in kindergarten now! ",
            tip: "You must not fall to the ABYSSSSSS!",
            successText: "Entering Primary School...",
            bgm: "dance-mood.mp3",
            volume: 0.06
        }
    },
    2: {
        map: [
            "   == T                                        ",
            "     ======         F                          ",
            "           =================          Q        ",
            "                             ==                ",
            "                               ==              ",
            "                                 ==            ",
            "                                     ==  E      ",
            "                                   ==         ",
            " @                             R  ==   R       ",
            "====    M    M    M  M    =====================",
            "==========================================="
        ],
        settings: {
            title: "You got into a good primary school, but do not slack!",
            tip: "Jump to kill the distractions!",
            successText: "Entering Secondary School...",
            bgm: "funk-in-the-trunk.mp3"
        }
    },
    3: {
        map: [
            "   == T                                     == ",
            "     ======         F                       == ",
            "           =================               == ",
            "                             ==           == ",
            "                               ==          == ",
            "                                 ==        == ",
            "                                     ==  E   == ",
            "                                   ==         == ",
            " @                             R  ==         == ",
            "===========================================",
            "==========================================="
        ],
        settings: {
            title: "You got into a good secondary school, time is precious!",
            tip: "Jump to kill the distractions!",
            successText: "Entering Junior College..."
        }
    },
    4: {
        map: [
            "   == T                                     == ",
            "     ======                                == ",
            "           =================               == ",
            "                             ==           == ",
            "     =============================== ==          == ",
            "              W     W   W   W    w    ==        == ",
            "        W  W   W   W     W    W                == ",
            "      W   W     W   W   W      W          ==         == ",
            " @       W  W    W    W          W       ==         == ",
            "===========================================",
            "==========================================="
        ],
        settings: {
            title: "You got into a good Junior College, keep on for a good University!",
            tip: "I know you wanna sleep all the time, but stay awake!",
            successText: "Now, you are at NUS..."
        }
    },
    5: {
        map: ["             ==      ==  T   ",
            "       F      ==      ==      ",
            "             ==      ==      ",
            "            ==      ==      ",
            "                 ==      ",
            "  Q             ==      ",
            "                 ==      ",
            " @                 E       ==  M     = ",
            "============       ==============     =",
            "===          ========================  ==="
        ],
        settings: {
            title: "Try Jump Around",
            tip: "Press &larr;&uarr;&rarr; to move",
            backgroundImage: "background.webp"
        }
    },
    6: {
        map: ["             ==           ==      ",
            "              ==          ==      ",
            "   C          ==        T  ==      ",
            "            ==          ==      ",
            "                 ==      Q ",
            "          Q         ==      ",
            "                 ==      ",
            " @      = M =        ==  M     = ",
            "============       ==============     =",
            "===          ========================  ==="
        ],
        settings: {
            title: "Try Jump Around",
            tip: "Press &larr;&uarr;&rarr; to move",
            backgroundImage: "background.webp"
            // will change to some nus background 
        }
    },
    7: {
        map: ["=@                                  T    ",
            "================"
        ],
        settings: {
            title: "More challenges awaiting you...",
            titleColor: "lightgrey",
            tip: "You will soar higher this time!",
            tipColor: "lightgrey",
            // feel lighter
            gravity: Math.floor(gridSize * 0.08),
            backgroundImage: "moon-background.webp"
        }
    },
    0: {
        map: [
            "               FE",
            "          CQ   ==",
            "",
            "                   RP  T",
            "=@         =M W ========    ",
            "=====J=========="
        ],
        settings: {
            title: "Big Moon!",
            titleColor: "lightgrey",
            tip: "You will soar higher this time!",
            tipColor: "lightgrey",
            // feel lighter
            // gravity: Math.floor(gridSize * 0.08),
            backgroundImage: "moon-background.webp"
        }
    }
};

const map = new Map();
map.renderLevel();
//---- map end ----//

//start moving when key pressed
document.addEventListener("keydown", (event) => {
    //Boolean value of left and right to the variable isToRight
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

            case " ":
                // space
                // restart if player dead
                if (player.isDead) {
                    noticeDown();
                    player.life = 5;
                    map.renderLevel();
                }
                break;
        }
    }

    if (!canPlayBGM) {
        //many browser by default, they dont let you play music until the user has done something
        //if cannot play bgm yet
        //means user not yet interacted before this current keydown
        //so set the play bgm to allowed
        //and also set and play the bgm

        canPlayBGM = true;
        map.setBGM();
    }
})

//stop moving when stop pressing key
document.addEventListener("keyup", (event) => {
    //Boolean value of left and right to the variable isToRight
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