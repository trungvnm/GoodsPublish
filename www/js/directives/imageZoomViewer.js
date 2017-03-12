    (function () {

        'use strict';

        var zoomView = function ($compile, $ionicModal, $ionicPlatform) {
            return {

                restrict: 'A',

                link(scope, elem, attr) {

                    $ionicPlatform.ready(function () {

                        elem.attr('ng-click', 'showZoomView()');
                        elem.removeAttr('zoom-view');
                        $compile(elem)(scope);

                        var zoomViewTemplate = `
                            <style>
                                .zoom-view .scroll { height:100%; }
                            </style>
                            <ion-modal-view class="zoom-view">
                                <ion-header-bar>
                                <h1 class="title"></h1>
                                <button ng-click="closeZoomView()" class="button button-clear button-dark">Close</button>
                                </ion-header-bar>
                                <ion-content>
                                 <ion-slides options="galleryOptionsThumb" slider="data.slider">
                                    <ion-slide-page ng-repeat="image in imgURI">
                                        <div>
                                            <img style="width: 100%;height: 100%" ng-src="{{image.photoUrl}}">
                                        </div>
                                    </ion-slide-page>
                                </ion-slides>
                                </ion-content>
                            </ion-modal-view>
                        `;

                        scope.zoomViewModal = $ionicModal.fromTemplate(zoomViewTemplate, {
                            scope,
                            animation: 'slide-in-up',
                        });
                      
                        scope.showZoomView = function () {
                            scope.zoomViewModal.show();
                            scope.ngSrc = attr.zoomSrc;                           
                        };

                        scope.closeZoomView = function () {
                            scope.zoomViewModal.hide();
                        };

                    });

                },

            };
        };
        angular.module('LelongApp.Goods', []).directive('zoomView', zoomView);
    }());