define(['jquery', 'jQueryKit'],  function ($) {

    /**
     * 渲染节点
     *
     * @author TechQuery
     *
     * @class  RenderNode
     *
     * @param  {Node} node - A Node within a template
     */

    function RenderNode(node) {

        this.DOMType = $.Type( node );

        var name = node.name;

        if (this.DOMType === 'Attr') {

            var propKey = $.propFix[ name ]  ||  (
                    (name in node.ownerElement)  &&  name
                );

            if ( propKey )
                this.name = propKey,  this.DOMType = 'Prop';
            else
                this.name = name;
        }

        $.extend(this, {
            ownerNode:       node,
            raw:             node.nodeValue || node.value,
            ownerElement:    node.parentNode || node.ownerElement,
            type:            0,
            value:           null
        }).scan();
    }

    RenderNode.expression = /\$\{([\s\S]+?)\}/g;

    RenderNode.reference = /(\w+)(\.|\[(?:'|")|\()(\w+)?/g;

    RenderNode.Reference_Mask = {
        view:     1,
        this:     4,
        scope:    8
    };

    RenderNode.Template_Type = $.makeSet('Attr', 'Text', 'Comment');

    function Eval(view, scope, expression) {  'use strict';
        try {
            var iValue = eval( expression );

            return  (iValue != null)  ?  iValue  :  '';

        } catch (iError) {

            console.error( iError );

            return '';
        }
    }

    $.extend(RenderNode.prototype = [ ],  {
        constructor:    RenderNode,
        add:            function (key) {

            if (key  &&  (this.indexOf( key )  <  0))
                this.push( key );
        },
        clear:          function () {

            var node = this.ownerNode,
                value = this.raw.replace(RenderNode.expression, '');

            switch ( this.DOMType ) {
                case 'Text':       ;
                case 'Comment':    return  (node.nodeValue = value);
                case 'Attr':       ;
                case 'Prop':
                    if (
                        !(node.value = value)  &&
                        (node.name.slice(0, 5) !== 'data-')
                    ) {
                        this.ownerElement.removeAttribute( node.name );

                        this.ownerNode = null;
                    }
            }
        },
        scan:           function () {

            var _This_ = this;

            this.splice(0, Infinity);    this.type = 0;

            this.raw = this.raw.replace(
                RenderNode.expression,  function (_, expression) {

                    if (/\w+\s*\([\s\S]*?\)/.test( expression ))
                        _This_.type = _This_.type | 2;

                    expression.replace(
                        RenderNode.reference,  function (_, scope, symbol, key) {

                            var global = self[ scope ];

                            if ( global )
                                return  _This_.type = _This_.type | 16;

                            if (symbol[0] === '(')  return;

                            _This_.type = _This_.type |
                                RenderNode.Reference_Mask[ scope ];

                            if (scope !== 'this')  _This_.add( key );
                        }
                    );

                    return  '${' + expression.trim() + '}';
                }
            );

            if ( this[0] )  this.clear();
        },
        eval:           function (context, scope) {

            var refer,  _This_ = this.ownerElement;

            var text = this.raw.replace(
                    RenderNode.expression,
                    function (template, expression, _, raw) {

                        refer = Eval.call(_This_, context, scope, expression);

                        return  (template == raw)  ?  raw  :  refer;
                    }
                );

            return  (this.raw == text)  ?  refer  :  text;
        },
        render:         function (context, scope) {

            var value = this.eval(context, scope),
                node = this.ownerNode,
                parent = this.ownerElement;

            if (value === this.value)  return;

            this.value = value;

            switch ( this.DOMType ) {
                case 'Text':    {
                    if (node.previousSibling || node.nextSibling)
                        node.nodeValue = value;
                    else
                        parent.innerHTML = value;

                    break;
                }
                case 'Prop':    if (this.name !== 'style') {

                    parent[ this.name ] = (value instanceof Function)  ?
                        value.bind( context )  :  value;

                    break;
                }
                case 'Attr':
                    if ( node )
                        node.value = value;
                    else
                        parent.setAttribute(this.name, value);
            }
        },
        /**
         * 生成文本值
         *
         * @author   TechQuery
         *
         * @memberof RenderNode.prototype
         *
         * @returns  {string} Text Value of this template
         */
        toString:       function () {

            return  this.value + '';
        }
    });

    return RenderNode;

});
