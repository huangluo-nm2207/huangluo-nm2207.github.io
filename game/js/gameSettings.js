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
            "                                == ",
            "                             == ",
            "                             == ",
            "                             == ",
            "                             == ",
            "                             == ",
            "                   Q         == ",
            "                    ==  T    == ",
            "  @      ==         ===== ",
            "====  ==============S====",
            "====  ===================="
        ],
        settings: {
            successText: "Entering Kindergarten...",
            backgroundImage: "kinderkid.jpg",
            title: "Try Jump Around",
            tip: "Press &larr;&uarr;&rarr; to move; Hit the treasure box with your head to get a HEART <3",
        }
    },
    1: {
        map: [
            "                                             == ",
            "                                             == ",
            "                                             == ",
            "                                             == ",
            "            Q                        T      == ",
            "                   ====                     == ",
            "                                             ==",
            "           ====          ====               ==",
            " @       ====                 P    ====     == ",
            "===      M====                   ===== =====",
            "=======  =  =   ==  =  =   =  =  =  =    ====="
        ],
        settings: {
            title: "You are in kindergarten now! ",
            tip: "Try jumping onto the monsters to kill them!(Sometimes you need to try twice.)",
            backgroundImage: "kinderkid.jpg",
            successText: "Entering Primary School...",
            bgm: "dance-mood.mp3",
            volume: 0.06
        }
    },
    2: {
        map: [
            "   @               Q                          ",
            " ===      =====         F           T          ",
            "           ====                   ",
            "                =========                    ",
            "                                               ",
            "                                               ",
            "                                         E      ",
            "                                              ",
            "                              R               ",
            "====    M    M    M  M    ==========JJJ========",
            "==========================================="
        ],
        settings: {
            title: "You got into a good primary school, but do not slack!",
            tip: "Jump to kill the distractions!",
            successText: "Entering Secondary School...",
            bgm: "funk-in-the-trunk.mp3",
            backgroundImage: "prisch.png",
        }
    },
    3: {
        map: [
            "   ==                                      == ",
            "     ======         F                       == ",
            "                                          @  == ",
            "                            J==           == ",
            "              ===              ==          == ",
            "       ===          E       ==        ==       ",
            "                                        =E      ",
            "              = = = = =        ==             == ",
            "  T                             R  ==         == ",
            "====     ====                       ============",
            "====     ====        F              ======="
        ],
        settings: {
            title: "Haiyaaaa, your vision is blurred because study too much!)",
            tip: "Oops. Careful not to jump too high up!",
            backgroundImage: "chungchengpic.jpg",
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
            title: "Junior College already eh! ",
            tip: "I know you wanna sleep all the time, but stay awake!",
            successText: "Now, you are at NUS...",
            backgroundImage: "nyjc1.webp",

        }
    },
    5: {
        map: ["             ==      ==  T   ",
            "       F      ==      ==      ",
            "             ==    C  ==      ",
            "  C           ==      ==      ",
            "                 ==      ",
            "       C        ==  C   ",
            "                         ",
            " @                 E       ==  M     = ",
            "============       ==============     =",
            "===          ========================  ==="
        ],
        settings: {
            title: "Say HELLO to the NUS chicken!",
            tip: "NUS student life is tough...",
            backgroundImage: "background.webp"
        }
    },
    6: {
        map: ["             ==           ==      ",
            "                          ==      ",
            "                  C     ==      ",
            "  ==    ==== ==    T     ==      ",
            "                 ==      Q ",
            "       Q  M         ==      ",
            "                ==         ",
            " @      = M =            M     = ",
            "============       ==============     =",
            "===          ========================  ==="
        ],
        settings: {
            title: "Woosh, soon you will start internship!",
            tip: "Happy or not? ",
            backgroundImage: "background2.webp"
            //  change to some nus background, took pictures at Utown green with my own camera yay
        }
    },
    7: {
        map: ["             ==         @ ==      ",
            "  T   C       ==        =====     ",
            "                  C           ",
            "  ==    ==== ==               ",
            "                            Q ",
            "       Q  M             F                ",
            "                ==           ",
            "         M =            M=== ===  F   === ",
            "=T=J =======       =========     ===== T  =",
            "===          ========================  ==="
        ],
        settings: {
            title: "Oh my! Oh My! NUS life is so busy",
            tip: "There is more than one way to success",
            backgroundImage: "background3.webp"
        }
    },
    8: {
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
    }
    // level will overwrite previous, for bug-testing
    //, 0: {
    //     map: [
    //         "               FE",
    //         "          CQ   ==",
    //         "",
    //         "                   RP  T",
    //         "=@         =M W ========    ",
    //         "=====J=========="
    //     ],
    //     settings: {
    //         title: "Big Moon!",
    //         titleColor: "lightgrey",
    //         tip: "You will soar higher this time!",
    //         tipColor: "lightgrey",
    //         // feel lighter
    //         // gravity: Math.floor(gridSize * 0.08),
    //         backgroundImage: "moon-background.webp"
    //     }
    // }
};

const map = new Map();
map.renderLevel();
//---- map end ----//

//start moving when key pressed
document.addEventListener("keydown", (event) => {
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