define([
    'jquery', './RenderNode', '../InnerLink'
],  function ($, RenderNode, InnerLink) {

    var Invalid_Style = $.makeSet('inherit', 'initial'),
        URL_DOM = $.extend(
            $.makeSet(0,  ['script', 'img', 'iframe', 'audio', 'video']),
            $.makeSet('href',  ['link', 'a', 'area']),
            {form: 'action',  '[data-href]': 'data-href'}
        ),
        URL_Prefix = $.makeSet('?', '#');


    return {
        cssRule:      function cssRule(sheet) {

            var rule = { };

            $.each(sheet.cssRules,  function () {

                if ( this.cssRules )
                    return (
                        rule[ this.cssText.split( /\s*\{/ )[0] ] = cssRule( this )
                    );

                var _rule_ = rule[this.selectorText || this.keyText] = { };

                for (var i = 0, value, priority;  this.style[i];  i++) {

                    value = this.style.getPropertyValue( this.style[i] );

                    if (priority = this.style.getPropertyPriority( this.style[i] ))
                        value += ' !' + priority;

                    if (! (value in Invalid_Style))
                        _rule_[ this.style[i] ] = value;
                }
            });

            return rule;
        },
        fixStyle:     function ($_Root, iDOM) {

            if ( iDOM.classList.contains('iQuery_CSS-Rule') )  return iDOM;

            var rule = this.cssRule( iDOM.sheet );    iDOM = [ ];

            $.each(rule,  function (selector) {

                var At_Rule = selector.match( /^@\S*?(\w+)\s*([\s\S]+)/ );

                if (! At_Rule)  return;

                switch ( At_Rule[1] ) {
                    case 'media':
                        $_Root.cssRule(this,  function () {

                            iDOM[iDOM.push( arguments[0].ownerNode ) - 1].media =
                                At_Rule[2];
                        });
                        break;
                    case 'keyframes':
                        iDOM.push( $.cssRule(selector,  this) );
                        break;
                    case 'supports':
                        if (
                            (CSS.supports instanceof Function)  &&
                            CSS.supports( At_Rule[2] )
                        )
                            $.extend(true,  rule,  this);
                }

                delete  rule[ selector ];
            });

            $_Root.cssRule(rule,  function () {

                iDOM.unshift( arguments[0].ownerNode );
            });

            return iDOM;
        },
        fixScript:    function (iDOM) {
            var iAttr = { };

            $.each(iDOM.attributes,  function () {

                iAttr[ this.nodeName ] = this.nodeValue;
            });

            iDOM = $('<script />', iAttr).prop('text', iDOM.text)[0];

            return iDOM;
        },
        fixURL:       function (iDOM, iKey, iBase) {

            var iURL = iDOM.getAttribute( iKey )  ||  '';

            var expression = iURL.match( RenderNode.expression );

            if (
                !(iURL[0] in URL_Prefix)  &&
                (iURL  !==  (expression || [ ]).join(''))
            ) {
                var root = $.filePath() + '/';

                iURL = (
                    new URL(iURL,  new URL(iBase || '', root))  +  ''
                ).replace(root, '');

                iDOM.setAttribute(
                    iKey,  iURL = expression ? decodeURI( iURL ) : iURL
                );
            }

            return iURL;
        },
        prefetch:     function (iURL) {
            if (! (
                (iURL[0] in URL_Prefix)  ||
                iURL.match( RenderNode.expression )  ||
                $('head link[href="' + iURL + '"]')[0]
            ))
                $('<link />', {
                    rel:     (($.browser.msie < 11)  ||  $.browser.ios)  ?
                        'next'  :  'prefetch',
                    href:    iURL
                }).appendTo( document.head );
        },
        parseSlot:    function (root, $_Root) {

            $_Root.find('slot[name]').each(function () {

                $('[slot="' + this.getAttribute('name') + '"]',  root)
                    .replaceAll( this );
            });

            $_Root.find('slot').each(function () {

                if (! arguments[0])
                    this.parentNode.replaceChild(
                        $.buildFragment( root.childNodes ),  this
                    );
                else
                    this.parentNode.removeChild( this );
            });
        },
        build:        function (root, base, HTML) {

            var $_Root = HTML  ?
                    $('<div />').prop('innerHTML', HTML)  :  $( root ),
                _This_ = this;

            if ( base.href )
                base = base.href;
            else if (base  =  $( root ).parents(
                '[data-href]:view:not([data-href^="?"])'
            )[0])
                base = base.dataset.href;


            $_Root.find(Object.keys( URL_DOM ) + '').not('head *').each(function () {

                var URL = _This_.fixURL(
                        this,
                        URL_DOM[ this.tagName.toLowerCase() ]  ||  (
                            ('src' in this)  ?  'src'  :  'data-href'
                        ),
                        base
                    );

                if (
                    $( this ).is( InnerLink.HTML_Link )  &&
                    ((this.target || '_self')  ===  '_self')
                ) {
                    if ($.urlDomain(this.href || this.action)  !==  $.urlDomain())
                        this.target = '_blank';

                    if ((this.target || '_self')  ===  '_self')
                        _This_.prefetch( URL );
                }

                if ($( this ).is(InnerLink.HTML_Link + ', ' + InnerLink.Self_Link))
                    new InnerLink( this );
            });


            if ( HTML ) {
                if ( root.childNodes[0] )  this.parseSlot(root, $_Root);

                root.appendChild( $.buildFragment( $_Root.contents() ) );
            }
        }
    };
});