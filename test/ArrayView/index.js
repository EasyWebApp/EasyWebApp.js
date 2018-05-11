import { resolve } from 'path';

import { readFileSync } from 'fs';

import { JSDOM } from 'jsdom';

import ArrayView from '../../source/ArrayView';

import ObjectView from '../../source/ObjectView';

const fragment = JSDOM.fragment(
        readFileSync( resolve(module.id, '../index.html') )
    ),
    data = require('./index.json');

var single, multiple;


/**
 * @test {ArrayView}
 */
describe('ArrayView()',  () => {

    describe('Single top element of item template',  () => {

        var element = fragment.querySelector('ol');

        /**
         * @test {ArrayView#constructor}
         */
        it('Scan DOM',  () => {

            single = new ArrayView( element );

            single.content.textContent.should.be.equal('');
        });

        /**
         * @test {ArrayView#render}
         */
        it('Render data',  () => {

            single.render( data.view );

            Array.from(
                single.content.children,  item => item.textContent
            ).should.be.eql([
                'ObjectView', 'ArrayView', 'TreeView'
            ]);
        });

        /**
         * @test {ArrayView#valueOf}
         */
        it('Get data',  () => {

            single.valueOf().should.be.eql( single.data );

            single.valueOf().should.not.be.equal( single.data );

            single.data[0].should.be.equal( single[0].data );
        });
    });

    describe('Multiple top element of item template',  () => {
        /**
         * @test {ObjectView#scan}
         * @test {View#bindWith}
         */
        it('Scan DOM with booted View',  () => {

            multiple = new ObjectView( fragment );

            multiple.length.should.be.equal( 3 );

            multiple[1].should.be.equal( single );

            multiple[2].should.be.instanceof( ArrayView );
        });

        /**
         * @test {ObjectView#render}
         */
        it('Render part of data',  () => {

            const _data_ = Object.assign({ },  data);

            delete _data_.view;

            multiple.render(_data_);

            multiple.toString().should.be.equal(`
<main>
    <h1>${data.title}</h1>

    <ol data-array="view">${
    data.view.map(item => `<li>${item.name}</li>`).join('')
}</ol>

    <dl data-array="browser">${
    data.browser.map(
        item => `<dt>${item.brand}</dt><dd>${item.core}</dd>`
    ).join('')
}</dl>
</main>`.trim()
            );
        });
    });
});
