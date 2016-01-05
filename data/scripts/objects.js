/**
 * Generic animator that animates from one state to another state based on the interpolating
 * function fed during construction (defaults to linear if none provided). Handles positive,
 * negative, and stopped animation without the need to create a custom loop to change states.
 *
 * Note that this uses frame counts normalized to 60fps rather than time durations to calculate
 * states.
 *
 * Arguments:
 *     none
 *
 * Public Methods:
 *     addAnimation                  - [opts] <See below for necessary details> (this obj)
 *                             Argument Object Required Key-Value Pairs:
 *                                 animationName - String of the name of the animation
 *                                 startValue    - Starting value of the data to be animated
 *                                 endValue      - Ending value of the data to be animated
 *                                 numFrames     - Number of frames (normalized to 60fps) that the animation should last
 *                                 interpolator  - Function that interpolates the starting and ending values. Its arguments
 *                                                 are in the following order: startValue, endValue, p where p is in [0, 1]
 *                                 updater       - Function called every time the animator is done calculating frame values
 *                                                 and is currently animating. Uses the arguments provided in the updaterArgs
 *                                                 array (if provided), along with the last argument being the return value
 *                                                 of the interpolator function (not to be confused with the interpolation
 *                                                 transform).
 *
 *                             Argument Object Optional Key-Value Pairs:
 *                                 interpolTransform - Function that transforms the p argument of the interpolator to another
 *                                                     value in [0, 1]. Example: function (v) {return 1 - Math.sqrt (1 - v * v);}
 *                                 updateArgs        - Array that will hold the arguments to be fed to the updater function.
 *                                                     Return value from the interpolator function is appended to the end of this
 *                                                     array.
 *                                 isActive          - True if the animation should be running, false otherwise. Defaults to true.
 *                                 animateNegatively - True if the animation should be negative (1 -> 0), false otherwise (0 -> 1)
 *                                                     Defaults to false.
 *     removeAnimation               - [animation] <Removes the animation from the animator> (this obj)
 *     start                         - [] <Starts the animator main loop> (this obj)
 *     play                          - [immediatelyReplay] <Reenables the main loop and plays animations in fed array> (this obj)
 *     pause                         - [] <Disables the main loop and pauses all animations> (this obj)
 *     playAnimation                 - [animation] <Allows the main loop to play the specified animation> (this obj)
 *     pauseAnimation                - [animation] <Disables the main loop from playing the specified animation> (this obj)
 *     setAnimationForward           - [animation] <Makes the specified animation animate positively [0 -> 1]> (this obj)
 *     setAnimationBackward          - [animation] <Makes the specified animation animate negatively [1 -> 0]> (this obj)
 *     updateAnimationUpdateArgs     - [animation, updateArgs] <Updates the animation's updateArgs array> (this obj)
 *     updateAnimationUpdateFunction - [animation, updateFunc] <Updates the animation's update function> (this obj)
 */
