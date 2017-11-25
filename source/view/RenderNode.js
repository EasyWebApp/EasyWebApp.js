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

        $.extend(this, {
            ownerNode:       node,
            name:            node.nodeName,
            raw:             node.nodeValue,
            ownerElement:    node.parentNode || node.ownerElement,
            type:            0,
            value:           null
        }).scan();
    }

    RenderNode.expression = /\$\{([\s\S]+?)\}/g;

    RenderNode.reference = /(\w+)(?:\.|\[(?:'|")|\()(\w+)?/g;

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

    $.extend(RenderNode.prototype, {
        splice:      Array.prototype.splice,
        indexOf:     Array.prototype.indexOf,
        push:        Array.prototype.push,
        scan:        function () {

            var _This_ = this,  node = this.ownerNode;

            this.splice(0, Infinity);    this.type = 0;

            node.nodeValue = this.raw.replace(
                RenderNode.expression,  function (_, expression) {

                    if (/\w+\s*\([\s\S]*?\)/.test( expression ))
                        _This_.type = _This_.type | 2;

                    expression.replace(
                        RenderNode.reference,  function (_, scope, key) {

                            var global;

                            _This_.type = _This_.type | (
                                RenderNode.Reference_Mask[ scope ]  ||  (
                                    (global = self[ scope ])  &&  16
                                )
                            );

                            if (
                                (scope !== 'this')  &&
                                (! global)  &&
                                (_This_.indexOf( key )  <  0)
                            )
                                _This_.push( key );
                        }
                    );

                    return '';
                }
            );

            if (
                this[0]  &&  (node instanceof Attr)  &&  (! node.value)  &&  (
                    ($.propFix[node.name] || node.name)  in  this.ownerElement
                )
            )
                this.ownerElement.removeAttribute( node.name );
        },
        eval:        function (context, scope) {

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
        render:      function (context, scope) {

            var value = this.eval(context, scope),
                node = this.ownerNode,
                parent = this.ownerElement;

            if (value === this.value)  return;

            this.value = value;

            switch ($.Type( node )) {
                case 'Text':    {
                    if (node.previousSibling || node.nextSibling)
                        node.nodeValue = value;
                    else
                        parent.innerHTML = value;

                    break;
                }
                case 'Attr':    if (
                    (this.name != 'style')  &&  (this.name in parent)
                ) {
                    parent[ this.name ] = (value instanceof Function)  ?
                        value.bind( context )  :  value;

                } else if (value !== '') {

                    if ( node.ownerElement )
                        node.value = value;
                    else
                        parent.setAttribute(this.name, value);
                }
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
        toString:    function () {

            return  this.value + '';
        }
    });

    return RenderNode;

});
