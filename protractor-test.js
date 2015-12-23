describe('anyverse edit ', function() {
  it('should update the table contents', function() {
    browser.get('http://localhost:5000');

    element(by.id('switchButton')).click();
    var editScreen=by.id('editScreen');
    var completedAmount = element.all(editScreen);
    
    expect(completedAmount.count()).toEqual(1);
    element(editScreen).sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"));
    element(editScreen).sendKeys(protractor.Key.DELETE);
    element(editScreen).sendKeys('|protractor test|');
    
    element(by.id('switchButton')).click();
    
    expect(element.all(by.css('.default')).last().getText()).toEqual('protractor test');
  });
});