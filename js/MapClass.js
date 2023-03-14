//map class
class Map {

    currentLevel = 0;

    //flag to show if map is rendered
    mapExist = false

    // to store initial location of player
    playerInitX = false;
    playerInitY = false;

    //the points that the map will move together with the character
    //to keep the user at the center of the container
    threshold = {
        //map moves left when left threshold is met by player
        "LEFT": (containerWidth - gridSize) / 2,
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

    //map boundaries
    bound = {}

    //default map settings
    gravity = Math.floor(gridSize * 0.2);

    //---- blocks start ----
    // A list the contains all blocks exist in this level
    // loop to test for collision for every action
    allBlocks = [];

    //---- blocks end ----

    renderLevel(level = this.currentLevel) {

        //delete all blocks
        this.allBlocks.forEach((block) => {
            block.div.remove();

        })

        this.allBlocks = [];

        this.currentLevel = level;

        var currentMap = LEVELS[level];

        //render the level from bottom, thus reverse the order
        currentMap = currentMap.reverse();

        //to record the width of map by number of grid
        var maxLineLength = 0;

        // render blocks
        // read each line
        for (var y = 0; y < currentMap.length; y++) {
            var line = currentMap[y];

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
                        this.allBlocks.push(new Block(x, y, "TARGET"))
                        break;
                }
            }
        }

        //---- create boundaries ----//
        //calculate the width of map

        this.bound.left = 0;
        //the bound right is with reference to player.left
        //so -1 gridsize to compensate with player width
        this.bound.right = (maxLineLength - 1) * gridSize;
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
        this.threshold.RIGHT = this.bound.right - this.threshold.LEFT

        //if no lock
        if (!this.initialiseLock) {
            this.initialise();
        }

    }

    initialise() {
        //initiate player after the rest of the map has rendered
        if (this.playerInitX && this.playerInitY) {
            console.log("initiating")
            //if player axies are set
            player.initiate(this.playerInitX, this.playerInitY);

            document.getElementById("title").innerHTML = "This is a very easy game </br> Try jump arround and reach the rainbow! " +
            "<img src='resource/rainbow.png' width='" + gridSize + " height='" + gridSize + "'>";
            document.getElementById("tip").innerHTML = "Press &larr;&uarr;&rarr; to move";
            
        } else {
            alert("No player specified in map")
        }
    }

    // update X according to player location
    updateX() {
        if (player.left <= this.threshold.RIGHT) {
            var newX = this.threshold.LEFT - player.left;
            if (newX > 0) {
                newX = 0;
            }
            if (this.left != newX) {
                this.left = newX;
                this.div.style.left = newX + "px";
            }
        }
    }

    //update map location according to where the player is
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