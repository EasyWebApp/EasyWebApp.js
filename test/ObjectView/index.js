import { resolve } from 'path';

import { readFileSync } from 'fs';

import { JSDOM } from 'jsdom';

import ObjectView from '../../source/ObjectView';

var HTML;


/**
 * @test {ObjectView}
 */
describe('ObjectView()',  () => {

    before(()  =>  HTML = readFileSync( resolve(module.id, '../index.html') ));

    describe('Single view',  () => {

        var view, element;

        before(() => {

            element = JSDOM.fragment( HTML ).querySelector('fieldset');

            element.remove();
        });

        /**
         * @test {ObjectView#constructor}
         */
        it('Scan DOM',  () => {

            view = new ObjectView( element );

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
    <fieldset>
        <legend title="Test field">
            Test
            <input type="checkbox">
        </legend>
    </fieldset>`.trim()
            );

            view.element.querySelector('input').checked.should.be.true();
        });
    });

    describe('Nested view',  () => {

        var view, element;

        before(() => {

            element = JSDOM.fragment( HTML ).children[0];

            element.remove();
        });

        /**
         * @test {ObjectView#scan}
         */
        it('Scan DOM',  () => {

            view = new ObjectView( element );

            view.length.should.be.equal( 4 );

            view[view.length - 1].should.be.instanceof( ObjectView );
        });

        /**
         * @test {ObjectView#render}
         */
        it('Render data',  () => {

            view.render({
                name:    'Test',
                title:   'Test field',
                enable:  true,
                tips:    {
                    title:    'Test tips',
                    content:  'Test content'
                }
            });

            view.element.outerHTML.should.be.equal(`
<form>
    <fieldset>
        <legend title="Test field">
            Test
            <input type="checkbox">
        </legend>
    </fieldset>
    <dl data-object="tips">
        <dt>Test tips</dt>
        <dd>Test content</dd>
    </dl>
</form>`.trim()
            );
        });
    });
});
