//Bullet class
class Bullet {
    constructor(parentLocation, bulletType, removeFromParentFunction, isPositionIncreasing = true) {

        this.bulletType = bulletType;
        //this is a function that the bullet can remove itself from parent function when it no longer exists
        this.removeFromParentFunction = removeFromParentFunction;

        if (bulletType === "EGG") {

            this.damage = 0.5;
            this.width = gridSize;
            this.height = gridSize;
            this.velocity = Math.floor(gridSize / 8);
            this.isDirectionX = false;

            //spond under parent
            this.left = parentLocation.left;
            this.bottom = parentLocation.bottom - this.height;
            this.className = "EGG-BULLET";
        } else if (bulletType === "NOTE") {

            this.damage = 0.5;
            //music note size ratio is 9 : 16
            this.height = gridSize;
            this.width = this.height * 9 / 16;
            this.velocity = Math.floor(gridSize / 2);
            this.isDirectionX = true;
            this.isPositionIncreasing = isPositionIncreasing;

            //spond at the left or right of parent
            if (this.isPositionIncreasing) {
                this.left = parentLocation.right;
                this.bottom = parentLocation.bottom;
            } else {
                this.left = parentLocation.left - this.width;
                this.bottom = parentLocation.bottom;
            }
            this.className = "NOTE-BULLET";
        }

        this.right = this.left + this.width;
        this.top = this.bottom + this.height;
        // for move in steps
        this.stepLoopingTimes = Math.floor(this.velocity / step);

        this.render();
    }

    direction = false; //by defualt the direction is left or up depending on this.isDirectionX
    moveInAction = false;

    //to indicate if the bullet is used
    isDead = false;

    render() {

        //create the div in html
        var newBlock = document.createElement('div');
        //add type as class
        newBlock.style.width = this.width + "px";
        newBlock.style.height = this.height + "px";
        newBlock.style.left = this.left + "px";
        newBlock.style.bottom = this.bottom + "px";

        //add class name
        if (this.bulletType === "NOTE") {
            //randomizes notes bullet for range monster
            newBlock.classList.add(this.className + "-" + Math.floor(Math.random() * 3));
        } else {
            newBlock.classList.add(this.className);
        }

        newBlock.classList.add("BULLET");

        //change direction of the image for moving left and right
        if (this.isDirectionX) {
            if (this.direction) {
                //to right or bottom then flip
                newBlock.style.transform = "scaleX(-1)";
            } else {
                //change back to original
                newBlock.style.transform = "scaleX(1)";
            }
        }

        this.div = map.div.appendChild(newBlock);

        //loop moving action non-stop
        this.move();
    }

    //set monster's X-axies
    setX(newX) {
        //do not change anything if the value is the same
        //do not move if is out of boundary
        if (newX > 0 && newX < map.bound.right) {
            this.left = newX;
            this.right = newX + this.width;
            this.div.style.left = newX + "px";

            this.collisionAction();
        } else {
            this.div.remove();
            this.moveInAction = false;
        }
    }

    //set monster's Y-axies
    setY(newY) {
        //do not change anything if the value is the same
        //do not move if is out of boundary
        if (newY > 0 && newY < map.bound.top) {

            this.bottom = newY;
            this.top = newY + this.height;
            this.div.style.bottom = newY + "px";

            this.collisionAction();
        } else {
            this.div.remove();
            this.moveInAction = false;
        }
    }


    move() {
        this.moveInAction = setInterval(function() {
            this.moveInSteps()
        }.bind(this), 50);
    }

    //falls all the way out of map when die
    die() {
        //stop moving
        if (this.moveInAction) {
            clearInterval(this.moveInAction)
        }

        //stop collision checks
        this.isDead = true;
        this.div.remove();
        //remove from monster object
        this.removeFromParentFunction(this);
    }

    collisionAction() {
        //stop performing collision checks if monster dead
        if (!this.isDead) {
            //if there is any concret block
            var isCollidingConcret = map.allBlocks.some(
                block => block.type === "CONCRET" && CollisionUtils.isCollision(this, block)
            );

            //dies when colliding concret
            if (isCollidingConcret) {
                this.die()
            }

            //check if collides with player
            if (CollisionUtils.isCollision(player, this)) {
                //dies before damage given
                //to prevent double damage
                this.die();
                player.updateLife(-this.damage);

            }
        }
    }

    //to make movement in steps to prevent collision not detected
    //only for left and right
    moveInSteps() {

        //is to right or up
        if (this.direction) {
            var signed_step = step;
            var remainder = this.velocity - this.stepLoopingTimes * step
        } else {
            //is to left or down
            var signed_step = -step
            var remainder = -(this.velocity - this.stepLoopingTimes * step)
        }


        if (this.isDirectionX) {
            for (var i = 0; i < this.stepLoopingTimes; i++) {
                this.setX(this.left + signed_step);
            }
            this.setX(this.left + remainder);
        } else {
            for (var i = 0; i < this.stepLoopingTimes; i++) {
                this.setY(this.bottom + signed_step);
            }
            this.setY(this.bottom + remainder);
        }
    }

}