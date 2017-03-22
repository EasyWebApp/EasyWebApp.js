define(['jquery', 'Observer', 'iQuery+'],  function ($, Observer) {

    function InnerLink(Link_DOM, API_Root) {

        Observer.call(this).$_View = $( Link_DOM );

        this.target = ('target' in Link_DOM)  &&  (Link_DOM.target || '_self');

        this.method = (Link_DOM.getAttribute('method') || 'Get').toUpperCase();

        this.setURI(Link_DOM, API_Root).title = Link_DOM.title || document.title;
    }

    var $_Prefetch = $(
            '<link rel="'  +  ($.browser.modern ? 'prefetch' : 'next')  +  '" />'
        ).on('load error',  function () {
            $(this).remove();
        });

    return  $.inherit(Observer, InnerLink, {
        HTML_Link:    'a[href], form[action]',
        Self_Link:    '[data-href]:not(a, form)'
    }, {
        setURI:      function (Link_DOM, API_Root) {

            this.href = Link_DOM.dataset.href ||
                Link_DOM.getAttribute(Link_DOM.href ? 'href' : 'action');

            this.src = this.href.split('?data=');

            this.href = this.src[0];

            this.fullSrc = this.src = this.src[1];

            if (this.src  &&  (! $.urlDomain( this.src )))
                this.fullSrc = API_Root + this.src;

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

            if (this.$_View[0].tagName == 'A')
                return  Promise.resolve($.getJSON( this.fullSrc ));

            var iOption = {
                    type:        this.method,
                    dataType:
                        (this.src.match(/\?/g) || '')[1]  ?  'jsonp'  :  'json'
                };

            if (! this.$_View.find('input[type="file"]')[0])
                iOption.data = this.$_View.serialize();
            else {
                iOption.data = new BOM.FormData( this.$_View[0] );
                iOption.contentType = iOption.processData = false;
            }

            var URI = iOption.type.toUpperCase() + ' ' + this.fullSrc,
                iJSON = Promise.resolve($.ajax(this.fullSrc, iOption));

            return  (this.method != 'get')  ?  iJSON  :  iJSON.then(
                $.proxy($.storage, $, URI),  $.proxy($.storage, $, URI, null)
            );
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
        },
        prefetch:    function () {
            if ( this.href )
                $_Prefetch.clone().attr('href', this.href).appendTo('head');

            if (
                (this.method == 'GET')  &&
                this.src  &&  (this.src.indexOf('?') == -1)
            )
                $_Prefetch.clone().attr('href', this.fullSrc).appendTo('head');
        }
    });
});