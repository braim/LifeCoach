
function DataManager(type) {
    var thisInstance = this;
    var fileDataText;
    var dtLastBreak = new Date();
    var linesData = [];
    var breakEvents = [];

    this.AddBreakEvent = function(t,l1,l2) {
        breakEvents.push({ "TimeStamp": t, "L1": l1, "L2": l2 });

        var appData = Windows.Storage.ApplicationData.current;
        var roamingSettings = appData.roamingSettings;
       // roamingSettings.values["BreakEvents"] = breakEvents;
    }
    //
    // If data file exists, returns the last time on the file. Otherwise returns begining of the day
    //
    this.GetStartTime = function () {

        var appData = Windows.Storage.ApplicationData.current;
        var roamingSettings = appData.roamingSettings;
        var testing = roamingSettings.values["BreakEvents"];


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
                var tempLinesData = fileContents.split("\r\n");
                linesData = [];
                for (var i = 0; i < tempLinesData.length; i++) {
                    if (tempLinesData[i].indexOf(",") == -1) continue;
                    linesData.push(tempLinesData[i]);
                    dtLastBreak = new Date(tempLinesData[i].split(",")[0]);

                    thisInstance.AddBreakEvent(dtLastBreak, tempLinesData[i].split(",")[1], tempLinesData[i].split(",")[2]);
                    //  dtLastBreak = Date.parse(lines[i].split(",")[0]);
                }
                thisInstance.SetTextArea();
              
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
        breakEvents = [];
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
            z += (breakEvents[i].TimeStamp.toLocaleString()+","+breakEvents[i].L1+","+breakEvents[i].L2+ "\n");

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
            thisInstance.AddBreakEvent(a, b, c);
            thisInstance.SetTextArea();
            Windows.Storage.FileIO.appendTextAsync(fileDataText, "\r\n" + a + "," + b + "," + c );
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

    this.SaveToOneDrive = function () {

        var session = WL.getSession();
        if (session) {
            var dateToFormat = dtLastBreak;


            // Formatters for times.
            var stimefmt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("{hour.integer}‎-{minute.integer(2)}‎-‎{second.integer(2)}");
            var mydatefmt1 = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("day");
            var mydatefmt6 = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("month.numeric");
            var mydatefmt7 = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("year.abbreviated");
            // Perform the actual formatting.
            var mydate1 = mydatefmt1.format(dateToFormat);
            var mydate6 = mydatefmt6.format(dateToFormat);
            var mydate7 = mydatefmt7.format(dateToFormat);

            var fileName = mydate7 + "-" + mydate6 + "-" + mydate1 + " " + stimefmt.format(dtLastBreak);
            var whenfilecreated = SkyDrive.createFile(fileName);
            whenfilecreated.then( function() {
                SkyDrive.sendSkyDriveFile(thisInstance.GetAsText());
            });
        } else {
            var md = new Windows.UI.Popups.MessageDialog("You don't seem to be logged in OneDrive. First use the login button");
            md.commands.append(new Windows.UI.Popups.UICommand("Ok"));

            md.showAsync();
        }
    }
    this.loginWL = function () {


        WL.init({});
        WL.Event.subscribe("auth.login", onLogin);
        WL.Event.subscribe("auth.sessionChange", onSessionChange);

        var session = WL.getSession();

        // TEMORARY. Just make sure we are logged in. Remove for release
       // if (session) {
       //     log("You are already signed in!");
          

       // } else {
            WL.login({ scope: "wl.skydrive_update" });
       // }
       
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


    };
    function log(message) {
        var child = document.createTextNode(message);
        var parent = document.getElementById('JsOutputDiv') || document.body;
        parent.appendChild(child);
        parent.appendChild(document.createElement("br"));
    }

    this.UploadToOneDrive_NotWorking =function () {
        WL.fileDialog({ mode: 'save' }).then(
            function (response) {
                var folder = response.data.folders[0];

                WL.upload({
                    path: folder.id,
                    element: 'save-to-skydrive-file-input',
                    overwrite: 'rename'
                }).then(
                    function (response) {
                        log("You saved to " + response.source + ". " +
                            "Below is the result of the upload.");
                        log("");
                        log(JSON.stringify(response));
                    },
                    function (errorResponse) {
                        log("WL.upload errorResponse = " + JSON.stringify(errorResponse));
                    },
                    function (progress) {
                        // progress events for the upload are raised here
                    }
                );
            }, function (errorResponse) {
                log("WL.fileDialog errorResponse = " + JSON.stringify(errorResponse));
            }
        );
    }

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

    this.dispose = function() {
        fileDataText.FlushAsync();
    }
}