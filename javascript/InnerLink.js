define(['jquery', 'UI_Module'],  function ($, UI_Module) {

    function InnerLink(iApp, iLink) {
        this.ownerApp = iApp;
        this.ownerView = UI_Module.instanceOf(iLink);

        this.$_DOM = $(iLink);

        this.title = iLink.title;
        this.target = iLink.getAttribute('target');
        this.href = iLink.getAttribute('href');
        this.method = (iLink.getAttribute('method') || 'GET').toLowerCase();
        this.src = iLink.getAttribute('src');
        this.action = iLink.getAttribute('action');
    }

    InnerLink.selector = '*[target]:not(a)';

    $.extend(InnerLink.prototype, {
        valueOf:     function () {
            var iValue = { };

            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        getURL:      function (iName, iScope) {
            var iURL = this[iName] = this.$_DOM[0].getAttribute(iName);

            if ((! iURL)  ||  $.isEmptyObject(iScope))  return iURL;

            var iArgs = this.$_DOM[0].dataset,  _Args_ = { },  _Data_;

            for (var iKey in iArgs) {
                _Data_ = iScope[ iArgs[iKey] ];

                if ($.isData(_Data_))  _Args_[iKey] = _Data_;
            }

            return $.extendURL(
                iURL.replace(/\{(.+?)\}/g,  function () {
                    return  iScope[arguments[1]] || '';
                }),
                _Args_
            );
        },
        loadData:    function (iScope, Data_Ready) {
            $[this.method](
                this.ownerApp.apiPath + (
                    this.getURL('src', iScope)  ||  this.getURL('action', iScope)
                ),
                this.$_DOM.serialize(),
                $.proxy(Data_Ready, this)
            );
        }
    });

    return InnerLink;

});