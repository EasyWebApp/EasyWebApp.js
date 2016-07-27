define(['jquery', 'ViewDataIO'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ---------- [object PageLink] ---------- */

    function PageLink(This_App, Link_DOM, iArgument, iData) {
        this.ownApp = This_App;
        this.$_DOM = $.isPlainObject(Link_DOM) ?
            this.createDOM(Link_DOM, iArgument, iData)  :
            $(Link_DOM);

        var _Self_ = arguments.callee,  iLink = this.$_DOM.data('EWA_PageLink');

        if (iLink instanceof _Self_)  return iLink;

        this.$_DOM.data('EWA_PageLink', this).css('cursor', 'pointer');

        $.extend(this, _Self_.getAttr(this.$_DOM));

        switch (this.target) {
            case '_top':      this.type = 'Outer';  break;
            case '_blank':    this.type = 'Data';   break;
            case '_self':     ;
            default:          if (this.href)  this.type = 'Inner';
        }
        this.method = (this.method || 'Get').toLowerCase();
        this.data = { };
        this.href = this.href || this.ownApp.history.last().HTML;
        this.href = this.getURL('href');

        var iFileName = $.fileName( this.href ).split('.');

        $.extend(this.data, {
            _File_Path_:    $.filePath( this.href ),
            _File_Name_:    iFileName[0],
            _Ext_Name_:     iFileName[1]
        });

        if (this.src)
            $.extend(this.data, {
                _Data_Path_:    $.filePath(this.src),
                _Data_Name_:    $.fileName(this.src)
            });

        if ((this.href || '').indexOf('?')  >  -1)
            this.data = $.extend($.paramJSON(this.href), this.data);
    }

    $.extend(PageLink, {
        getAttr:          function () {
            return arguments[0].attr([
                'target', 'title', 'alt', 'href', 'method', 'src', 'action'
            ]);
        },
        prefetchRel:      $.browser.modern ? 'prefetch' : 'next',
        prefetchClear:    function () {
            $('head link[rel="' + this.prefetchRel + '"]').remove();
        }
    });

    $.extend(PageLink.prototype, {
        createDOM:    function (iAttribute, iArgument, iData) {
            var _Argument_ = { };

            if ( $.isPlainObject(iArgument) )
                for (var iName in iArgument)
                    _Argument_['data-' + iName] = iArgument[iName];

            var $_Link = $('<button />', $.extend({
                    rel:    'nofollow',
                    css:    {display:  'none'}
                }, iAttribute, _Argument_)).appendTo(DOM.body);

            if ((iData instanceof Array)  ||  $.isPlainObject(iData))
                $_Link.data('EWA_Model', iData);

            return $_Link;
        },
        getData:      function () {
            var iData = this.$_DOM.data('EWA_Model');

            if (! iData) {
                var $_Item = this.$_DOM.hasClass('ListView_Item') ?
                        this.$_DOM : this.$_DOM.parents('.ListView_Item');

                if ( $_Item[0] )
                    iData = $.ListView.getInstance( $_Item[0].parentNode )
                        .valueOf( $_Item );
            }
            return  this.data = $.extend(iData || { },  this.data);
        },
        getArgs:      function () {
            var iData = $.extend(this.ownApp.history.getData(), this.getData());

            return  $.map(this.$_DOM[0].dataset,  function (iName) {
                if (
                    ((Number(iName) % 1)  !==  0)  &&
                    (iData[iName] !== undefined)
                )
                    return iData[iName];

                return iName;
            });
        },
        getURL:       function (iKey) {
            if (! this[iKey])  return '';

            if ((iKey != 'href')  ||  (this[iKey][0] != '#')) {
                this[iKey] = this.ownApp.makeURL(
                    this[iKey] || '',
                    this.getData(),
                    ((iKey == 'href')  ?  (! this.src)  :  (
                        this.method.toUpperCase() == 'GET'
                    )) && this.getArgs()
                );
                if ((iKey == 'href')  &&  (this[iKey].slice(-1) == '?'))
                    this[iKey] = this[iKey].slice(0, -1);
            }
            return this[iKey];
        },
        valueOf:      function () {
            var iValue = { };

            for (var iKey in this)
                if (! (typeof this[iKey]).match(/object|function/))
                    iValue[iKey] = this[iKey];

            return iValue;
        }
    });

    return PageLink;

});