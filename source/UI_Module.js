define([
    'jquery', 'HTML_Template', 'Module_Argument', 'Node_Template', 'InnerLink'
],  function ($, HTML_Template, Module_Argument, Node_Template, InnerLink) {

    function UI_Module(iLink, iScope) {

        var iView = $.CommonView.call(this, iLink.getTarget());

        iView.source = iLink;

        if (iView !== this)  return iView;

        this.ownerApp = iLink.ownerApp;

        this.type = (this.$_View[0] == this.ownerApp.$_Root[0])  ?
            'page'  :  'module';

        this.name = this.$_View[0].getAttribute('name');

        if (! this.name) {
            this.name = $.uuid('EWA');
            this.$_View[0].setAttribute('name', this.name);
        }

        this.arguments = new Module_Argument(this.$_View[0], [
            'target', 'href', 'method', 'title', 'autofocus', 'name'
        ]);
        (
            this.template = new HTML_Template(
                this.$_View,  iScope || this.source.getScope()
            )
        ).scope.extend( this.getEnv() ).extend( this.valueOf() );

        this.attrWatch().length = this.lastLoad = 0;
    }

    return  $.inherit($.CommonView, UI_Module, {
        selector:    '*[href]:not(a, link), *[src]:not(:media, script)'
    }, {
        attrWatch:     function () {
            var _This_ = this;

            this.arguments.observe(function (_, iKey, iNew, iOld) {

                if (! (iOld != null))  return;

                if (iKey != 'src') {
                    var iData = { };  iData[iKey] = Node_Template.safeEval( iNew );

                    return  _This_.template.render( iData );
                }

                if (_This_.lastLoad)
                    _This_.source.loadJSON().then(function () {

                        _This_.template.lastRender = 0;

                        _This_.render(_This_.loadJSON( arguments[0] ));
                    });
            });

            return this;
        },
        emit:          function () {
            var iArgs = [
                    arguments[0],
                    this.source.href || '',
                    this.source.src || this.source.action || '',
                    [ this.source ].concat( arguments[1] )
                ];

            return  this.trigger.apply(this, iArgs).concat(
                this.trigger.apply(this.ownerApp, iArgs)
            )[0];
        },
        findSub:       function () {
            var $_Sub = this.$_View.find( UI_Module.selector )
                    .not( InnerLink.selector );

            $_Sub = $($.map($_Sub,  function (_This_, Index) {

                if (! (Index  &&  $.contains($_Sub[Index - 1], _This_)))
                    return _This_;
            }));

            var _This_ = this;

            $.extend(this,  $.map($_Sub,  function () {
                return  new UI_Module(
                    new InnerLink(_This_.ownerApp, arguments[0])
                );
            }));
            this.length = $_Sub.length;

            return $_Sub;
        },
        getEnv:        function () {
            var iData = { },
                iHTML = this.source.getURL('href'),
                iJSON = this.source.getURL('src') || this.source.getURL('action');

            if (iHTML) {
                var iFileName = $.fileName(iHTML).split('.');

                $.extend(iData, {
                    _File_Path_:    $.filePath(iHTML),
                    _File_Name_:    iFileName[0],
                    _File_Ext_:     iFileName[1]
                });
            }

            if (iJSON) {
                iJSON = iJSON.slice( this.ownerApp.apiPath.length );

                $.extend(iData, {
                    _Data_Path_:    $.filePath(iJSON),
                    _Data_Name_:    $.fileName(iJSON)
                });
            }

            return  $.extend(iData, $.paramJSON(this.source.href));
        },
        syncLoad:      function ($_Link) {
            this.template.parsePlain( $_Link[0] );
            this.template.renderDOM( $_Link[0] );

            $_Link = $_Link[0].attributes;

            var iLink = this.source;

            for (var i = 0;  $_Link[i];  i++)
                if ($_Link[i].nodeName != 'target')
                    iLink.$_DOM[0].setAttribute(
                        $_Link[i].nodeName,  $_Link[i].nodeValue
                    );

            var iJSON = iLink.src || iLink.action;

            this.template.scope.extend( this.getEnv() );

            if (this.type == 'page') {
                iLink.$_DOM = [
                    $( $_Link[0].ownerElement ),  $_Link = iLink.$_DOM
                ][0];

                this.ownerApp.register( this ).source.$_DOM.remove();

                this.registered = true;

                iLink.$_DOM = $_Link;
            }

            return  ((! iJSON)  &&  iLink.src)  ?
                this.source.loadJSON()  :  Promise.resolve('');
        },
        attach:        function () {
            this.$_View
                .data(this.constructor.getClass(), this)
                .data(HTML_Template.getClass(), this.template);

            this.arguments.observe();

            if ( this.$_Content )
                return  this.$_View.append( this.$_Content )
                    .toggleAnimate('active', this).then(function (_This_) {

                        _This_.$_Content = null;

                        _This_.emit('ready');
                    });
        },
        detach:        function () {
            return  this.$_View.toggleAnimate('active', this)
                .then(function (_This_) {

                    _This_.$_Content = _This_.$_View.children().detach();

                    _This_.arguments.destructor();

                    _This_.$_View
                        .data(_This_.constructor.getClass(), null)
                        .data(HTML_Template.getClass(), null);

                    return _This_;
                });
        },
        destructor:    function () {
            return  (this.$_Content ? Promise.resolve('') : this.detach())
                .then(function (_This_) {

                    if ( _This_.$_Content ) {
                        _This_.$_Content.remove();
                        _This_.$_Content = null;
                    }
                });
        },
        loadHTML:      function () {

            var _This_ = this,  $_Slot = this.$_View.children().detach();

            return  this.$_View.htmlExec( arguments[0] ).then(function () {

                _This_.template.parseSlot( $_Slot );

                _This_.emit('template');

                var $_Link = _This_.$_View.children('link[target="_blank"]');

                return  $_Link[0]  &&  _This_.syncLoad( $_Link );

            }).then($.proxy($.fn.toggleAnimate, this.$_View, 'active'));
        },
        loadJSON:      function (iData) {

            iData = this.emit('data', [iData])  ||  iData;

            if (iData instanceof Array) {
                var _Data_ = { };
                _Data_[this.name] = iData;
            }

            return  _Data_ || iData;
        },
        loadModule:    function () {

            return  Promise.all($.map(this,  function (iModule) {

                return  iModule.source.load().then(function () {

                    return  iModule.load(arguments[0][1], arguments[0][0]);
                });
            }));
        },
        prefetch:      function () {
            var $_Link = this.$_View.find( InnerLink.selector ).not('link, form');

            for (var i = 0;  $_Link[i] && (i < 5);  i++)
                (new InnerLink(this.ownerApp, $_Link[i])).prefetch();

            return this;
        },
        render:        function () {
            this.template.parse( this.$_Sub );
            delete this.$_Sub;

            this.template.render( arguments[0] );

            if (! this.lastLoad)  this.prefetch();

            this.lastLoad = $.now();
            this.domReady = null;

            this.emit('ready');

            return this.loadModule();
        },
        load:          function (iData, iHTML) {

            var _This_ = this,  DOM_Ready = this.promise();

            return  (iHTML  ?  this.loadHTML( iHTML )  :  Promise.resolve(''))
                .then(function (_Data_) {

                    _This_.lastLoad = _This_.template.lastRender = 0;

                    _This_.$_Sub = _This_.findSub();

                    return  _This_.loadJSON(_Data_ || iData);

                }).then(function (_Data_) {

                    if (! _This_.$_View.children('script')[0]) {

                        delete _This_.domReady;
                        return _Data_;
                    }

                    _This_.resolve(_Data_);

                    return DOM_Ready;

                }).then($.proxy(this.render, this));
        },
        promise:       function () {
            var _This_ = this;

            var DOM_Ready = new Promise(function () {

                    _This_.domReady = $.makeArray( arguments );
                });

            this.curry = $.curry(function (iData, iFactory) {

                if (typeof iData == 'function')
                    iData = [iFactory,  iFactory = iData][0];

                try {
                    _This_.domReady[0](iFactory.call(_This_, iData)  ||  iData);
                } catch (iError) {
                    _This_.domReady[1]( iError );
                }
            });

            return DOM_Ready;
        },
        resolve:       function () {
            if ( this.curry )  this.curry = this.curry( arguments[0] );

            if (! this.curry)  delete this.domReady;
        }
    });
});
