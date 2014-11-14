angular.module('app', [
    'ui.router',
    'app.home',
    'app.about',
    'app.html.templates'
])
    .config(function myAppConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
    })
;