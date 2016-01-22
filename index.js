var data = require ('sdk/self').data,
    pM = require ('sdk/page-mod'),
    sS = require ('sdk/simple-storage').storage;

pM.PageMod ({
    include: /^https?:\/\/[^.]*\.?reddit\.com\/.*/,
    exclude: /^https?:\/\/(api|m)\.reddit\.com\/.*/,

    contentStyleFile: data.url ('menu.css'),

    contentScriptFile: [
        data.url ('scripts/objects.js'),
        data.url ('scripts/global_variables_and_functions.js'),
        data.url ('scripts/script.js')
    ],

    contentScriptWhen: 'end',

    // Establish communication between the content scripts and the main script for storage
    onAttach: startSimpleStorage
});

/**
 * Utilizes the simple-storage API to store information for the content script
 * so that the user does not have to re-enable everything during each page reload.
 */
function startSimpleStorage (worker) {
    // Stores the information given from the content script
    worker.port.on ('storeInfo', function (keyVals) {
        for (var key in keyVals) sS[key] = keyVals[key];
    });

    // Reads back the information stored from simple storage
    worker.port.on ('retrieveInfo', function (keys) {
        var settings = {};
        for (var i = 0; i < keys.length; i++) settings[keys[i]] = sS[keys[i]]? sS[keys[i]] : null;

        // Emit any and all key values obtained from simple storage
        worker.port.emit ('readInfo', settings);
    });
}
