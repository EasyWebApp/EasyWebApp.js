define(['jquery', 'Observer', 'iQuery+'],  function ($, Observer) {

    function InnerLink(Link_DOM) {

        var _This_ = Observer.call(this, Link_DOM);

        if (_This_ != this)  this.__handle__ = _This_.__handle__;

        this.target = Link_DOM.tagName.match(/^(a|area|form)$/i) ? 'page' : 'view';

        this.method = (
            Link_DOM.getAttribute('method') || Link_DOM.dataset.method || 'Get'
        ).toUpperCase();

        this.contentType =
            Link_DOM.getAttribute('type') || Link_DOM.getAttribute('enctype') ||
            'application/x-www-form-urlencoded';

        this.setURI().title = Link_DOM.title || document.title;
    }

    return  $.inherit(Observer, InnerLink, {
        HTML_Link:    'a[href], area[href], form[action]',
        Self_Link:    '[data-href]:not(a, form)'
    }, {
        setURI:      function () {

            var Link_DOM = this.$_View[0];

            this.href = Link_DOM.dataset.href ||
                Link_DOM.getAttribute(Link_DOM.href ? 'href' : 'action');

            this.src = this.href.split('?data=');

            this.href = this.src[0];

            this.src = this.src[1];

            this.data = $.paramJSON( this.href );

            this.href = this.href.split('?')[0];

            return this;
        },
        getURI:      function () {

            var iData = [$.param( this.data )];

            if (! iData[0])  iData.length = 0;

            if ( this.src )  iData.push('data=' + this.src);

            iData = iData.join('&');

            return  (this.href || '')  +  (iData  &&  ('?' + iData));
        },
        loadData:    function () {

            var URI = this.method + ' ';

            var iOption = {
                    type:           this.method,
                    beforeSend:     arguments[0],
                    contentType:    this.contentType,
                    dataType:
                        (this.src.match(/\?/g) || '')[1]  ?  'jsonp'  :  'json',
                    complete:       function () {
                        URI += this.url;
                    }
                };

            if ( this.$_View[0].tagName.match(/^(a|area)$/i) ) {

                iOption.data = $.extend({ }, this.$_View[0].dataset);

            } else if (! this.$_View.find('input[type="file"]')[0]) {

                iOption.data = $.paramJSON('?' + this.$_View.serialize());
            } else {
                iOption.data = new BOM.FormData( this.$_View[0] );
                iOption.contentType = iOption.processData = false;
            }

            var iJSON = Promise.resolve( $.ajax(this.src, iOption) );

            return  (this.method != 'GET')  ?  iJSON  :  iJSON.then(
                function () {
                    return  $.storage(URI, arguments[0]);
                },
                function () {
                    return  $.storage( URI );
                }
            );
        },
        load:        function (onRequest) {

            return Promise.all([
                this.href  &&  $.ajax({
                    type:          'GET',
                    url:           this.href,
                    beforeSend:    onRequest
                }),
                this.src  &&  this.loadData( onRequest )
            ]);
        },
        valueOf:     function () {
            var _This_ = { };

            for (var iKey in this)
                if (
                    (typeof this[iKey] != 'object')  &&
                    (typeof this[iKey] != 'function')
                )
                    _This_[iKey] = this[iKey];

            _This_.target = this.$_View[0];

            return _This_;
        }
    });
});