/// <reference path="///LiveSDKHTML/js/wl.js" />

(function () {

    var inMemoryFile;
    var uploadUrl;
    var downloadUrl;
    var folderUrl;
    var loggedIn = false;
    // Store user data files in a unique folder to help 
    // the user easily manage their files when using SkyDrive.
    var folderName = "BraimTimerNotes";

    WL.init();

    // Event gets fired if user's login status changes.
    WL.Event.subscribe("auth.statusChange", onStatusChange);

    // Uploads data file to SkyDrive.
    function _upload(uploadPath, overwriteArg) {

        return WL.backgroundUpload({
            path: uploadPath,
            file_name: inMemoryFile.name,
            // In this app, file_input must be a StorageFile object.
            // For other options, check documentation.
            file_input: inMemoryFile,
            overwrite: overwriteArg
        }).then(
           function (response) {
               _showStatus("Uploaded...");
               // Set paths for upload and download operations for new data file.
               uploadUrl = response.id;
               downloadUrl = uploadUrl + "/content";
               return WinJS.Promise.wrap(true);
           },
           function (responseFailed) {
               if (overwriteArg == true) {
                   _showError("Error calling API: " + responseFailed.error.message);
               }
               else {
                   // You will get an error response if the file
                   // already exists and you are not overwriting.
                   _showStatus("Does file exist? If yes, press Enter to set data file.");
               }
               // If you want to handle an error in the error handler
               // of the calling function, use wrapError instead of wrap.
               return WinJS.Promise.wrap(false);
           });
    }

    // Overwrites local data file before calling upload function.
    function _cacheDataAndSend(uploadPath, notes, overwrite) {

        if (!(inMemoryFile)) {
            _showStatus( "inMemory file not valid");
        }
        return Windows.Storage.FileIO.writeTextAsync(inMemoryFile, notes).then(
            // The result here is always undefined.
            function (result) {
                return _upload(uploadPath, overwrite);
            });
    }

    // Downloads data file from SkyDrive.
    function _download(storageFile) {
        // Checking for valid StorageFile object.
        if (!(storageFile && storageFile instanceof Windows.Storage.StorageFile)) {
            _showStatus("file object missing");
        }

        return WL.backgroundDownload({
            path: downloadUrl,
            // Must be a valid StorageFile object.
            file_output: storageFile
        }).then(
            function (response) {
                // The specified StorageFile object receives the output on
                // a successful download. At this point, you can
                // read the contents.
                return Windows.Storage.FileIO.readLinesAsync(storageFile).then(
                    function (result) {

                        // Assign the input StorageFile object to
                        // the global variable.
                        inMemoryFile = storageFile;

                        // For this app, we pass just the first note
                        // (excluding header) to the Tile updater.
                        if (result[1] !== undefined) {
                            Tiler.start(result[1]);
                        }

                        _showStatus("Downloaded...");

                        // Return the result of the read operation
                        // for processing and display.
                        return WinJS.Promise.wrap(result);

                    }, function (err) {
                        _showError("Error reading file: " + err.error.message);
                        return WinJS.Promise.wrap(null);
                    });
            },
            function (responseFailed) {
                // In your app, you may want to give the user the option
                // to show the cached data if a response fails.
                // Here, we just show an error.
                _showError("Error calling API: " + responseFailed.error.message);
                return WinJS.Promise.wrap(null);
            });
    }

    // Creates a StorageFile object to use for upload and download operations.
    function _createFileObject(name) {

        // Braim Commented. Windows Store App can not access documentLibrary
        //return Windows.Storage.KnownFolders.documentsLibrary.createFileAsync(name,
        //    Windows.Storage.CreationCollisionOption.openIfExists);

        var applicationData = Windows.Storage.ApplicationData.current;
        
        return applicationData.localFolder.createFileAsync(name,
            Windows.Storage.CreationCollisionOption.openIfExists);
    }

    // Opens an existing file in the Documents folder.
    function _openFileObject(name) {
        return Windows.Storage.KnownFolders.documentsLibrary.getFileAsync(name);
    }

    // Before uploading data, check isDataFileSet.
    // We do that in default.js.
    function sendSkyDriveFile(notes) {
        return _cacheDataAndSend(uploadUrl, notes, true);

    }

    // Before downloading data, check isDataFileSet.
    // We do that in default.js.
    function getSkyDriveFile() {
        return _download(inMemoryFile);

    }

    // Searches for folder on SkyDrive.
    function _searchForFolder() {

        // Runs async search for the predefined folder.
        return WL.api({
            path: "/me/skydrive/search?q=" + folderName,
            method: "GET"
        }).then(function (response) {
            if (response != null) {
                var data = response.data;

                // Iterate through the search results.
                // The app assumes one unique matching folder name.
                for (var index = 0; index < data.length; index++) {
                    // Make sure you have an exact match, not 
                    // just a partial match.
                    if (data[index].name == folderName) {
                        folderUrl = data[index].id;
                        // Return the folder ID
                        return WinJS.Promise.wrap(data[index].id);
                    }
                }
                folderUrl = null;
                return WinJS.Promise.wrap(null);

            } else {
                // We need to reset the folder in 
                // case it was manually deleted.
                folderUrl = null;
                return WinJS.Promise.wrap(null);
            }
        });
    }

    // Runs a search query on SkyDrive to find a matching file.
    function searchForFile(path) {

        var whenFolderFound = _searchForFolder();

        var skyDriveSearchPath = "/me/skydrive/search?q=" + path;

        // Runs async search for the user-specified file.
        var whenFilesFound = WL.api({
            path: skyDriveSearchPath,
            method: "GET"
        }).then(function (response) {
            if (response != null) {

                return WinJS.Promise.wrap(response);

            } else {
                inMemoryFile = null;
                return WinJS.Promise.wrap(false);
            }
        });

        // Joins the two asynchronous search operations.
        var whenEverythingIsReady = WinJS.Promise.join({
            folderResult: whenFolderFound, fileResult: whenFilesFound
        });

        // Runs when the two searches complete.
        return whenEverythingIsReady.then(function (args) {
            var folderId = args.folderResult;
            var response = args.fileResult;
            var data = response.data;

            var localFileName = _fixFileName(path);
            // Iterate through the returned files.
            for (var index = 0; index < data.length; index++) {

                if (data[index].name == localFileName) {
                    // Check whether the matching file is 
                    // in the correct folder.
                    if (folderId !== null && folderId == data[index].parent_id) {

                        // Set paths for upload and download operations.
                        uploadUrl = response.data[index].id;
                        downloadUrl = uploadUrl + "/content";

                        var whenFileCreated = _createFileObject(localFileName);
                        whenFileCreated.then(function (newFile) {
                            inMemoryFile = newFile;
                        });

                        // Wrap the return value in a promise.
                        return WinJS.Promise.wrap(true);
                    }
                }
            }
            inMemoryFile = null;
            return WinJS.Promise.wrap(false);

        }, function (errorResponse) {
            _showError("Error getting info about: " + path + "-- Error: " + errorResponse.error.message);
        });
    }

    // Gets an existing cached data file.
    function getCachedData(name) {

        var localName = _fixFileName(name);

        return _openFileObject(localName).then(
            function (result) {
                return Windows.Storage.FileIO.readLinesAsync(result).then(
                   function (result) {
                       _showStatus("Loaded from cache...");
                       return WinJS.Promise.wrap(result);

                   }, function (err) {
                       _showError("Error reading file: " + err.message);
                       return WinJS.Promise.wrap(null);
                   });

            }, function (err) {
                _showError("Error opening file: " + err.message);
                return WinJS.Promise.wrap(null);
            });
    }

    // Creates a folder to store notes on SkyDrive.
    function _createFolder() {
        if (folderUrl == undefined | folderUrl == null) {

            var whenFolderSearchCompleted = _searchForFolder();

            return whenFolderSearchCompleted.then(
                function (result) {
                    if (folderUrl == undefined | folderUrl == null) {
                        return WL.api({
                            path: "me/skydrive",
                            method: "POST",
                            body: {
                                "name": folderName,
                                "description": "Folder for notes"
                            }
                        }).then(
                            function (response) {
                                if (response !== null) {
                                    folderUrl = response.id;
                                    return WinJS.Promise.wrap(folderUrl);
                                }
                            },
                            function (responseFailed) {
                                // Response will be an error if the folder
                                // already exists.
                                _showError("Error calling API: " + responseFailed.error.message);
                                return WinJS.Promise.wrap(null);
                            }
                        );
                    }
                    else {
                        return WinJS.Promise.wrap(folderUrl);
                    }
                });
        }
        else {
            return WinJS.Promise.wrap(folderUrl);
        }

    }

    // Creates a new file on SkyDrive in correct folder.
    function createFile(name) {

        var localFileName = _fixFileName(name);
        var whenFolderCreated = _createFolder(folderName);
        var whenLocalFileCreated = _createFileObject(localFileName);

        // Joins the two asynchronous operations.
        var whenEverythingIsReady = WinJS.Promise.join({
            folderResult: whenFolderCreated, fileResult: whenLocalFileCreated
        });

        return whenEverythingIsReady.then(
            function (args) {
                if (folderUrl !== undefined && folderUrl !== null) {

                    inMemoryFile = args.fileResult;
                    var header = "<stickynoteheader>\r\n";
                   return _cacheDataAndSend(folderUrl, header, false);
                }
                else {
                    _showError("Error creating file... ");
                    return WinJS.Promise.wrap(false);
                }
            }, function (err) {
                _showError("Error creating file: " + err.message);
                return WinJS.Promise.wrap(false);
            });
    }

    // Package manifest specifies .dat files.
    function _fixFileName(name) {
        var localName = name;
        if (name.substr(name.length - 4, 4) !== ".txt") {
            localName = name + ".txt";
        }
        return localName;
    }

    // Call this function before getting or sending data.
    function isDataFileSet() {
        if (inMemoryFile == undefined | inMemoryFile == null) {
            return false;
        }
        else {
            return true;
        }
    }

    // Event fires on a change of login status.
    function onStatusChange() {
        WL.getLoginStatus(function (response) {
            if (response.status !== "connected") {
                loggedIn = false;
            }
            else {
                loggedIn = true;
                inMemoryFile = null;
            }
        });

    }

    function getStatus() {
        return loggedIn;
    }

    function _showStatus(info) {
        log( info);
    }

    function _showError(info, errorStr) {
        log(
            info + errorStr);
    }
    function log(message) {
        var child = document.createTextNode(message);
        var parent = document.getElementById('JsOutputDiv') || document.body;
        parent.appendChild(child);
        parent.appendChild(document.createElement("br"));
    }

    var namespacePublicMembers = {
        getSkyDriveFile: getSkyDriveFile,
        sendSkyDriveFile: sendSkyDriveFile,
        searchForFile: searchForFile,
        isDataFileSet: isDataFileSet,
        getCachedData: getCachedData,
        createFile: createFile,
        getStatus: getStatus
    };

    WinJS.Namespace.define("SkyDrive", namespacePublicMembers);


})();
