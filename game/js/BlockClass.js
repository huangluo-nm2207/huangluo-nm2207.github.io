//Block class
class Block {
    constructor(gridX, gridY, type = "CONCRET", isSolid = true, className = type) {
        this.gridX = gridX;
        this.gridY = gridY;
        //all positions are referenced from left or bottom
        this.left = gridX * gridSize;
        this.bottom = gridY * gridSize;
        this.top = this.bottom + gridSize;
        this.right = this.left + gridSize;
        this.width = gridSize;
        this.height = gridSize;
        this.type = type;

        //shows if player can go through this block
        this.isSolid = isSolid

        //defines the css class of this block
        this.className = className

        //---- rendering the block ---
        if (this.type !== "MONSTER") {
            this.render();
        }
    }

    render() {
        //create the div in html
        var newBlock = document.createElement('div');
        //add type as class
        newBlock.className = this.className;
        newBlock.style.left = this.left + "px";
        newBlock.style.bottom = this.bottom + "px";
        newBlock.style.width = this.width + "px";
        newBlock.style.height = this.height + "px";
        this.div = map.div.appendChild(newBlock);
    }
}