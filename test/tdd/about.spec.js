describe('About', function() {

    var aboutController;

    beforeEach(function() {
        module('ui.router');
        module('app.about');
    });

    beforeEach(inject(function($controller) {
        aboutController = $controller('About');
    }));

    it('should have a message', function() {
        expect(aboutController.message).toBe('Hello from About controller');
    });
});
