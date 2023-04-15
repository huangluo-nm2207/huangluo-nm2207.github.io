//Player class
class Player {
    initiate(newX, newY) {
        //---- initiate location start ----
        this.left = newX;
        this.right = newX + this.width;
        this.div.style.left = newX + "px";

        this.bottom = newY;
        this.top = newY + this.height;
        this.div.style.bottom = this.bottom + "px";
        //---- initiate location end ----

        //---- initiate player in html start ----
        this.div.style.width = this.width + "px";
        this.div.style.height = this.height + "px";
        this.div.style.backgroundImage = "url(\"resource/player.png\")"
        //---- initiate player in html start ----

        //---- initiate life indication start ----
        this.renderLifeHearts();

        this.lifeValueDiv.style.fontSize = gridSize + "px";
        this.lifeValueDiv.style.width = "auto";
        //vertically align text
        this.lifeValueDiv.style.lineHeight = gridSize + "px";
        //set the text with always 1 decimal place
        this.lifeValueDiv.innerText = "GPA: " + this.life.toFixed(1);
        //---- initiate life indication end ----

        //---- relocate map start ----//
        map.updateX();
        map.updateY();
        //---- relocate map end ----//

        //---- unlock user properties start ----//
        this.movableX = true;
        this.movableY = true;
        this.isInvincible = false;
        this.isDead = false;
        //---- unlock user properties end ----//

        //---- user jump start ----//
        //let user jump when level start
        this.isInAir = false;
        this.jump();
        //---- user jump end ----//

    }

    //---- initiate div start ----
    div = document.getElementById("player");
    lifeDiv = document.getElementById("life");
    lifeValueDiv = document.getElementById("life-value");

    height = gridSize * 1.5;
    width = this.height * 31 / 48;
    //---- initiate div end ----

    //---- initiate game related variables start ----
    type = "PLAYER";
    life = 5;
    // the amount of damage player deal to the monster
    damage = 1;
    // this gives user a invincible time after taking damage
    // value is in second
    invincibleTime = 3;
    // the distance move per 0.05 second
    // 20Hz refresh rate for movement update, achieved in setInterval(..., 50ms)
    velocity = Math.floor(gridSize / 2);

    // by default this setting allows 4 grid high when jump
    // can increase jumpvelocity to jump higher
    // can decrease map gravity to fall slower
    jumpVelocity = Math.floor(gridSize * 1.2);
    //---- initiate game related variables end ----

    //---- initiate flag variables start ----
    // Interval for moving left and right
    // for smoothier movements without spamming the arrow buttons
    movingLeftInAction = false;
    movingRightInAction = false;
    isCollidingLeft = false;
    isCollidingRight = false;

    // Interval for falling
    fallingInAction = false;
    // flag for if player is in air
    isInAir = false;
    //flag for whether is in process of updating health
    updatingLife = false;
    //indicate if player has died
    isDead = false;
    //cannot take damage when invincible
    isInvincible = false;
    //indicate if player's movement is enabled
    movableX = true;
    movableY = true;

    //---- initate flag variables end ----

    //set player's X-axies
    setX(newX) {
        //do not change anything if the value is the same
        //do not move if is out of boundary
        if (newX != this.left && map.bound.left <= newX && newX <= map.bound.right - this.width) {
            var valueChange = newX - this.left;
            var isValueIncrease = valueChange > 0;
            this.left = newX;
            this.right = newX + this.width;
            this.div.style.left = newX + "px";
            this.collisionAction("X", isValueIncrease);

            //move entire map
            map.updateX();

            //check if player is standing on any block when is supposed to be landed
            //if not, then let player fall down
            if (!this.isInAir && !this.isOnConcret()) {
                //indicate the player is in air
                this.isInAir = true;
                //trigger freefall
                this.freeFall();
            }
        }
    }

    //set player's Y-axies
    setY(newY) {
        //do not change anything if the value is the same
        if (newY != this.bottom) {

            //when moving on y axis, allow left right to test collision again if is locked
            if (this.isCollidingRight)
                this.isCollidingRight = false;
            if (this.isCollidingLeft)
                this.isCollidingLeft = false;

            //continue the setY only if the player is still in map
            if (!this.isFallOutMap(newY)) {
                var isValueIncrease = newY > this.bottom;
                this.bottom = newY;
                this.top = newY + this.height;
                this.div.style.bottom = this.bottom + "px";

                this.collisionAction("Y", isValueIncrease);

                //move entire map
                map.updateY();
            }
        }
    }


