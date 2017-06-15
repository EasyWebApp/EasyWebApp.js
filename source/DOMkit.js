define(['jquery', 'RenderNode', 'jQueryKit'],  function ($, RenderNode) {

    var Link_Name = $.makeSet('a', 'area', 'form');

    return {
        fixScript:      function (iDOM) {
            var iAttr = { };

            $.each(iDOM.attributes,  function () {

                iAttr[ this.nodeName ] = this.nodeValue;
            });

            iDOM = $('<script />', iAttr)[0];

            return iDOM;
        },
        fixLink:        function (iDOM) {
            if (
                ((iDOM.target || '_self')  ==  '_self')  &&
                ($.urlDomain(iDOM.href || iDOM.action)  !=  $.urlDomain())
            )
                iDOM.target = '_blank';
        },
        parsePath:      function (iPath) {

            var iNew;  iPath = iPath.replace(/^\.\//, '').replace(/\/\.\//g, '/');

            do {
                iPath = iNew || iPath;

                iNew = iPath.replace(/[^\/]+\/\.\.\//g, '');

            } while (iNew != iPath);

            return iNew;
        },
        fixURL:         function (iDOM, iKey, iBase) {

            var iURL = iDOM.getAttribute( iKey )  ||  '';

            if (
                (iURL[0] === '#')  ||
                ((iURL.match( RenderNode.expression ) || [ ]).join('')  ==  iURL)
            )
                return iURL;

            iURL = iURL.split('?');

            if (
                iBase  &&  iURL[0]  &&
                (! $.urlDomain( iURL[0] ))  &&  (iURL[0].indexOf( iBase )  <  0)
            ) {
                iURL[0] = this.parsePath(iBase + iURL[0]);

                iDOM.setAttribute(iKey, iURL.join('?'));
            }

            return iURL.join('?');
        },
        prefetch:       function (iDOM, iURL) {
            if (
                (iDOM.tagName.toLowerCase() in Link_Name)  &&
                ((iDOM.target || '_self')  ==  '_self')  &&
                (! (
                    iURL.match( RenderNode.expression )  ||
                    $('head link[href="' + iURL + '"]')[0]
                ))
            )
                $('<link />', {
                    rel:     (($.browser.msie < 11)  ||  $.browser.ios)  ?
                        'next'  :  'prefetch',
                    href:    iURL
                }).appendTo( document.head );
        }
    };
});