//Monster class
//monsters cannot jump
class Monster extends Block {
    constructor(x, y, monsterType, direction) {
        // use parent constructor with type monster
        super(x, y, "MONSTER", false)
        this.monsterType = monsterType;
        this.isDirectionX = direction === "X";

        if (monsterType === "REGULAR") {
            this.life = 2;
            this.damage = 1;
            this.width = gridSize;
            this.height = gridSize;
            this.velocity = Math.floor(gridSize / 8);
            var className = "REGULAR-MONSTER";

        } else if (monsterType === "RANGE") {

            this.life = 1;
            this.damage = 0.5;
            this.width = Math.floor(gridSize * 1.5);
            this.height = Math.floor(gridSize * 1.5);
            this.velocity = Math.floor(gridSize / 2);
            this.bulletType = "NOTE";
            this.bulletRate = 1; //in second
            var className = "RANGE-MONSTER";

        } else if (monsterType === "RAPID") {
            this.life = 1;
            this.damage = 0.5;
            this.width = Math.floor(gridSize * 1.5);
            this.height = Math.floor(gridSize * 1.5);
            this.velocity = Math.floor(gridSize);
            var className = "RAPID-MONSTER";

        } else if (monsterType === "CHICKEN") {
            this.life = 3;
            //no damage but lay eggs to attack
            this.damage = 0;
            this.width = Math.floor(gridSize * 1.5);
            this.height = Math.floor(gridSize * 1.5);
            this.velocity = Math.floor(gridSize);
            this.bulletType = "EGG";
            this.bulletRate = 0.5; //in second
            var className = "CHICKEN-MONSTER";
        }

        //for move in steps
        this.stepLoopingTimes = Math.floor(this.velocity / step);

        this.render();
        this.div.classList.add(className);
    }

    isPositionIncreasing = true;
    isInvincible = false;
    moveInAction = false;
    isDead = false;
    //the jumping velocity when monster dies
    jumpVelocity = Math.floor(gridSize * 1.2);

    //---- range attack variables start ----/
    bulletType = false
    bulletRate = 0;
    bullets = [];
    firingInAction = false;
    //---- range attack variables end ----//

    initialise() {
        //loop moving action non-stop
        this.move();

        if (this.bulletType) {
            this.fire();
        }
    }

    //set monster's X-axies
    setX(newX) {
        //do not move if is out of boundary
        if (newX > 0 && newX < map.bound.right) {
            this.left = newX;
            this.right = newX + this.width;
            this.div.style.left = newX + "px";

            this.collisionAction();
        } else {
            this.changeDirection();
        }

    }

    //set monster's Y-axies
    setY(newY) {
        if (newY < map.bound.top - this.height) {
            this.bottom = newY;
            this.top = newY + this.height;
            this.div.style.bottom = newY + "px";
            this.collisionAction();
        } else {
            this.changeDirection();
        }
    }

    move() {
        if (this.moveInAction) {
            clearInterval(this.moveInAction)
        }

        this.moveInAction = setInterval(() => {
            this.moveInSteps(this.isPositionIncreasing)
        }, 50);
    }

    //update health
    updateLife(valueChange) {
        if (!this.isInvincible) {

            this.life += valueChange;

            if (this.life <= 0) {
                this.die()
            } else {
                //be invincible for 0.1 second
                //to prevent player from taking damage after giving damage to monster
                this.isInvincible = true
                setTimeout(() => { this.isInvincible = false }, 0.1 * 1000)
            }

            //blinks
            this.div.style.animationDuration = "1s";
            setTimeout(() => {
                this.div.style.animationDuration = "0s";
            }, 1.5 * 1000)

        }
    }


