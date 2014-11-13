
(function () {
    'use strict';

    angular
        .module('app.about')
        .controller('about', about);

    /* @ngInject */
    function about() {
        console.log('about');
    }
})();