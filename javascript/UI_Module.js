define(['jquery', 'iQuery+'],  function ($) {

    function UI_Module(iApp, iScope, iLink) {
        this.ownerApp = iApp;

        this.data = { };
        this.inherit(iScope);

        this.$_Root = iLink.getAttribute('target') || iLink;

        if (this.$_Root == '_self')
            this.$_Root = this.ownerApp.$_Root;
        else if (typeof this.$_Root == 'string')
            this.$_Root = '*[name="' + this.$_Root + '"]';

        this.$_Root = $(this.$_Root).data('_UIM_', this);

        iLink = iLink || this.$_Root[0];
        this.$_Link = $(iLink);

        this.title = iLink.title;
        this.href = iLink.getAttribute('href');
        this.method = iLink.getAttribute('method') || 'get';
        this.src = iLink.getAttribute('src');
        this.action = iLink.getAttribute('action');

        iApp.register(this);
    }

    UI_Module.$_Link = '*[target]:not(a)';

    UI_Module.instanceOf = function () {
        return  $( arguments[0] ).parents('*:data("_UIM_")').data('_UIM_');
    };

    $.extend(UI_Module.prototype, {
        inherit:    function () {
            function iScope() { }
            iScope.prototype = arguments[0];
            iScope.prototype.constructor = iScope;

            this.data = $.extend(new iScope(),  this.data);

            return this;
        },
        getData:    function () {
            var pModule = this.constructor.instanceOf( this.$_Link );

            if (! $.likeArray( pModule.data ))  return pModule.data;

            var iLV = $.ListView.instanceOf( this.$_Link );

            var $_Item = this.$_Link.parentsUntil( iLV.$_View );

            return  iLV.valueOf($_Item[0] ? $_Item.slice(-1) : this.$_Link);
        },
        getURL:     function (iName) {
            var iArgs = this.$_Link[0].dataset;

            if ($.isEmptyObject( iArgs ))  return this[iName];

            var iData = this.getData();

            return  $.extendURL(this[iName],  $.map(iArgs,  function (iKey) {
                return  $.isData( iData[iKey] )  ?  iData[iKey]  :  iKey;
            }));
        },
        valueOf:    function () {
            var iValue = { };

            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        boot:       function () {
            var $_Module = this.$_Root
                    .find('*[href]:not(a, link), *[src]:not(img, iframe, script)')
                    .not(UI_Module.$_Link + ', *[href]:parent');

            for (var i = 0;  $_Module[i];  i++)
                (new UI_Module(this.ownerApp, this.data, $_Module[i])).load();

            return this;
        },
        render:     function (iData) {
            iData = iData || this.data;

            var iView;

            if ($.likeArray( iData )) {
                iView = $.ListView.getInstance( this.$_Root );
                if (! iView) {
                    iView = $.ListView.findView( this.$_Root )[0];
                    if (iView)
                        iView = $.ListView(iView,  function () {
                            arguments[0].value('name', arguments[1]);
                        });
                }
            } else
                iView = $.CommonView(this.$_Root).on('render',  function () {
                    this.$_View.find('*').value('name', arguments[0]);
                });

            if (iView)  iView.render(iData);

            this.boot();

            return this;
        },
        trigger:    function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.href || '',
                this.src || '',
                [ this.valueOf() ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        load:       function () {
            var iThis = this,  iJSON = this.getURL('src') || this.getURL('action');

            var iReady = (this.href && iJSON)  ?  2  :  1;

            if (this.href)
                this.$_Root.load(this.getURL('href'),  function () {
                    if (--iReady)  return;

                    if (! $.isEmptyObject(iThis.data))  iThis.render();

                    iThis.trigger('ready');
                });

            if (! iJSON)  return;

            $[this.method](
                this.ownerApp.apiPath + iJSON,
                this.$_Link.serialize(),
                function (_JSON_) {
                    _JSON_ = iThis.trigger('data', [_JSON_])  ||  _JSON_;

                    $.extend(iThis.data, _JSON_);

                    if (_JSON_ instanceof Array)
                        iThis.data.length = _JSON_.length;

                    if (--iReady)  return;

                    iThis.render();

                    iThis.trigger('ready');
                },
                'jsonp'
            );

            return this;
        },
        detach:    function () {
            this.$_Content = this.$_Root.children().detach();

            return this;
        },
        attach:    function () {
            this.$_Root.append( this.$_Content );

            return this;
        }
    });

    return UI_Module;

});
