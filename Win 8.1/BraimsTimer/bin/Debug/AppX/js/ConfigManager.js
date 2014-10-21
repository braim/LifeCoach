function ConfigManager(type) {
    var firstoptions = [];
    var lines = [];
    var secondoptions = [];
    var xhrrespones;
    var configContent;
    var ThisInstance = this;
    var configFile;

    this.LoadDefaultSetting = function (parameter) {

        WinJS.xhr({ url: "AppData/config.txt" }).done(
        function completed(response) {
            xhrrespones = response;
            configContent = response.responseText;
            parameter();
        },
        function error(request) {
            var md = new Windows.UI.Popups.MessageDialog("Error in LoadDefaultSetting"+request);
            md.commands.append(new Windows.UI.Popups.UICommand("Ok"));
            md.showAsync();
        },
        function progress(request) {
            
        });
    }

    this.WriteBackConfig = function (params) {
        configContent = lines[0];
        for (var i = 1; i < lines.length; i++) {
            if (lines[i].length > 0)
                configContent += "\r\n" + lines[i];
        }

        Windows.Storage.FileIO.writeTextAsync(configFile, configContent);
    };
    this.GetSelectedL1 = function (parameters){

        var rootdiv = document.getElementById("firstlevelC");
        var inputs = rootdiv.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++)
            if (inputs[i].checked) {
                var l1 = inputs[i].value;
            }
        return l1;
    }
    this.SetSelectedL1 = function (parameters) {

        var rootdiv = document.getElementById("firstlevelC");
        var inputs = rootdiv.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++){
            if (inputs[i].value == parameters) {
                inputs[i].checked = true;
                inputs[i].fireEvent("onchange");
            }

            }
      
    }
    this.GetSelectedL2 = function (parameters) {
        var rootdiv = document.getElementById("secondlevelC");
        var inputs = rootdiv.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++)
            if (inputs[i].checked) {
                var l1 = inputs[i].value;
            }
        return l1;
    }
    this.Add = function (parameters) {
       
        var x = parameters.srcElement.id;

        if (x == "btnAddL1") {
            var v = document.getElementById("txtAddL1").value;
            if (v == "") {
                ThisInstance.ShowNoNameDlg();
            } else {
                lines.push(v + ",");
                ThisInstance.WriteBackConfig(v);
                ThisInstance.CreateRBs();

            }
        }
        if (x == "btnAddL2") {
            var v = document.getElementById("txtAddL2").value;
            if (v == "") {
                ThisInstance.ShowNoNameDlg();
            } else {
                var l1 = ThisInstance.GetSelectedL1();
                if (l1 && (l1 != "")) {
                    lines.push(l1 + "," + v);

                    ThisInstance.CreateRBs();
                    ThisInstance.SetSelectedL1(l1);
                    ThisInstance.WriteBackConfig();
                } else {
                    ThisInstance.ShowNoL1Dlg();
                }
            }
        }
    };
    this.ShowNoL1Dlg = function () {
        var md = new Windows.UI.Popups.MessageDialog("Select a parent category to add to");
        md.commands.append(new Windows.UI.Popups.UICommand("Ok"));
        md.showAsync();
    }
    this.ShowNoNameDlg = function () {
        var md = new Windows.UI.Popups.MessageDialog("Enter item to add");
        md.commands.append(new Windows.UI.Popups.UICommand("Ok"));
        md.showAsync();
    }
    this.ShowNoItemDlg = function () {
        var md = new Windows.UI.Popups.MessageDialog("Select an item to delete");
        md.commands.append(new Windows.UI.Popups.UICommand("Ok"));
        md.showAsync();
    }
    this.ShowAreYouSure = function(itemdodel){
        var md = new Windows.UI.Popups.MessageDialog("Are you sure you want to delete'"+itemdodel+"'?");
        md.commands.append(new Windows.UI.Popups.UICommand("Yes"));
        md.commands.append(new Windows.UI.Popups.UICommand("No"));
        return md.showAsync();
    }
    this.Del = function (parameters) {
        var x = parameters.srcElement.id;
        var l1 = ThisInstance.GetSelectedL1();
        if (x == "btnDelL1") {
            
            if (l1) {
                ThisInstance.ShowAreYouSure(l1).then(function (command) {
                    if (command.label == "Yes") {
                        var Lines2 = [];
                        for (var i = 0; i < lines.length; i++)
                            if (lines[i].indexOf(l1) != 0)
                                Lines2.push(lines[i]);
                        lines = Lines2;
                        ThisInstance.CreateRBs();

                        ThisInstance.WriteBackConfig();
                    }
                });
            } else {
                ThisInstance.ShowNoItemDlg();
            }
        } 
        if(x=="btnDelL2"){
            var l2 = ThisInstance.GetSelectedL2();
            if (l2) {
                ThisInstance.ShowAreYouSure(l2).then(function (command) {
                    if (command.label == "Yes") {
                        var Lines2 = [];
                        for (var i = 0; i < lines.length; i++) {
                            if (lines[i].indexOf(",") == -1) continue;
                            if (lines[i].split(",")[1] == l2) {
                            } else {
                                Lines2.push(lines[i]);
                            }
                        }
                        lines = Lines2;
                        ThisInstance.CreateRBs();
                        ThisInstance.SetSelectedL1(l1);
                        ThisInstance.WriteBackConfig();
                    }
                });
            } else {
                ThisInstance.ShowNoItemDlg();
            }

        }
    }
    this.CreateRBs = function (paramers) {
        var pre_l1 = ThisInstance.GetSelectedL1();
        firstoptions = [];
        for (var i = 0; i < lines.length; i++) {
            var item = lines[i].split(",")[0];
            if (firstoptions.indexOf(item) == -1)
                firstoptions.push(item);
        }
        document.getElementById("firstlevelC").innerHTML = "";
        document.getElementById("secondlevelC").innerHTML = "";
        
        for (var j = 0; j < firstoptions.length; j++) {
            if (firstoptions[j].trim() == '') continue;
            var newdiv = document.createElement('div');
            newdiv.setAttribute('class', 'firstoptiondiv');
            var radioInput = document.createElement('input');
            radioInput.setAttribute('type', 'radio');
            radioInput.setAttribute('name', 'firstoption');
            radioInput.setAttribute('id', 'fl_' + j);
            radioInput.setAttribute('value', firstoptions[j]);
           // if (firstoptions[j] == pre_l1) radioInput.setAttribute('checked', 'true');
            radioInput.onchange = function (event) {
                if (event.target) {
                    var currentCheckedRadio = event.target;
                    var name = currentCheckedRadio.name;
                    var v = currentCheckedRadio.value;
                } else {
                    var name = event.srcElement.name;
                    var v = event.srcElement.value;
                }

                var secondleveldiv = document.getElementById("secondlevelC");
                secondleveldiv.innerHTML = "";
                secondoptions = [];
                for (var k = 0; k < lines.length; k++) {
                    if (lines[k].split(",")[0] == v)
                        if (secondoptions.indexOf(lines[k].split(",")[1]) == -1)
                            secondoptions.push(lines[k].split(",")[1]);
                }
                for (var l = 0; l < secondoptions.length; l++) {
                    if (secondoptions[l] == "") continue;
                    var newdiv = document.createElement('div');
                    newdiv.setAttribute('class', 'secondoptiondiv');
                    var radioInput = document.createElement('input');
                    radioInput.setAttribute('type', 'radio');
                    radioInput.setAttribute('name', 'secondoption');
                    radioInput.setAttribute('id', 'sl_' + l);
                    radioInput.setAttribute('value', secondoptions[l]);
                    newdiv.appendChild(radioInput);
                    var lbl2 = document.createElement('Label');
                    lbl2.setAttribute('for', 'sl_' + l);
                    lbl2.innerText = secondoptions[l];
                    newdiv.appendChild(radioInput);
                    newdiv.appendChild(lbl2);
                    secondleveldiv.appendChild(newdiv);
                }
            };
            var lbl = document.createElement('Label');
            lbl.setAttribute('for', 'fl_' + j);
            lbl.innerText = firstoptions[j];
            newdiv.appendChild(radioInput);
            newdiv.appendChild(lbl);
            document.getElementById("firstlevelC").appendChild(newdiv);
        }
    }
    this.LoadFromFile = function () {
        this.LoadFileOrDefault(this.CreateRBs);
    };
    this.GetConfigContent = function () {
        return configContent;
    }
    this.LoadFileOrDefault = function (param) {

        var applicationData = Windows.Storage.ApplicationData.current;

        applicationData.localFolder.createFileAsync("Config.txt",
        Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            configFile = file;
            return Windows.Storage.FileIO.readTextAsync(file)
        })
        .then(function (fileContents) {

            var isRefresh = false;
            if (!fileContents || isRefresh) {
                var c = new ConfigManager();
                c.LoadDefaultSetting(function () {
                    configContent = c.GetConfigContent();
                    lines = configContent.split("\r\n");
                    param();
                });

            }
            else {
                configContent = fileContents;
                lines = configContent.split("\r\n");
                param();
            }
        });
       
    };
}