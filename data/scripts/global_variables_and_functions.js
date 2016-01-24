var rstbBooleanTree = {

    hideSidebar: {
        parents: [],
        children: [],
        value: false
    },

    mouseOnButton: {
        parents: [],
        children: [],
        value: false
    },

    hoverAnimationNotInitialized: {
        parents: [],
        children: [],
        value: true
    },

    displayOptionAnimationNotInitialized: {
        parents: [],
        children: [],
        value: true
    },

    resIsInstalled: {
        parents: [],
        children: [],
        value: false
    },

    isNightMode: {
        parents: [],
        children: [],
        value: false
    },

    buttonAlwaysDisplayed: {
        parents: [],
        children: [],
        value: false
    },

    buttonIsDisplayedNow: {
        parents: [],
        children: [],
        value: false
    }

}, bT = new BooleanTree (rstbBooleanTree);



// Easy-to-manipulate values for the button. Units are separate for potential math operations
var BG_RGB             = [255, 255, 255],
    TXT_RGB            = [0, 0, 0],
    BUTTON_MARGIN      = 7,          BM_UN  = 'px',
    BORDER_RADIUS      = 3,          BR_UN  = 'px',
    PADDING_LR         = 4,          PLR_UN = 'px',
    PADDING_TB         = 3,          PTB_UN = 'px',
    BORDER_THICKNESS   = 1,          BT_UN  = 'px',
    BORDER_TYPE        = 'solid',
    CURSOR_TYPE        = 'pointer',
    POSITION_TYPE      = 'fixed',
    USER_SELECT        = 'none',
    IDLE_ALPHA         = 0.25,
    ACTIVE_ALPHA       = 1.0,

    // Easy-to-manipulate RSTB menu variables and CSS values. Units are separate for potential math operations
    MENU_TD_TEXT        = 'Always Show Button: ',
    MENU_BG_DAY         = [243, 243, 243],
    MENU_STROKE_DAY     = [22, 22, 22],
    MENU_BG_NIGHT       = [52, 52, 52],
    MENU_STROKE_NIGHT   = [243, 243, 243],
    MENU_STROKE_WIDTH   = 1,         MSW_UN = 'px',
    MENU_WIDTH          = 180,       MW_UN  = 'px',
    MENU_HEIGHT         = 45,        MH_UN  = 'px',
    MENU_IDLE_ALPHA     = 0,
    MENU_ACTIVE_ALPHA   = 1,
    MENU_ARROW_HEIGHT   = 10,
    MENU_ARROW_HALF_LEN = 7.5,
    // MENU_FRAME_DURATION = 7,
    MHW                 = MENU_WIDTH / 2,
    MENU_OPT_DESCRIPTOR = 'When off, the button will hide when the sidebar does not take up too much screen space.',

    // Easy-to-manipulate animation variables
    TXT_ANIMATION   = 'Text Color Animation',
    BG_ANIMATION    = 'Background Color Animation',
    HOVER_FRAME_DUR = 15,

    MENU_DISP_BG_ANIMATION = 'Displayability Background Animation',
    MENU_NOB_BG_ANIMATION  = 'Displayability Button Nob Background Animation',
    MENU_NOB_POSITION_ANIMATION = 'Displayability Button Nob Position Animation',
    MENU_TOGGLE_FRAME_DUR  = 15,

    // Ratio of side to body that will determine whether or not the button should appear
    SIDE_TO_BODY_RATIO = 0.342,

    // String concatenations for main button CSS values
    bgRGBA0    = 'rgba(' + BG_RGB + ',' + IDLE_ALPHA + ')',
    bgRGBA1    = 'rgba(' + BG_RGB + ',' + ACTIVE_ALPHA + ')',
    txtRGBA0   = 'rgba(' + TXT_RGB + ',' + IDLE_ALPHA + ')',
    txtRGBA1   = 'rgba(' + TXT_RGB + ',' + ACTIVE_ALPHA + ')',

    borderAnim = BORDER_THICKNESS + BT_UN + ' ' + BORDER_TYPE + ' ',
    bgBorder0  = borderAnim + bgRGBA0,
    bgBorder1  = borderAnim + bgRGBA1,
    txtBorder0 = borderAnim + txtRGBA0,
    txtBorder1 = borderAnim + txtRGBA1,

    // Animation object constructions
    hoverAnimator     = new Animator (),
    displayAnimator   = new Animator (),
    interpolTrans     = function (x) {return 0.5 * (1 - Math.cos (Math.PI * x));},
    exponentialTrans  = function (x) {return (Math.pow (Math.E, -4 * x) - 1) / (Math.pow (Math.E, -4) - 1);},
    isAct             = false;



    // Initial CSS values for the button
