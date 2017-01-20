define(['jquery', 'UI_Module', 'InnerLink'],  function ($, UI_Module, InnerLink) {

    var BOM = self,  DOM = self.document;

    function WebApp(Page_Box, API_Path, Cache_Minute) {
        var _Self_ = arguments.callee;

        if (this instanceof $)
            return  new _Self_(this[0], Page_Box, API_Path);

        var _This_ = $('*:data("_EWA_")').data('_EWA_') || this;

        if (_This_ !== this)  return _This_;

        $.Observer.call(this, 1);

        this.$_Root = $(Page_Box).data('_EWA_', this);

        var iArgs = $.makeArray(arguments).slice(1);

        this.apiPath = $.urlDomain(iArgs[0] || ' ')  ?  iArgs.shift()  :  '';
        this.cacheMinute = $.isNumeric( iArgs[0] )  ?  iArgs.shift()  :  3;

        this.length = 0;
        this.lastPage = -1;

        $(BOM).on('popstate',  function () {

            var Index = (arguments[0].originalEvent.state || '').index;

            if ((! _This_[Index])  ||  (_This_.lastPage == Index))
                return;

            _This_.hashChange = false;

            _This_[_This_.lastPage].detach();
            _This_[_This_.lastPage = Index].attach();

        }).on('hashchange',  function () {

            if (_This_.hashChange !== false)  _This_.bootLink();

            _This_.hashChange = null;
        });

        this.init();
    }

    $.fn.iWebApp = $.inherit($.Observer, WebApp, null, {
        push:        Array.prototype.push,
        splice:      Array.prototype.splice,
        bootLink:    function () {
            var iURL = (arguments[0] || BOM.location).hash.match(/^#!([^#!]+)/);

            return  iURL  &&  this.load( iURL[1] );
        },
        init:        function () {
            var iModule = new UI_Module(new InnerLink(this, DOM.body));

            var iLink = iModule.source,  _This_ = this;

            iModule.template.scope.extend( $.paramJSON() );

            iModule.findSub();

            iModule[
                (iLink.href || iLink.src || iLink.action)  ?  'load'  :  'render'
            ]().then(function () {

                if (! _This_.bootLink()) {
                    var iAuto = $('body *[autofocus]:not(:input)')[0];

                    if ( iAuto )  iAuto.click();
                }
            });
        },
        register:    function (iPage) {

            if (++this.lastPage != this.length)
                $.each(this.splice(this.lastPage, Infinity),  iPage.destructor);

            iPage.source.register( this.length );
            this.push( iPage );

            var iTimeOut = $.now()  -  (1000 * 60 * this.cacheMinute);

            for (var i = 0;  this[i + 2];  i++)
                if (this[i].lastLoad < iTimeOut)  this[i].destructor();
        },
        boot:        function (iLink) {
            iLink = new InnerLink(this, iLink);

            switch (iLink.target) {
                case null:        ;
                case '':          break;
                case '_blank':
                    $.extend(Object.create( UI_Module.prototype ),  {
                        ownerApp:    this,
                        source:      iLink,
                        template:    iLink.ownerView.template
                    }).loadJSON();
                    break;
                case '_self':     ;
                default:          {
                    var iModule = UI_Module.instanceOf(iLink.getTarget(), false);

                    if ( iModule ) {
                        if ( iModule.domReady )  break;

                        if ( iLink.href )  iModule.detach();
                    }

                    (new UI_Module(iLink)).load();
                }
            }

            return this;
        },
        load:        function (HTML_URL, $_Sibling) {
            $('<span />',  $.extend(
                {style: 'display: none'},
                (typeof HTML_URL == 'object')  ?  HTML_URL  :  {
                    target:    '_self',
                    href:      HTML_URL
                }
            )).appendTo($_Sibling || 'body').click();

            return this;
        }
    });

    WebApp.fn = WebApp.prototype;

    return WebApp;

});
