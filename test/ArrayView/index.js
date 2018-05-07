import { resolve } from 'path';

import { readFileSync } from 'fs';

import { JSDOM } from 'jsdom';

import ArrayView from '../../source/ArrayView';

import ObjectView from '../../source/ObjectView';

var HTML;


/**
 * @test {ArrayView}
 */
describe('ArrayView()',  () => {

    before(()  =>  HTML = readFileSync( resolve(module.id, '../index.html') ));

    describe('Single view',  () => {

        var view, element;

        before(() => {

            element = JSDOM.fragment( HTML ).querySelector('ol');

            element.remove();
        });

        /**
         * @test {ArrayView#constructor}
         */
        it('Scan DOM',  () => {

            view = new ArrayView( element );

            view.element.textContent.should.be.equal('');
        });

        /**
         * @test {ArrayView#render}
         */
        it('Render data',  () => {

            view.render([
                {name: 'ObjectView'},
                {name: 'ArrayView'},
                {name: 'TreeView'}
            ]);

            Array.from(
                view.element.children,  item => item.textContent
            ).should.be.eql([
                'ObjectView', 'ArrayView', 'TreeView'
            ]);
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

            view.length.should.be.equal( 2 );

            view[1].should.be.instanceof( ArrayView );
        });

        /**
         * @test {ObjectView#render}
         */
        it('Render data',  () => {

            const list = [
                {name: 'Gecko'},
                {name: 'Trident'},
                {name: 'WebKit'},
                {name: 'Blink'},
                {name: 'EdgeHTML'}
            ];

            view.render({
                title:  'Kinds of Web browser core',
                list:   list
            });

            view.element.outerHTML.should.be.equal(`
<main>
    <h1>Kinds of Web browser core</h1>

    <ol data-array="list">${
    list.map(item => `<li>${item.name}</li>`).join('')
}</ol>
</main>`.trim()
            );
        });
    });
});
