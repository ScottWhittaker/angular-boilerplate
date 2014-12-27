(function () {

    'use strict';

    angular
        .module('app.about')
        .controller('About', About);

    /* @ngInject */
    function About() {

        var vm = this;
        vm.test = 'About controller';
    }
})();