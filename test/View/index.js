'use strict';

const base = require('../../build/test-base'), data = require('./index.json');

const browser = base.browser;



describe('View',  function () {

    before( base.loadHTML(module, base.loadJS) );


    describe('HTMLView.prototype.parse()',  function () {

        it('Clean expression',  function () {

            return  browser.evaluate(function () {

                var view = (new $.fn.iWebApp.HTMLView('.HTMLView')).parse();

                return view.$_View.text().trim();

            }).should.be.fulfilledWith('Hello,  !');
        });
    });


    describe('HTMLView.prototype.render()',  function () {

        it('Splice string',  function () {

            return  browser.evaluate(function (data) {

                var view = $('.HTMLView').view().render( data );

                return  Array.from(view.$_View[0].children,  function (node) {

                    return node.textContent.trim();
                });
            },  [data.HTMLView]).should.be.fulfilledWith([
                'EasyWebApp',  'Hello, EWA !'
            ]);
        });


        it('Bind DOM property',  async function () {

            await browser.visible('.HTMLView > div')
                .should.be.fulfilledWith( true );

            await browser.evaluate(function () {

                var view = $('.HTMLView').view();

                view.important = false;

                return view.$_View[0].lastElementChild.hidden;

            }).should.be.fulfilledWith( true );
        });


        it('Bind DOM event handler',  async function () {

            await browser.evaluate(function () {

                var view = $('.HTMLView').view();

                view.changeTitle = function () {

                    document.title = this.name;
                };

                view.$_View.find('h1').click();
            });

            await browser.evaluate(function () {

                return document.title;

            }).should.be.fulfilledWith('EasyWebApp');
        });
    });


    describe('View.prototype.clear()',  function () {

        it('Clear the view',  function () {

            return  browser.evaluate(function () {

                var view = $('.HTMLView').view().clear();

                return  view.$_View.text().trim();

            }).should.be.fulfilledWith('Hello,  !');
        });
    });


    describe('new ListView()',  function () {

        it('Clean template item',  function () {

            return  browser.evaluate(function () {

                var view = new $.fn.iWebApp.ListView('.ListView');

                return view.$_View.html().trim();

            }).should.be.fulfilledWith('');
        });
    });


    describe('ListView.prototype.render()',  function () {

        it('Render list',  function () {

            return  browser.evaluate(function (data) {

                var view = $('.ListView').view().render( data );

                return  Array.from(view,  function (item) {

                    return  item.$_View.text().trim();
                });
            },  [data.ListView]).should.be.fulfilledWith([
                '1.RequireJS', '2.jQuery', '3.iQuery', '4.EasyWebApp'
            ]);
        });
    });


    describe('ListView.prototype.insert()',  function () {

        it('Insert a new item & refresh items after the new one',  function () {

            return  browser.evaluate(function () {

                var view = $('.ListView').view();

                view.insert({name: 'BootEWA'});

                return  Array.from(view,  function (item) {

                    return  item.$_View.text().trim();
                });
            }).should.be.fulfilledWith([
                '1.BootEWA', '2.RequireJS', '3.jQuery', '4.iQuery', '5.EasyWebApp'
            ]);
        });
    });


    describe('ListView.prototype.sort()',  function () {

        it('Sort the list & refresh the changed items',  function () {

            return  browser.evaluate(function () {

                var view = $('.ListView').view().sort(function (A, B) {

                        return  A.name.localeCompare( B.name );
                    });

                return  Array.from(view,  function (item) {

                    return  item.$_View.text().trim();
                });
            }).should.be.fulfilledWith([
                '1.BootEWA', '2.EasyWebApp', '3.iQuery', '4.jQuery', '5.RequireJS'
            ]);
        });
    });


    describe('ListView.prototype.remove()',  function () {

        it('Remove an item & refresh items after the removed one',  function () {

            return  browser.evaluate(function () {

                var view = $('.ListView').view();

                view.remove(-2);

                return  Array.from(view,  function (item) {

                    return  item.$_View.text().trim();
                });
            }).should.be.fulfilledWith([
                '1.BootEWA', '2.EasyWebApp', '3.iQuery', '4.RequireJS'
            ]);
        });
    });


    describe('TreeView.fromFlat()',  function () {

        it('Convert a Flat-array to a Tree-array',  function () {

            return  browser.evaluate(function (data) {

                return  $.fn.iWebApp.TreeView.fromFlat( data );

            },  [data.TreeView]).should.be.fulfilledWith( data.TreeData );
        });
    });


    describe('new TreeView()',  function () {

        it('Clean template item',  function () {

            return  browser.evaluate(function () {

                var view = new $.fn.iWebApp.TreeView('.TreeView');

                return view.$_View.html().trim();

            }).should.be.fulfilledWith('');
        });
    });


    describe('TreeView.prototype.render()',  function () {

        it('Data of the nesting ListView',  function () {

            return  browser.evaluate(function (data) {

                var view = $('.TreeView').view().render( data );

                return view.valueOf();

            },  [data.TreeData]).should.be.fulfilledWith( data.TreeData );
        });


        it('Tree structure',  function () {

            return  browser.evaluate(function () {

                var view = $('.TreeView').view();

                return $.mapTree(
                    view.$_View[0],  'childNodes',  function (item, _, depth) {

                        return  (item instanceof Text)  ?
                            ('  '.repeat(depth - 2)  +  item.nodeValue)  :  '';
                    }
                ).filter( String );

            }).should.be.fulfilledWith([
                'Observer',
                '    View',
                '        HTMLView',
                '        ListView',
                '            TreeView',
                '    InnerLink',
                '    WebApp'
            ]);
        });
    });


    describe('ListView.prototype.clear()',  function () {

        it('Clear the view',  function () {

            return  browser.evaluate(function () {

                var view = $('.TreeView').view().clear();

                return  view.$_View.text().trim();

            }).should.be.fulfilledWith('');
        });
    });
});