    // move object left and right continuously until key up
    moving(direction) {
        // do not move if the player is not movable 
        if (this.movableX) {

            var isToRight = direction === "RIGHT";

            const swapingCount = 3; //every 3 moves swap the image one time
            var swapingCounter = 3;

            //when moving right
            if (isToRight) {
                if (!this.movingRightInAction && !this.isCollidingRight) {
                    // if moving right in action is not set and not colliding to the right

                    this.movingRightInAction = setInterval(() => {

                        //remove collide lock on the other side
                        if (this.isCollidingLeft) {
                            this.isCollidingLeft = false;
                        }

                        this.div.style.transform = "scaleX(1)";

                        if (swapingCounter == swapingCount) {
                            //swap the character image
                            if (this.div.style.backgroundImage === "url(\"resource/player.png\")") {
                                this.div.style.backgroundImage = "url(\"resource/playerwalk.png\")"
                            } else {
                                this.div.style.backgroundImage = "url(\"resource/player.png\")"
                            }
                            swapingCounter = 0
                        } else {
                            swapingCounter++
                        }


                        this.moveInSteps(isToRight);

                    }, 50);
                }
            } else {
                // if moving left in action is not set and not colliding to the left
                if (!this.movingLeftInAction && !this.isCollidingLeft) {

                    this.movingLeftInAction = setInterval(() => {
                        //remove collide lock on the other side
                        if (this.isCollidingRight) {
                            this.isCollidingRight = false;
                        }

                        this.div.style.transform = "scaleX(-1)";

                        if (swapingCounter == swapingCount) {
                            //swap the character image
                            if (this.div.style.backgroundImage === "url(\"resource/player.png\")") {
                                this.div.style.backgroundImage = "url(\"resource/playerwalk.png\")"
                            } else {
                                this.div.style.backgroundImage = "url(\"resource/player.png\")"
                            }
                            swapingCounter = 0
                        } else {
                            swapingCounter++
                        }

                        this.moveInSteps(isToRight);

                    }, 50);
                }
            }
        }
    }

    //to make movement in steps to prevent collision not detected
    //only for left and right
    moveInSteps(isToRight) {

        //loop to move 1 step at a time until full distance
        var stepLoopingTimes = Math.floor(this.velocity / step);

        if (isToRight) {
            var signed_step = step;
            var remainder = this.velocity - stepLoopingTimes * step
        } else {
            var signed_step = -step
            var remainder = -(this.velocity - stepLoopingTimes * step)
        }


        for (var i = 0; i < stepLoopingTimes; i++) {

            //when moving the direction that is not locked
            if (this.movableX &&
                ((isToRight && !this.isCollidingRight) || (!isToRight && !this.isCollidingLeft))) {
                this.setX(this.left + signed_step);
            }

        }

        //when moving the direction that is not locked
        if (this.movableX &&
            ((isToRight && !this.isCollidingRight) || (!isToRight && !this.isCollidingLeft))) {
            this.setX(this.left + remainder);
        }
    }

    // trigger to reset moving intervals to stop movement
    stopMoving(direction) {
        var stopRight = false;
        var stopLeft = false;

        if (direction === "LEFT") {
            stopLeft = true
        } else if (direction === "RIGHT") {
            stopRight = true
        } else {
            stopRight = true;
            stopLeft = true;
        }

        if (stopLeft) {
            // if moving left in action is set
            if (this.movingLeftInAction) {
                clearInterval(this.movingLeftInAction);
                this.movingLeftInAction = false;
            }

        }
        if (stopRight) {
            // if moving right in action is set
            if (this.movingRightInAction) {
                clearInterval(this.movingRightInAction);
                this.movingRightInAction = false;
            }
        }

        //reset to standing image
        if (this.div.style.backgroundImage !== "url(\"resource/player.png\")") {
            this.div.style.backgroundImage = "url(\"resource/player.png\")"
        }
    }

    jump(play = true) {
        //do not jump if is currently in air
        if (this.movableY && !this.isInAir) {
            this.isInAir = true;
            if (play) {
                //sound effect for jump
                playAudio("sound-effect/jump.mp3", 0.5)
            }

            //start freefall with initial velocity of jumping
            this.freeFall(this.jumpVelocity)
        }
    }

