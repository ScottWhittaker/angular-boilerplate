angular.module('app', [
    'ui.router',
    'app.home',
    'app.about',
    'app.html.templates'
])

    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('home');
    })
;