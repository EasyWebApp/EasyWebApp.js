define(['jquery', 'iQuery+'],  function ($) {

    function InnerLink(Link_DOM, Glob_Env) {

        this.$_View = $( Link_DOM );

        this.$_Target = Glob_Env.target[
            this.target = Link_DOM.target || '_self'
        ]  ||  $(
            '[name="' + this.target + '"]'
        );

        this.method = (Link_DOM.getAttribute('method') || 'Get').toUpperCase();

        this.src = $.paramJSON(
            this.href = Link_DOM.getAttribute(Link_DOM.href ? 'href' : 'action')
        )['for'];

        if (this.src  &&  (! $.urlDomain( this.src )))
            this.src = Glob_Env.dataBase + this.src;

        this.href = this.href.split('?')[0];

        this.title = Link_DOM.title || document.title;
    }

    var $_Prefetch = $(
            '<link rel="'  +  ($.browser.modern ? 'prefetch' : 'next')  +  '" />'
        ).on('load error',  function () {
            $(this).remove();
        });

    $.extend(InnerLink.prototype, {
        loadData:    function () {
            if (! this.src)  return;

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

            return  Promise.all([$.get( this.href ),  this.loadData()]);
        },
        valueOf:     function () {
            var _This_ = { };

            for (var iKey in this)
                if (
                    (typeof this[iKey] != 'object')  &&
                    (typeof this[iKey] != 'function')
                )
                    _This_[iKey] = this[iKey];

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

    return InnerLink;

});
