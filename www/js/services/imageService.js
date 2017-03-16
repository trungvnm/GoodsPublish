angular.module('LelongApp.services')
    .service('imageService', function ($q, tokenService) {
        var self = this;
        var dirName = "ImagesUpload";
        var token = tokenService.getToken();
        var userid = token.userid;

        self.removeFileFromPersitentFolder = function (imgFullPath) {
            var deffered = $q.defer();
            var arrFilePath = imgFullPath.split('/');
            var path = arrFilePath.slice(0, arrFilePath.length - 1).join('/');
            var fileName = imgFullPath.replace(/^.*[\\\/]/, '');

            window.resolveLocalFileSystemURL(path, function (dir) {
                dir.getFile(fileName, { create: false }, function (files) {
                    files.remove(function () {
                        console.log("REMOVE FILE " + fileName + " SUCCESS");
                        deffered.resolve(fileName);
                    }, function (err) {
                        console.log("FAILED TO DELETE FILE: " + fileName);
                        deffered.reject(err);
                    }, function () {
                        console.log("FILE " + fileName + " DOES NOT EXISTS.");
                        deffered.reject();
                    })
                }, errorHandler)
            }, errorHandler);
            return deffered.promise;
        };

        // upload image to an server by its path
        self.uploadImage = function (serverUrl, filePath) {
            /*this.tokenService.verify().then(function (token) {
            if (token) {*/
            var deffered = $q.defer();
            var win = function (r) {
                console.log("UPLOAD image success ");
                deffered.resolve(1);
            }

            var fail = function (error) {
                console.log("error on upload image ");
                deffered.resolve(0);
            }
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
            options.mimeType = "text/plain";

            var headers = {
                "Authorization": "Bearer " + token.access_token,
                "X-User-Context": token.username,
            };
            options.headers = headers;

            var ft = new FileTransfer();
            ft.upload(filePath, encodeURI(serverUrl), win, fail, options);
            return deffered.promise;
        };

        // Download image from an server by its url
        self.downloadImage = function (serverUrl, saveUrl, finishCallback, erorCallback) {
            var fileTransfer = new FileTransfer();
            var uri = encodeURI(serverUrl);

            return fileTransfer.download(
                uri,
                saveUrl,
                finishCallback,
                erorCallback,
                false,
                {
                    headers: {
                        "Authorization": "Bearer " + token.access_token,
                        "X-User-Context": token.username,
                    }
                }
            );
        }

        function errorHandler(error) {
            var err = "ERROR: ";
            if (error !== undefined) {
                err += JSON.stringify(error);
            }
            console.log(err);
        }

    });