    freeFall(initial_velocity = 0) {
        if (this.fallingInAction) {
            //if there is already an falling action exist,
            //terminate it first
            this.stopFall();
        }
        this.fallingInAction = setInterval(() => {
            // bracket function -> ignore setting problem
            //set new Y position

            //loop to move 1 step at a time until full distance
            var loopingTimes = Math.abs(Math.floor(initial_velocity / step));

            if (initial_velocity < 0) {
                //move down when velocity is negative
                var signedStep = -step;
                var remainder = initial_velocity + loopingTimes * step

            } else {
                var signedStep = step
                var remainder = initial_velocity - loopingTimes * step
            }

            for (var i = 0; i < loopingTimes; i++) {
                //to check if falling action has been terminated by other functions
                if (this.movableY && this.fallingInAction)
                    this.setY(this.bottom + signedStep);
            }
            //move the last remainder
            //when velocity is negative, the remainder will be negative as well
            //to check if falling action has been terminated by other functions
            if (this.movableY && this.fallingInAction)
                this.setY(this.bottom + remainder);

            initial_velocity -= map.gravity;

        }, 50);

    }

    stopFall() {
        //when the player cannot move down anymore
        if (this.fallingInAction) {
            clearInterval(this.fallingInAction)
            this.fallingInAction = false;
        }
    }

    //check if player falls into holes and drop out from map
    isFallOutMap(newY) {
        //check if fall out from map from below
        //newY + gridSize is the new player.top
        if (newY + this.height * 2 < map.bound.bottom) {
            //if is not in the process of updating health
            if (!this.updatingLife) {
                //relocate to the start in 50ms time
                this.updatingLife = setTimeout(() => {
                    this.stopMoving("ALL");
                    this.setY(map.playerInitY);
                    this.setX(map.playerInitX);
                    //unlock invincible if user is invincible
                    //because falling is unprotectable
                    if (this.isInvincible) {
                        this.isInvincible = false
                    }
                    //drop 1 life
                    this.updateLife(-1);
                    //reset updating health
                    this.updatingLife = false;

                    //if not dead
                    if (!this.isDead) {
                        //jump 1 time at the respawn point
                        this.isInAir = false;
                        //jump without audio
                        this.jump(false);
                        //play revive sound effect
                        playAudio("sound-effect/revive.mp3")
                    }

                }, 500);

            }
            //end this round of movement
            return true
        }
        return false
    }

    isOnConcret() {
        return (
            //some returns true when any of the blocks is concret and is under the block
            map.allBlocks.some((block) => block.type === "CONCRET" && CollisionUtils.isOn(this, block))
        )

    }

    //only input ±x , and smallest value of x is 0.5
    updateLife(valueChange = 0) {
        //only update life when player is still
        if (!this.isDead) {

            //if life decrease,
            if (valueChange < 0) {
                if (this.isInvincible) {
                    //take 0 damage when is invincible
                    valueChange = 0
                } else {
                    //change character to get hit image
                    this.div.style.backgroundImage = "url(\"resource/playergethit.png\")"
                    //jump character to signify damage taken
                    this.isInAir = false; //turn off jump lock to force jump
                    this.jump();
                    // make character invincible for 1.5 second for user to move
                    this.isInvincible = true;
                    setTimeout(() => {
                        this.isInvincible = false;
                        //reset get hit image
                        if (this.div.style.backgroundImage === "url(\"resource/playergethit.png\")") {
                            this.div.style.backgroundImage = "url(\"resource/player.png\")"
                        }
                    }, 1.5 * 1000)
                }
            } else if (newLife + valueChange > 5) {
                //if health more than 5, do not change to more than 5
                valueChange = 5 - this.life;
            }

            var newLife = this.life + valueChange;

            if (newLife <= 5 && newLife > 0 && newLife != this.life) {
                //get all children of lifeDiv as a list
                var childrenOfLifeDiv = this.lifeDiv.children;

                this.life = newLife;

                this.renderLifeHearts();

                if (valueChange < 0) {
                    // blink user to signify damage taken
                    this.div.style.animationDuration = "1s";

                    //start animation for All
                    for (var i = 0; i < childrenOfLifeDiv.length; i++) {
                        childrenOfLifeDiv[i].style.animationDuration = "1s";
                    }

                    //stop css animation for all children under health div after 1.5 second
                    //this 1.5 second of blinking syncs with invicible timing as well
                    setTimeout(() => {
                        for (var i = 0; i < childrenOfLifeDiv.length; i++) {
                            childrenOfLifeDiv[i].style.animationDuration = "0s";
                        }

                        this.div.style.animationDuration = "0s";
                    }, 1.5 * 1000)
                }

            } else if (newLife <= 0) {
                this.lifeDiv.firstChild.className = "empty-heart";
                this.life = 0;
                this.lifeValueDiv.innerText = "GPA: " + this.life.toFixed(1);
                //die
                this.die();
            }
        }
    }

