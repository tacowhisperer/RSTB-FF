/**
 * Creates the side toggling button on the lower right corner of the window on Reddit
 * and enables the functions that show or hide the sidebar on click.
 *
 * Most of the code in this file is for animating the transparency and color on hover
 * and click for aesthetic purposes. Full functionality can be achieved through jQuery,
 * but has been abandoned for slight performance boostage and code exercise.
 *
 * The initializing code below only runs if there exists a "side" class in the Reddit
 * page. As a sidenote, redditSCA stands for Reddit Side Class Array.
 *
 * Public Methods Description Format: method - [arguments] <short description> (return value)
 */
if (redditSCA.length) {

// Create the button and menu elements and add them to the page
var rstbTab = document.createElement ('li'),
	rstbMenuDiv = document.createElement ('div');

// Create the tab that goes in the Reddit Tab Menu
rstbTab.innerHTML = '<a href="javascript:void(0)" id="rstbmenulink" class="choice">' + MENU_TAB_TEXT + '</a>';
redditTabMenu.appendChild (rstbTab);



// Create the RSTB Menu that will appear when the tab is clicked
rstbMenuDiv.setAttribute ('id', 'rstbmenudiv');
rstbMenuDiv.setAttribute ('style', 'display:none;');
body.appendChild (rstbMenuDiv);
rstbMenuDiv.innerHTML = rstbMenuSpacerHTML + svgCode + rstbMenuDisplayabilityToggleOptionHTML;



// Create the RSTB
var rSTB = document.createElement ('p');
rSTB.id = 'redditsidetogglebutton';
rSTB.innerHTML = 'Hide';
for (var prop in buttonCSS) rSTB.style[prop] = buttonCSS[prop];

// Add the RSTB to the DOM and save its display CSS property
body.appendChild (rSTB);
sCDS.push (rSTB.style.display);



// Set the el object DOM references
el = getDomElementReferencesFor (rstbElements);
styleSpecifiedReferences ();





// Add the animations to the animators
hoverAnimator.addAnimation (txtAnimation)
			 .addAnimation (bgAnimation)
			 .start ();

displayAnimator.addAnimation (rstbMenuBGAnimation)
			   // .addAnimation (rstbMenuNobBGAnimation)
			   .addAnimation (rstbMenuNobPosAnimation)
			   .start ();



el.redditSideToggleButton.addEventListener ('mouseenter', function () {
    bT.makeTrue ('mouseOnButton');

    // Used for starting the hover animation for the first time
    if (bT.holdsTrue ('hoverAnimationNotInitialized')) {
        hoverAnimator.playAnimation (TXT_ANIMATION).playAnimation (BG_ANIMATION);
        bT.makeFalse ('hoverAnimationNotInitialized');
    }

    hoverAnimator.setAnimationForward (TXT_ANIMATION).setAnimationForward (BG_ANIMATION).play ([TXT_ANIMATION, BG_ANIMATION]);
});

el.redditSideToggleButton.addEventListener ('mouseleave', function () {
    bT.makeFalse ('mouseOnButton');

    hoverAnimator.setAnimationBackward (TXT_ANIMATION).setAnimationBackward (BG_ANIMATION).play ([TXT_ANIMATION, BG_ANIMATION]);
});

el.redditSideToggleButton.addEventListener ('mousedown', function () {
    hoverAnimator.pause ().endAnimation (TXT_ANIMATION).endAnimation (BG_ANIMATION);
    el.redditSideToggleButton.style.color = bgRGBA1;
    el.redditSideToggleButton.style.border = bgBorder1;
    el.redditSideToggleButton.style.backgroundColor = txtRGBA1;
});

el.redditSideToggleButton.addEventListener ('mouseup', function (e) {
    if (bT.holdsTrue ('mouseOnButton') && e.which == LEFT_CLICK) {
        // Handles toggling visibility and button styling during mouse up
        bT.toggle ('hideSidebar');
        toggleSidebar ();

        el.redditSideToggleButton.style.color = txtRGBA1;
        el.redditSideToggleButton.style.border = txtBorder1;
        el.redditSideToggleButton.style.backgroundColor = bgRGBA1;

        // Makes the button disappear if the setting applies
        executeButtonDisplayability ();
    }
});


el.rstbMenuLink.addEventListener ('mousedown', function (e) {
    displayRSTBMenu (e.clientX, e.clientY);
});

el.rstbMenuDisplayabilityToggleButtonWrapper.addEventListener ('mousedown', toggleButtonDisplayability);



// Shows or hides the button based on the settings provided by the user
window.addEventListener ('scroll', hideRSTBMenu);
window.addEventListener ('resize', hideRSTBMenu);
for (var i = 0; i < redditContentArray.length; i++) redditContentArray[i].addEventListener ('mousedown', hideRSTBMenu);
if (redditListingChooser) redditListingChooser.addEventListener ('mousedown', hideRSTBMenu);

window.addEventListener ('resize', executeButtonDisplayability);

function toggleButtonDisplayability (calledFromInternal) {
    if (bT.holdsTrue ('displayOptionAnimationNotInitialized')) {
        displayAnimator .playAnimation (MENU_DISP_BG_ANIMATION)
                        // .playAnimation (MENU_NOB_BG_ANIMATION)
                        .playAnimation (MENU_NOB_POSITION_ANIMATION);
        bT.makeFalse ('displayOptionAnimationNotInitialized');
    }

    if (!arguments.length || !calledFromInternal[0]) bT.toggle ('buttonAlwaysDisplayed');
    if (bT.holdsTrue ('buttonAlwaysDisplayed')) {
        displayAnimator .setAnimationForward (MENU_DISP_BG_ANIMATION)
                        // .setAnimationForward (MENU_NOB_BG_ANIMATION)
                        .setAnimationForward (MENU_NOB_POSITION_ANIMATION);
    }

    else {
        displayAnimator .setAnimationBackward (MENU_DISP_BG_ANIMATION)
                        // .setAnimationBackward (MENU_NOB_BG_ANIMATION)
                        .setAnimationBackward (MENU_NOB_POSITION_ANIMATION);
    }

    executeButtonDisplayability ();
}



// Poll for RES to correctly set the resIsInstalled and the isNightMode bT booleans
pollForRES ();

// Make sure that the button is visible if needed upon initialization if the user set it to hide
setTimeout (executeButtonDisplayability, 0);

// Reload the settings from the previous page reload, if any
reloadSettingsFromLocalStorage (toggleSidebar, toggleButtonDisplayability);


// Finish by logging the trademark on the console for pro users to admire (or not hehe)
logRSTBLogo ();

}
