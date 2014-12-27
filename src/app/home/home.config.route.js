(function () {

    'use strict';

    angular
        .module('app.home')
        /* @ngInject */
        .config(function ($stateProvider) {
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'home/home.html',
                    controller: 'Home as vm'
                })
        })
})();
