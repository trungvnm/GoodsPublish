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
                                .image-modal {
                                    width: 100% !important;
                                    height: 100%;
                                    top: 0 !important;
                                    left: 0 !important;
                                }
                                 
                                .transparent {
                                  background: rgba(0,0,0,0.7);
                                }
                                 
                                .slider {
                                    width: 100%;
                                    height: 100%;
                                }
                                 
                                .image {
                                    width: 100%;
                                    height: 600px;
                                    background-size: contain;
                                    background-repeat: no-repeat;
                                    background-position: center, center;
                                }
                            </style>
                            <div class="modal image-modal transparent" ng-click='closeZoomView()' on-swipe-down="closeZoomView()">
                              <ion-slide-box active-slide="ngSrc">
                                <ion-slide ng-repeat="image in imgURI">
                                  <ion-scroll direction="xy" scrollbar-x="false" scrollbar-y="false"
                                  zooming="true" min-zoom="1" style="width: 100%; height: 100%">
                                  <div class="image" style="background-image: url( {{image.photoUrl}} )"></div>
                                </ion-scroll>
                              </ion-slide>
                            </ion-slide-box>
                            </div>
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