var buttonCSS = {
        'background-color':    bgRGBA0,
        'border':              txtBorder0,
        'border-radius':       BORDER_RADIUS + BR_UN,
        'bottom':              BUTTON_MARGIN + BM_UN,
        'color':               txtRGBA0,
        'cursor':              CURSOR_TYPE,
        'padding-left':        PADDING_LR + PLR_UN,
        'padding-right':       PADDING_LR + PLR_UN,
        'padding-top':         PADDING_TB + PTB_UN,
        'padding-bottom':      PADDING_TB + PTB_UN,
        'position':            POSITION_TYPE,
        'right':               BUTTON_MARGIN + BM_UN,
        '-webkit-user-select': USER_SELECT,
        'z-index':             Number.MAX_SAFE_INTEGER || 509031400070006
    },

    // Initial CSS values for the menu's contents
    menuDivCSS = {
        'height': MENU_HEIGHT + MH_UN,
        'left': 0,
        'top': 0,
        'width': MENU_WIDTH + MW_UN,
        'z-index': 100
    },

    menuSVGCSS = {
        'svg': {
            'left': 0,
            'margin': 0,
            'padding': 0,
            // 'position': 'fixed',
            'top': 0
        },

        'polygon': {
            // 'cursor': 'pointer',
            'stroke': 'rgba(' + MENU_STROKE_DAY + ',' + IDLE_ALPHA + ')',
            'stroke-width': MENU_STROKE_WIDTH + MSW_UN
        }
    },

    menuSpacerCSS = {
        'height': MENU_ARROW_HEIGHT + MH_UN,
        'margin': 0,
        'padding': 0,
        'top': 0,
        'width': '100%'
    };



    // Animation objects to be fed to the animators
var txtAnimation = {
        animationName:     TXT_ANIMATION,
        startValue:        [TXT_RGB[0], TXT_RGB[1], TXT_RGB[2], IDLE_ALPHA],
        endValue:          [TXT_RGB[0], TXT_RGB[1], TXT_RGB[2], ACTIVE_ALPHA],
        numFrames:         HOVER_FRAME_DUR,
        interpolator:      rgbaInterpolate,
        updater:           txtRGBAUpdate,
        interpolTransform: interpolTrans,
        isActive:          isAct
    },

    bgAnimation = {
        animationName:     BG_ANIMATION,
        startValue:        [BG_RGB[0], BG_RGB[1], BG_RGB[2], IDLE_ALPHA],
        endValue:          [BG_RGB[0], BG_RGB[1], BG_RGB[2], ACTIVE_ALPHA],
        numFrames:         HOVER_FRAME_DUR,
        interpolator:      rgbaInterpolate,
        updater:           bgRGBAUpdate,
        interpolTransform: interpolTrans,
        isActive:          isAct
    },

    rstbMenuBGAnimation = {
        animationName:        MENU_DISP_BG_ANIMATION,
        startValue:           [150, 150, 150, ACTIVE_ALPHA],    // Ported straight from menu.css
        endValue:             [70, 187, 70, ACTIVE_ALPHA],
        numFrames:            MENU_TOGGLE_FRAME_DUR,
        interpolator:         rgbaInterpolate,
        updater:              rstbDisplayabilityBGUpdate,
        interpolTransform:    exponentialTrans,
        isActive:             isAct
    },

    rstbMenuNobBGAnimation = {
        animationName:        MENU_NOB_BG_ANIMATION,
        startValue:           [125, 95, 95, ACTIVE_ALPHA],      // Ported straight from menu.css
        endValue:             [95, 125, 95, ACTIVE_ALPHA],
        numFrames:            MENU_TOGGLE_FRAME_DUR,
        interpolator:         rgbaInterpolate,
        updater:              rstbDisplayabilityNobBGUpdate,
        interpolTransform:    exponentialTrans,
        isActive:             isAct
    },

    rstbMenuNobPosAnimation = {
        animationName:        MENU_NOB_POSITION_ANIMATION,
        startValue:           2,                                // Ported straight from menu.css
        endValue:             18,
        numFrames:            MENU_TOGGLE_FRAME_DUR,
        interpolator:         positionInterpolate,
        updater:              rstbDisplayabilityNobPosUpdate,
        interpolTransform:    exponentialTrans,
        isActive:             isAct
    };

    // Points that define the outline of the SVG for the RSTB Menu
