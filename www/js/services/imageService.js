angular.module('LelongApp.services')
    .service('imageService', function ($q,tokenService) {
        var self = this;
        var dirName = "ImagesUpload";
        var token = tokenService.getToken();
        var userid = token.userid;

        self.removeFileFromPersitentFolder = function (imgFullPath) {
            var deffered = $q.defer();
            var fileName = imgFullPath.replace(/^.*[\\\/]/, '');
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileEntry) {
                fileEntry.root.getDirectory(dirName, { create: true }, function (dir) {
                    dir.getDirectory('' + userid + '', { create: true }, function (subdir) {
                        subdir.getFile(fileName, { create: false }, function (files) {
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
                }, errorHandler);
            }, errorHandler);

            return deffered.promise;
        }

        function errorHandler(error) {
            var err = "ERROR: ";
            if (error !== undefined) {
                err += JSON.stringify(error);
            }
            console.log(err);
        }

    });