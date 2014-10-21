// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";
    var sampleTitle = "Application Settings";
    var scenarios = [
    { url: "/html/MainScenario.html", title: "Default Screen" },
    { url: "/html/SettingsFlyout.html", title: "Settings Flyout" }
  
  
    ];
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var cnfgmgr = new ConfigManager();
    var datamgr = new DataManager();
    WinJS.Binding.optimizeBindingReferences = true;

    WinJS.Utilities.startLog({ type: "status", tags: "sample" });

    WinJS.Namespace.define("SdkSample", {
        sampleTitle: sampleTitle,
        scenarios: scenarios
    });
    var doSaveLocal;
    var page = WinJS.UI.Pages.define("default.html", {
        ready: function (element, options) {

            
            document.getElementById("btnEmail").addEventListener("click", doClickView, false);
            document.getElementById("btnBreakat").addEventListener("click", datamgr.Break, false);
            document.getElementById("btnBreakfor").addEventListener("click", datamgr.Break, false);
            document.getElementById("btnBreaknow").addEventListener("click", datamgr.Break, false);
            document.getElementById("btnAddL1").addEventListener("click", cnfgmgr.Add, false);
            document.getElementById("btnDelL1").addEventListener("click", cnfgmgr.Del, false);
            document.getElementById("btnAddL2").addEventListener("click", cnfgmgr.Add, false);
            document.getElementById("btnDelL2").addEventListener("click", cnfgmgr.Del, false);
            document.getElementById("btnSaveWL").addEventListener("click", datamgr.loginWL, false);
            document.getElementById("btnSaveLocal").addEventListener("click", datamgr.SaveFile , false);

            WinJS.log && WinJS.log("To show the bar, swipe up from the bottom of the screen", "sample", "status");

            WinJS.Application.onsettings = function (e) {
                e.detail.applicationcommands = { "defaults": { title: "Defaults", href: "/html/SettingsFlyout.html" } };
                WinJS.UI.SettingsFlyout.populateSettings(e);
            };
            document.querySelector("#btnShowSettings").addEventListener("click", function (e) {
                //WinJS.UI.SettingsFlyout.showSettings("defaults", "/html/4-SettingsFlyout-Settings.html");
                Windows.UI.ApplicationSettings.SettingsPane.show();
            });
            document.querySelector("#btnClear").addEventListener("click", datamgr.Clear);

        },
        unload: function () {
            AppBarSampleUtils.removeAppBars();
        },
        sampleTitle: sampleTitle,
        scenarios: scenarios
    });
    doSaveLocal = function () {
        WinJS.log && WinJS.log("Save local pressed", "sample", "status");
        WinJS.log && WinJS.log("Save local pressed", "A", "info");
    };
    function doClickView() {
        WinJS.log && WinJS.log("Add button pressed", "sample", "status");
        var applicationData = Windows.Storage.ApplicationData.current;
        var localSettings = applicationData.localSettings;
        var mailto = localSettings.values["email"];
        if (!mailto) mailto = "";
   
        var body = datamgr.GetAsText("%0D%0A");
           
         var mymail = new Windows.Foundation.Uri("mailto:?to="+mailto+"&subject=Braim's Timer Data&body="+body);
         Windows.System.Launcher.launchUriAsync(mymail);
 
        WinJS.log && WinJS.log("Add button pressed", "sample", "status");
    }

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                cnfgmgr.LoadFromFile();
                var dt_start = datamgr.GetStartTime();
                document.getElementById("lblStart").innerText = dt_start.toString();
                datamgr.StartTimer();

                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll().done(function () {

                var url = WinJS.Application.sessionState.lastUrl || scenarios[0].url;
                return WinJS.Navigation.navigate(url);

            })
            );
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    WinJS.Navigation.addEventListener("navigated", function (eventObject) {
        var url = eventObject.detail.location;
        var host = document.getElementById("contentHost");
        // Call unload method on current scenario, if there is one
        host.winControl && host.winControl.unload && host.winControl.unload();
        WinJS.Utilities.empty(host);
        eventObject.detail.setPromise(WinJS.UI.Pages.render(url, host, eventObject.detail.state).then(function () {
            WinJS.Application.sessionState.lastUrl = url;
        }));
    });

    app.start();
})();