var menuSVGPoints = '0,' + MENU_ARROW_HEIGHT + ' ' +
                    (MHW - MENU_ARROW_HALF_LEN) + ',' + MENU_ARROW_HEIGHT + ' ' +
                    MHW + ',0 ' +
                    (MHW + MENU_ARROW_HALF_LEN) + ',' + MENU_ARROW_HEIGHT + ' ' +
                    MENU_WIDTH + ',' + MENU_ARROW_HEIGHT + ' ' +
                    MENU_WIDTH + ',' + MENU_HEIGHT + ' ' +
                    '0,' + MENU_HEIGHT,

    // HTML for the RSTB Menu
    xmlns     = 'http://www.w3.org/2000/svg',

    wrapperElement = document.createElement ('div'),
    svgElement = document.createElementNS (xmlns, 'svg'),
    polygonElement = document.createElementNS (xmlns, 'polygon'),

    spacerElement = document.createElement ('div'),

    optionElement = document.createElement ('div'),
    optionElementWrapper = document.createElement ('div'),
    optionNobElement = document.createElement ('div'),
    tdTextElement = document.createTextNode (MENU_TD_TEXT);

    wrapperElement.setAttribute ('id', 'rstbmenusvgwrapper');
    svgElement.setAttribute ('width', MENU_WIDTH + MW_UN);
    svgElement.setAttribute ('height', MENU_HEIGHT + MH_UN);
    svgElement.setAttribute ('stroke-linejoin', 'miter');
    svgElement.setAttribute ('id', 'rstbmenusvg');
    polygonElement.setAttribute ('points', menuSVGPoints);
    polygonElement.setAttribute ('fill', 'black');
    polygonElement.setAttribute ('id', 'rstbmenusvgpolygon');

    spacerElement.setAttribute ('id', 'rstbmenuspacer');

    optionElement.setAttribute ('id', 'rstbmenudisplayabilitytoggleoption');
    optionElement.setAttribute ('class', 'rstbmenuoption');
    optionElement.setAttribute ('title', MENU_OPT_DESCRIPTOR);
    optionElement.appendChild (tdTextElement);

    optionElementWrapper.setAttribute ('id', 'rstbmenudisplayabilitytogglebuttonwrapper');

    optionNobElement.setAttribute ('id', 'rstbmenudisplayabilitytogglebuttonnob');


    // Re-create the svgCode element innerHTML
    svgElement.appendChild (polygonElement);
    wrapperElement.appendChild (svgElement);

var svgCodeElement = wrapperElement;

    // Re-create the menuSpacerHTML innerHTML
var rstbMenuSpacerElement = spacerElement;

    // Re-create the rstbMenuDisplayabilityToggleOptionHTML innerHTML
    optionElementWrapper.appendChild (optionNobElement);
    optionElement.appendChild (optionElementWrapper);

var rstbMenuDisplayabilityToggleOptionElement = optionElement;



var LEFT_CLICK   = 1,
    MIDDLE_CLICK = 2,
    RIGHT_CLICK  = 3;





var rstbElements = [
        'redditSideToggleButton',
        'rstbMenuLink',
        'rstbMenuDiv',
        'rstbMenuSVGWrapper',
        'rstbMenuSVG',
        'rstbMenuSVGPolygon',
        'rstbMenuSpacer',
        'rstbMenuDisplayabilityToggleOption',
        'rstbMenuDisplayabilityToggleButton',
        'rstbMenuDisplayabilityToggleButtonWrapper',
        'rstbMenuDisplayabilityToggleButtonNob'
    ],

    // Reddit-specific DOM elements
    redditSCA            = document.getElementsByClassName ('side'),
    redditHeader         = document.getElementById ('header'),
    redditListingChooser = document.getElementsByClassName ('listing-chooser')[0],
    redditTabMenu        = document.getElementsByClassName ('tabmenu')[0],
    redditContentArray   = document.getElementsByClassName ('content'),
    resNightSwitchToggle = document.getElementById ('nightSwitchToggle'),
    body                 = document.body;

// Store the side class array display style for all side class elements and push the button's display
var sCDS = [];
for (var i = 0; i < redditSCA.length; i++) sCDS.push (redditSCA[i].style.display);

