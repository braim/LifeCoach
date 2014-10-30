//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var cnfgmgr = new ConfigManager();
    var datamgr = new DataManager();

    var page = WinJS.UI.Pages.define("/html/MainScenario.html", {
        ready: function (element, options) {
            var heightOfForm = document.getElementById('formWrapper').offsetHeight;
            //Get height of body (accounting for user-installed toolbars)
            var heightOfBody = document.body.clientHeight;

            var buffer = 135; //Accounts for misc. padding, etc.
            //Set the height of the textarea dynamically
            document.getElementById('taLines').style.height =
              (heightOfBody - heightOfForm) - buffer;

        
            document.getElementById("btnBreakat").addEventListener("click", datamgr.Break, false);
            document.getElementById("btnBreakfor").addEventListener("click", datamgr.Break, false);
            document.getElementById("btnBreaknow").addEventListener("click", datamgr.Break, false);
            document.getElementById("btnAddL1").addEventListener("click", cnfgmgr.Add, false);
            document.getElementById("btnDelL1").addEventListener("click", cnfgmgr.Del, false);
            document.getElementById("btnAddL2").addEventListener("click", cnfgmgr.Add, false);
            document.getElementById("btnDelL2").addEventListener("click", cnfgmgr.Del, false);
            document.getElementById("btnSaveWL").addEventListener("click", datamgr.SaveToOneDrive, false);
            document.getElementById("btnLoginWL").addEventListener("click", datamgr.loginWL, false);
            document.getElementById("btnSaveLocal").addEventListener("click", datamgr.SaveFile, false);
          
            document.querySelector("#btnClear").addEventListener("click", datamgr.Clear);

            cnfgmgr.LoadFromFile();
            var dt_start = datamgr.GetStartTime();
            document.getElementById("lblStart").innerText = dt_start.toString();
            datamgr.StartTimer();

            // clear out the current on settings handler to ensure scenarios are atomic
            //   WinJS.Application.onsettings = null;

            // Display invocation instructions in the SDK sample output region
            WinJS.log && WinJS.log("To show the settings charm, invoke the charm bar by swiping your finger on the right edge of the screen or bringing your mouse to the lower-right corner of the screen, then select Settings. Or you can just press Windows logo + i. To dismiss the settings charm, tap in the application, swipe a screen edge, right click, invoke another charm or application.", "sample", "status");
        },
        unload: function () {
            datamgr.dispose();
        },
    });

    function scenario1ShowSettingsCharm() {
        // Ensure no settings commands are specified in the settings charm in this scenario
        WinJS.Application.onsettings = function (e) { };
        Windows.UI.ApplicationSettings.SettingsPane.show();
    }
})();
