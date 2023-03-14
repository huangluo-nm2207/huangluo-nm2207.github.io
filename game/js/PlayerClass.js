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
        // 移动map让player保持在中间
        map.updateX();
        map.updateY();
        //---- relocate map end ----//

        //---- user jump start ----//
        //unlock user and jump when level start
        this.isInAir = false;
        this.isCollidingLeft = false;
        this.isCollidingRight = false;
        this.jump();
        //---- user jump end ----//

    }

    //---- initiate div start ----
    div = document.getElementById("player");
    lifeDiv = document.getElementById("life");
    lifeValueDiv = document.getElementById("life-value");

    width = gridSize;
    height = gridSize;
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
    // 先随便放一个数值
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

    //---- initate flag variables end ----

    //set player's X-axies
    setX(newX) {
        //do not change anything if the value is the same
        //do not move if is out of boundary
        if (newX != this.left && map.bound.left < newX && newX < map.bound.right) {
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
    moving(dir) {
        if (dir === "RIGHT") {
            if (!this.movingRightInAction && !this.isCollidingRight) {
                // if moving right in action is not set
                this.movingRightInAction = setInterval(() => {
                    
                    this.setX(this.left + this.velocity)

                    if (this.isCollidingLeft) {
                        this.isCollidingLeft = false;
                    }

                }, 50);
            }
        } else if(dir === "LEFT"){
            // if moving left in action is not set
            if (!this.movingLeftInAction && !this.isCollidingLeft) {
                this.movingLeftInAction = setInterval(() => {
                    this.setX(this.left - this.velocity)
                    //remove collide lock on the other side
                    if (this.isCollidingRight) {
                        this.isCollidingRight = false;
                    }

                }, 50);
            }
        }
    }

    // trigger to reset moving intervals to stop movement
    stopMoving(dir) {
        //when dir remains null, stop both movement
        // https://stackoverflow.com/questions/6604749/what-reason-is-there-to-use-null-instead-of-undefined-in-javascript#:~:text=It%27s%20a%20value%20that%20the,to%20have%20%22no%20value%22.
        if (dir === "RIGHT" || dir === null) {
            // if moving left in action is set
            if (this.movingRightInAction) {
                clearInterval(this.movingRightInAction);
                this.movingRightInAction = false;
            }

        }
        if (dir ==="LEFT" || dir === null) {
            // if moving left in action is set
            if (this.movingLeftInAction) {
                // clear the ID movingLeftInAction (you running? Yes running, means I gotta clear you!)
                clearInterval(this.movingLeftInAction);
                // put false to clear the integer value so that the if( the var)is false
                this.movingLeftInAction = false;
            }
        }
    }

    jump() {
        //do not jump if is currently in air
        if (!this.isInAir) {
            this.isInAir = true;
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

            // 一步一步来，然后可以走一步test一次
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
                if (this.fallingInAction)
                    this.setY(this.bottom + signedStep);
            }
            //move the last remainder
            //when velocity is negative, the remainder will be negative as well
            //to check if falling action has been terminated by other functions
            if (this.fallingInAction)
                this.setY(this.bottom + remainder);

            initial_velocity -= map.gravity;
// 50 is every 50ms (set interval for repeat)
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
                    this.stopMoving();
                    this.setY(map.playerInitY);
                    this.setX(map.playerInitX);
                    //drop 1 life
                    this.updateLife(-1);
                    //reset updating health
                    this.updatingLife = false;

                    //jump 1 time
                    this.isInAir = false;
                    this.jump();
                }, 1000);

            }
            //end this round of movement
            return true
        }
        return false
    }

    isOnConcret() {
        //if there is no any concret block below
        var filterFunction = (block) => {
            return block.type == "CONCRET" && CollisionUtils.isOn(this, block);
        }

        return (
            //some returns true when any of the blocks return true in the following function
            map.allBlocks.some(filterFunction)
        )

    }

    //only input ±x , and smallest value of x is 0.5
    updateLife(valueChange = 0) {


        //if life decrease,
        if (valueChange < 0) {
            if (this.isInvincible) {
                //take 0 damage when is invincible
                valueChange = 0
            } else {
                //jump user to signify damage taken
                this.isInAir = false; //turn off jump lock to force jump, so in sky also can jump
                this.jump();
                // make user invincible for 1.5 second for user to move
                this.isInvincible = true;
                setTimeout(() => { this.isInvincible = false }, 1.5 * 1000)
            }
        } else if (newLife + valueChange > 5) {
            //if health more than 5, do not change to more than 5
            valueChange = 5 - this.life;
        }

        var newLife = this.life + valueChange;

        if (newLife <= 5 && newLife > 0 && newLife != this.life) {

            this.life = newLife;
            this.renderLifeHearts();

        } else if (newLife == 0) {
            this.lifeDiv.firstChild.className = "empty-heart";
            this.life = 0;
            this.lifeValueDiv.innerText = "GPA: " + this.life.toFixed(1);
            //die
            this.die();
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
        // i 是指第几个heart, 第一个heart是0
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

    die() {
        this.isDead = true;
        notice(
            "<p>" +
            ":-<" + "<br/>" +
            "You did not manage to graduate from NUS!" + "<br/><br/>" +
            "<small>&lt;press space to restart&gt;</small>" + "</p>");

    }

    // detect collision between PLAYER and block
    // take actions when collision happens
    collisionAction(dir, isValueIncrease) {

        //this colliding block will be the block if there is a block that collides
        //else this colliding block will be undefined
        var collidingBlocks = map.allBlocks.filter(
            (block) => { return block.type !== "PLAYER" && CollisionUtils.isCollision(this, block); }
        )

        //if colliding block exists
        if (collidingBlocks.length > 0) {
            //filter blocks that are concret
            var collidingConcrets = collidingBlocks.filter(
                (block) => { return block.type === "CONCRET"; }
            )

            //if there is any concret block
            if (collidingConcrets.length > 0) {
                var collidingConcret = false;

                //if current movement is on x-axies
                if (dir === "X") {
                    //if is moving right and right is not collided
                    if (isValueIncrease && !this.isCollidingRight) {
                        //find the block that intercept is at right of player
                        collidingConcret = collidingConcrets.find(
                            (block) => { return CollisionUtils.isIntercept(this, block, "RIGHT"); }
                        );
                        //if the colliding concret exists
                        if (collidingConcret) {
                            this.isCollidingRight = true;
                            //reset the location to the point of collision
                            //colliding player right so reposition to block left - player width
                            // !! help need debug 
                            this.setX(collidingConcret.left - this.width)
                        }
                    }

                    //if is moving left and left is not collided
                    if (!isValueIncrease && !this.isCollidingLeft) {
                        //find the block that intercept is at left of player
                        collidingConcret = collidingConcrets.find(
                            (block) => { return CollisionUtils.isIntercept(this, block, "LEFT"); }
                        );
                        //if the concret exists
                        if (collidingConcret) {
                            this.isCollidingLeft = true;
                            //reset the location to the point of collision
                            //colliding player left so reposition to block right
                            this.setX(collidingConcret.right);
                        }
                    }
                }
                //if current movement is on y-axies
                else if(dir === "Y") {
                    if (this.isInAir) {
                        //check if player is moving upwards
                        //moving upwards means will collide at player top
                        if (isValueIncrease) {

                            var collidingConcret = collidingConcrets.find(
                                (block) => { return CollisionUtils.isIntercept(this, block, "TOP"); }
                            );

                            //if the concret exists
                            if (collidingConcret) {
                                //player under concret
                                this.stopFall();
                                console.log(collidingConcret)
                                //relocate the location to the point of collision
                                this.setY(collidingConcret.bottom - this.height);
                                this.freeFall();
                            }

                        }
                        //moving downwards means will collide at player bottom
                        else {
                            collidingConcret = collidingConcrets.find(
                                (block) => { return CollisionUtils.isIntercept(this, block, "BOTTOM"); }
                            );
                            //if the concret exists
                            if (collidingConcret) {
                                //player on top concret
                                this.stopFall();
                                //reset the location to the point of collision
                                this.setY(collidingConcret.top);

                                //reset inair flag after 0.05 second (50 millisecond)
                                //to prevent jumping too fast and cause the div starting the next jump before reaching the floor
                                //setTimeout is to delay 50ms
                                setTimeout(() => {
                                    this.isInAir = false;
                                }, 50)
                            }
                        }
                    }
                }
            }


            //search for collided target
            var collidingTarget = collidingBlocks.find((block) => { return block.type === "TARGET"; });
            //if reach target
            if (collidingTarget && !map.initialiseLock) {
                var nextLevel = map.currentLevel + 1;
                //go to next level
                //wins when no next level


                //lock motion
                this.isInAir = true;
                this.isCollidingLeft = true;
                this.isCollidingRight = true;


                //if there is still next level, go next level
                //else show notice
                if (LEVELS.length > nextLevel) {

                    map.renderLevel(nextLevel);
                    this.stopMoving();

                } else {
                    notice(
                        "<p>" +
                        ":->" + "<br/>" +
                        "You graduated from NUS!" +
                        "</p>");
                }
            }
        }
    }
}