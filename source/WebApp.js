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

            _This_.hashChange = false;

            if ((! _This_[Index])  ||  (_This_.lastPage == Index))
                return;

            _This_[_This_.lastPage].detach();
            _This_[_This_.lastPage = Index].attach();

        }).on('hashchange',  function () {

            if (_This_.hashChange === false)
                return  _This_.hashChange = null;

            var iHash = _Self_.getRoute();

            if (iHash)  _This_.load(iHash);
        });

        this.init();
    }

    $.fn.iWebApp = $.inherit($.Observer, WebApp, {
        getRoute:    function () {
            var iHash = BOM.location.hash.match(/^#!([^#!]+)/);
            return  iHash && iHash[1];
        }
    }, {
        push:         Array.prototype.push,
        splice:       Array.prototype.splice,
        init:         function () {
            var iModule = new UI_Module(new InnerLink(this, DOM.body));

            var iLink = iModule.source,  _This_ = this;

            iModule.template.scope.extend( $.paramJSON() );

            iModule.findSub();

            iModule[
                (iLink.href || iLink.src || iLink.action)  ?  'load'  :  'render'
            ]().then(function () {
                var iHash = WebApp.getRoute();

                if (! iHash)
                    $('body *[autofocus]:not(:input)').eq(0).click();
                else
                    _This_.load(iHash);
            });
        },
        register:     function (iPage) {
            if (this.lastPage > -1)  this[this.lastPage].detach();

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, this.length);

            this.hashChange = false;
            iPage.source.register( this.length );
            this.push( iPage );

            var iTimeOut = $.now()  -  (1000 * 60 * this.cacheMinute);

            for (var i = 0;  (i + 2) < this.length;  i++)
                if ((this[i].lastLoad < iTimeOut)  &&  this[i].$_Content) {
                    this[i].$_Content.remove();
                    this[i].$_Content = null;
                }
        },
        boot:         function (iLink) {
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
                    var iModule = UI_Module.instanceOf( iLink.$_DOM );

                    if ((! iModule)  ||  !(iModule.domReady instanceof Promise))
                        (new UI_Module(iLink)).load();
                }
            }

            return this;
        },
        load:         function (HTML_URL, $_Sibling) {
            $('<span />',  $.extend(
                {style: 'display: none'},
                (typeof HTML_URL == 'object')  ?  HTML_URL  :  {
                    target:    '_self',
                    href:      HTML_URL
                }
            )).appendTo($_Sibling || 'body').click();

            return this;
        },
        getModule:    function () {
            return  UI_Module.instanceOf( arguments[0] );
        },
        component:    function ($_View, iFactory) {

            if (typeof $_View == 'function') {
                iFactory = $_View;
                $_View = '';
            }
            $_View = $($_View);

            var iModule = UI_Module.instanceOf($_View[0] ? $_View : this.$_Root);

            iModule.domReady.then(function (iData) {

                iModule.render(iFactory.call(iModule, iData)  ||  iData);
            });

            return iModule;
        }
    });

    WebApp.fn = WebApp.prototype;

    return WebApp;

});
