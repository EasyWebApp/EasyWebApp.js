define(['jquery', 'DS_Inherit', 'iQuery+'],  function ($, DS_Inherit) {

    function UI_Module(iLink, iScope) {
        this.ownerApp = iLink.ownerApp;
        this.source = iLink;
        this.data = DS_Inherit(iScope,  { });

        var $_View = iLink.target || iLink.$_DOM;

        if ($_View == '_self')
            $_View = this.ownerApp.$_Root;
        else if (typeof $_View == 'string')
            $_View = '*[name="' + $_View + '"]';

        this.$_View = $($_View).data(this.constructor.getClass(), this);

        this.ownerApp.register(this);
    }

    $.extend(UI_Module, {
        getClass:      $.CommonView.getClass,
        instanceOf:    $.CommonView.instanceOf,
        $_Template:    { }
    });

    $.extend(UI_Module.prototype, {
        toString:    $.CommonView.prototype.toString,
        getData:     function () {
            var iLV = $.ListView.instanceOf( this.source.$_DOM );

            if (! iLV)  return this.data;

            var $_Item = this.source.$_DOM.parentsUntil( iLV.$_View );

            return  ($_Item[0] ? $_Item.slice(-1) : this.source.$_DOM)
                .data('EWA_DS');
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

            this.ownerApp.loadViewOf(this);

            return this;
        },
        trigger:     function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.source.href || '',
                this.source.src || this.source.action || '',
                [ this.source.valueOf() ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        loadHTML:    function (HTML_Ready) {
            var iTemplate = this.constructor.$_Template,
                iHTML = this.source.href.split('?')[0];

            if (iTemplate[iHTML]) {
                this.$_View.append( iTemplate[iHTML].clone(true) );

                return  HTML_Ready.call( this.$_View[0] );
            }

            this.$_View.load(this.source.getURL('href'),  function () {
                iTemplate[iHTML] = $(this.children).not('script').clone(true);

                HTML_Ready.apply(this, arguments);
            });
        },
        load:        function () {
            var iThis = this,  iJSON = this.source.src || this.source.action;

            var iReady = (this.source.href && iJSON)  ?  2  :  1;

            if (this.source.href)
                this.loadHTML(function () {
                    if (--iReady)  return;

                    if (! $.isEmptyObject(iThis.data))  iThis.render();

                    iThis.trigger('ready');
                });

            if (iJSON)
                this.source.loadData(this.getData(),  function (_JSON_) {
                    _JSON_ = iThis.trigger('data', [_JSON_])  ||  _JSON_;

                    $.extend(iThis.data, _JSON_);

                    if (_JSON_ instanceof Array)
                        iThis.data.length = _JSON_.length;

                    if (--iReady)  return;

                    iThis.render();

                    iThis.trigger('ready');
                });

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
