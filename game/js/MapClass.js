//map class
class Map {
    //record current level number
    currentLevel = 0;

    // to store initial location of player
    playerInitX = false;
    playerInitY = false;

    //the points that the map will move together with the character
    //to keep the user at the center of the container
    threshold = {
        //map moves left when left threshold is met by player
        "LEFT": (containerWidth - player.width) / 2,
        //map moves right when right threshold is met by player
        //this value will be added when the map is rendered
        "RIGHT": 0,
        //map moves vertically when the threshold is met by player
        "BOTTOM": Math.floor(gridDivider / 3) * gridSize,
        "TOP": Math.floor(gridDivider * 2 / 3) * gridSize
    }

    //map html contents
    div = document.getElementById("map");
    background = document.getElementById("background");

    //map axies
    left = 0;
    bottom = 0;

    //lock map initialization
    initialiseLock = false;

    //flag to show if map is rendered
    mapExist = false

    //map boundaries
    bound = {}

    //default map settings
    defaultSettings = {
        title: "This is a very easy game </br> Try jump arround and reach the rainbow! " +
            "<img src='resource/rainbow.png' width='" + gridSize + " height='" + gridSize + "'>",
        titleColor: "#581845",
        tip: "Press &larr;&uarr;&rarr; to move",
        tipColor: "#581845",
        gravity: Math.floor(gridSize * 0.2),
        backgroundImage: "background.webp",
        successText: "loading to the next stage ...",
        healthColor: "#581845",
        bgm: "default.mp3",
        volume: 0.1,
        outline: "white"
    }

    //---- blocks start ----
    // A list the contains all blocks exist in this level
    // loop to test for collision for every action
    allBlocks = [];

    //---- blocks end ----

    //the text to show when successfully pass the level
    defaultSuccessText = "Getting to the next level..."
    successText = "Getting to the next level...";

    //to store the bgm audio
    bgm = false;
    canPlayBGM = false;