    renderLifeHearts() {
        var childrenOfLifeDiv = this.lifeDiv.children;
        //if the life blocks are not shown, create them
        if (childrenOfLifeDiv.length < 5) {
            for (var i = 0; i < 5; i++) {
                var heartDiv = document.createElement("div");
                heartDiv.style.width = gridSize + "px";
                heartDiv.style.height = gridSize + "px";
                this.lifeDiv.prepend(heartDiv)
            }

            childrenOfLifeDiv = this.lifeDiv.children;
        }

        //change life
        for (var i = 0; i < childrenOfLifeDiv.length - 1; i++) {
            //if current hear div is full
            if (this.life >= i + 1) {
                if (childrenOfLifeDiv[i].className !== "full-heart") {
                    childrenOfLifeDiv[i].className = "full-heart";
                }

            } else {
                if (this.life >= i + 0.5) {
                    if (childrenOfLifeDiv[i].className !== "half-heart") {
                        childrenOfLifeDiv[i].className = "half-heart";
                    }
                } else {
                    if (childrenOfLifeDiv[i].className !== "empty-heart") {
                        childrenOfLifeDiv[i].className = "empty-heart";
                    }
                }
            }
        }

        //set the text with always 1 decimal place
        this.lifeValueDiv.innerText = "GPA: " + this.life.toFixed(1);
    }


    //when player dies
    die() {
        //change character to dead image
        this.div.style.height = this.width + "px"
        this.div.style.width = this.height + "px"
        this.div.style.backgroundImage = "url(\"resource/playerdie.png\")"
        //jump character to signify damage taken
        this.isInAir = false; //turn off jump lock to force jump
        this.jump();


        this.isDead = true;
        //lock player motion
        this.movableX = false;
        //play failing audio
        map.setBGM("sound-effect/failed.mp3", 1);

        //show failed text
        notice(
            "<p>" +
            ":-<" + "<br/>" +
            "You did not manage to graduate from NUS!" + "<br/><br/>" +
            "<small>&lt;press space to restart&gt;</small>" + "</p>",
            "failed.gif");

    }

