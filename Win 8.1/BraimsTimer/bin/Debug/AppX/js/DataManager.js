
function DataManager(type) {
    var thisInstance = this;
    var fileDataText;
    var dtLastBreak = new Date();
    var linesData = [];
    //
    // If data file exists, returns the last time on the file. Otherwise returns begining of the day
    //
    this.GetStartTime = function () {

        dtLastBreak.setHours(0, 0, 0, 0);
        var applicationData = Windows.Storage.ApplicationData.current;
        applicationData.localFolder.createFileAsync("Data.txt",
        Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
                fileDataText = file;
                return Windows.Storage.FileIO.readTextAsync(file);
            })
        .then(function (fileContents) {
            
            var isRefresh = false;
            if (!fileContents || isRefresh) {
                //  do nothing
            }
            else {

                var date;
                linesData = fileContents.split("\r\n");
                for (var i = 0; i < linesData.length; i++) {
                    if (linesData[i].indexOf(",") == -1) continue;
                    dtLastBreak = new Date(linesData[i].split(",")[0]);
                    //  dtLastBreak = Date.parse(lines[i].split(",")[0]);
                }
                thisInstance.SetTextArea();
                Windows.Storage.FileIO.writeTextAsync(fileDataText, "");
            }
        }).then(function () {
            document.getElementById("lblStart").innerText = dtLastBreak.toString();
        });
        return dtLastBreak;
    };
    //
    // Starts the timer and its handler
    //
    this.StartTimer = function () {
        var myTest = document.getElementById("lblSoFar");
        var intervalId = setInterval(function () {
            var n = new Date();
            var difference = n - dtLastBreak;
            var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
            difference -= daysDifference * 1000 * 60 * 60 * 24
            var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
            difference -= hoursDifference * 1000 * 60 * 60
            var minutesDifference = Math.floor(difference / 1000 / 60);
            difference -= minutesDifference * 1000 * 60
            var secondsDifference = Math.floor(difference / 1000);

            if (hoursDifference < 10) { hoursDifference = "0" + hoursDifference; }
            if (minutesDifference < 10) { minutesDifference = "0" + minutesDifference; }
            if (secondsDifference < 10) { secondsDifference = "0" + secondsDifference; }

            myTest.value = "" + hoursDifference + ":" + minutesDifference + ":" + secondsDifference;
        }, 1000);
    }
    this.ClearData = function () {
        linesData = [];
        thisInstance.SetTextArea();
        dtLastBreak = new Date();
        dtLastBreak.setHours(0, 0, 0, 0);
        document.getElementById("lblStart").innerText = dtLastBreak.toString();
    }
    //
    // Updates text area with data lines
    //
    this.SetTextArea = function () {
        var z = "";
        for (var i = 0; i < linesData.length; i++)
            z += (linesData[i] + "\n");
        var textarea = document.getElementById("taLines");
        textarea.value = z;
    }
    this.GetAsText = function (linebreak) {
        var z = "";
        for (var i = 0; i < linesData.length; i++)
            z += (linesData[i] + linebreak );
        return z;
    }
    this.AddLine = function (a, b, c) {
        if (a <= dtLastBreak) {
            thisInstance.ShowNewTimeEarlierDlg();
        } else if (a > new Date()) {
            thisInstance.ShowNewTimeAfterNowDlg();
        } else {
            dtLastBreak = a;
            document.getElementById("lblStart").innerText = dtLastBreak.toString();
            linesData.push("" + a + "," + b + "," + c);
            thisInstance.SetTextArea();
            Windows.Storage.FileIO.appendTextAsync(fileDataText, "" + a + "," + b + "," + c + "\r\n");
        }
    }
    this.GetSelecteL1 = function () {
        var rootdiv = document.getElementById("firstlevelC");
        var inputs = rootdiv.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++)
            if (inputs[i].checked)
                return inputs[i].value;

    }
    this.GetSelecteL2 = function () {
        var rootdiv = document.getElementById("secondlevelC");
        var inputs = rootdiv.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++)
            if (inputs[i].checked)
                return inputs[i].value;

    }
    this.Break = function (parameters) {
        var x = parameters.srcElement.value;
        // var result_new = new Date();
        if (x == "breaknow") {
            /*
            var rootdiv = document.getElementById("firstlevelC");
            var inputs = rootdiv.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; i++)
                if (inputs[i].checked) {
                    var l1 = inputs[i].value;
                }
           */
            //  result_new = new Date();
            thisInstance.AddLine(new Date(), thisInstance.GetSelecteL1(), thisInstance.GetSelecteL2());
        }
        if (x == "breakfor") {
            var breakfor = document.getElementById("numBreakfor").value;
            var newDateObj = new Date(dtLastBreak.getTime() + breakfor * 60000);
            //result_new = newDateObj;
            thisInstance.AddLine(newDateObj, thisInstance.GetSelecteL1(), thisInstance.GetSelecteL2());

        }
        if (x == "breakat") {
            var dateFilterControl = document.getElementById("dtBreakat").winControl;
            var month = dateFilterControl.current;
            //result_new = month;
            thisInstance.AddLine(month, thisInstance.GetSelecteL1(), thisInstance.GetSelecteL2());
        }
    }
    this.Clear = function () {
        var md = new Windows.UI.Popups.MessageDialog("Are you sure you want to clear data?");
        md.commands.append(new Windows.UI.Popups.UICommand("Yes"));
        md.commands.append(new Windows.UI.Popups.UICommand("No"));
        md.showAsync().then(function (command) {
            if (command.label == "Yes") {
                thisInstance.ClearData();
            }

        });

    }
    this.ShowNewTimeEarlierDlg = function () {
        var md = new Windows.UI.Popups.MessageDialog("New break time must be after last break time");
        md.commands.append(new Windows.UI.Popups.UICommand("Ok"));
        md.showAsync();
    }
    this.ShowNewTimeAfterNowDlg = function () {
        var md = new Windows.UI.Popups.MessageDialog("New break time can not be in future");
        md.commands.append(new Windows.UI.Popups.UICommand("Ok"));
        md.showAsync();
    }
    this.loginWL = function () {

        //WL.init({ client_id: clientId, redirect_uri: redirectUri });
        WL.init({});
        WL.Event.subscribe("auth.login", onLogin);
        WL.Event.subscribe("auth.sessionChange", onSessionChange);

        var session = WL.getSession();
        if (session) {
            log("You are already signed in!");
        } else {
            WL.login({ scope: "wl.signin" });
        }

        function onLogin() {
            var session = WL.getSession();
            if (session) {
                log("You are signed in!");
            }
        }

        function onSessionChange() {
            var session = WL.getSession();
            if (session) {
                log("Your session has changed.");
            }
        }

        function log(message) {
            var child = document.createTextNode(message);
            var parent = document.getElementById('JsOutputDiv') || document.body;
            parent.appendChild(child);
            parent.appendChild(document.createElement("br"));
        }
    };
    this.SaveFile = function () {
        WinJS.log && WinJS.log("Save Started.", "sample", "status");
        // Create the picker object and set options
        var savePicker = new Windows.Storage.Pickers.FileSavePicker();
        savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
        // Dropdown of file types the user can save the file as
        savePicker.fileTypeChoices.insert("Plain Text", [".txt"]);
        // Default file name if the user does not type one in or select a file to replace
        savePicker.suggestedFileName = "New Document";
        savePicker.pickSaveFileAsync().then(function (file) {
            if (file) {
                // Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
                Windows.Storage.CachedFileManager.deferUpdates(file);
                // write to file
                var body = thisInstance.GetAsText("\r\n");

                Windows.Storage.FileIO.writeTextAsync(file, body).done(function () {
                    // Let Windows know that we're finished changing the file so the other app can update the remote version of the file.
                    // Completing updates may require Windows to ask for user input.
                    Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
                        if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                            WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
                        } else {
                            WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
                        }
                    });
                });
            } else {
                WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
            }
        });

    };

}