    renderLevel(level = this.currentLevel) {

        //when getting to a new level, load curtain and headline to transit
        if (this.currentLevel < level) {
            //show successful notice when no next level
            //else show curtain and transit to the next level
            if (!LEVELS.hasOwnProperty(level)) {
                //there is no next level
                //show notice of winning
                if (this.settings.successText) {
                    var endingSuccessText = this.settings.successText;
                } else {
                    var endingSuccessText = "<p>" +
                        ":->" + "<br/>" +
                        "You graduated from NUS!" +
                        "</p>"
                }
                //show notice
                notice(endingSuccessText, "dancing.gif");

                //set winning bgm
                this.setBGM("sound-effect/winning.mp3", 1, true);

            } else {


                //bgm for changing level
                this.setBGM("sound-effect/changing-level.mp3", 1, false);
                //load text into curtain headline
                document.getElementById("curtain-headline").innerHTML = this.successText;
                //cover with curtain when is loading next level
                document.getElementById("curtain").style.opacity = "1";
                this.currentLevel = level;
                this.initialiseLock = true;

                //and load new level after 2 second
                setTimeout(() => {
                    this.renderLevel()

                    //remove the curtain and initialize everyone after another 1 second
                    setTimeout(() => {
                        document.getElementById("curtain").style.opacity = "0";

                        this.initialiseLock = false;
                        this.initialise();

                    }, 1000)
                }, 2 * 1000)

            }
        } else {

            //delete all blocks
            this.allBlocks.forEach((block) => {
                block.div.remove();

                if (block.type === "MONSTER") {
                    // if is a monster, kill the monster
                    block.die();
                }

            })

            //clear all blocks recorded
            this.allBlocks = [];

            //set current level
            this.currentLevel = level;

            //get map of current level
            var currentMap = LEVELS[level].map;

            //local setting from map as well
            this.loadSettings()

            //to record the width of map by number of grid
            var maxLineLength = 0;

            // render blocks
            // read each line
            // the variable y is the y-grid position of the blocks in map
            for (var y = 0; y < currentMap.length; y++) {

                // render the level from bottom, thus reverse the order
                // because in the map list, the bottom rows of the map is towards the end of list elements
                // the index of last item in list is length-1, whereas the first element is 0
                // so we read from (length - 1) to 0
                var line = currentMap[currentMap.length - 1 - y];

                //update longest line length
                if (maxLineLength < line.length) {
                    maxLineLength = line.length
                }

                for (var x = 0; x < line.length; x++) {
                    //get character
                    var char = line.charAt(x);

                    //render the html with the respective char
                    /*
                    "=" : concret
                    "@" : player
                    "T" : target
                    "Q" : treasure
                    "J" : jumping block (force jump to 1.5 jump velocity)
                    "M" : regualr monster
                    "W" : regular monster move in Y direction
                    "R" : rapid monster
                    "P" : rapid monster move in Y direction
                    "F" : range monster
                    "E" : range monster move in Y direction
                    "C" : chicken monster

                    */
                    switch (char) {
                        case "=":
                            // concret block
                            // and add block to allBlocks array
                            // so that we can loop through the array for collision detection
                            this.allBlocks.push(new Block(x, y));
                            break;
                        case "@":
                            //player
                            this.playerInitX = x * gridSize;
                            this.playerInitY = y * gridSize;
                            break;
                        case "T":
                            //target
                            this.allBlocks.push(new Block(x, y, "TARGET", false))
                            break;
                        case "J":
                            //target
                            this.allBlocks.push(new Block(x, y, "JUMP"))
                            break;
                        case "Q":
                            //target
                            this.allBlocks.push(new Treasure(x, y))
                            break;
                        case "M":
                            //regular monster
                            this.allBlocks.push(new Monster(x, y, "REGULAR", "X"))
                            break;
                        case "W":
                            //regular monster but move up down
                            this.allBlocks.push(new Monster(x, y, "REGULAR", "Y"))
                            break;
                        case "R":
                            //rapid monster
                            this.allBlocks.push(new Monster(x, y, "RAPID", "X"))
                            break;
                        case "P":
                            //rapid monster but move up down
                            this.allBlocks.push(new Monster(x, y, "RAPID", "Y"))
                            break;
                        case "F":
                            //range monster
                            this.allBlocks.push(new Monster(x, y, "RANGE", "X"))
                            break;
                        case "E":
                            //range monster but move up down
                            this.allBlocks.push(new Monster(x, y, "RANGE", "Y"))
                            break;
                        case "C":
                            //chicken monster but move up down
                            this.allBlocks.push(new Monster(x, y, "CHICKEN", "X"))
                            break;
                    }
                }
            }

            //---- create boundaries ----//
            //calculate the width of map

            this.bound.left = 0;
            //the bound right is with reference to player.left
            //so -1 gridsize to compensate with player width
            this.bound.right = maxLineLength * gridSize;
            //if right bound smaller than container width, use container width
            if (this.bound.right < containerWidth) {
                this.bound.right = containerWidth
            }
            this.bound.bottom = 0;

            //give top a slack of half contianer height
            this.bound.top = currentMap.length * gridSize + containerHeight / 2;
            // if top bound still smaller than container, then use container height
            if (this.bound.top < containerHeight) {
                this.bound.top = containerHeight
            }

            //threshold right is the width of map - the center point of container
            //minus a player width in the center for the player to stay in
            this.threshold.RIGHT = this.bound.right - this.threshold.LEFT - player.width

            //reshape the map element based on content
            this.div.style.width = this.bound.right + "px";
            this.div.style.height = this.bound.top + "px";

            //if no lock, initialize the map
            if (!this.initialiseLock) {
                this.initialise();
            }
        }
    }

    initialise() {
        //initiate player and monsters after the rest of the map has rendered
        if (this.playerInitX && this.playerInitY) {
            console.log("initiating");
            //if player axies are set
            player.initiate(this.playerInitX, this.playerInitY);

            this.allBlocks.forEach((block) => {
                //initialize if type is monster
                if (block instanceof Monster) {
                    block.initialise();
                }
            });
        } else {
            alert("No player specified in map")
        }
    }

