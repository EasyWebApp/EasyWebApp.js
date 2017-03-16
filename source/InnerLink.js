define(['jquery', 'Observer', 'iQuery+'],  function ($, Observer) {

    function InnerLink(Link_DOM, API_Root) {

        Observer.call(this).$_View = $( Link_DOM );

        this.target = ('target' in Link_DOM)  &&  (Link_DOM.target || '_self');

        this.method = (Link_DOM.getAttribute('method') || 'Get').toUpperCase();

        this.href = Link_DOM.dataset.href ||
            Link_DOM.getAttribute(Link_DOM.href ? 'href' : 'action');

        this.src = this.href.split('?data=');

        this.href = this.src[0];

        this.src = this.src[1];

        if (this.src  &&  (! $.urlDomain( this.src )))
            this.src = API_Root + this.src;

        this.href = this.href.split('?')[0];

        this.title = Link_DOM.title || document.title;
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
        loadData:    function () {

            if (this.$_View[0].tagName == 'A')
                return  Promise.resolve($.getJSON( this.src ));

            var iOption = {type: this.method};

            if (! this.$_View.find('input[type="file"]')[0])
                iOption.data = this.$_View.serialize();
            else {
                iOption.data = new BOM.FormData( this.$_View[0] );
                iOption.contentType = iOption.processData = false;
            }

            var URI = iOption.type.toUpperCase() + ' ' + this.src;

            return  Promise.resolve($.ajax(this.src, iOption)).then(
                $.proxy($.storage, $, URI),  $.proxy($.storage, $, URI, null)
            );
        },
        load:        function () {

            return  Promise.all([
                this.href  &&  $.get( this.href ),
                this.src  &&  this.loadData()
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
        },
        prefetch:    function () {
            if ( this.href )
                $_Prefetch.clone().attr('href', this.href).appendTo('head');

            if (
                (this.method == 'GET')  &&
                this.src  &&  (this.src.indexOf('?') == -1)
            )
                $_Prefetch.clone().attr('href', this.src).appendTo('head');
        }
    });
});