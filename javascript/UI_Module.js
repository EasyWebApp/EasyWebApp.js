define(['jquery', 'DS_Inherit', 'iQuery+'],  function ($, DS_Inherit) {

    function UI_Module(iApp, iScope, iLink) {
        this.ownerApp = iApp;

        this.data = DS_Inherit(iScope,  { });

        var $_View = iLink.getAttribute('target') || iLink;

        if ($_View == '_self')
            $_View = this.ownerApp.$_Root;
        else if (typeof $_View == 'string')
            $_View = '*[name="' + $_View + '"]';

        this.$_View = $($_View).data(this.constructor.getClass(), this);

        iLink = iLink || this.$_View[0];
        this.$_Link = $(iLink);

        this.title = iLink.title;
        this.href = iLink.getAttribute('href');
        this.method = iLink.getAttribute('method') || 'get';
        this.src = iLink.getAttribute('src');
        this.action = iLink.getAttribute('action');

        iApp.register(this);
    }

    $.extend(UI_Module, {
        $_Link:      '*[target]:not(a)',
        getClass:    $.CommonView.getClass
    });

    $.extend(UI_Module.prototype, {
        toString:    $.CommonView.prototype.toString,
        getData:     function () {
            var iLV = $.ListView.instanceOf( this.$_Link );

            if (! iLV)  return this.data;

            var $_Item = this.$_Link.parentsUntil( iLV.$_View );

            return  ($_Item[0] ? $_Item.slice(-1) : this.$_Link)
                .data('EWA_DS');
        },
        getURL:      function (iName) {
            var iArgs = this.$_Link[0].dataset;

            if ($.isEmptyObject( iArgs ))  return this[iName];

            var iData = this.getData(),  _Args_ = { };

            for (var iKey in iArgs)
                _Args_[iKey] = $.isData( iData[iKey] )  ?  iData[iKey]  :  iKey;

            return  $.extendURL(this[iName], _Args_);
        },
        valueOf:     function () {
            var iValue = { };

            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        boot:        function () {
            var $_Module = this.$_View
                    .find('*[href]:not(a, link), *[src]:not(img, iframe, script)')
                    .not(UI_Module.$_Link + ', *[href]:parent');

            for (var i = 0;  $_Module[i];  i++)
                (new UI_Module(this.ownerApp, this.data, $_Module[i])).load();

            return this;
        },
        render:      function (iData) {
            iData = iData || this.data;

            var iView;

            if ($.likeArray( iData )) {
                iView = $.ListView.getInstance( this.$_View );
                if (! iView) {
                    iView = $.ListView.findView( this.$_View )[0];
                    iView = iView  &&  $.ListView( iView );
                }
            } else
                iView = $.CommonView(this.$_View).on('render',  function () {
                    this.$_View.find('*').value('name', arguments[0]);
                });

            if (iView)
                iView.on('insert',  function ($_Item, iValue) {
                    $_Item.data('EWA_DS',  DS_Inherit(iData, iValue))
                        .value('name', iValue);
                }).render(iData);

            this.boot();

            return this;
        },
        trigger:     function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.href || '',
                this.src || '',
                [ this.valueOf() ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        load:        function () {
            var iThis = this,  iJSON = this.getURL('src') || this.getURL('action');

            var iReady = (this.href && iJSON)  ?  2  :  1;

            if (this.href)
                this.$_View.load(this.getURL('href'),  function () {
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
        detach:      function () {
            this.$_Content = this.$_View.children().detach();

            return this;
        },
        attach:      function () {
            this.$_View.append( this.$_Content );

            return this;
        }
    });

    return UI_Module;

});
