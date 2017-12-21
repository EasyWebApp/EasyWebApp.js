define([
    'jquery', './RenderNode', '../InnerLink'
],  function ($, RenderNode, InnerLink) {

    var Invalid_Style = $.makeSet('inherit', 'initial'),
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
        fixURL:       function (base) {

            var key, URI;  base = new URL(base, self.location);

            switch ( this.tagName.toLowerCase() ) {
                case 'a':         ;
                case 'area':      ;
                case 'link':      key = 'href';
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

                    } else if (
                        !(URI[0] in URL_Prefix)  &&
                        URI.replace(RenderNode.expression, '')
                    ) {
                        this.setAttribute(
                            key,
                            decodeURI(new URL(URI, base)).replace(
                                $.filePath(), ''
                            )
                        );

                        if ($( this ).is(
                            InnerLink.HTML_Link + ', ' + InnerLink.Self_Link
                        ))
                            new InnerLink( this );
                    }
                }
            }
        }
    };
});
