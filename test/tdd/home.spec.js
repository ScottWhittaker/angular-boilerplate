describe('Home', function() {

    var homeController;

    beforeEach(function() {
        module('ui.router');
        module('app.home');
    });

    beforeEach(inject(function($controller) {
        homeController = $controller('Home');
    }));

    it('should have a message', function() {
        expect(homeController.message).toBe('Hello from Home controller');
    });
});
