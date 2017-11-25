define([
    'jquery', './View', './DOMkit', './RenderNode'
],  function ($, View, DOMkit, RenderNode) {

    /**
     * 普通视图类（对应 JSON 对象）
     *
     * @author  TechQuery
     *
     * @class   HTMLView
     * @extends View
     *
     * @param   {jQueryAcceptable} $_View  - Container DOM of HTMLView
     * @param   {object}           [scope] - Data object as a scope
     * @param   {(string|URL)}     [base]
     *
     * @returns {HTMLView}             Return the last one if a HTMLView instance
     *                                 has been created on this element
     */

    function HTMLView($_View, scope, base) {

        var _This_ = View.call(this, $_View, scope, base);
        /**
         * 本视图的插卡元素
         *
         * @name $_Slot
         * @type {jQuery}
         *
         * @memberof HTMLView
         * @instance
         *
         * @readonly
         */
        this.$_Slot = $();

        return  (_This_ !== this)  ?
            _This_ :
            this.setPrivate( {length: 0,  map: { }} );
    }

    View.extend(HTMLView, {
        is:             function () {

            return  (! $.expr[':'].list( arguments[0] ));
        },
        rawSelector:    $.makeSet('code', 'xmp', 'template'),
        getValue:       function (field) {

            if (field.type !== 'checkbox')
                return  $( field )[('value' in field) ? 'val' : 'html']();

            field = field.form.elements[ field.name ];

            return  $.likeArray( field )  ?
                $.map(field,  function (_This_) {

                    return  _This_.checked ? _This_.value : null;
                })  :  (
                    field.checked ? field.value : ''
                );
        }
    }, {
        indexOf:       Array.prototype.indexOf,
        signIn:        function (iNode) {

            for (var i = 0;  this[i];  i++)  if (this[i] == iNode)  return;

            this[this.length++] = iNode;

            var iName = (iNode instanceof RenderNode)  ?
                    iNode  :  [iNode.__name__];

            for (var j = 0;  iName[j];  j++)
                this.watch( iName[j] ).__map__[iName[j]] =
                    (this.__map__[iName[j]] || 0)  +  Math.pow(2, i);
        },
        parsePlain:    function (node) {

            if (! (node.nodeValue || node.value))  return;

            var render = new RenderNode( node );

            if (! render.type)  return;

            this.signIn( render );

            if (node.nodeType === 8) {

                render.ownerNode = node =
                    document.createTextNode( node.nodeValue );

                render.name = node.nodeName;
            }

            return node;
        },
        parseNode:     function (type, node) {

            if ((node instanceof View)  &&  (this.indexOf( node )  <  0))
                return  this.signIn( node );

            switch ($.Type( node )) {
                case 'Text':           ;
                case 'Comment':
                    return  this.parsePlain( node );
                case 'HTMLElement':
                    if (type in HTMLView.rawSelector)
                        return null;
                    else
                        Array.from(
                            $.makeArray( node.attributes ),
                            this.parsePlain,
                            this
                        );
            }
        },
        fixElement:    function (type, node, last_slot) {

            var $_View = this.$_View, base = this.__base__, $_Slot;

            switch ( type ) {
                case 'style':       return  DOMkit.fixStyle($_View, node);
                case 'link':        {

                    DOMkit.fixURL(type, node, base).onload = function () {

                        $( this ).replaceWith(
                            DOMkit.fixStyle($_View, this)
                        );
                    };
                    return true;
                }
                case 'script':
                    return  DOMkit.fixURL(type, DOMkit.fixScript( node ), base);
                case 'slot':        {
                    $_Slot = this.$_Slot.filter(
                        ($_Slot = node.getAttribute('name'))  ?
                            ('[slot="' + $_Slot + '"]')  :
                            function () {
                                return  this.getAttribute &&
                                    (! this.getAttribute('slot'));
                            }
                    );

                    if ( $_Slot[0] )
                        return $.merge(
                            [ document.createTextNode('') ],  $_Slot
                        );
                }
                case 'template':
                    return  $( node ).contents();
                default:
                    if (
                        (! last_slot)  ||
                        this.$_Slot.has( last_slot )[0]  ||
                        (! $.contains(last_slot, node))
                    )
                        DOMkit.fixURL(type, node, base);
            }
        },
        /**
         * HTML 模板解析
         *
         * @author   TechQuery
         *
         * @memberof HTMLView.prototype
         *
         * @param    {string}   [template] - A HTML String of the Component's template
         *                                   with HTMLSlotElement
         * @returns  {HTMLView} Current HTMLView
         */
        parse:         function (template) {

            if (this.__parse__)  return this;

            if (template = (template || '').trim()) {

                this.$_Slot = this.$_View.contents().remove().attr(
                    'slot',  function () {

                        return  arguments[1] || '';
                    }
                );

                this.$_View[0].innerHTML = template;
            }

            var last_slot;

            this.scan(function (node, last_view) {

                var type = (node.nodeName || '').toLowerCase(), newDOM;

                last_slot = (last_slot  &&  $.contains(last_slot, node))  ?
                    last_slot : null;

                if ((node.nodeType === 1)  &&  (node !== this.$_View[0])) {

                    if ( node.hasAttribute('slot') )  last_slot = node;

                    newDOM = this.fixElement(type, node, last_slot);

                    if ((newDOM === true)  ||  last_view)  return;

                    if ( newDOM )  return newDOM;
                }

                return  this.parseNode(type, node);
            });

            this.$_Slot = this.$_Slot.filter( this.$_View.find('[slot]') );

            return this;
        },
        nodeOf:        function (data, exclude, forEach) {

            forEach = (forEach instanceof Function)  &&  forEach;

            var iMask = '0',  _This_ = this;

            for (var iName in data)
                if (this.__map__.hasOwnProperty( iName ))
                    iMask = $.bitOperate('|',  iMask,  this.__map__[ iName ]);

            return $.map(
                iMask.padStart(this.length, 0).split('').reverse(),
                function (bit, node) {

                    node = _This_[ node ];

                    if ((
                        (bit > 0)  ||  ((node || '').type > 1)
                    ) && (
                        !(node instanceof RenderNode)  ||
                        (node.name !== 'value')  ||
                        (node.ownerElement !== exclude)
                    )) {
                        forEach  &&  forEach.call(_This_, node);

                        return node;
                    }
                }
            );
        },
        /**
         * 渲染视图
         *
         * @author   TechQuery
         *
         * @memberof HTMLView.prototype
         *
         * @param    {string|object} data    - Property Key or Data Object
         * @param    {*}             [value] - Property Value
         *
         * @returns  {HTMLView}      Current HTMLView
         */
        render:        function (data, value) {

            var _Data_ = { },  exclude;

            if (data instanceof Element) {

                exclude = data;

                data = exclude.getAttribute('name');

                value = HTMLView.getValue( exclude );
            }

            if (typeof data.valueOf() === 'string') {

                _Data_[data] = value;    data = _Data_;
            }

            _Data_ = this.__data__;

            this.nodeOf(_Data_.commit( data ),  exclude,  function (node) {

                if (node instanceof RenderNode)
                    node.render(this, _Data_);
                else if (node instanceof View) {

                    node.render(_Data_[node.__name__]);

                    _Data_[node.__name__] = node.__data__;
                }
            });

            return this;
        }
    }).registerEvent('template');

//  Render data from user input

    function reRender() {

        var iView = HTMLView.instanceOf( this );

        if (iView  &&  $( this ).validate())  iView.render( this );
    }

    $('html').on('change', ':field', reRender).on(
        'input',  ':field',  $.throttle( reRender )
    ).on('reset',  'form',  function () {

        var data = $.paramJSON('?'  +  $( this ).serialize());

        for (var key in data)  data[ key ] = '';

        HTMLView.instanceOf( this ).render( data );
    });

    return HTMLView;

});