    //available level settings:
    //settings{title, tip, gravity,background}
    loadSettings() {

        this.settings = LEVELS[this.currentLevel].settings

        if (this.settings) {

            //if there is setting
            if (this.settings.title) {
                document.getElementById("title").innerHTML = this.settings.title;
            } else {
                document.getElementById("title").innerHTML = this.defaultSettings.title;
            }

            if (this.settings.titleColor) {
                document.getElementById("title").style.color = this.settings.titleColor;
            } else {
                document.getElementById("title").style.color = this.defaultSettings.titleColor;
            }

            if (this.settings.tip) {
                document.getElementById("tip").innerHTML = this.settings.tip;
            } else {
                document.getElementById("tip").innerHTML = this.defaultSettings.tip;
            }

            if (this.settings.tipColor) {
                document.getElementById("tip").style.color = this.settings.tipColor;
            } else {
                document.getElementById("tip").style.color = this.defaultSettings.tipColor;
            }

            if (this.settings.outline) {
                var outlineStyleText = "-1px 1px 0 " + this.settings.outline +
                    ", 1px 1px 0 " + this.settings.outline +
                    ", 1px -1px 0 " + this.settings.outline +
                    ", -1px -1px 0 " + this.settings.outline;

                document.getElementById("tip").style.textShadow = outlineStyleText;
                document.getElementById("title").style.textShadow = outlineStyleText;
                document.getElementById("life-value").style.textShadow = outlineStyleText;
            } else {
                var outlineStyleText = "-1px 1px 0 " + this.defaultSettings.outline +
                    ", 1px 1px 0 " + this.defaultSettings.outline +
                    ", 1px -1px 0 " + this.defaultSettings.outline +
                    ", -1px -1px 0 " + this.defaultSettings.outline;

                document.getElementById("tip").style.textShadow = outlineStyleText;
                document.getElementById("title").style.textShadow = outlineStyleText;
                document.getElementById("life-value").style.textShadow = outlineStyleText;
            }

            if (this.settings.gravity) {
                this.gravity = this.settings.gravity;
            } else {
                this.gravity = this.defaultSettings.gravity;
            }

            if (this.settings.backgroundImage) {
                this.div.style.backgroundImage = 'URL("resource/' + this.settings.backgroundImage + '")';
            } else {
                //remove backgroundImage
                this.div.style.backgroundImage = 'URL("resource/' + this.defaultSettings.backgroundImage + '")';
            }

            if (this.settings.healthColor) {
                document.getElementById("life-value").style.color = this.settings.healthColor
            } else {
                //if color property has content
                document.getElementById("life-value").style.color = this.defaultSettings.healthColor

            }

            if (this.settings.successText) {
                this.successText = this.settings.successText;
            } else {
                this.successText = this.defaultSuccessText;
            }



            // for most modern browsers today
            // we cannot play audio before any user interaction 
            // so we only play audio when user interats with the browser
            // we will use the 'keydown' event to set canPlayBGM to true
            // meaning audio plays when user trying to move the player

            if (canPlayBGM) {
                this.setBGM();
            }


        }
    }

    setBGM(bgm = false, volume = null, loop = true) {
        //audio setting
        // remove audio if is set
        // the audio is a <audio > tag created in js, so we use remove() to remove the old audio tag
        if (this.bgm) {
            //stop the old music
            this.bgm.pause();
        }

        if (volume == null) {
            if (this.settings.volume) {
                volume = this.settings.volume;
            } else {
                volume = this.defaultSettings.volume;
            }
        }

        //if bgm is set
        if (bgm) {
            this.bgm = playAudio(bgm, volume, loop);
        } else {
            //then we set the bgm again
            if (this.settings.bgm) {
                this.bgm = playAudio(this.settings.bgm, volume, loop);
            } else {
                this.bgm = playAudio(this.defaultSettings.bgm, volume, loop);
            }
        }



    }

    updateX() {
        if (player.left <= this.threshold.LEFT) {
            var newX = 0;
        } else if (player.left <= this.threshold.RIGHT) {
            var newX = this.threshold.LEFT - player.left;
        } else {
            //let the map move back the following value will allow the map to align right to the container
            var newX = containerWidth - this.bound.right;
        }

        if (this.left != newX) {
            this.left = newX;
            this.div.style.left = newX + "px";
        }
    }


    updateY() {

        //this.threshold.BOTTOM is to trigger map movement when user is below this.threshold.BOTTOM in the container
        //this bottom threshhold is the threshold for the map to move upwards
        //this bottom threshold is the actual distance from the bottom of the map to the this.threshold.BOTTOM of the container
        //because map "elevates" when map moves down, thus, this.bottom will be negative number
        //so to add threshold with current Y position, use minus this.bottim
        var bottomMovementThreshold = this.threshold.BOTTOM - this.bottom;

        if (player.bottom < bottomMovementThreshold) {
            var newY = this.threshold.BOTTOM - player.bottom;
        }

        var topMovementThreshold = this.threshold.TOP - this.bottom;

        if (player.bottom > topMovementThreshold) {
            var newY = this.threshold.TOP - player.bottom;
        }

        //if newY is no created or bigger than 0
        //because mapY only elevates upwards, so newY is always negative or 0
        if (!newY || newY > 0) {
            var newY = 0;
        }

        if (newY && this.bottom != newY) {
            this.bottom = newY;
            this.div.style.bottom = newY + "px";
        }

    }
}