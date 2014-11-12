(function () {
    'use strict';

    angular
        .module('app.home')
        .controller('home', home);

    home.$inject = [''];

    /* @ngInject */
    function home() {
        console.log('home');
    }
})();