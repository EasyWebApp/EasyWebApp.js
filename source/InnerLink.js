define(['jquery', './base/Observer'],  function ($, Observer) {

    /**
     * 应用内链接
     *
     * @author  TechQuery
     *
     * @class   InnerLink
     * @extends Observer
     *
     * @param   {jQueryAcceptable} $_View - HTMLElement of Inner Link
     *
     * @returns {InnerLink}        Return the last one if a InnerLink instance
     *                             has been created on this element
     */

    function InnerLink($_View) {

        var _This_ = Observer.call(this, $_View);

        return  ((_This_ !== this)  ?  _This_  :  this).setProp();
    }

    return  Observer.extend(InnerLink, {
        parsePath:    function (iPath) {

            var iNew;  iPath = iPath.replace(/^\.\//, '').replace(/\/\.\//g, '/');

            do {
                iPath = iNew || iPath;

                iNew = iPath.replace(/[^\.\/]+\/\.\.\//g, '');

            } while (iNew  &&  (iNew !== iPath));

            return iNew;
        },
        HTML_Link:    'a[href], area[href], form[action]',
        Self_Link:    '[data-href]:not(a, form)'
    }, {
        setProp:     function () {

            var link = this.$_View[0];

            this.method = (
                link.getAttribute('method') || link.dataset.method || 'Get'
            ).toUpperCase();

            this.contentType =
                link.getAttribute('type') || link.getAttribute('enctype') ||
                'application/x-www-form-urlencoded';

            this.charset = (
                link.getAttribute('charset') || link.acceptCharset ||
                document.charset
            ).split(/\s+/);

            this.setURI().title = link.title || document.title;

            if (! /^(a|area|form)$/i.test( link.tagName ))
                this.target = 'view';
            else if ( this.href )
                this.target = 'page';
            else
                this.target = 'data';

            return this;
        },
        setURI:      function () {

            var link = this.$_View[0];

            this.href = link.dataset.href ||
                link.getAttribute(link.href ? 'href' : 'action');

            this.src = this.href.split(/\?data=|&data=/);

            this.href = this.src[0];

            this.src = this.src[1];

            this.data = $.paramJSON( this.href );

            this.href = InnerLink.parsePath( this.href.split('?')[0] );

            return this;
        },
        /**
         * 生成 URI
         *
         * @author   TechQuery
         *
         * @memberof InnerLink.prototype
         *
         * @returns  {string} URI of this Inner Link
         */
        toString:    function () {

            var iData = [$.param( this.data )];

            if (! iData[0])  iData.length = 0;

            if ( this.src )  iData.push('data=' + this.src);

            iData = iData.join('&');

            return  (this.href || '')  +  (iData  &&  ('?' + iData));
        },
        loadData:    function () {

            var header;

            var option = {
                    method:         this.method,
                    url:            this.src,
                    beforeSend:     arguments[0],
                    contentType:
                        this.contentType  +  '; charset='  +  this.charset[0],
                    dataType:
                        (this.src.match(/\?/g) || '')[1]  ?  'jsonp'  :  'json',
                    complete:       function (XHR) {

                        header = $.parseHeader( XHR.getAllResponseHeaders() );
                    }
                };

            switch ( this.$_View[0].tagName.toLowerCase() ) {
                case 'form':
                    option.data = $.paramJSON('?' + this.$_View.serialize());
                    break;
                case 'area':    ;
                case 'a':       {
                    option.data = $.extend({ }, this.$_View[0].dataset);

                    delete option.data.method;
                    delete option.data.autofocus;
                }
            }

            switch ( this.contentType.split(';')[0] ) {

                case 'multipart/form-data':

                    $.extend(option, {
                        data:           new self.FormData( this.$_View[0] ),
                        contentType:    false,
                        processData:    false
                    });
                    break;
                case 'application/json': {

                    option.data = JSON.stringify( option.data );

                    option.processData = false;
                }
            }

            return  Promise.resolve( $.ajax( option ) ).then(function (data) {

                return  {head: header,  body: data};
            });
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
                if (this.hasOwnProperty( iKey ))  _This_[iKey] = this[iKey];

            delete _This_.$_View;

            _This_.target = this.$_View[0];

            return _This_;
        }
    }).registerEvent('request', 'data');

});
