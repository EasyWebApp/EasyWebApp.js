//
//          >>>  EasyWebUI Component Library  <<<
//
//
//      [Version]     v1.9  (2016-02-02)  Stable
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


/* ---------- CSS 3 补丁 ---------- */
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

    var Need_Fix,
        _addClass_ = $.fn.addClass;

    if (! ($.browser.msie < 10)) {
        $.fn.addClass = function () {
            _addClass_.apply(this, arguments);

            if (Need_Fix  &&  ($.inArray('Flex-Box', arguments[0].split(' ')) > -1))
                return  this.each(FlexFix);

            return this;
        };

        $(DOM).ready(function () {
            if (isNaN(
                parseInt( $('body').css(CSS_Attribute.Prefix + 'flex') )
            ))
                $('.Flex-Box').each(FlexFix);
        });
    }

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



/* ---------- UI 组件 ---------- */
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

    function ShadowCover($_Container, iContent, CSS_Rule) {
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

    ShadowCover.prototype.close = function () {
        this.$_Cover.remove();
        if (this.$_Style)  this.$_Style.remove();

        _Instance_.splice(_Instance_.indexOf(this), 1);
    };

    ShadowCover.clear = function () {
        for (var i = _Instance_.length - 1;  i > -1;  i--)
            _Instance_[i].close();
    };

    $.fn.shadowCover = function () {
        var iArgs = $.makeArray(arguments).reverse();

        var More_Logic = (typeof iArgs[0] == 'function')  &&  iArgs.shift();
        var CSS_Rule = $.isPlainObject(iArgs[0]) && iArgs.shift();
        var iContent = iArgs[0];

        for (var i = 0, iCover;  i < this.length;  i++) {
            iCover = new ShadowCover($(this[i]), iContent, CSS_Rule);

            if (More_Logic)  More_Logic.call(this[i], iCover);
        }
        return this;
    };

    $.shadowCover = ShadowCover;


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
            locked:      ($.type(iContent) == 'Window')
        });

        var _This_ = this;

        $('body').shadowCover(this.locked ? null : iContent,  iStyle,  function () {
            _This_.__ShadowCover__ = arguments[0];

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

        this.__ShadowCover__.close();
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
            var $_Head_Height =
                    Number( $_Head.css('height').slice(0, -2) )
                    + Number( $_Head.css('margin-top').slice(0, -2) )
                    + Number( $_Head.css('margin-bottom').slice(0, -2) )
                    + Number( $_Panel.css('padding-top').slice(0, -2) ) * 2;

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

            var $_Tab_Box = $(this),  $_Tab_Head,
                iName = $.uuid('iTab'),  iType;

            for (var i = 0;  i < Tab_Type.length;  i++)
                if ($_Tab_Box.hasClass( Tab_Type[i] )) {
                    iType = Tab_Type[i];
                    $_Tab_Box.attr('data-tab-type', iType);
                }
        /* ----- 成员实例化核心 ----- */

            var Label_At = (this.children[0].tagName.toLowerCase() == 'label'),
                iSelector = ['input[type="radio"]',  'div, section, .Body'];
            iSelector[Label_At ? 'unshift' : 'push']('label');

            $.ListView(this,  iSelector,  function ($_Tab_Item) {
                var _UUID_ = $.uuid();

                var $_Label = $_Tab_Item.filter('label').attr('for', _UUID_),
                    $_Radio = $([
                        '<input type="radio" name=',  iName,  ' id=',  _UUID_,  ' />'
                    ].join('"'));
                var $_Tab_Body = $_Tab_Item.not($_Label).before($_Radio);

                $_Tab_Head = $($.map(
                    this.$_View.children('input[type="radio"]'),
                    function () {
                        return  $('label[for="' + arguments[0].id + '"]')[0];
                    }
                ))[Label_At ? 'prependTo' : 'appendTo']( this.$_View );

                if (! $.browser.modern)
                    $_Radio.change(function () {
                        if (this.checked)
                            this.setAttribute('checked', true);
                        else
                            this.removeAttribute('checked');
                    });
            }).on('remove',  function () {

                var $_Label = arguments[0].filter('label');

                $('*[id="' + $_Label.attr('for') + '"]').remove();

                Tab_Active.call(this.$_View, $_Label);

            }).on('afterRender',  function () {

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
                Array( $.ListView.getInstance(this).length )
            );
        }).swipe(function (iEvent) {
            if (
                (typeof iEvent.pageX != 'number')  ||
                (Math.abs(iEvent.pageY)  >  Math.abs(iEvent.pageX))
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
                        (iEvent.pageX < 0)  ?  1  :  -1
                    )
                ) % $_Tab_Body.length
            );

            $('label[for="' + $_Target[0].previousElementSibling.id + '"]')[0]
                .click();
        });
    };

/* ---------- 元素禁止选中  v0.1 ---------- */

    $.fn.noSelect = function () {
        return  this.attr('unSelectable', 'on').css({
               '-moz-user-select':      '-moz-none',
             '-khtml-user-select':           'none',
            '-webkit-user-select':           'none',
                 '-o-user-select':           'none',
                '-ms-user-select':           'none',
                    'user-select':           'none',
            '-webkit-touch-callout':         'none'
        }).bind('selectStart', false).bind('contextmenu', false)
            .css('cursor', 'default');
    };

})(self,  self.document,  self.jQuery || self.Zepto);



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
            text:     iEvent.data,
            style:    'color: white'
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

        $.ListView.findView(
            $(DOM.body).addClass('Loaded'),  true
        ).each(function () {
            var iView = $.ListView.getInstance(this);

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