function Animator () {
    // Used to keep track of animations
    var animations = {},

        // Indexing values for arrays inside of the animations array
        I               = -1,
        ANIM_DIRECTION  = ++I,
        START_VALUE     = ++I,
        END_VALUE       = ++I,
        INTERPOLATOR    = ++I,
        UPDATER         = ++I,
        INTERPOL_TRANS  = ++I,
        UPDATE_ARGS     = ++I,
        FRAME_GENERATOR = ++I,

        // Used for keeping track of the internal loop
        animIsStarted = false,
        loopAnimation = false;

    // Internal looping function. Must run this.play to start and this.pause to stop
    function animatorLoop () {
        for (var animation in animations) {
            var a = animations[animation], fG = a[FRAME_GENERATOR];

            // Start the fG if it is not already started
            if (!fG.isStarted ()) fG.start ();

            // Only update values if the animation if not paused
            if (!fG.isPaused ()) {

                // Stores the interpolated value in the last entry of the UPDATE_ARGS array
                var uA = a[UPDATE_ARGS], p = fG.next (a[ANIM_DIRECTION]).percent ();
                uA[uA.length - 1] = a[INTERPOLATOR](a[START_VALUE], a[END_VALUE], a[INTERPOL_TRANS](p));

                // Call the updator to do whatever it needs to do
                a[UPDATER].apply (a[UPDATER], uA);

                // Clear the interpolated value as it is no longer necessary
                uA[uA.length - 1] = null;
            }
        }

        // Only loop if the loopAnimation variable is not false
        if (loopAnimation) loopAnimation = requestAnimationFrame (animatorLoop);
    }

    // Starts the animator loop
    this.start = function () {
        if (!animIsStarted) {
            animIsStarted = true;
            loopAnimation = requestAnimationFrame (animatorLoop);
        }

        return this;
    }

    // Adds an animation plain object to the animator. Animations have no particular order.
    this.addAnimation = function (opts) {
        var iA = typeof opts.isActive == 'boolean'? opts.isActive : true,
            aD = !!opts.animateNegatively,
            sV = opts.startValue,
            eV = opts.endValue,
            ip = opts.interpolator,
            up = opts.updater,
            iT = opts.interpolTransform || function (v) {return v;},
            uA = opts.updateArgs,
            fG = new FrameGenerator (opts.numFrames);

        // Create a new reference for the updater arguments and append a spot for the output of the interpolator function
        uA = uA? copyUpdateArgumentArray (uA) : [null];

        // Pause the FrameGenerator if the animation should not be active
        if (!iA) fG.pause ();

        // Store the animation in the animation object
        animations[opts.animationName] = [aD, sV, eV, ip, up, iT, uA, fG];

        return this;
    };

    // Removes an animation from the animations object.
    this.removeAnimation = function (animationName) {
        if (animations[animationName]) delete animations[animationName];

        return this;
    };

    // Begins the animator's update loop. Plays any animations labeled in the immediatelyReplay array by their string name.
    this.play = function (immediatelyReplay) {
        if (!loopAnimation) {
            if (immediatelyReplay) {
                for (var i = 0; i < immediatelyReplay.length; i++) animations[immediatelyReplay[i]][FRAME_GENERATOR].unpause ();
            }

            loopAnimation = requestAnimationFrame (animatorLoop);
        }

        return this;
    };

    // Pauses the animator's update loop and all animation's frame generators
    this.pause = function () {
        if (loopAnimation) {
            // Pause all frame generators
            for (var animation in animations) {
                animations[animation][FRAME_GENERATOR].pause ();
            }

            cancelAnimationFrame (loopAnimation);
            loopAnimation = false;
        }

        return this;
    };

    // Enables the specified animation to be updated in the animator's update loop. Does nothing
    // if the animation is not found in the animations object.
    this.playAnimation = function (animationName) {
        var a = animations[animationName];
        if (a && a[FRAME_GENERATOR].isPaused ()) a[FRAME_GENERATOR].unpause ();

        return this;
    };

    // Disables the specified animation from being updated in the animator's update loop. Does
    // nothing if the animation is not found in the animations object.
    this.pauseAnimation = function (animationName) {
        var a = animations[animationName];
        if (a && !a[FRAME_GENERATOR].isPaused ()) a[FRAME_GENERATOR].pause ();

        return this;
    };

    // Makes the specified animation's direction positive. Does nothing if the animation is not
    // found in the animations object.
    this.setAnimationForward = function (animationName) {
        if (animations[animationName]) animations[animationName][ANIM_DIRECTION] = true;

        return this;
    };

    // Makes the specified animation's direction negative. Does nothing if the animation is not
    // found in the animations object
    this.setAnimationBackward = function (animationName) {
        if (animations[animationName]) animations[animationName][ANIM_DIRECTION] = false;

        return this;
    };

    // Resets an animation to its initial state
    this.resetAnimation = function (animationName) {
        if (animations[animationName]) animations[animationName][FRAME_GENERATOR].reset ();

        return this;
    };

    // Sets an animation to its final state
    this.endAnimation = function (animationName) {
        if (animations[animationName]) animations[animationName][FRAME_GENERATOR].end ();

        return this;
    };

    // Updates the update function argument array for the specified animation
    this.updateAnimationUpdateArgs = function (animationName, newUpdateArgs) {
        if (animations[animationName]) {
            animations[UPDATE_ARGS] = copyUpdateArgumentArray (newUpdateArgs);
        }

        return this;
    };

    // Updates the update function to the specified function for the specified animation
    this.updateAnimationUpdateFunction = function (animationName, newUpdateFunction) {
        if (animations[animationName]) {
            animations[UPDATER] = newUpdateFunction;
        }

        return this;
    };

    // Used to make a shallow copy of an update argument array, which includes a spot for the
    // interpolator's output for the update function
    function copyUpdateArgumentArray (array) {
        var ret = [];
        for (var i = 0; i < arra.length; i++) ret.push (array[i]);
        ret.push (null);

        return ret;
    }

    /**
     * Normalizes variable framerates to 60fps using 4th order Runge-Kutta integration. This
     * implementation does not produce only integer values.
     *
     * Arguments:
     *     numFrames - the highest value that the generator should produce
     *
     * Public Methods:
     *     start     - [] <Updates to the latest time in milliseconds> (this object)
     *     reset     - [] <Sets the frame count to 0> (this object)
     *     end       - [] <Sets the frame count to the max frame value> (this object)
     *     pause     - [] <Pauses the internal clock, so .next() is constant> (this object)
     *     unpause   - [] <Unpauses from a paused state> (this object)
     *     isPaused  - [] <Returns whether or not this FrameGenerator is paused> (Boolean)
     *     isStarted - [] <Returns whether or not this FrameGenerator was started> (Boolean)
     *     next      - [neg] <Generates the next frame value. Goes backward if !!neg is true> (this object)
     *     frame     - [] <Returns the current frame value> (floating point value)
     */
    function FrameGenerator (numFrames) {
        var n = numFrames,
            t_i = Date.now (),
            i_t = 0,
            offset = 0,         // Offsets new values of time by the amount of time paused
            isStarted = false,  // Used to determine if the frame generator is "started"
            isNotPaused = true,
            tPaused = t_i,      // Used to store the time when paused
            FPMS = 3 / 50,
            BACKWARD = -1,
            FORWARD = 1;

        // Starts the internal clock
        this.start = function () {
            if (!isStarted) {
                offset = 0;
                isStarted = true;
                t_i = Date.now ();
            }

            return this;
        };

        // Resets the FrameGenerator to construction state.
        this.reset = function () {
            offset = 0;
            i_t = 0;

            return this;
        };

        // Sets the FrameGenerator to the maximum frame value
        this.end = function () {
            offset = 0;
            i_t = n;

            return this;
        };

        // Pauses the FrameGenerator such that calling next on it will not change the value of the frame
        this.pause = function () {
            if (isNotPaused) {
                tPaused = t_i;
                isNotPaused = false;
            }

            return this;
        };

        // Unpauses the FrameGenerator
        this.unpause = function () {
            if (!isNotPaused) {
                if (isStarted) offset += (Date.now () - tPaused);
                isNotPaused = true;
            }

            return this;
        };

        // Returns whether this FrameGenerator is paused
        this.isPaused = function () {return !isNotPaused;};

        // Returns whether this FrameGenerator is started
        this.isStarted = function () {return isStarted;};

        // Generates the next value for i_t. Counts backward if !!neg === true
        this.next = function (neg) {
            if (isNotPaused && isStarted) {
                var dt = (Date.now () - t_i - offset) * (neg? BACKWARD : FORWARD);
                i_t = rk4 (i_t, FPMS, dt, function () {return 0;})[0];

                // Does a bound check on the new value of i_t
                if (i_t < 0) i_t = 0;
                else if (i_t > n) i_t = n;

                // Sets the new t_i value for the next call
                t_i = Date.now () - offset;
            }

            return this;
        };

        // Returns the current frame number i_t
        this.frame = function () {return i_t;};

        // Returns frame information as a percentage from [0, 1]
        this.percent = function () {return 1 - i_t / n;};

        /**
         * Performs Runge-Kutta integration for a discrete value dt. Used for normalizing i in animation
         * across different framerates by different machines.
         *
         * Arguments:
         *     x  - initial position
         *     v  - initial velocity
         *     dt - timestep
         *     a  - acceleration function handler
         *
         * Returns:
         *     [xf, vf] - array containing the next position and velocity
         */
        function rk4 (x, v, dt, a) {
            var C = 0.5 * dt, K = dt / 6;

            var x1 = x,             v1 = v,             a1 = a (x1, v, 0),
                x2 = x + C * v1,    v2 = v + C * a1,    a2 = a (x2, v2, C),
                x3 = x + C * v2,    v3 = v + C * a2,    a3 = a (x3, v3, C),
                x4 = x + v3 * dt,   v4 = v + a3 * dt,   a4 = a (x4, v4, dt);

            var xf = x + K * (v1 + 2 * v2 + 2 * v3 + v4),
                vf = v + K * (a1 + 2 * a2 + 2 * a3 + a4);

            return [xf, vf];
        };

        // Returns a string value for this object in the format 'FG: <frame i/n> <is (not )paused> <FPMS*1000fps>'
        this.toString = function () {
            return isStarted?'FG: <frame '+i_t+'/'+n+'> <is '+(isNotPaused?'not ':'')+'paused> <'+(FPMS*1000)+'fps>':'FG: <>';
        };
    }
}

