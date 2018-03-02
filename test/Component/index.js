'use strict';

const base = require('../../build/test-base');

const browser = base.browser;



describe('Component',  function () {

    before(base.loadHTML(module,  function () {

        return  browser.wait('body > header.loaded');
    }));


    it('Scoped style',  function () {

        return  browser.evaluate(function () {

            return [
                $('body > nav').css('display'),
                $('body > header > nav').css('display')
            ];
        }).should.be.fulfilledWith(['block', 'table-cell']);
    });


    it('Fix relative URL',  function () {

        return  browser.evaluate(function () {

            return  $('body > header > img').attr('src');

        }).should.be.fulfilledWith(
            'http://localhost:8084/docs/images/Struct.png'
        );
    });
});
