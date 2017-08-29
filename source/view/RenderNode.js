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

    RenderNode.reference = /(this|vm)\.(\w+)/g;


    function Eval(vm) {  'use strict';
        try {
            var iValue = eval( arguments[1] );

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
                                (scope === 'vm')  ?  4  :  1
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
        eval:        function (iContext, iScope) {
            var iRefer;

            var iText = this.raw.replace(RenderNode.expression,  function () {

                    iRefer = Eval.call(iContext, iScope, arguments[1]);

                    return  (arguments[0] == arguments[3])  ?
                        arguments[3]  :  iRefer;
                });

            return  (this.raw == iText)  ?  iRefer  :  iText;
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