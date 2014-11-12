
(function () {
    'use strict';

    angular
        .module('app.about')
        .controller('about', about);

    about.$inject = [''];

    /* @ngInject */
    function about() {
        console.log('about');
    }
})();