(function () {

    'use strict';

    angular
        .module('app.about')
        .controller('About', About);

    /* @ngInject */
    function About() {

        var vm = this;
        vm.message = 'Hello from About controller';
    }
})();