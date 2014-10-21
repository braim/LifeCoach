//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/SettingsFlyout.html", {

        ready: function (element, options) {
            var applicationData = Windows.Storage.ApplicationData.current;
            var localSettings = applicationData.localSettings;
            var x = localSettings.values["email"];
            if(x)            document.getElementById("txtSetEmail").value = x;
            // Register the handlers for dismissal
            document.getElementById("defaultSettingsFlyout").addEventListener("keydown", handleKeys);
            document.getElementById("btnSetEmail").addEventListener("click",handleBtnSetEmail);
        },

        unload: function () {
            // Remove the handlers for dismissal
            document.getElementById("btnSetEmail").removeEventListener("click", handleBtnSetEmail);
            document.getElementById("defaultSettingsFlyout").removeEventListener("keydown", handleKeys);
            document.getElementById("backButton").removeEventListener("click", handleBackButton);
        },
    });

    function handleKeys(evt) {
        // Handles Alt+Left and backspace key in the control and dismisses it
        if ((evt.altKey && evt.key === 'Left') || (evt.key === 'Backspace')) {
            WinJS.UI.SettingsFlyout.show();
        }
    };
    function handleBtnSetEmail(){
        var newemail = document.getElementById("txtSetEmail").value;
        var applicationData = Windows.Storage.ApplicationData.current;
        var localSettings = applicationData.localSettings;
        localSettings.values["email"] = newemail;

    };
})();