/**
 * Instantiates a boolean tree handler to simplify adding user-toggleable values to code by removing the need for
 * nested conditionals. Wors similarly to the Animator in that once instantiated, everything just works or not based
 * on its value.
 *
 * Arguments:
 *     boolStructure - adjacency list that denotes the structure of the boolean tree to be built. See where boolStruct
 *                     is defined for acceptable values.
 *
 * Public Methods:
 *     add                         - [boolean, parentsArr, childrenArr, initVal] <Adds/overwrites boolean to the tree> (this obj)
 *     remove                      - [boolName] <Removes boolName from the tree> (this obj)
 *     addParentTo                 - [boolName, parent] <Adds the parent to boolName if both are in the tree> (this obj)
 *     removeParentFrom            - [boolName, parent] <Removes the parent from boolName if both are in the tree> (this obj)
 *     toggle, makeFalse, makeTrue - [boolName] <Toggles/makes false/true boolName's internal value (not output value)> (this obj)
 *     holdsTrue                   - [boolName] <Returns boolName's output value (depends on parent output values)> (this obj)
 *     isTrue                      - [boolName] <Returns boolName's internal boolean value> (this obj)
 */
function BooleanTree (booleanStructure) {
    var boolStruct = booleanStructure || {
    /*  booleanName0: {
            value: boolean,
            parents: [],
            children: []
        }, ... */
    };

    // Convert the parent arrays to mappings with values and calculate the initial output boolean value
    for (var bl in boolStruct) addBooleanHelper (bl, boolStruct[bl].value, boolStruct[bl].parents, boolStruct[bl].children);



    // This adds a boolean to the boolean structure mapping, or it overwrites the value if it exists already.
    this.add = function (boolName, parentsArray, childrenArray, initialValue) {
        if (arguments.length) {
            if (arguments.length == 1) {
                parentsArray = [];
                childrenArray = [];
            }

            else if (arguments.length == 2) {
                childrenArray = [];
            }

            initialValue = false;
            addBooleanHelper (boolName, initialValue, parentsArray, childrenArray);
        }

        return this;
    };

    // This removes a boolean from the boolean structure mapping if it already exists; it does nothing otherwise.
    this.remove = function (boolName) {
        if (boolStruct[boolName]) {
            // Remove the boolean from its parents' children arrays
            for (var parent in boolStruct[boolName].parents) {
                var pChildren = boolStruct[parent].children;
                pChildren.splice (pChildren.indexOf (boolName), 1);
            }

            // Remove the boolean from its children's parent mappings
            for (var i = 0; i < boolStruct[boolName].children.length; i++) {
                var child = boolStruct[boolName].children[i];
                delete boolStruct[child].parents[boolName];
            }

            delete boolStruct[boolName];
        }

        return this;
    };

    // Adds the parent to the given boolean if both the boolean and the parent exist. Does nothing otherwise.
    this.addParentTo = function (boolName, parent) {
        if (boolStruct[boolName] && boolStruct[parent]) {
            if (boolStruct[parent].children.indexOf (boolName) == -1) boolStruct[parent].children.push (boolName);

            boolStruct[boolName].parents[parent] = parent.outputBoolean;
            boolStruct[boolName].outputBoolean = calculateOutputBool (boolName);
        }

        return this;
    };

    // Adds the child to the given boolean if it exists (adds the missing child if it does not exist). Does nothing otherwise.
    this.removeParentFrom = function (boolName, parent) {
        if (boolStruct[boolName] && boolStruct[parent]) {
            var i = Infinity;
            if ((i = boolStruct[parent].children.indexOf (boolName)) != -1) boolStruct[parent].children.splice (i, 1);

            delete boolStruct[boolName].parents[parent];
            boolStruct[boolName].outputBoolean = calculateOutputBool (boolName);
        }

        return this;
    };

    // Nots the given boolean if it exists and returns this object for chainable methods
    this.toggle = function (boolName) {
        if (boolStruct[boolName]) {
            boolStruct[boolName].value = !boolStruct[boolName].value;
            boolStruct[boolName].outputBoolean = calculateOutputBool (boolName);

            // Update the boolean's children's output boolean values
            for (var i = 0; i < boolStruct[boolName].children.length; i++) {
                var child = boolStruct[boolName].children[i];

                boolStruct[child].parents[boolName] = boolStruct[boolName].outputBoolean;
                boolStruct[child].outputBoolean = calculateOutputBool (child);
            }
        }

        return this;
    };

    // Makes the given boolean false if it exists and returns this object for chainability
    this.makeFalse = function (boolName) {
        if (boolStruct[boolName]) {
            boolStruct[boolName].value = false;
            boolStruct[boolName].outputBoolean = false;

            // Update the children's parent values
            for (var i = 0; i < boolStruct[boolName].children.length; i++) {
                var child = boolStruct[boolName].children[i];

                boolStruct[child].parents[boolName] = boolStruct[boolName].outputBoolean;
                boolStruct[child].outputBoolean = false;
            }
        }

        return this;
    };

    // Makes the given boolean true if it exists and returns this object for chainability
    this.makeTrue = function (boolName) {
        if (boolStruct[boolName]) {
            boolStruct[boolName].value = true;
            boolStruct[boolName].outputBoolean = calculateOutputBool (boolName);

            // Update the children's parent's values
            for (var i = 0; i < boolStruct[boolName].children.length; i++) {
                var child = boolStruct[boolName].children[i];

                boolStruct[child].parents[boolName] = boolStruct[boolName].outputBoolean;
                boolStruct[child].outputBoolean = calculateOutputBool (child);
            }
        }

        return this;
    };

    // If in the tree, returns false if any of the parent booleans are false, true otherwise, otherwise null.
    this.holdsTrue = function (boolName) {return boolStruct[boolName]? boolStruct[boolName].outputBoolean : null;};

    // Returns the value of the boolean without influence of parents, or null if not in the boolean tree.
    this.isTrue = function (boolName) {return boolStruct[boolName]? boolStruct[boolName].value : null;};



    // Reduces an array to a set like in Python. Code taken from https://gist.github.com/brettz9/6137753
    function removeDuplicates (arr) {return arr.reduce (function (a, v) {if (a.indexOf (v) === -1) {a.push (v);} return a;}, []);}

    // Helper function for adding booleans to the BooleanTree. Called at construction and at .addBoolean(...)
    function addBooleanHelper (boolean, initialValue, parentArr, childrenArr) {
        boolStruct[boolean] = {
            value: !!initialValue,
            parents: removeDuplicates (parentArr),
            children: removeDuplicates (childrenArr)
        };

        // parentTemp is a mapping of parents to their current boolean value (not their output boolean value)
        var parentTemp = {}, outputBool = true;
        for (var i = 0; i < boolStruct[boolean].parents.length; i++) {
            var parent = boolStruct[boolean].parents[i];

            // Recursively add each missing parent
            if (!boolStruct[parent])
                addBooleanHelper (parent, false, [], [boolean]);

            else {
                if (boolStruct[parent].children.indexOf (boolean) == -1) boolStruct[parent].children.push (boolean);

                // parentTemp[parent] = !!boolStruct[parent].value;
                parentTemp[parent] = calculateOutputBool (parent);
                outputBool = outputBool && parentTemp[parent];
            }

        }

        // Add the newly calculated output value and parent mapping to the boolean structure
        boolStruct[boolean].outputBoolean = boolStruct[boolean].parents.length? outputBool : !!initialValue;
        boolStruct[boolean].parents = parentTemp;

        // Recursively add any missing children from the boolean structure
        for (var i = 0; i < boolStruct[boolean].children.length; i++) {
            var child = boolStruct[boolean].children[i];

            if (!boolStruct[child])
                addBooleanHelper (child, false, [boolean], []);

            else if (!boolStruct[child].parents[boolean]) {
                boolStruct[child].parents[boolean] = boolStruct[boolean].outputBoolean;
                boolStruct[child].outputBoolean = calculateOutputBool (child);
            }
        }
    }

    // Calculates the output value of the boolean
    function calculateOutputBool (boolean) {
        var parentBooleanValues = true, parents = boolStruct[boolean].parents;
        for (var parent in parents) {
            if (!parents[parent]) {
                parentBooleanValues = false;
                break;
            }
        }

        return parentBooleanValues && boolStruct[boolean].value;
    }



    // String representation functions for debugging purposes
    function toArray (object) {
        var arr = [];
        for (var prop in object) arr.push (prop);
        return arr;
    }

    this.toString = function () {
        var s = '', f = true;
        for (var bl in boolStruct) {
            var b = boolStruct[bl],
                ln = '"'+ bl +'" -> v: '+ b.value +'; o: '+ b.outputBoolean +'; p: '+ toArray(b.parents) +'; c: '+ b.children;
            s += !f? '\n    ' + ln : (function () {f = false; return '    ' + ln;})();
        }

        return '{\n' + s + '\n}';
    };
}
