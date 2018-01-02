define([
    'jquery', './RenderNode', '../InnerLink'
],  function ($, RenderNode, InnerLink) {

    var Invalid_Style = $.makeSet('inherit', 'initial'),
        URL_Prefix = $.makeSet('?', '#');

    function mapStyle(style, filter) {

        var context = this, key_value = { };

        $.each(style,  function () {

            var value = style.getPropertyValue( this ), _value_,
                priority = style.getPropertyPriority( this );

            if ( filter ) {

                if (null  !=  (_value_ = filter.call(
                    context,  value,  this + '',  priority,  style
                )))
                    value = _value_;
                else
                    return;
            }

            if ( priority )  value += ' !' + priority;

            if (! (value in Invalid_Style))  key_value[ this ] = value;
        });

        return  key_value;
    }

    function pathToRoot(base, path) {

        return (
            !(path[0] in URL_Prefix)  &&  path.replace(RenderNode.expression, '')
        )  &&
            decodeURI(
                new URL(path,  new URL(base, self.location))
            ).replace(
                $.filePath(), ''
            );
    }

    function fixCSSURL(base, value) {

        return  value.replace(
            /\s?url\(\s*(?:'|")(\S+)(?:'|")\)/g,
            function (_, path) {

                return  'url("'  +  (pathToRoot(base, path) || path)  +  '")';
            }
        );
    }

    return {
        cssRule:      function cssRule(sheet, mapFilter) {

            mapFilter = (mapFilter instanceof Function)  &&  mapFilter;

            var rule = { };

            $.each(sheet.cssRules,  function () {

                if ( this.cssRules )
                    rule[ this.cssText.split( /\s*\{/ )[0] ] =
                        cssRule(this, mapFilter);
                else
                    rule[this.selectorText || this.keyText] =
                        mapStyle.call(sheet, this.style, mapFilter);
            });

            return rule;
        },
        fixStyle:     function ($_Root, iDOM, base) {

            if ( iDOM.classList.contains('iQuery_CSS-Rule') )  return iDOM;

            var rule = this.cssRule(
                    iDOM.sheet,  base && fixCSSURL.bind(null, base)
                );

            iDOM = [ ];

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
        loadCSS:      function ($_View, linkDOM, base) {

            var path = pathToRoot(base, linkDOM.getAttribute('href')),
                _this_ = this,
                $_Style = $('<style disabled />');

            $.get( path ).then(function (CSS) {

                $_Style[0].textContent = CSS;

                $_Style.replaceWith( _this_.fixStyle($_View, $_Style[0], path) );

            },  function () {

                linkDOM.href = path;

                $_Style.replaceWith( linkDOM );
            });

            return $_Style[0];
        },
        fixScript:    function (iDOM) {
            var iAttr = { };

            $.each(iDOM.attributes,  function () {

                iAttr[ this.nodeName ] = this.nodeValue;
            });

            iDOM = $('<script />', iAttr).prop('text', iDOM.text)[0];

            return iDOM;
        },
        fixURL:       function (base) {

            var key, URI, $_This = $( this );

            if (this.style.cssText.indexOf('url(') > 0)
                $_This.css( mapStyle(this.style,  fixCSSURL.bind(null, base)) );

            switch ( this.tagName.toLowerCase() ) {
                case 'a':         ;
                case 'area':      key = 'href';
                case 'form':      key = key || 'action';
                case 'img':       ;
                case 'iframe':    ;
                case 'audio':     ;
                case 'video':     ;
                case 'script':    key = key || 'src';
                default:          {
                    key = key || 'data-href';

                    if (! (URI = this.getAttribute( key )))  break;

                    if (
                        ('target' in this)  &&
                        (this.target !== '_self')  &&
                        $.isXDomain( URI )
                    ) {
                        this.target = '_blank';

                    } else if (URI = pathToRoot(base, URI)) {

                        this.setAttribute(key, URI);

                        if ($_This.is(
                            InnerLink.HTML_Link + ', ' + InnerLink.Self_Link
                        ))
                            new InnerLink( this );
                    }
                }
            }
        },
        URL_DOM:      [
            'a', 'area', 'form', 'img', 'iframe', 'audio', 'video', 'script',
            '[style]', '[data-href]'
        ].join(', ')
    };
});
