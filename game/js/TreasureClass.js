//Treasure class
class Treasure extends Block {
    constructor(gridX, gridY) {
        //treasure block's type still treat as concret
        super(gridX, gridY, "TREASURE", true, "TREASURE-ACTIVE");

        //to indicate if the treasure has been opened
        this.isActive = true;
    }

    open() {
        if (this.isActive) {
            //to indicate if the treasure has been opened
            this.isActive = false;

            //play treasure open sound
            playAudio("sound-effect/open-treasure.mp3")

            //changes the look of treasure block
            this.div.className = "TREASURE-INACTIVE"

            //respond health on top of the treasure block
            map.allBlocks.push(new Health(this.gridX, this.gridY + 1))
        }
    }
}

class Health extends Block {
    constructor(gridX, gridY) {
        //treasure block's type still treat as concret
        super(gridX, gridY, "HEALTH", false);
    }

    eaten() {
        //remove from screen
        this.div.remove();
        //play gain health sound effect
        playAudio("sound-effect/gain-health.mp3");
        //add player life
        player.updateLife(1);
        //remove from all blocks
        map.allBlocks = map.allBlocks.filter((block) => { return block !== this; })
    }
}