import { resolve } from 'path';

import { readFileSync } from 'fs';

import { JSDOM } from 'jsdom';

import View from '../../source/View';

import ObjectView from '../../source/ObjectView';

var page = new JSDOM(), HTML;

global.window = page.window;  global.document = window.document;


/**
 * @test {ObjectView}
 */
describe('ObjectView()',  () => {

    before(()  =>  HTML = readFileSync(
        resolve(module.id, '../index.html'),  {encoding: 'utf-8'}
    ));

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

            view.content.outerHTML.should.be.equal(`
    <fieldset>
        <legend title="Test field">
            Test
            <input type="checkbox">
        </legend>
    </fieldset>`.trim()
            );

            view.content.querySelector('input').checked.should.be.true();
        });

        /**
         * @test {ObjectView#valueOf}
         */
        it('Get data',  () => {

            view.valueOf().should.be.eql( view.data );

            view.valueOf().should.not.be.equal( view.data );
        });
    });

    describe('Nested view',  () => {

        var view;

        /**
         * @test {View.parseDOM}
         * @test {ObjectView#scan}
         */
        it('Scan DOM',  () => {

            view = new ObjectView( HTML );

            view.length.should.be.equal( 4 );

            view[3].should.be.instanceof( ObjectView );
        });

        /**
         * @test {View#bindWith}
         * @test {View.instanceOf}
         */
        it('Associate DOM',  () => {

            View.instanceOf( view.content[0] ).should.be.equal( view );
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

            view.toString().trim().should.be.equal(`
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

        /**
         * @test {ObjectView#valueOf}
         */
        it('Get data',  () => {

            view.valueOf().should.be.eql( view.data );

            view.valueOf().should.not.be.equal( view.data );

            view.data.tips.should.be.equal( view[3].data );
        });
    });
});
