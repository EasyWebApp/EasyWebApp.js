(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('EasyWebUI', ['iQuery+'], arguments[0]);

})(function () {


(function (BOM, DOM, $) {

/* ---------- Flex Box 补丁  v0.2 ---------- */

    var CSS_Attribute = {
            Float:        {
                absolute:    true,
                fixed:       true
            },
            Display:      {
                block:    true,
                table:    true
            },
            Prefix:       (function (iUA) {
                try {
                    return ({
                        webkit:     '-webkit-',
                        gecko:      '-moz-',
                        trident:    '-ms-'
                    })[
                        iUA.match(/Gecko|WebKit|Trident/i)[0].toLowerCase()
                    ];
                } catch (iError) {
                    return '';
                }
            })(navigator.userAgent),
            Flex_Size:    {
                horizontal:    {
                    length:    'width',
                    margin:    ['left', 'right']
                },
                vertical:      {
                    length:    'height',
                    margin:    ['top', 'bottom']
                }
            }
        };
    function FlexFix() {
        var $_Box = $(this);

        var Size_Name = CSS_Attribute.Flex_Size[
                $_Box.css(CSS_Attribute.Prefix + 'box-orient')
            ];

        var Flex_Child = $.extend([ ], {
                sum:       0,
                sum_PX:    (
                    $_Box[Size_Name.length]() -
                    parseFloat( $_Box.css('padding-' + Size_Name.margin[0]) ) -
                    parseFloat( $_Box.css('padding-' + Size_Name.margin[1]) )
                )
            });
        $_Box.children().each(function () {
            var $_This = $(this);
            if (
                ($_This.css('position') in CSS_Attribute.Float) ||
                ($_This.css('display') == 'none')
            )
                return;

            var iDisplay = $_This.css('display').match(
                    RegExp(['(', CSS_Attribute.Prefix, ')?', '(inline)?-?(.+)?$'].join(''),  'i')
                );
            if ( iDisplay[2] )
                $_This.css({
                    display:    iDisplay[3] ?
                        (
                            ((iDisplay[3] in CSS_Attribute.Display) ? '' : CSS_Attribute.Prefix) +
                            iDisplay[3]
                        ) :
                        'block'
                });

            var _Index_ = Flex_Child.push({$_DOM:  $_This}) - 1,
                _Length_ = $_This[Size_Name.length]();

            if (! _Length_) {
                Flex_Child.pop();
                return;
            }

            Flex_Child[_Index_].scale = parseInt(
                $_This.css(CSS_Attribute.Prefix + 'box-flex')
            );

            Flex_Child.sum += Flex_Child[_Index_].scale;
            Flex_Child.sum_PX -= (
                _Length_ +
                parseFloat(
                    $_This.css('margin-' + Size_Name.margin[0])
                ) +
                parseFloat(
                    $_This.css('margin-' + Size_Name.margin[1])
                )
            );
        });
        if (Flex_Child.sum_PX < 0)  Flex_Child.sum_PX = 0;

        var iUnit = Flex_Child.sum_PX / Flex_Child.sum;
        for (var i = 0; i < Flex_Child.length; i++)
            Flex_Child[i].$_DOM[Size_Name.length](
                Flex_Child[i].$_DOM[Size_Name.length]() + (Flex_Child[i].scale * iUnit)
            );
    }

    var _addClass_ = $.fn.addClass;

    if ('flex' in DOM.documentElement.style)  return;

    $.fn.addClass = function () {
        _addClass_.apply(this, arguments);

        if ($.inArray('Flex-Box', arguments[0].split(/\s+/))  >  -1)
            return this.each(FlexFix);

        return this;
    };

    $(DOM).ready(function () {
        $('.Flex-Box').each(FlexFix);
    });

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- Input Range 补丁  v0.1 ---------- */

    function Pseudo_Bind() {
        var iRule = BOM.getMatchedCSSRules(arguments[0], ':before');

        $(this).change(function () {
            var iPercent = ((this.value / this.max) * 100) + '%';

            for (var i = 0;  i < iRule.length;  i++)
                iRule[i].style.setProperty('width', iPercent, 'important');
        });
    }

    Pseudo_Bind.No_Bug = (Math.floor($.browser.webkit) > 533);

    $.fn.Range = function () {
        return  this.each(function () {
            var $_This = $(this);

            //  Fill-Lower for WebKit
            if (Pseudo_Bind.No_Bug && (! $_This.hasClass('Detail')))
                $_This.cssRule({
                    ':before': {
                        width:    (($_This[0].value / $_This[0].max) * 100) + '%  !important'
                    }
                }, Pseudo_Bind);

            //  Data-List for All Cores
            var $_List = $('<datalist />', {
                    id:    $.uuid('Range')
                });

            $_This.attr('list', $_List[0].id);

            if (this.min) {
                var iSum = (this.max - this.min) / this.step;

                for (var i = 0;  i < iSum;  i++)
                    $_List.append('<option />', {
                        value:    Number(this.min + (this.step * i))/*,
                        text:     */
                    });
            }

            $_This.before($_List);
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- Input Data-List 补丁  v0.3 ---------- */

    var List_Type = 'input[type="' + [
            'text', 'tel', 'email', 'url', 'search'
        ].join(
            '"][list], input[type="'
        ) + '"]';

    function Tips_Show($_List) {
        if (! this.value)  $_List.append( $_List.$_Option );

        if (! $_List.height())  $_List.slideDown(100);

        return this.value;
    }

    function Tips_Hide() {
        if ( this.height() )  this.slideUp(100);

        return this;
    }

    function Tips_Match($_List) {
        $_List.$_Option = $.unique($.merge(
            $_List.$_Option,  $_List.children()
        ));

        var iValue = Tips_Show.call(this, $_List);

        if (! iValue)  return;

        $.each($_List.$_Option,  function () {
            for (var i = 0, _Index_;  i < iValue.length;  i++) {
                if (iValue[i + 1]  ===  undefined)  break;

                _Index_ = this.value.indexOf( iValue[i] );

                if (
                    (_Index_ < 0)  ||
                    (_Index_  >=  this.value.indexOf( iValue[i + 1] ))
                ) {
                    if (this.parentElement)  $(this).detach();
                    return;
                }
            }
            if (! this.parentElement)  $_List[0].appendChild( this );
        });
    }

    function DL_Change(iCallback) {
        return  this.change(function () {
            var iOption = this.list.options;

            for (var i = 0;  i < iOption.length;  i++)
                if (this.value == iOption[i].value)
                    return  iCallback.call(this, arguments[0], iOption[i]);
        });
    }

    $.fn.smartInput = function (onChange) {
        return  this.filter(List_Type).each(function () {

            var $_Input = $(this),  iPosition = this.parentNode.style.position;

            if ( BOM.HTMLDataListElement )
                return  DL_Change.call($_Input, onChange);

        //  DOM Property Patch
            $_Input[0].list = $('#' + this.getAttribute('list'))[0];

            var $_List = $( $_Input[0].list.children.item(0) );

            $_List[0].multiple = $_List[0].multiple || true;

            $_Input[0].list.options = $_List[0].children;

            if ($_Input.attr('autocomplete') == 'off')  return;

        //  Get Position
            if ((! iPosition)  ||  (iPosition == 'static'))
                $(this.parentNode).css({
                    position:    'relative',
                    zoom:        1
                });
            iPosition = $_Input.attr('autocomplete', 'off').position();
            iPosition.top += $_Input.height();

        //  DropDown List
            $_List.css($.extend(iPosition, {
                position:     'absolute',
                'z-index':    10000,
                height:       0,
                width:        $_Input.width(),
                padding:      0,
                border:       0,
                overflow:     'hidden',
                opacity:      0
            })).change(function () {
                $_Input[0].value = Tips_Hide.call($_List)[0].value;

                return onChange.call(
                    $_Input[0],
                    arguments[0],
                    this.children[this.selectIndex]
                );
            });
            $_List.$_Option = [ ];

            var iFilter = $.proxy(Tips_Match, null, $_List);

            $_Input.after($_List)
                .dblclick($.proxy(Tips_Show, null, $_List))
                .blur($.proxy(Tips_Hide, $_List))
                .keyup(iFilter)
                .on('paste', iFilter)
                .on('cut', iFilter);
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 密码确认插件  v0.3 ---------- */

    //  By 魏如松

    var $_Hint = $('<div class="Hint" />').css({
            position:         'absolute',
            width:            '0.625em',
            'font-weight':    'bold'
        });

    function showHint() {
        var iPosition = this.position();

        $_Hint.clone().text( arguments[0] ).css({
            color:    arguments[1],
            left:     (iPosition.left + this.width() - $_Hint.width()) + 'px',
            top:      (iPosition.top + this.height() * 0.2) + 'px'
        }).appendTo(
            this.parent()
        );
    }

    $.fn.pwConfirm = function () {
        var pwGroup = { },
            $_passwordAll = this.find('input[type="password"][name]');

        //  密码明文查看
        var $_visible = $('<div class="visible" />').css({
                position:       'absolute',
                right:          '5%',
                top:            '8%',
                'z-index':      1000000,
                'font-size':    '26px',
                cursor:         'pointer'
            });
        $_passwordAll.parent().css('position', 'relative').append( $_visible.clone() )
            .find('.visible').html('&#10002;').click(function(){
                var $_this = $(this);

                if($_this.text() == '✒')
                    $_this.html('&#10001;').siblings('input').attr('type', 'text');
                else
                    $_this.html('&#10002;').siblings('input').attr('type', 'password');
            });

        //  密码输入验证
        $_passwordAll.each(function (){
            if (! pwGroup[this.name])
                pwGroup[this.name] = $_passwordAll.filter('[name="' + this.name + '"]');
            else
                return;

            var $_password = pwGroup[this.name],
                _Complete_ = 0;

            if ($_password.length < 2)  return;

            $_password.blur(function () {
                var $_this = $(this);

                $_this.parent().find('.Hint').remove();

                if (! this.value) return;

                if (! this.checkValidity())
                    showHint.call($_this, '×', 'red');
                else if (++_Complete_ == 2) {
                    var $_other = $_password.not(this);

                    showHint.apply(
                        $_this,
                        (this.value == $_other[0].value)  ?  ['√', 'green']  :  ['×', 'red']
                    );

                    _Complete_ = 0;
                } else
                    showHint.call($_this, '√', 'green');
            });
        });

        return this;
    };

})(self,  self.document,  self.jQuery || self.Zepto);


/* ---------- 数据表 控件  v0.2 ---------- */


(function (BOM, DOM, $) {

    var Sort_Class = {
            '':            'SortDown',
            'SortUp':      'SortDown',
            'SortDown':    'SortUp'
        };

    function Data_Page(iSum, iUnit) {
        if (iSum > -1)
            return  $.map(Array(Math.ceil(iSum / iUnit)),  function () {
                return  {index:  arguments[1] + 1};
            });
    }

    $.fn.iTable = function (DataURL) {
        if (! this[0])  return this;

        var iLV = $.ListView( $('tbody', this[0]) );

        $('th', this[0]).click(function () {
            var $_This = $(this);

            var iClass = ($_This.attr('class') || '').match(
                    /\s?(Sort(Up|Down))\s?/
                );
            iClass = iClass ? iClass[1] : '';

            $_This.removeClass(iClass).addClass( Sort_Class[iClass] );

            var iNO = (Sort_Class[iClass] == 'SortUp')  ?  0.5  :  -0.5,
                Index = $_This.index();

            iLV.sort(function () {
                var A = $( arguments[2.5 - iNO][0].children[Index] ).text(),
                    B = $( arguments[2.5 + iNO][0].children[Index] ).text();

                return  isNaN(parseFloat( A ))  ?
                    A.localeCompare( B )  :  (parseFloat(A) - parseFloat(B));
            });
        });

        if (typeof DataURL != 'string')  return this.eq(0);

        var $_tFoot = $('tfoot', this[0]);
        $_tFoot = $_tFoot[0]  ?  $_tFoot  :  $('<tfoot />').appendTo( this[0] );

        $('<tr><td><ol><li></li></ol></td></tr>').appendTo( $_tFoot )
            .children('td').attr(
                'colspan',  $('tbody > tr', this[0])[0].children.length
            );

        var iPage = $.ListView($('ol', $_tFoot[0])[0],  false,  function () {
                arguments[0].text( ++arguments[2] );
            });

        iPage.$_View.on('click',  'li',  function () {
            var Index = $(this).index() + 1;

            $.getJSON(
                DataURL.replace(/^([^\?]+\??)(.*)/,  function () {
                    return  arguments[1] + 'page=' + Index + (
                        arguments[2]  ?  ('&' + arguments[2])  :  ''
                    );
                }),
                function (iData) {
                    iLV.clear().render(iData.tngou);

                    iPage.clear().render(
                        Data_Page(iData.total, 10)
                    );
                }
            );
        });
        iPage[0].click();

        return this.eq(0);
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 面板控件  v0.1 ---------- */

    $.fn.iPanel = function () {
        var $_This = this.is('.Panel') ? this : this.find('.Panel');

        return  $_This.each(function () {
            var $_Body = $(this).children('.Body');

            if (! ($_Body.length && $_Body.height()))
                $(this).addClass('closed');
        }).children('.Head').dblclick(function () {
            var $_Head = $(this);
            var $_Panel = $_Head.parent();

            var $_Head_Height = parseFloat( $_Head.css('height') )
                    + parseFloat( $_Head.css('margin-top') )
                    + parseFloat( $_Head.css('margin-bottom') )
                    + parseFloat( $_Panel.css('padding-top') ) * 2;

            if (! $_Panel.hasClass('closed')) {
                $_Panel.data('height', $_Panel.height());
                $_Panel.stop().animate({height:  $_Head_Height});
                $_Panel.addClass('closed');
            } else {
                $_Panel.stop().animate({height:  $_Panel.data('height')});
                $_Panel.removeClass('closed');
            }
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 标签页 控件  v0.5 ---------- */

    var Tab_Type = ['Point', 'Button', 'Monitor'];

    function Tab_Active() {
        var $_Label = this.children('label').not(arguments[0]);
        var $_Active = $_Label.filter('.active');

        $_Active = $_Active.length ? $_Active : $_Label;

        if ($_Active.length)  $_Active[0].click();
    }

    $.fn.iTab = function () {
        if (! $.browser.modern)
            this.on('click',  'input[type="radio"]',  function () {
                $(this).attr('checked', true)
                    .siblings('input[type="radio"]').removeAttr('checked');
            });

        return  this.on('click',  'label[for]',  function () {

            var $_This = $(this);

            if (! $_This.hasClass('active'))
                $_This.addClass('active').siblings().removeClass('active');

        }).each(function () {

            var $_Tab_Box = $(this),  iName = $.uuid('iTab'),  iType;

            for (var i = 0;  i < Tab_Type.length;  i++)
                if ($_Tab_Box.hasClass( Tab_Type[i] )) {
                    iType = Tab_Type[i];
                    $_Tab_Box.attr('data-tab-type', iType);
                }
        /* ----- 成员实例化核心 ----- */

            var Label_At = (this.children[0].tagName.toLowerCase() == 'label'),
                iSelector = ['input[type="radio"]',  'div, section, .Body'];
            iSelector[Label_At ? 'unshift' : 'push']('label');

            $.ListView(this, iSelector, false).on('insert',  function ($_Tab_Item) {
                var _UUID_ = $.uuid();

                var $_Label = $_Tab_Item.filter('label').attr('for', _UUID_),
                    $_Radio = $([
                        '<input type="radio" name=',  iName,  ' id=',  _UUID_,  ' />'
                    ].join('"'));

                if (! $.browser.modern)
                    $_Radio.change(function () {
                        if (this.checked)
                            this.setAttribute('checked', true);
                        else
                            this.removeAttribute('checked');
                    });

                return  [$_Label[0], $_Radio[0], $_Tab_Item.not($_Label)[0]];

            }).on('remove',  function () {

                var $_Label = arguments[0].filter('label');

                $('*[id="' + $_Label.attr('for') + '"]').remove();

                Tab_Active.call(this.$_View, $_Label);

            }).on('afterRender',  function () {

                var $_Tab_Head = $($.map(
                        this.$_View.children('input[type="radio"]'),
                        function () {
                            return  $('label[for="' + arguments[0].id + '"]')[0];
                        }
                    ))[Label_At ? 'prependTo' : 'appendTo']( this.$_View );

                Tab_Active.call( this.$_View );

                if (! this.$_View.hasClass('auto'))  return;

        /* ----- 自动切换模式 ----- */

                var Index = 0,  iPause;

                $.every(2,  function () {
                    if (iPause  ||  (! $_Tab_Box.hasClass('auto')))
                        return;

                    Index = (Index < $_Tab_Head.length)  ?  Index  :  0;

                    $_Tab_Head[Index++].click();
                });

                this.$_View.hover(
                    function () { iPause = true; },
                    function () { iPause = false; }
                );
            }).render(
                Array( $.ListView.instanceOf(this, false).length )
            );
        }).on('swipe',  function (iEvent) {
            if (
                (typeof iEvent.deltaX != 'number')  ||
                (Math.abs(iEvent.deltaY)  >  Math.abs(iEvent.deltaX))
            )
                return;

        /* ----- 滑动切换模式 ----- */

            var $_This = $(this),  $_Target = $(iEvent.target);

            var $_Path = $_Target.parentsUntil(this),
                $_Tab_Body = $_This.children().not('label, input');

            $_Target = $_Path.length ? $_Path.slice(-1) : $_Target;

            $_Target = $_Tab_Body.eq(
                (
                    $_Tab_Body.index($_Target) + (
                        (iEvent.deltaX < 0)  ?  1  :  -1
                    )
                ) % $_Tab_Body.length
            );

            $('label[for="' + $_Target[0].previousElementSibling.id + '"]')[0]
                .click();
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 阅读导航栏  v0.3 ---------- */

    function toTreeData() {
        var iTree = [ ],  $_Tree = this;

        var _This_ = iTree,  _Parent_;

        this.each(function (Index) {
            var _Level_ = Index && (
                    this.tagName[1]  -  $_Tree[Index - 1].tagName[1]
                );

            if (_Level_ > 0) {
                _Parent_ = _This_;
                _This_ = _This_.slice(-1)[0].list = [ ];
            } else if (_Level_ < 0)
                _This_ = _Parent_;

            if (! this.id.match(/\w/))  this.id = $.uuid('Header');

            _This_.push({
                id:      this.id,
                text:    this.textContent
            });
        });

        return iTree;
    }

    $.fn.iReadNav = function ($_Context) {
        return  this.each(function () {
            var iMainNav = $.TreeView(
                    $.ListView(this,  false,  function ($_Item, iValue) {

                        $('a', $_Item[0]).text(iValue.text)[0].href =
                            '#' + iValue.id;
                        $_Item.attr('title', iValue.text);
                    }),
                    function () {
                        arguments[0].$_View.attr('class', '');
                    }
                ).on('focus',  function (iEvent) {
                    if (iEvent.target.tagName.toLowerCase() != 'a')  return;

                    var $_Target = $(
                            '*[id="' + iEvent.target.href.split('#')[1] + '"]'
                        );
                    $_Target.scrollParents().eq(0).scrollTo( $_Target );
                }),
                _DOM_ = $_Context[0].ownerDocument;

            $_Context.scroll(function () {
                if (arguments[0].target !== this)  return;

                var iAnchor = $_Context.offset(),
                    iFontSize = $(_DOM_.body).css('font-size') / 2;

                var $_Anchor = $(_DOM_.elementFromPoint(
                        iAnchor.left + $_Context.css('padding-left') + iFontSize,
                        iAnchor.top + $_Context.css('padding-top') + iFontSize
                    )).prevAll('h1, h2, h3');

                if (! $.contains(this, $_Anchor[0]))  return;

                $_Anchor = $(
                    'a[href="#' + $_Anchor[0].id + '"]',  iMainNav.$_View[0]
                );
                $('.ListView_Item.active', iMainNav.$_View[0])
                    .removeClass('active');

                $.ListView.instanceOf( $_Anchor ).focus( $_Anchor[0].parentNode );

            }).on('Refresh',  function () {

                iMainNav.clear().render(
                    toTreeData.call( $('h1, h2, h3', this) )
                );
                return false;

            }).on('Clear',  function () {
                return  (! iMainNav.clear());
            });
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 普通元素内容编辑  v0.1 ---------- */

    function StopBubble() {
        arguments[0].stopPropagation();
    }

    $.fn.contentEdit = function () {
        return  this.one('blur',  function () {

            var $_This = $(this);

            this.removeAttribute('contentEditable');

            $_This.off('click', StopBubble).off(
                'input propertychange paste keyup'
            );
            this.value = $.trim( $_This.text() );

            if (! this.value)
                $_This.text(this.value = this.defaultValue);

        }).input(function () {

            var $_This = $(this);

            return  ($.trim( $_This.text() ).length  <=  $_This.attr('maxlength'));

        }).on('click', StopBubble).prop('defaultValue',  function () {

            return  $.trim( $(this).text() );

        }).prop('contentEditable', true).focus();
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 目录树  v0.2 ---------- */

    function branchDelete() {
        var iList = $.ListView.instanceOf( this );

        iList.remove( this );

        if (! iList.$_View[0].children[0])  iList.$_View.remove();

        return false;
    }

    $.fn.iTree = function (Sub_Key, onInsert) {
        return  this.each(function () {
            var iOrgTree = $.TreeView(
                    $.ListView(this, false, onInsert),
                    Sub_Key,
                    2,
                    function (iFork, iDepth, iData) {
                        iFork.$_View.parent().cssRule({
                            ':before':    {content:  (
                                '"'  +  (iData ? '-' : '+')  +  '"  !important'
                            )}
                        });
                    }
                ).on('focus',  function (iEvent) {
                    var _This_ = iEvent.currentTarget;

                    $(':input', _This_).focus();

                    var iRule = Array.prototype.slice.call(
                            BOM.getMatchedCSSRules(_This_, ':before'),  -1
                        )[0];

                    if (! (
                        iEvent.isPseudo() &&
                        $(iRule.parentStyleSheet.ownerNode)
                            .hasClass('iQuery_CSS-Rule')
                    ))
                        return;

                    iRule.style.setProperty('content', (
                        (iRule.style.content[1] == '-')  ?  '"+"'  :  '"-"'
                    ), 'important');
                });

            iOrgTree.$_View.on('Insert',  '.ListView_Item',  function () {

                var iSub = $.ListView.instanceOf(
                        $(this).children('.TreeNode'), false
                    );

                if ( iSub )
                    iSub.insert( arguments[1] );
                else
                    iOrgTree.branch(this, arguments[1]);

                return false;

            }).on('Edit',  '.ListView_Item',  function () {

                return  (! $(arguments[0].target).contentEdit());

            }).on('Delete',  '.ListView_Item', branchDelete);
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 滚动悬停  v0.1 ---------- */

    var $_DOM = $(DOM),  Fixed_List = [ ];

    $_DOM.scroll(function () {
        var iOffset = $_DOM.scrollTop();

        for (var i = 0, $_Fixed, $_Shim;  Fixed_List[i];  i++) {
            $_Fixed = $( Fixed_List[i].element );

            if (iOffset < Fixed_List[i].offset.top) {

                if ($_Fixed.css('position') == 'static')  continue;

                $_Fixed.css('position', 'static');

                Fixed_List[i].callback.call($_Fixed[0], 'static', iOffset);

                $_Shim = $( $_Fixed[0].nextElementSibling );

                if (
                    $_Shim.removeAttr('style')[0].outerHTML ==
                    $_Fixed.clone(true).removeAttr('style')[0].outerHTML
                )
                    $_Shim.remove();

            } else if ($_Fixed.css('position') != 'fixed') {
                $_Fixed.after( $_Fixed[0].outerHTML ).css({
                    position:     'fixed',
                    top:          0,
                    'z-index':    100
                });

                Fixed_List[i].callback.call($_Fixed[0], 'fixed', iOffset);
            }
        }
    });

    $.fn.scrollFixed = function (iCallback) {

        $.merge(Fixed_List,  $.map(this,  function (iDOM) {
            return {
                element:     iDOM,
                offset:      $(iDOM).offset(),
                callback:    iCallback
            };
        }));

        return this;
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- DOM 遮罩层  v0.2 ---------- */

    var $_DOM = $(DOM).ready(function () {
            $.cssRule({
                '.ShadowCover': {
                    position:      'absolute',
                    top:           0,
                    left:          0,
                    width:         '100%',
                    height:        '100%',
                    background:    'rgba(0, 0, 0, 0.7)',
                    display:       'table'
                },
                '.ShadowCover > *': {
                    display:             'table-cell',
                    'vertical-align':    'middle',
                    'text-align':        'center'
                }
            });
        }),
        _Instance_ = [ ];

    function Shade($_Container, iContent, CSS_Rule) {
        var _This_ = this;

        this.$_Cover = $('<div class="ShadowCover"><div /></div>');

        if (iContent)  $(this.$_Cover[0].firstChild).append(iContent);

        this.$_Cover.appendTo($_Container).zIndex('+');

        if ( $.isPlainObject(CSS_Rule) )
            this.$_Cover.cssRule(CSS_Rule,  function () {
                _This_.$_Style = $(arguments[0].ownerNode);
            });
        _Instance_.push(this);
    }

    Shade.prototype.close = function () {
        this.$_Cover.remove();
        if (this.$_Style)  this.$_Style.remove();

        _Instance_.splice(_Instance_.indexOf(this), 1);
    };

    Shade.clear = function () {
        for (var i = _Instance_.length - 1;  i > -1;  i--)
            _Instance_[i].close();
    };

    $.fn.shade = function () {
        var iArgs = $.makeArray(arguments).reverse();

        var More_Logic = (typeof iArgs[0] == 'function')  &&  iArgs.shift();
        var CSS_Rule = $.isPlainObject(iArgs[0]) && iArgs.shift();
        var iContent = iArgs[0];

        for (var i = 0, iCover;  i < this.length;  i++) {
            iCover = new Shade($(this[i]), iContent, CSS_Rule);

            if (More_Logic)  More_Logic.call(this[i], iCover);
        }
        return this;
    };

    $.shade = Shade;


/* ---------- DOM/BOM 模态框  v0.4 ---------- */

    var $_BOM = $(BOM);

    BOM.ModalWindow = function (iContent, iStyle, closeCB) {
        arguments.callee.lastInstance = $.extend(this, {
            opener:      BOM,
            self:        this,
            closed:      false,
            onunload:    closeCB,
            frames:      [ ],
            document:    { },
            locked:      ($.Type(iContent) == 'Window')
        });

        var _This_ = this;

        $('body').shade(this.locked ? null : iContent,  iStyle,  function () {
            _This_.__Shade__ = arguments[0];

            _This_.document.body = arguments[0].$_Cover.click(function () {
                if (! _This_.locked) {
                    if (arguments[0].target.parentNode === this)
                        _This_.close();
                } else
                    _This_.frames[0].focus();
            }).height( $_BOM.height() )[0];
        });
        if (! this.locked)  return;

        //  模态框 (BOM)
        this.frames[0] = iContent;

        $.every(0.2,  function () {
            if (iContent.closed) {
                _This_.close();
                return false;
            }
        });
        $_BOM.bind('unload',  function () {
            iContent.close();
        });
    };

    BOM.ModalWindow.prototype.close = function () {
        if (this.closed)  return;

        this.__Shade__.close();
        this.closed = true;

        if (typeof this.onunload == 'function')
            this.onunload.call(this.document.body);

        this.constructor.lastInstance = null;
    };

    $_DOM.keydown(function () {
        var _Instance_ = BOM.ModalWindow.lastInstance;
        if (! _Instance_)  return;

        if (! _Instance_.locked) {
            if (arguments[0].which == 27)
                _Instance_.close();
        } else
            _Instance_.frames[0].focus();
    });

    /* ----- 通用新窗口 ----- */

    function iOpen(iURL, Scale, iCallback) {
        Scale = (Scale > 0)  ?  Scale  :  3;
        var Size = {
            height:    BOM.screen.height / Scale,
            width:     BOM.screen.width / Scale
        };
        var Top = (BOM.screen.height - Size.height) / 2,
            Left = (BOM.screen.width - Size.width) / 2;

        BOM.alert("请留意本网页浏览器的“弹出窗口拦截”提示，当被禁止时请点选【允许】，然后可能需要重做之前的操作。");
        var new_Window = BOM.open(iURL, '_blank', [
                'top=' + Top,               'left=' + Left,
                'height=' + Size.height,    'width=' + Size.width,
                [
                    'resizable',  'scrollbars',
                    'menubar',    'toolbar',     'location',  'status'
                ].join('=no,').slice(0, -1)
            ].join(','));

        BOM.new_Window_Fix.call(new_Window, function () {
            $('link[rel~="shortcut"], link[rel~="icon"], link[rel~="bookmark"]')
                .add('<base target="_self" />')
                .appendTo(this.document.head);

            $(this.document).keydown(function (iEvent) {
                var iKeyCode = iEvent.which;

                if (
                    (iKeyCode == 122) ||                       //  F11
                    (iKeyCode == 116) ||                       //  (Ctrl + )F5
                    (iEvent.ctrlKey && (iKeyCode == 82)) ||    //  Ctrl + R
                    (iEvent.ctrlKey && (iKeyCode == 78)) ||    //  Ctrl + N
                    (iEvent.shiftKey && (iKeyCode == 121))     //  Shift + F10
                )
                    return false;
            }).mousedown(function () {
                if (arguments[0].which == 3)
                    return false;
            }).bind('contextmenu', false);
        });

        if (iCallback)
            $.every(0.2, function () {
                if (new_Window.closed) {
                    iCallback.call(BOM, new_Window);
                    return false;
                }
            });
        return new_Window;
    }

    /* ----- showModalDialog 扩展 ----- */

    var old_MD = BOM.showModalDialog;

    BOM.showModalDialog = function () {
        if (! arguments.length)
            throw 'A URL Argument is needed unless...';
        else if (BOM.ModalWindow.lastInstance)
            throw 'A ModalWindow Instance is running... (Please close it first.)';

        var iArgs = $.makeArray(arguments);

        var iContent = iArgs.shift();
        var iScale = (typeof iArgs[0] == 'number') && iArgs.shift();
        var iStyle = $.isPlainObject(iArgs[0]) && iArgs.shift();
        var CloseBack = (typeof iArgs[0] == 'function') && iArgs.shift();

        if (typeof iArgs[0] == 'string')
            return  (old_MD || BOM.open).apply(BOM, arguments);

        if (typeof iContent == 'string') {
            if (! iContent.match(/^(\w+:)?\/\/[\w\d\.:@]+/)) {
                var iTitle = iContent;
                iContent = 'about:blank';
            }
            iContent = new ModalWindow(
                iOpen(iContent, iScale, CloseBack)
            );
            BOM.new_Window_Fix.call(iContent.frames[0], function () {
                this.iTime = {
                    _Root_:    this,
                    now:       $.now,
                    every:     $.every,
                    wait:      $.wait
                };

                this.iTime.every(0.2, function () {
                    if (! this.opener) {
                        this.close();
                        return false;
                    }
                });
                if (iTitle)
                    $('<title />', {text:  iTitle}).appendTo(this.document.head);
            });
        } else
            iContent = new ModalWindow(iContent, iStyle, CloseBack);

        return iContent;
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 元素禁止选中  v0.1 ---------- */

    $.fn.noSelect = function () {
        return  this.attr('unSelectable', 'on').addClass('No_Select')
                .bind('selectStart', false).bind('contextmenu', false);
    };

})(self,  self.document,  self.jQuery || self.Zepto);


//
//          >>>  EasyWebUI Component Library  <<<
//
//
//      [Version]     v3.1  (2016-08-29)  Stable
//
//      [Based on]    iQuery v1  or  jQuery (with jQuery+),
//
//                    iQuery+
//
//      [Usage]       A jQuery Plugin Library which almost
//                    isn't dependent on EasyWebUI.css
//
//
//            (C)2014-2016    shiy2008@gmail.com
//

/* ---------- 首屏渲染 自动启用组件集 ---------- */


(function (BOM, DOM, $) {

    var $_DOM = $(DOM),  $_Load_Tips,  Load_Cover;

    $_DOM.on('loading',  function (iEvent) {

        //  $.Event 实例对象 detail 属性 Bug ——
        //      https://www.zhihu.com/question/20174130/answer/80990463

        iEvent = iEvent.originalEvent;

        if ($(iEvent.target).parents().length > 1)  return;

        if ($_Load_Tips  &&  (iEvent.detail < 1))
            return  $_Load_Tips.text( iEvent.data );
        else if (iEvent.detail >= 1) {
            if (Load_Cover instanceof BOM.ModalWindow)  Load_Cover.close();
            return  $_Load_Tips = Load_Cover = null;
        }

        $_Load_Tips = $('<h1 />', {
            text:    iEvent.data,
            css:     {color:  'white'}
        });

        try {
            Load_Cover = BOM.showModalDialog($_Load_Tips, {
                ' ':    {background:  'darkgray'}
            });
        } catch (iError) { }

    }).ready(function () {

        $('form').pwConfirm();

        $('form input[type="range"]').Range();

        $('.Panel').iPanel();

        $('.Tab').iTab();

        $('*:button,  a.Button,  .No_Select,  .Panel > .Head,  .Tab > label')
            .noSelect();

        $.ListView.findView(this.body, true).each(function () {
            var iView = $.ListView.instanceOf(this);

            if ( $(this).children('.ListView_Item').length )  return;

            iView.$_View.click(function (iEvent) {
                if (iEvent.target.parentNode === this)
                    iView.focus( iEvent.target );
            });
        });
    });

    if ($.browser.msie < 11)  return;

    $_DOM.on(
        [
            'mousedown', 'mousemove', 'mouseup',
            'click', 'dblclick', 'mousewheel',
            'touchstart', 'touchmove', 'touchend', 'touchcancel',
            'tap', 'press', 'swipe'
        ].join(' '),
        '.No_Pointer',
        function (iEvent) {
            if (iEvent.target !== this)  return;

            var $_This = $(this).hide(),
                $_Under = $(DOM.elementFromPoint(iEvent.pageX, iEvent.pageY));
            $_This.show();
            $_Under.trigger(iEvent);
        }
    );

})(self,  self.document,  self.jQuery || self.Zepto);


});
