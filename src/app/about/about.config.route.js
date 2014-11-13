angular
    .module('app.about')
    .config(function ($stateProvider) {
        $stateProvider
            .state('about', {
                url: '/about',
                templateUrl: 'about/about.html',
                controller: 'about'
            })
    })
;