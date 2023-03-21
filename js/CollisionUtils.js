//a collection of functions for Collisions
//because dont need to create instance, so use static for every function
//meaning this is a collection of functions instead of an actual object
class CollisionUtils {

    // check the interception of sides
    // repeatedly used in multiple functions
    // offset is given when the intercept is desired to calculate with offsets
    // offset is only used for bottom, this is to check if there is block that is directly under but not intercepting with the subject
    // static means can just take and use! 直接拿来用耶
    static isIntercept(subject, object, side, bottomOffset = 0) {
        switch (side) {

            case ("LEFT"):
                var blockRight = object.right;
                var interceptionLeft = (subject.right > blockRight) && (blockRight > subject.left);
                //
                //      ---------
                //     ||  X     |
                //  XXXXXXXX     |
                //     ||  X     |
                //      ---------
                //
                return interceptionLeft;


            case ("RIGHT"):
                var blockLeft = object.left;
                var interceptionRight = (subject.left < blockLeft) && (blockLeft < subject.right);
                //
                //      ---------
                //     |    X   ||    
                //     |    XXXXXXXXX   
                //     |    X   ||
                //      ---------
                //
                return interceptionRight;

                //---- interception X start ----//
            case ("X"):

                //returns interception on X
                // interception x and y is inclusive of aligned edges
                var blockRight = object.right;
                var interceptionLeft = (subject.right > blockRight) && (blockRight > subject.left);
                var blockLeft = object.left;
                var interceptionRight = (subject.left < blockLeft) && (blockLeft < subject.right);
                var isEdgeAligned = (subject.left == blockLeft) || (subject.right == blockRight);
                return interceptionLeft || interceptionRight || isEdgeAligned;
                //---- interception x end ----//


            case ("TOP"):
                var blockBottom = object.bottom;
                var interceptionTop = (subject.top > blockBottom) && (blockBottom > subject.bottom);

                //          x
                //      ====x====
                //     |    X    |
                //     |  XXXXX  |
                //     |         |
                //      ---------
                //
                return interceptionTop;

            case ("BOTTOM"):
                var blockTop = object.top + bottomOffset
                var interceptionBottom = (subject.bottom < blockTop) && (blockTop < subject.top);

                //          
                //      ---------
                //     |         |
                //     |  XXXXX  |
                //     |    X    |
                //      ====x====
                //          x
                return interceptionBottom;

                //---- interception y start ----//
            case ("Y"):
                //implementation logic same as interception X
                var blockBottom = object.bottom;
                var interceptionTop = (subject.top > blockBottom) && (blockBottom > subject.bottom);
                var blockTop = object.top;
                var interceptionBottom = (subject.bottom < blockTop) && (blockTop < subject.top);

                //returns interception on y
                var isEdgeAligned = (subject.top == blockTop) || (subject.bottom == blockBottom);
                return interceptionBottom || interceptionTop || isEdgeAligned;
                //---- intercrption y end ----//
        }
    }

    //check if collision occured between the subject and this block
    static isCollision(subject, object) {
        //compare if collision occured with coordinates
        return this.isIntercept(subject, object, "X") && this.isIntercept(subject, object, "Y");
    }

    //check if subject is on this block
    static isOn(subject, object, offset = step) {
        //compare if the subject's lower point (1/4 step in Y) is within the coordinates of the block
        return this.isIntercept(subject, object, "X") && this.isIntercept(subject, object, "BOTTOM", offset);
    }
}