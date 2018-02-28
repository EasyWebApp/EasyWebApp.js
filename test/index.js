describe('HTMLView',  function () {

    describe('HTMLView.prototype.parse()',  function () {

        it('Clean expression',  function () {

            return  browser.evaluate(function () {

                var view = (new $.fn.iWebApp.HTMLView('#HTML-View')).parse();

                return view.$_View.text().trim();

            }).should.be.fulfilledWith('Hello,  !');
        });
    });


    describe('HTMLView.prototype.render()',  function () {

        it('Splice string',  function () {

            return  browser.evaluate(function () {

                var view = $('#HTML-View').view().render({
                        name:        'EasyWebApp',
                        nickname:    'EWA'
                    });

                return  Array.from(view.$_View[0].children,  function (node) {

                    return node.textContent.trim();
                });
            }).should.be.fulfilledWith(['EasyWebApp',  'Hello, EWA !']);
        });


        it('Bind DOM property',  function () {

            return  browser.evaluate(function () {

                var view = $('#HTML-View').view();

                view.important = false;

                return view.$_View[0].lastElementChild.hidden;

            }).should.be.fulfilledWith( true );
        });


        it('Bind DOM event handler',  async function () {

            await browser.evaluate(function () {

                var view = $('#HTML-View').view();

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
});
