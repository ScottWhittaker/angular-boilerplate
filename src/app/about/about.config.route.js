(function () {
    angular
        .module('app.about')
        /* @ngInject */
        .config(function ($stateProvider) {
            $stateProvider
                .state('about', {
                    url: '/about',
                    templateUrl: 'about/about.html',
                    controller: 'about'
                })
        })
})();