    // detect collision between PLAYER and block
    // take actions when collision happens
    collisionAction(axies, isValueIncrease) {

        var isDirectionX = axies === "X";

        //this colliding block will be the block if there is a block that collides
        //else this colliding block will be undefined
        var collidingBlocks = map.allBlocks.filter(
            block => block.type !== "PLAYER" && CollisionUtils.isCollision(this, block)
        )

        //if colliding block exists
        if (collidingBlocks.length > 0) {

            // ---- colliding with solid blocks start ---- //
            //filter for collided solid blocks
            var collidingSolids = collidingBlocks.filter(
                block => block.isSolid
            )

            if (collidingSolids.length > 0) {
                var collidingSolid = false;

                //if current movement is on x-axies
                if (isDirectionX) {
                    //if is moving right and right is not collided
                    if (isValueIncrease && !this.isCollidingRight) {
                        //find the block that intercept is at right of player
                        collidingSolid = collidingSolids.find(
                            block => CollisionUtils.isIntercept(this, block, "RIGHT")
                        );
                        //if the concret exists
                        if (collidingSolid) {
                            this.isCollidingRight = true;
                            //reset the location to the point of collision
                            //colliding player right so reposition to block left - player width
                            this.setX(collidingSolid.left - this.width)
                        }
                    }

                    //if is moving left and left is not collided
                    if (!isValueIncrease && !this.isCollidingLeft) {
                        //find the block that intercept is at left of player
                        collidingSolid = collidingSolids.find(
                            block => CollisionUtils.isIntercept(this, block, "LEFT")
                        );
                        //if the concret exists
                        if (collidingSolid) {
                            this.isCollidingLeft = true;
                            //reset the location to the point of collision
                            //colliding player left so reposition to block right
                            this.setX(collidingSolid.right);
                        }
                    }
                }
                //if current movement is on y-axies
                else {
                    if (this.isInAir) {
                        //check if player is moving upwards
                        //moving upwards means will collide at player top
                        if (isValueIncrease) {

                            var collidingTopConcrets = collidingSolids.filter(
                                block => CollisionUtils.isIntercept(this, block, "TOP")
                            );

                            //if the concret exists
                            if (collidingTopConcrets.length > 0) {
                                //player under concret
                                this.stopFall();
                                //relocation the location to the point of collision
                                this.setY(collidingSolids[0].bottom - this.height);
                                this.freeFall();
                            }

                            var collidingTreasures = collidingTopConcrets.filter(
                                block => block.type === "TREASURE" && block.isActive
                            );

                            //if hit treasure
                            if (collidingTreasures.length > 0) {
                                for (var treasure of collidingTreasures) {
                                    treasure.open();
                                }
                            }
                        }
                        //moving downwards means will collide at player bottom
                        else {
                            collidingSolid = collidingSolids.find(
                                block => CollisionUtils.isIntercept(this, block, "BOTTOM")
                            );
                            //if the concret exists
                            if (collidingSolid) {
                                //player on top concret
                                this.stopFall();
                                //reset the location to the point of collision
                                this.setY(collidingSolid.top);

                                //reset inair flag after 0.05 second (50 millisecond)
                                //to prevent jumping too fast and cause the div starting the next jump before reaching the floor
                                setTimeout(() => {
                                    this.isInAir = false;
                                }, 50)
                            }
                        }
                    }
                }
            }

            // ---- colliding with concret end ---- //

            // ---- colliding with target start ---- //
            //search for collided target
            var collidingTarget = collidingBlocks.find(block => block.type === "TARGET");
            //if reach target
            if (collidingTarget && !map.initialiseLock) {

                //lock motion
                this.movableX = false;
                this.movableY = false;
                //do not take further damages in current level
                this.isInvincible = true;

                //enter next level
                map.renderLevel(map.currentLevel + 1);
            }

            // ---- colliding with target end ---- //

            // ---- colliding with health start ---- //
            //search for for collided health block
            var collidingHealth = collidingBlocks.find(block => block.type === "HEALTH");
            //if reach health block
            if (collidingHealth) {
                collidingHealth.eaten();
            }
            // ---- colliding with health end ---- //
        }


        //this on block will be the block if there is directly under the player
        //else this on block will be undefined
        var onBlocks = map.allBlocks.filter(
            block => block.type !== "PLAYER" && CollisionUtils.isOn(this, block, 1)
        )

        //if there is any block directly under
        if (onBlocks.length > 0) {

            // ---- on monster start ---- //
            // do not kill monster if player is invincible
            // this is to prevent when user jump automatically when damage is taken
            if (!this.isInvincible) {
                //filter for monster
                var killingMonsters = onBlocks.filter(
                    //look for block type monster and the moster is not dead
                    block => block.type === "MONSTER" && !block.isDead
                )

                if (killingMonsters.length > 0) {
                    killingMonsters.forEach(killingMonster => {
                        killingMonster.updateLife(-this.damage);
                    });
                    //force jump
                    this.isInAir = false;
                    this.jump();
                }
            }
            // ---- on monster end ---- //

            // ---- on jumping block start ---- //
            //check if any block is jump block
            if (onBlocks.some(block => block.type === "JUMP")) {
                //trigger jumping that is 1.5 of the usual jump velocity

                //delay jump if is in air, or the player will not reach the ground before the next jump
                if (this.isInAir) {
                    setTimeout(() => {
                        var old = this.jumpVelocity
                        this.jumpVelocity *= 1.5;
                        this.jump();
                        this.jumpVelocity = old;
                    }, 50)
                } else {
                    var old = this.jumpVelocity
                    this.jumpVelocity *= 1.5;
                    this.jump();
                    this.jumpVelocity = old;
                }


            }
            // ---- on jumping block end ---- //

        }



    }


}