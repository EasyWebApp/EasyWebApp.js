define([
    'jquery', 'TreeBuilder', 'View', 'iQuery+'
],  function ($, TreeBuilder, View) {

    function WebApp() {
        var iPath = self.location.href.split('?')[0];

        this.pageRoot = $.filePath(
            iPath  +  (iPath.match(/\/([^\.]+\.html?)?/i) ? '' : '/')
        );

        this.listen();
    }

    $.extend(WebApp.prototype, {
        getCID:      function () {
            return  arguments[0].replace(this.pageRoot + '/',  '')
                .replace(/\.js(\?.*)?/i, '.html');
        },
        loadView:    function (Target_Name, HTML_URL) {

            var $_Target = $('[name="' + Target_Name + '"]');

            return Promise.resolve($.get( HTML_URL )).then(
                $.proxy($.fn.htmlExec, $_Target)
            ).then(
                $.proxy(TreeBuilder, null, $_Target)
            );
        },
        loadData:    function (Link_DOM) {

            var iURL = Link_DOM.href || Link_DOM.action;

            var iData = $.paramJSON( iURL )['for'];

            if (! iData)  return;

            if (Link_DOM.tagName == 'A')
                return  Promise.resolve($.getJSON( iData ));

            var iOption = {type:  Link_DOM.getAttribute('method')};

            Link_DOM = $( Link_DOM );

            if (! $('input[type="file"]', Link_DOM)[0])
                iOption.data = $( Link_DOM ).serialize();
            else {
                iOption.data = new BOM.FormData( Link_DOM );
                iOption.contentType = iOption.processData = false;
            }

            iURL = iOption.type.toUpperCase() + ' ' + iData;

            return  Promise.resolve($.ajax(iData, iOption)).then(
                $.proxy($.storage, $, iURL),  $.proxy($.storage, $, iURL, null)
            );
        },
        listen:      function () {
            var _This_ = this;

            $(document).on(
                'click submit',
                'a[target][href], form[target][action]',
                function () {
                    var iURL = this.href || this.action;

                    var CID = iURL.match(_This_.pageRoot) || '';

                    if (CID.index !== 0)  return;

                    arguments[0].preventDefault();

                    CID = _This_.getCID( iURL );

                    Promise.all([
                        _This_.loadView(this.target, CID),
                        _This_.loadData( this )
                    ]).then(function () {

                        var iPromise = (_This_[CID] instanceof Array)  ?
                                _This_[CID]  :  '';

                        _This_[CID] = arguments[0][0];

                        if ( iPromise )  iPromise[0]( arguments[0][1] );
                    });
                }
            );
        },
        define:      function (iSuper, iFactory) {

            if (! document.currentScript)
                throw 'WebApp.prototype.define() can only be executed synchronously in script tags, not a callback function.';

            var CID = this.getCID( document.currentScript.src ),  _This_ = this;

            Promise.all([
                new Promise(function (iResolve) {

                    self.require(iSuper,  function () {

                        iResolve( arguments );
                    });
                }),
                new Promise(function () {

                    _This_[CID] = $.makeArray( arguments );
                })
            ]).then(function () {

                iSuper = $.makeArray( arguments[0][0] );

                var iData = arguments[0][1];

                iSuper.push( iData );

                _This_[CID].render(iFactory.apply(_This_[CID], iSuper)  ||  iData);
            });
        }
    });

    return WebApp;

});