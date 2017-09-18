define(['jquery'],  function ($) {

    function RenderNode(iNode) {

        $.extend(this, {
            ownerNode:       iNode,
            name:            iNode.nodeName,
            raw:             iNode.nodeValue,
            ownerElement:    iNode.parentNode || iNode.ownerElement,
            type:            0,
            value:           null
        }).scan();
    }

    RenderNode.expression = /\$\{([\s\S]+?)\}/g;

    RenderNode.reference = /(view|scope)\.(\w+)/g;


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

            var _This_ = this;

            this.splice(0, Infinity);    this.type = 0;

            this.ownerNode.nodeValue = this.raw.replace(
                RenderNode.expression,  function (_, expression) {

                    if (/\w+\s*\([\s\S]*?\)/.test( expression ))
                        _This_.type = _This_.type | 2;

                    expression.replace(
                        RenderNode.reference,  function (_, scope, key) {

                            _This_.type = _This_.type | (
                                (scope === 'view')  ?  1  :  4
                            );

                            if (_This_.indexOf( key )  <  0)
                                _This_.push( key );
                        }
                    );

                    return '';
                }
            );

            return this;
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
        render:      function (iContext, iScope) {

            var iValue = this.eval(iContext, iScope),
                iNode = this.ownerNode,
                iParent = this.ownerElement;

            if (iValue === this.value)  return;

            this.value = iValue;

            switch ( iNode.nodeType ) {
                case 3:    {
                    if (! (iNode.previousSibling || iNode.nextSibling))
                        return  iParent.innerHTML = iValue;

                    break;
                }
                case 2:    if (
                    (this.name != 'style')  &&  (this.name in iParent)
                ) {
                    iParent[ this.name ] = (iValue instanceof Function)  ?
                        iValue.bind( iContext )  :  iValue;

                    return;

                } else if (! iNode.ownerElement) {
                    if ( iValue )
                        iParent.setAttribute(this.name, iValue);

                    return;
                }
            }

            iNode.nodeValue = iValue;
        },
        toString:    function () {

            return  this.value + '';
        }
    });

    return RenderNode;

});