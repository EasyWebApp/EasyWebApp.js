import { resolve } from 'path';

import { readFileSync } from 'fs';

import { JSDOM } from 'jsdom';

import ObjectView from '../../source/ObjectView';

var view;


/**
 * @test {ObjectView}
 */
describe('ObjectView()',  () => {

    before(async () => {

        view = JSDOM.fragment(
            readFileSync( resolve(module.id, '../index.html') )
        ).children[0];

        view.remove();
    });

    /**
     * @test {ObjectView#constructor}
     */
    it('Scan DOM',  () => {

        view = new ObjectView( view );

        view.length.should.be.equal( 3 );
    });

    /**
     * @test {ObjectView#render}
     */
    it('Render data',  () => {

        view.render({
            name:    'Test',
            title:   'Test field',
            enable:  true
        });

        view.element.outerHTML.should.be.equal(`
<form>
    <fieldset>
        <legend title="Test field">
            Test
            <input type="checkbox">
        </legend>
    </fieldset>
</form>`.trim()
        );

        view.element.querySelector('input').checked.should.be.true();
    });
});