var el;
function getDomElementReferencesFor (elementNames) {
    var elements = {};
    for (var i = 0; i < elementNames.length; i++) {
        var element = elementNames[i];
        elements[element] = document.getElementById (element.toLowerCase ());

        // Remove any elements that do not exist
        if (!elements[element]) delete elements[element];
    }

    return elements;
}

function styleSpecifiedReferences () {
    for (var prop in menuDivCSS) el.rstbMenuDiv.style[prop] = menuDivCSS[prop];
    for (var prop in menuSVGCSS.svg) el.rstbMenuSVG.style[prop] = menuSVGCSS.svg[prop];
    for (var prop in menuSVGCSS.polygon) el.rstbMenuSVGPolygon.style[prop] = menuSVGCSS.polygon[prop];
    for (var prop in menuSpacerCSS) el.rstbMenuSpacer.style[prop] = menuSpacerCSS[prop];
}





/**
 * Takes as input 2 RGBA arrays [0-255, 0-255, 0-255, 0-1] and returns the interpolated
 * RGBA string at q percent through the CIE*Lab color space.
 *
 * Arguments:
 *     sRGBA - Starting RGBA array of the interpolation
 *     eRGBA - Ending RGBA array of the interpolation
 *     q     - Percentage (domain: [0, 1]) of the progress of the interpolation through CIE*Lab color space
 *
 * Returns:
 *     CSS-valid RGBA string with the interpolated value ready to go.
 */
function rgbaInterpolate (sRGBA, eRGBA, q) {

    var I = 0,
        RED    = I++,
        L_STAR = RED,

        GREEN  = I++,
        A_STAR = GREEN,

        BLUE   = I++,
        B_STAR = BLUE,

        ALPHA = I++;

    q = q < 0? 0 : q > 1? 1 : q;
    var p = 1 - q,
        r = Math.round,

        sL = x2L (r2X (sRGBA)),
        eL = x2L (r2X (eRGBA)),

        iL = p * sL[L_STAR] + q * eL[L_STAR],
        ia = p * sL[A_STAR] + q * eL[A_STAR],
        ib = p * sL[B_STAR] + q * eL[B_STAR],
        alphaValue = p * sRGBA[ALPHA] + q * eRGBA[ALPHA],

        iRGBA = x2R (l2X ([iL, ia, ib, alphaValue]));

    // Returns the array corresponding to the XYZ values of the input RGB array
    function r2X (rgb) {
        var R = rgb[0] / 255,
            G = rgb[1] / 255,
            B = rgb[2] / 255;

        R = 100 * (R > 0.04045? Math.pow ((R + 0.055) / 1.055, 2.4) : R / 12.92);
        G = 100 * (G > 0.04045? Math.pow ((G + 0.055) / 1.055, 2.4) : G / 12.92);
        B = 100 * (B > 0.04045? Math.pow ((B + 0.055) / 1.055, 2.4) : B / 12.92);

        var X = R * 0.4124 + G * 0.3576 + B * 0.1805,
            Y = R * 0.2126 + G * 0.7152 + B * 0.0722,
            Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

        return [X, Y, Z];
    }

    // Returns the array corresponding to the CIE-L*ab values of the input XYZ array
    function x2L (xyz) {
        var X = xyz[0] / 95.047,
            Y = xyz[1] / 100,
            Z = xyz[2] / 108.883,
            T = 1 / 3,
            K = 16 / 116;

        X = X > 0.008856? Math.pow (X, T) : (7.787 * X) + K;
        Y = Y > 0.008856? Math.pow (Y, T) : (7.787 * Y) + K;
        Z = Z > 0.008856? Math.pow (Z, T) : (7.787 * Z) + K;

        var L = (116 * Y) - 16,
            a = 500 * (X - Y),
            b = 200 * (Y - Z);

        return [L, a, b];
    }

    // Returns the array corresponding to the XYZ values of the input CIE-L*ab array
    function l2X (Lab) {
        var Y = (Lab[0] + 16) / 116,
            X = Lab[1] / 500 + Y,
            Z = Y - Lab[2] / 200,
            K = 16 / 116;

        X = 95.047 * ((X * X * X) > 0.008856? X * X * X : (X - K) / 7.787);
        Y = 100 * ((Y * Y * Y) > 0.008856? Y * Y * Y : (Y - K) / 7.787);
        Z = 108.883 * ((Z * Z * Z) > 0.008856? Z * Z * Z : (Z - K) / 7.787);

        return [X, Y, Z];
    }

    // Returns the array corresponding to the RGB values of the input XYZ array
    function x2R (xyz) {
        var X = xyz[0] / 100,
            Y = xyz[1] / 100,
            Z = xyz[2] / 100,
            T = 1 / 2.4;

        var R = X *  3.2406 + Y * -1.5372 + Z * -0.4986,
            G = X * -0.9689 + Y *  1.8758 + Z *  0.0415,
            B = X *  0.0557 + Y * -0.2040 + Z *  1.0570;

        R = 255 * (R > 0.0031308? 1.055 * Math.pow (R, T) - 0.055 : 12.92 * R);
        G = 255 * (G > 0.0031308? 1.055 * Math.pow (G, T) - 0.055 : 12.92 * G);
        B = 255 * (B > 0.0031308? 1.055 * Math.pow (B, T) - 0.055 : 12.92 * B);

        return [R, G, B];
    }

    return 'rgba(' + r(iRGBA[RED]) + ',' + r(iRGBA[GREEN]) + ',' + r(iRGBA[BLUE]) + ',' + alphaValue + ')';
}