    //falls all the way out of map when die
    die() {
        //stop collision checks
        this.isDead = true;

        //play dying sound effect
        playAudio("sound-effect/kill.mp3");

        //stop moving
        if (this.moveInAction) {
            clearInterval(this.moveInAction)
        }

        if (this.firingInAction) {
            clearInterval(this.firingInAction);
            //remove all bullets
            this.bullets.forEach(bullet => { bullet.die() })
        }

        //jump a bit then fall out from map
        //stop falling and remove from allBlocks after falling out from map
        this.fallingInAction = setInterval(() => {

            //set new Y position

            //loop to move 1 step at a time until full distance
            var loopingTimes = Math.abs(Math.floor(this.jumpVelocity / step));

            if (this.jumpVelocity < 0) {
                //move down when velocity is negative
                var signedStep = -step;
                var remainder = this.jumpVelocity + loopingTimes * step

            } else {
                var signedStep = step
                var remainder = this.jumpVelocity - loopingTimes * step
            }

            for (var i = 0; i < loopingTimes; i++) {
                //to check if falling action has been terminated by other functions
                if (this.fallingInAction)
                    this.setY(this.bottom + signedStep);
            }
            //move the last remainder
            //when velocity is negative, the remainder will be negative as well
            //to check if falling action has been terminated by other functions
            if (this.fallingInAction)
                this.setY(this.bottom + remainder);

            //remove block if fall out from map
            if (this.top < 0) {
                this.div.remove();
                //remove from all blocks
                map.allBlocks = map.allBlocks.filter(block => block !== this)

                clearInterval(this.fallingInAction)
            }

            this.jumpVelocity -= map.gravity;

        }, 50);


    }

    changeDirection() {
        this.isPositionIncreasing = !this.isPositionIncreasing;
        //change direction also changes the direction of the backgound
        if (this.isPositionIncreasing) {
            //to right or top then flip
            this.div.style.transform = "scaleX(-1)";
        } else {
            //change back to original
            this.div.style.transform = "scaleX(1)";
        }

    }

    collisionAction() {

        //stop performing collision checks if monster dead
        if (!this.isDead) {
            //if there is any concret block
            var collidingConcret = map.allBlocks.find(
                block => block.isSolid && CollisionUtils.isCollision(this, block)
            )
            if (collidingConcret) {
                //reset monster location upon collision

                if (this.isDirectionX) {
                    //monster move in x direction
                    if (this.isPositionIncreasing) {
                        //monster moving right
                        this.setX(collidingConcret.left - this.width)
                    } else {
                        //monster moving left
                        this.setX(collidingConcret.right)
                    }
                } else {
                    //monster move in y direction
                    if (this.isPositionIncreasing) {
                        //monster moving top
                        this.setY(collidingConcret.bottom - this.height)
                    } else {
                        //monster moving bottom
                        this.setY(collidingConcret.top)
                    }
                }

                this.changeDirection();
            }

            //check if collides with player
            //if monster is invincible, does no damage to player
            if (!this.isInvincible && CollisionUtils.isCollision(player, this)) {
                player.updateLife(-this.damage)
            }
        }
    }

    //to make movement in steps to prevent collision not detected
    //only for left and right
    moveInSteps(isToRightOrTop) {

        if (isToRightOrTop) {
            var signed_step = step;
            var remainder = this.velocity - this.stepLoopingTimes * step
        } else {
            var signed_step = -step
            var remainder = -(this.velocity - this.stepLoopingTimes * step)
        }


        for (var i = 0; i < this.stepLoopingTimes; i++) {
            //if current direction of monster is the same
            if (isToRightOrTop == this.isPositionIncreasing) {
                if (this.isDirectionX) {
                    //when moving the direction that is not locked
                    this.setX(this.left + signed_step);
                } else {
                    this.setY(this.bottom + signed_step);
                }
            }
        }

        if (isToRightOrTop == this.isPositionIncreasing) {
            if (this.isDirectionX) {
                //when moving the direction that is not locked
                this.setX(this.left + remainder);
            } else {
                this.setY(this.bottom + remainder);
            }
        } else {
            //changed direction, so restart moving
            this.move();
        }
    }

    fire() {

        this.firingInAction = setInterval(
            () => {
                var thisLocation = {
                    left: this.left,
                    right: this.right,
                    bottom: this.bottom
                }

                this.bullets.push(new Bullet(thisLocation, this.bulletType, this.destroyBullet.bind(this)))

                if (this.monsterType === "RANGE") {
                    //fires bullet on both side as well for range monster
                    //bind(this), means that adds the this class into the function as well
                    this.bullets.push(new Bullet(thisLocation, this.bulletType, this.destroyBullet.bind(this), true));
                }

            },
            this.bulletRate * 1000)
    }

    //a function to pass to bullets to remove themselves
    destroyBullet(bulletToRemove) {
        this.bullets = this.bullets.filter(bullet => bullet != bulletToRemove);
    }
}