function positionInterpolate (start, stop, q) {
    var p = 1 - q,
        pI = p * start + q * stop;

    return pI;
}





// Prints the RSTB logo to the Chrome console in an awesome assortment of colors
function logRSTBLogo () {
      var UP = "background-color:rgb(84,84,84);";
      console.log('%c        ' +
                  '%c                                                ' +
                  '%c        ', '', UP, '');
      console.log('%c    ' +
                  '%c    ' +
                  '%c                                                ' +
                  '%c    ' +
                  '%c    ', '', UP, '', UP, '');
      console.log('%c    ' +
                  '%c                                                        ' +
                  '%c    ', UP, '', UP);
      console.log('%c    ' +
                  '%c   ' +
                  '%c            ' +
                  '%c ' +
                  '%c            ' +
                  '%c ' +
                  '%c            ' +
                  '%c ' +
                  '%c        ' +
                  '%c      ' +
                  '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
      console.log('%c    ' +
                  '%c   ' +
                  '%c    ' +
                  '%c    ' +
                  '%c    ' +
                  '%c ' +
                  '%c    ' +
                  '%c             ' +
                  '%c    ' +
                  '%c     ' +
                  '%c    ' +
                  '%c    ' +
                  '%c    ' +
                  '%c  ' +
                  '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
      console.log('%c    ' +
                  '%c   ' +
                  '%c        ' +
                  '%c     ' +
                  '%c            ' +
                  '%c     ' +
                  '%c    ' +
                  '%c     ' +
                  '%c        ' +
                  '%c      ' +
                  '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
      console.log('%c    ' +
                  '%c   ' +
                  '%c    ' +
                  '%c    ' +
                  '%c    ' +
                  '%c         ' +
                  '%c    ' +
                  '%c     ' +
                  '%c    ' +
                  '%c     ' +
                  '%c    ' +
                  '%c    ' +
                  '%c    ' +
                  '%c  ' +
                  '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
      console.log('%c    ' +
                  '%c   ' +
                  '%c    ' +
                  '%c    ' +
                  '%c    ' +
                  '%c ' +
                  '%c            ' +
                  '%c     ' +
                  '%c    ' +
                  '%c     ' +
                  '%c        ' +
                  '%c      ' +
                  '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
      console.log('%c    ' +
                  '%c                                                        ' +
                  '%c    ', UP, '', UP);
      console.log('%c    ' +
                  '%c    ' +
                  '%c                                                ' +
                  '%c    ' +
                  '%c    ', '', UP, '', UP, '');
      console.log('%c        ' +
                  '%c                                                ' +
                  '%c        ', '', UP, '');
}





// Simple storage handling functions
function reloadSettingsFromLocalStorage (callback1, callback2) {
    // Emit the signal to the SDK for access to the simple-storage API
    self.port.emit ('retrieveInfo', ['isHidden', 'buttonAlwaysDisplayed']);

    // Handle the returning message when emitted from index.js
    self.port.on ('readInfo', function (settings) {
        !!settings.isHidden? bT.makeTrue ('hideSidebar') : bT.makeFalse ('hideSidebar');
        !!settings.buttonAlwaysDisplayed? bT.makeTrue ('buttonAlwaysDisplayed') : bT.makeFalse ('buttonAlwaysDisplayed');

        // Execute the callbacks that require initial states for the Button
        callback1 ([true]);
        callback2 ([true]);
    });
}






// Polls for RES. Gives up after a predetermined time
var MAX_TIME_DELAY_MS = 5000,
    timeAtPoll = Date.now (),
    NIGHT_MODE_URL_RGX = /^https?:\/\/nm\./i;

function pollForRES () {
    if (Date.now () - timeAtPoll <= MAX_TIME_DELAY_MS) {
        resNightSwitchToggle = document.getElementById ('nightSwitchToggle');
        resNightSwitchLi = resNightSwitchToggle? resNightSwitchToggle.parentNode : false;

        if (resNightSwitchToggle) enableRESSetting ();

        // The new version of RES changed night switch names and HTML types
        else {
            var openRESPrefs = document.getElementById ('openRESPrefs');

            if (openRESPrefs) enableRESSetting ();
            else requestAnimationFrame (pollForRES);
        }
    }

    else {
        // Background color can only be set once because a URL change means a page refresh
        document.URL.match (NIGHT_MODE_URL_RGX)? bT.makeTrue ('isNightMode') : bT.makeFalse ('isNightMode');
    }

    function updateMenuBGColor () {
        setTimeout (function () {
            resNightSwitchToggle.className.match (/enabled$/i)? bT.makeTrue ('isNightMode') : bT.makeFalse ('isNightMode');

            var rgbaBG = 'rgba(' + (bT.holdsTrue ('isNightMode')? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + ACTIVE_ALPHA + ')',
                rgbaSt = 'rgba(' + (bT.holdsTrue ('isNightMode')? MENU_STROKE_NIGHT : MENU_STROKE_DAY) + ',' + ACTIVE_ALPHA + ')';

            el.rstbMenuSVGPolygon.setAttribute ('fill', rgbaBG);
            el.rstbMenuSVGPolygon.style.stroke = rgbaSt;
        }, 0);
    }

    function updateMenuBGColorWithRESWithoutNightSwitchToggle () {
        var a = document.querySelector ('[class*=res-night]');
        a? bT.makeTrue ('isNightMode') : bT.makeFalse ('isNightMode');

        var rgbaBG = 'rgba(' + (bT.holdsTrue ('isNightMode')? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + ACTIVE_ALPHA + ')',
            rgbaSt = 'rgba(' + (bT.holdsTrue ('isNightMode')? MENU_STROKE_NIGHT : MENU_STROKE_DAY) + ',' + ACTIVE_ALPHA + ')';

        el.rstbMenuSVGPolygon.setAttribute ('fill', rgbaBG);
        el.rstbMenuSVGPolygon.style.stroke = rgbaSt;
    }

    function enableRESSetting () {
        bT.makeTrue ('resIsInstalled');

        // Switch the color of the menu if the RES day/night button is clicked
        if (resNightSwitchLi) {
            resNightSwitchToggle.className.match (/enabled$/i)? bT.makeTrue ('isNightMode') : bT.makeFalse ('isNightMode');
            resNightSwitchLi.addEventListener ('mouseup', updateMenuBGColor);
        }

        else if (resNightSwitchToggle) {
            resNightSwitchToggle.className.match (/enabled$/i)? bT.makeTrue ('isNightMode') : bT.makeFalse ('isNightMode');
            resNightSwitchToggle.addEventListener ('mouseup', updateMenuBGColor);
        }

        else document.addEventListener ('mouseup', updateMenuBGColorWithRESWithoutNightSwitchToggle);
    }
}





// Toggles the sidebar visibility given the RSTB DOM reference
function toggleSidebar () {
    if (bT.holdsTrue ('hideSidebar')) {
        el.redditSideToggleButton.innerHTML = 'Show';
        for (var i = 0; i < redditSCA.length; i++) redditSCA[i].style.display = 'none';
    }

    else {
        el.redditSideToggleButton.innerHTML = 'Hide';
        for (var i = 0; i < redditSCA.length; i++) redditSCA[i].style.display = sCDS[i];
    }

    self.port.emit ('storeInfo', {isHidden: bT.isTrue ('hideSidebar')});
}

function executeButtonDisplayability () {
    // Ensures that the button is visible if the side classes are not
    var requiresButtonFunctionality = false;
    for (var i = 0; i < redditSCA.length; i++) {
        var invisibleByDisplay = redditSCA[i].style.display == 'none',
            isAnnoyinglyBig = (redditSCA[i].offsetWidth / body.offsetWidth) >= SIDE_TO_BODY_RATIO;

        if (invisibleByDisplay || isAnnoyinglyBig) {
            requiresButtonFunctionality = true;
            break;
        }
    }

    if (requiresButtonFunctionality || bT.holdsTrue ('buttonAlwaysDisplayed')) {
        el.redditSideToggleButton.style.display = sCDS[sCDS.length - 1];
        bT.makeTrue ('buttonIsDisplayedNow');
    }

    else {
        el.redditSideToggleButton.style.display = 'none';
        hoverAnimator.pause ();
        bT.makeFalse ('buttonIsDisplayedNow');
    }

    self.port.emit ('storeInfo', {buttonAlwaysDisplayed: bT.isTrue ('buttonAlwaysDisplayed')});
}





// Displays the RSTB menu from the Reddit Tab menu
function displayRSTBMenu (left, top) {
    if (bT.holdsTrue ('resIsInstalled')) {
        if (resNightSwitchToggle)
            resNightSwitchToggle.className.match (/enabled$/i)? bT.makeTrue ('isNightMode') : bT.makeFalse ('isNightMode');

        else {
            var a = document.querySelector ('[class*=res-night]');
            a? bT.makeTrue ('isNightMode') : bT.makeFalse ('isNightMode');
        }
    }

    var rgbaBG = 'rgba(' + (bT.holdsTrue ('isNightMode')? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + ACTIVE_ALPHA + ')',
        rgbaSt = 'rgba(' + (bT.holdsTrue ('isNightMode')? MENU_STROKE_NIGHT : MENU_STROKE_DAY) + ',' + ACTIVE_ALPHA + ')',
        topValue = Math.max (redditHeader.offsetHeight, redditTabMenu.getBoundingClientRect ().bottom) - window.scrollY;

    el.rstbMenuDiv.style.top  = topValue + MH_UN;
    el.rstbMenuDiv.style.left = (left - MHW) + MW_UN;
    el.rstbMenuDiv.style.position = 'fixed';
    el.rstbMenuDiv.style.display = 'block';

    el.rstbMenuSVGPolygon.setAttribute ('fill', rgbaBG);
    el.rstbMenuSVGPolygon.style.stroke = rgbaSt;
}

// Hides the RSTB menu from the viewport
function hideRSTBMenu () {
    var rgbaBG = 'rgba(' + (bT.holdsTrue ('isNightMode')? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + IDLE_ALPHA + ')',
        rgbaSt = 'rgba(' + (bT.holdsTrue ('isNightMode')? MENU_STROKE_NIGHT : MENU_STROKE_DAY) + ',' + IDLE_ALPHA + ')';
    el.rstbMenuDiv.style.display = 'none';

    el.rstbMenuSVGPolygon.setAttribute ('fill', rgbaBG);
    el.rstbMenuSVGPolygon.style.stroke = rgbaSt;
}





// Updater for the button text color animation
function txtRGBAUpdate (rgba) {
    el.redditSideToggleButton.style.color = rgba;
    el.redditSideToggleButton.style.border = borderAnim + rgba;
}

// Updater for the button background color animation
function bgRGBAUpdate (rgba) {
    el.redditSideToggleButton.style.backgroundColor = rgba;
}

// Updater for the option background color animation
function rstbDisplayabilityBGUpdate (rgba) {
    // Placed inside of undefined check because of polling
    if (el.rstbMenuDisplayabilityToggleButtonWrapper) el.rstbMenuDisplayabilityToggleButtonWrapper.style.backgroundColor = rgba;
}

// Updater for the option nob background color animation
function rstbDisplayabilityNobBGUpdate (rgba) {
    // Placed inside of undefined check because of polling
    if (el.rstbMenuDisplayabilityToggleButtonNob) el.rstbMenuDisplayabilityToggleButtonNob.style.backgroundColor = rgba;
}

// Updater for the option button nob position animation
function rstbDisplayabilityNobPosUpdate (pos) {
    // Placed inside of undefined check because of polling
    if (el.rstbMenuDisplayabilityToggleButtonNob) el.rstbMenuDisplayabilityToggleButtonNob.style.left = pos + 'px';
}
