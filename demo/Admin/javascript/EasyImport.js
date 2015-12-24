//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2015-12-24)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//            (C)2015    shiy2008@gmail.com
//


/* ---------- ECMAScript API  Patch & Extension ---------- */
(function (BOM) {

    /* ----- Object Patch ----- */

    if (! Object.getOwnPropertyNames)
        Object.getOwnPropertyNames = function (iObject) {
            var iKey = [ ];

            for (var _Key_ in iObject)
                if ( this.prototype.hasOwnProperty.call(iObject, _Key_) )
                    iKey.push(_Key_);

            return iKey;
        };

    /* ----- String Extension ----- */

    if (! ''.trim)
        var Blank_Char = /(^\s*)|(\s*$)/g;
    else
        var _Trim_ = ''.trim;

    String.prototype.trim = function (iChar) {
        if (! iChar)
            return  Blank_Char ? this.replace(Blank_Char, '') : _Trim_.call(this);
        else {
            for (var i = 0, a = 0, b;  i < iChar.length;  i++) {
                if ((this[0] == iChar[i]) && (! a))
                    a = 1;
                if ((this[this.length - 1] == iChar[i]) && (! b))
                    b = -1;
            }
            return this.slice(a, b);
        }
    };

    if (! ''.repeat)
        String.prototype.repeat = function (Times) {
            return  (new Array(Times + 1)).join(this);
        };

    String.prototype.toCamelCase = function () {
        var iName = this.split(arguments[0] || '-');

        for (var i = 1;  i < iName.length;  i++)
            iName[i] = iName[i][0].toUpperCase() + iName[i].slice(1);

        return iName.join('');
    };

    String.prototype.toHyphenCase = function () {
        return  this.replace(/([a-z0-9])[\s_]?([A-Z])/g,  function () {
            return  arguments[1] + '-' + arguments[2].toLowerCase();
        });
    };

    /* ----- Array Extension ----- */

    if (! [ ].indexOf)
        Array.prototype.indexOf = function () {
            for (var i = 0;  i < this.length;  i++)
                if (arguments[0] === this[i])
                    return i;

            return -1;
        };

    /* ----- Date Extension ----- */

    if (! Date.now)
        Date.now = function () {
            return  (new Date()).getTime();
        };

    /* ----- JSON Extension  v0.4 ----- */

    BOM.JSON.format = function () {
        return  this.stringify(arguments[0], null, 4)
            .replace(/(\s+"[^"]+":) ([^\s]+)/g, '$1    $2');
    };

    BOM.JSON.parseAll = function (iJSON) {
        return  BOM.JSON.parse(iJSON,  function (iKey, iValue) {
            if (iKey && (typeof iValue == 'string'))  try {
                return  BOM.JSON.parse(iValue);
            } catch (iError) { }

            return iValue;
        });
    };

    /* ----- BOM/DOM Fix  v0.4 ----- */

    BOM.new_Window_Fix = function (Fix_More) {
        if (! this)  return false;

        try {
            var _Window_ = this.opener,
                This_DOM = this.document;

            This_DOM.defaultView = this;

            if (_Window_ && (this.location.href == 'about:blank'))
                This_DOM.domain = _Window_.document.domain;

            if (! (_Window_ || this).navigator.userAgent.match(/MSIE 8/i))
                This_DOM.head = This_DOM.documentElement.firstChild;
        } catch (iError) {
            return false;
        }
        if (Fix_More)  Fix_More.call(this);

        return true;
    };

    BOM.new_Window_Fix();


    if (console)  return;

    function _Notice_() {
        var iString = [ ];

        for (var i = 0;  i < arguments.length;  i++)  try {
            iString.push(
                BOM.JSON.stringify( arguments[i].valueOf() )
            );
        } catch (iError) {
            iString.push( arguments[i] );
        }

        BOM.status = iString.join(' ');
    }

    BOM.console = { };

    var Console_Method = ['log', 'info', 'warn', 'error', 'dir'];

    for (var i = 0;  i < Console_Method.length;  i++)
        BOM.console[ Console_Method[i] ] = _Notice_;

})(self);



/* ---------- iQuery Core & API ---------- */
(function (BOM, DOM) {

/* ---------- UA Check ---------- */
    var UA = navigator.userAgent;

    var is_Trident = UA.match(/MSIE (\d+)|Trident[^\)]+rv:(\d+)/i),
        is_Gecko = UA.match(/; rv:(\d+)[^\/]+Gecko\/\d+/),
        is_Webkit = UA.match(/AppleWebkit\/(\d+\.\d+)/i);
    var IE_Ver = is_Trident ? Number(is_Trident[1] || is_Trident[2]) : NaN,
        FF_Ver = is_Gecko ? Number(is_Gecko[1]) : NaN,
        WK_Ver = is_Webkit ? parseFloat(is_Webkit[1]) : NaN;

    var is_Pad = UA.match(/Tablet|Pad|Book|Android 3/i),
        is_Phone = UA.match(/Phone|Touch|Android 2|Symbian/i);
    var is_Mobile = (
            is_Pad || is_Phone || UA.match(/Mobile/i)
        ) && (! UA.match(/ PC /));

    var is_iOS = UA.match(/(iTouch|iPhone|iPad|iWatch);[^\)]+CPU[^\)]+OS (\d+_\d+)/i),
        is_Android = UA.match(/(Android |Silk\/)(\d+\.\d+)/i);

    var _Browser_ = {
            msie:             IE_Ver,
            ff:               FF_Ver,
            webkit:           WK_Ver,
            modern:           !  (IE_Ver < 9),
            mobile:           !! is_Mobile,
            pad:              !! is_Pad,
            phone:            !! is_Phone,
            ios:              is_iOS  ?  parseFloat( is_iOS[2].replace('_', '.') )  :  NaN,
            android:          is_Android ? parseFloat(is_Android[2]) : NaN,
            versionNumber:    IE_Ver || FF_Ver || WK_Ver
        };


/* ---------- Object Base ---------- */
    var _Object_ = {
            isEmptyObject:    function () {
                for (var iKey in arguments[0])
                    return false;
                return true;
            },
            isPlainObject:    function (iValue) {
                return  iValue && (iValue.constructor === Object);
            },
            each:             function (Arr_Obj, iEvery) {
                if (Arr_Obj)
                    if (typeof Arr_Obj.length == 'number')
                        for (var i = 0;  i < Arr_Obj.length;  i++)  try {
                            if (iEvery.call(Arr_Obj[i], i, Arr_Obj[i]) === false)
                                break;
                        } catch (iError) {
                            console.dir( iError.valueOf() );
                        }
                    else
                        for (var iKey in Arr_Obj)  try {
                            if (iEvery.call(Arr_Obj[iKey], iKey, Arr_Obj[iKey]) === false)
                                break;
                        } catch (iError) {
                            console.dir( iError.valueOf() );
                        }
                return Arr_Obj;
            },
            extend:           function () {
                var iDeep = (arguments[0] === true);
                var iTarget,
                    iFirst = iDeep ? 1 : 0;

                if (arguments.length  >  (iFirst + 1)) {
                    iTarget = arguments[iFirst] || (
                        (arguments[iFirst + 1] instanceof Array)  ?  [ ]  :  { }
                    );
                    iFirst++ ;
                } else
                    iTarget = this;

                for (var i = iFirst, iValue;  i < arguments.length;  i++)
                    for (var iKey in arguments[i])
                        if (
                            Object.prototype.hasOwnProperty.call(arguments[i], iKey)  &&
                            (arguments[i][iKey] !== undefined)
                        ) {
                            iTarget[iKey] = iValue = arguments[i][iKey];

                            if (iDeep)  try {
                                if ((iValue instanceof Array)  ||  _Object_.isPlainObject(iValue))
                                    iTarget[iKey] = arguments.callee.call(this, true, undefined, iValue);
                            } catch (iError) { }
                        }
                return iTarget;
            },
            map:              function (iSource, iCallback) {
                var iTarget = { },  iArray;

                if (typeof iSource.length == 'number') {
                    iTarget = [ ];
                    iArray = true;
                }

                if (typeof iCallback == 'function')
                    this.each(iSource,  function (iKey) {
                        if (this === undefined)  return;

                        var _Element_ = iCallback(arguments[1], iKey, iSource);

                        if ((_Element_ !== undefined)  &&  (_Element_ !== null))
                            if (iArray)
                                iTarget = iTarget.concat(_Element_);
                            else
                                iTarget[iKey] = _Element_;
                    });

                return iTarget;
            },
            likeArray:        function (iObject) {
                return (
                    iObject  &&
                    (typeof iObject.length == 'number')  &&
                    (typeof iObject.valueOf() != 'string')
                );
            },
            makeArray:        _Browser_.modern ?
                function () {
                    return  Array.apply(null, arguments[0]);
                } :
                function () {
                    return  this.extend([ ], arguments[0]);
                },
            inArray:          function () {
                return  Array.prototype.indexOf.call(arguments[1], arguments[0]);
            },
            unique:           function (iArray) {
                var iResult = [ ];

                for (var i = iArray.length - 1;  i > -1 ;  i--)
                    if (this.inArray(iArray[i], iArray) == i)
                        iResult.push( iArray[i] );
                iResult.reverse();

                return iResult;
            },
            isEqual:          function (iLeft, iRight) {
                if (!  (iLeft && iRight))
                    return  (iLeft == iRight);

                iLeft = iLeft.valueOf();
                iRight = iRight.valueOf();

                if (iLeft == iRight)  return true;
                if (! (
                    (iLeft instanceof Object)  &&  (iRight instanceof Object)
                ))
                    return false;

                var Left_Key = Object.getOwnPropertyNames(iLeft),
                    Right_Key = Object.getOwnPropertyNames(iRight);

                if (Left_Key.length != Right_Key.length)  return false;

                for (var i = 0, _Key_;  i < Left_Key.length;  i++) {
                    _Key_ = Left_Key[i];

                    if (! (
                        (_Key_ in iRight)  &&
                        arguments.callee.call(this, iLeft[_Key_], iRight[_Key_])
                    ))
                        return false;
                }
                return true;
            }
        };
    function _inKey_() {
        var iObject = { };

        for (var i = 0;  i < arguments.length;  i++)
            iObject[arguments[i]] = true;

        return iObject;
    }

    var Type_Info = {
            Data:         _inKey_('String', 'Number', 'Boolean', 'Null'),
            BOM:          _inKey_('Window', 'DOMWindow', 'global'),
            DOM:          {
                set:        _inKey_('Array', 'HTMLCollection', 'NodeList', 'jQuery', 'iQuery'),
                element:    _inKey_('Window', 'Document', 'HTMLElement'),
                root:       _inKey_('Document', 'Window')
            },
            DOM_Event:    _inKey_(
                'DOMContentLoaded',
                'DOMAttrModified', 'DOMAttributeNameChanged',
                'DOMCharacterDataModified',
                'DOMElementNameChanged',
                'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
                'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
                'DOMSubtreeModified'
            )
        };

    _Object_.type = function (iVar) {
        var iType = typeof iVar;

        try {
            iType = (iType == 'object') ? (
                (iVar && iVar.constructor.name) ||
                Object.prototype.toString.call(iVar).match(/\[object\s+([^\]]+)\]/i)[1]
            ) : (
                iType[0].toUpperCase() + iType.slice(1)
            );
        } catch (iError) {
            return 'Window';
        }

        if (! iVar)  switch (true) {
            case (isNaN(iVar)  &&  (iVar !== iVar)):    return 'NaN';
            case (iVar === null):                       return 'Null';
            default:                                    return iType;
        }

        if (
            Type_Info.BOM[iType] ||
            ((iVar == iVar.document) && (iVar.document != iVar))
        )
            return 'Window';

        if (iVar.defaultView || iVar.documentElement)
            return 'Document';

        if (
            iType.match(/HTML\w+?Element$/) ||
            (typeof iVar.tagName == 'string')
        )
            return 'HTMLElement';

        if ( this.likeArray(iVar) ) {
            iType = 'Array';
            if (! _Browser_.modern)  try {
                iVar.item();
                try {
                    iVar.namedItem();
                    return 'HTMLCollection';
                } catch (iError) {
                    return 'NodeList';
                }
            } catch (iError) { }
        }

        return iType;
    };

    function Object_Seek(iName, iCallback) {
        var iResult = [ ];

        for (var _This_ = this, _Next_, i = 0;  _This_[iName];  _This_ = _Next_, i++) {
            _Next_ = _This_[iName];
            iResult.push(_Next_);
            if ( iCallback )
                iCallback.call(_Next_, i, _Next_);
        }

        return iResult;
    }


/* ---------- DOM Info Operator - Get first, Set all. ---------- */
    var _DOM_ = {
            Get_Name_Type:    _inKey_('String', 'Array'),
            operate:          function (iType, iElement, iName, iValue) {
                if ((! iName) || (iValue === null)) {
                    if (this[iType].clear)
                        for (var i = 0;  i < iElement.length;  i++)
                            this[iType].clear(iElement[i], iName);
                    return iElement;
                }
                if ((iValue === undefined) && (_Object_.type(iName) in this.Get_Name_Type)) {
                    if (! iElement.length)
                        return;
                    else if (typeof iName == 'string')
                        return  this[iType].get(iElement[0], iName);
                    else {
                        var iData = { };
                        for (var i = 0;  i < iName.length;  i++)
                            iData[iName[i]] = this[iType].get(iElement[0], iName[i]);
                        return iData;
                    }
                } else {
                    var iResult;

                    if (typeof iName == 'string') {
                        if (typeof iValue == 'function') {
                            for (var i = 0;  i < iElement.length;  i++)
                                iResult = this[iType].set(iElement[i], iName, iValue.call(
                                    iElement[i],  i,  this[iType].get(iElement[i], iName)
                                ));
                            return  iResult || iElement;
                        } else {
                            iResult = { };
                            iResult[iName] = iValue;
                            iName = iResult;
                            iResult = undefined;
                        }
                    }
                    for (var i = 0;  i < iElement.length;  i++)
                        for (var iKey in iName)
                            iResult = this[iType].set(iElement[i], iKey, iName[iKey]);

                    return  iResult || iElement;
                }
            }
        };

    /* ----- DOM Attribute ----- */
    _DOM_.Attribute = {
        get:      function (iElement, iName) {
            if (! (_Object_.type(iElement) in Type_Info.DOM.root)) {
                var iValue = iElement.getAttribute(iName);
                return  (iValue === null) ? undefined : iValue;
            }
        },
        set:      function (iElement, iName, iValue) {
            return  (_Object_.type(iElement) in Type_Info.DOM.root) ?
                    false  :  iElement.setAttribute(iName, iValue);
        },
        clear:    function (iElement, iName) {
            iElement.removeAttribute(iName);
        }
    };

    /* ----- DOM Property ----- */
    _DOM_.Property = {
        alias:    {
            'class':    'className',
            'for':      'htmlFor'
        },
        get:      function (iElement, iName) {
            return  iElement[
                    _Browser_.modern  ?  iName  :  (this.alias[iName] || iName)
                ];
        },
        set:      function (iElement, iName, iValue) {
            iElement[this.alias[iName] || iName] = iValue;
        }
    };

    /* ----- DOM Style ----- */
    var Code_Indent = _Browser_.modern ? '' : ' '.repeat(4);

    _DOM_.Style = {
        get:           function (iElement, iName) {
            if ((! iElement) || (_Object_.type(iElement) in Type_Info.DOM.root))
                return;

            var iStyle = DOM.defaultView.getComputedStyle(iElement, null).getPropertyValue(iName);
            var iNumber = parseFloat(iStyle);

            return  isNaN(iNumber) ? iStyle : iNumber;
        },
        PX_Needed:     _inKey_(
            'width',  'min-width',  'max-width',
            'height', 'min-height', 'max-height',
            'margin', 'padding',
            'top',    'left',
            'border-radius'
        ),
        Set_Method:    _Browser_.modern ? 'setProperty' : 'setAttribute',
        set:           function (iElement, iName, iValue) {
            if (_Object_.type(iElement) in Type_Info.DOM.root)  return false;

            if ((! isNaN( Number(iValue) ))  &&  this.PX_Needed[iName])
                iValue += 'px';

            if (iElement)
                iElement.style[this.Set_Method](iName, String(iValue), 'important');
            else
                return  [iName, ':', Code_Indent, iValue].join('');
        }
    };

    /* ----- DOM Data ----- */
    _DOM_.Data = {
        _Data_:    [ ],
        set:       function (iElement, iName, iValue) {
            if (typeof iElement.dataIndex != 'number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            this._Data_[iElement.dataIndex][iName] = iValue;
        },
        get:       function (iElement, iName) {
            if (typeof iElement.dataIndex != 'number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            var iData =  (this._Data_[iElement.dataIndex] || { })[iName]  ||
                    (iElement.dataset || { })[ iName.toCamelCase() ];

            if (typeof iData == 'string')  try {
                iData = BOM.JSON.parseAll(iData);
            } catch (iError) { }

            return  ((iData instanceof Array)  ||  _Object_.isPlainObject(iData))  ?
                    _Object_.extend(true, undefined, iData)  :  iData;
        },
        clear:     function (iElement, iName) {
            if (typeof iElement.dataIndex != 'number')  return;

            if (iName)
                delete this._Data_[iElement.dataIndex][iName];
            else {
                delete this._Data_[iElement.dataIndex];
                delete iElement.dataIndex;
            }
        },
        clone:     function (iOld, iNew) {
            iNew.dataIndex = this._Data_.push({ }) - 1;
            return _Object_.extend(
                    this._Data_[iNew.dataIndex],
                    this._Data_[iOld.dataIndex]
                )._event_;
        }
    };

    /* ----- DOM Content ----- */
    _DOM_.innerText = {
        set:    function (iElement, iText) {
            switch ( iElement.tagName.toLowerCase() ) {
                case 'style':     if (! _Browser_.modern) {
                    iElement.styleSheet.cssText = iText;
                    return;
                }
                case 'script':    if (! _Browser_.modern) {
                    iElement.text = iText;
                    return;
                }
                case '':          {
                    iElement.appendChild( DOM.createTextNode(iText) );
                    return;
                }
            }
            iElement[_Browser_.ff ? 'textContent' : 'innerText'] = iText;
        },
        get:    _Browser_.ff ?
            function (iElement) {
                var TextRange = iElement.ownerDocument.createRange();
                TextRange.selectNodeContents(iElement);
                return TextRange.toString();
            } :
            function (iElement) {
                return iElement.innerText;
            }
    };

    _DOM_.innerHTML = {
        set:    function (iElement, iHTML) {
            var IE_Scope = String(iHTML).match(
                    /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
                );

            if (_Browser_.modern || (! IE_Scope))
                iElement.innerHTML = iHTML;
            else {
                iElement.innerHTML = 'IE_Scope' + iHTML;
                var iChild = iElement.childNodes;
                iChild[0].nodeValue = iChild[0].nodeValue.slice(8);
                if (! iChild[0].nodeValue.length)
                    iElement.removeChild(iChild[0]);
            }

            return _Object_.makeArray(iElement.childNodes);
        }
    };

/* ---------- DOM Event ---------- */
    _DOM_.operate('Data',  [BOM],  '_timer_',  { });

    var _Time_ = {
            _Root_:     BOM,
            now:        Date.now,
            every:      function (iSecond, iCallback) {
                var _BOM_ = this._Root_,
                    iTimeOut = (iSecond || 1) * 1000,
                    iTimer, iReturn, Index = 0,
                    iStart = this.now(), iDuring;

                iTimer = _BOM_.setTimeout(function () {
                    iDuring = (Date.now() - iStart) / 1000;
                    iReturn = iCallback.call(_BOM_, ++Index, iDuring);
                    if ((typeof iReturn == 'undefined') || iReturn)
                        _BOM_.setTimeout(arguments.callee, iTimeOut);
                }, iTimeOut);

                return iTimer;
            },
            wait:       function (iSecond, iCallback) {
                return  this.every(iSecond, function () {
                    iCallback.apply(this, arguments);
                    return false;
                });
            },
            start:      function (iName) {
                var _This_ = this,  Time_Stamp;

                _DOM_.operate('Data', [BOM], '_timer_',  function (_Index_, iTimer) {
                    iTimer = iTimer || { };
                    Time_Stamp = iTimer[iName] = _This_.now();
                    return iTimer;
                });

                return Time_Stamp;
            },
            end:        function () {
                var iTimer = _DOM_.operate('Data', [BOM], '_timer_');
                return  (this.now() - iTimer[arguments[0]]) / 1000;
            },
            uuid:       function () {
                return  [
                        (arguments[0] || 'uuid'),  '_',
                        this.now().toString(16),
                        Math.random().toString(16).slice(2)
                    ].join('');
            }
        };

    /* ----- Event Proxy Layer ----- */
    function Proxy_Handler(iEvent) {
        var iHandler = (_DOM_.operate('Data', [this], '_event_') || { })[iEvent.type];
        if (! iHandler)  return;

        var Handler_Args = [iEvent].concat(
                _DOM_.operate('Data', [iEvent.target], '_trigger_')
            ),
            This_DOM = this,  iReturn;

        _Object_.each(iHandler,  function () {
            var This_Handler = arguments[1],  _Return_;

            if (This_Handler)
                _Return_ = This_Handler.apply(This_DOM, Handler_Args);
            else if (This_Handler === false)
                _Return_ = false;
            else
                return;

            if (iReturn !== false)  iReturn = _Return_;
        });

        _DOM_.operate('Data', [this], '_trigger_', null);

        if (iReturn === false) {
            iEvent.preventDefault();
            iEvent.stopPropagation();
        }
    }

/* ---------- DOM Constructor ---------- */
    function DOM_Create(TagName, AttrList) {
        var iNew,  iTag = TagName.match(/^\s*<(.+?)\s*\/?>([\s\S]+)?/);

        if (! iTag)  return  [ DOM.createTextNode(TagName) ];

        iNew = (iTag[2]  ||  (iTag[1].split(/\s/).length > 1))  ?
            _DOM_.innerHTML.set(
                DOM.createElement('div'),  TagName
            )  :  [
                DOM.createElement( iTag[1] )
            ];

        if ((iNew.length == 1)  &&  (iNew[0].nodeType == 1)  &&  AttrList)
            _Object_.each(AttrList,  function (iKey, iValue) {
                switch (iKey) {
                    case 'text':     return  _DOM_.innerText.set(iNew[0], iValue);
                    case 'html':     return  _DOM_.innerHTML.set(iNew[0], iValue);
                    case 'style':    {
                        if ( _Object_.isPlainObject(iValue) )
                            return  _DOM_.operate('Style', iNew, iValue);
                    }
                }
                _DOM_.operate('Attribute', iNew, iKey, iValue);
            });

        if (iNew[0].parentNode)
            iNew = _Object_.map(iNew,  function (iDOM, _Index_) {
                iNew[_Index_].parentNode.removeChild(iDOM);
                return iDOM;
            });

        return iNew;
    }


/* ---------- DOM Selector ---------- */
    var iPseudo = {
            ':header':     {
                filter:    function () {
                    return  (arguments[0] instanceof HTMLHeadingElement);
                }
            },
            ':image':      {
                feature:    _Object_.extend(_inKey_('img', 'svg', 'canvas'), {
                    input:    {type:  'image'},
                    link:     {type:  'image/x-icon'}
                }),
                filter:    function (iElement) {
                    var iTag = iElement.tagName.toLowerCase();

                    if (iTag in this.feature)
                        return  (this.feature[iTag] instanceof Boolean) ? true : (
                            this.feature[iTag].type == iElement.type.toLowerCase()
                        );
                }
            },
            ':button':     {
                feature:    _inKey_('button', 'image', 'submit', 'reset'),
                filter:     function (iElement) {
                    var iTag = iElement.tagName.toLowerCase();

                    return  ((iTag == 'button') || (
                        (iTag == 'input') &&
                        (iElement.type.toLowerCase() in this.feature)
                    ));
                }
            },
            ':input':      {
                feature:    _inKey_('input', 'textarea', 'button', 'select'),
                filter:     function () {
                    return  (arguments[0].tagName.toLowerCase() in this.feature);
                }
            },
            ':list':       {
                feature:    _inKey_('ul', 'ol', 'dl'),
                filter:     function () {
                    return  (arguments[0].tagName.toLowerCase() in this.feature);
                }
            },
            ':data':       {
                filter:    function () {
                    return  (! _Object_.isEmptyObject(arguments[0].dataset));
                }
            },
            ':visible':    {
                feature:    {
                    display:    'none',
                    width:      0,
                    height:     0
                },
                filter:     function (iElement) {
                    var iStyle = _DOM_.operate('Style', [iElement], [
                            'display', 'width', 'height'
                        ]);

                    for (var iKey in iStyle)
                        if (iStyle[iKey] === this.feature[iKey])
                            return;
                    return true;
                }
            },
            ':parent':      {
                filter:    function () {
                    var iNode = arguments[0].childNodes;

                    if (! arguments[0].children.length) {
                        for (var i = 0;  i < iNode.length;  i++)
                            if (iNode[i].nodeType == 3)
                                return true;
                    } else  return true;
                }
            }
        };

    _Object_.extend(iPseudo, {
        ':hidden':    {
            filter:    function () {
                return  (! iPseudo[':visible'].filter(arguments[0]));
            }
        },
        ':empty':     {
            filter:    function () {
                return  (! iPseudo[':parent'].filter(arguments[0]));
            }
        }
    });

    for (var _Pseudo_ in iPseudo)
        iPseudo[_Pseudo_].regexp = RegExp(
            '(.*?)' + _Pseudo_ + "([>\\+~\\s]*.*)"
        );

    function DOM_Search(iRoot, iSelector) {
        var _Self_ = arguments.callee;

        return  _Object_.map(iSelector.split(/\s*,\s*/),  function () {
            try {
                return  _Object_.makeArray( iRoot.querySelectorAll(arguments[0] || '*') );
            } catch (iError) {
                var _Selector_;
                for (var _Pseudo_ in iPseudo) {
                    _Selector_ = arguments[0].match(iPseudo[_Pseudo_].regexp);
                    if (_Selector_)  break;
                };
                _Selector_[1] = _Selector_[1] || '*';
                _Selector_[1] += (_Selector_[1].match(/[\s>\+~]\s*$/) ? '*' : '');

                return _Object_.unique(
                    _Object_.map(
                        _Self_(iRoot, _Selector_[1]),
                        function (iDOM) {
                            if ( iPseudo[_Pseudo_].filter(iDOM) )
                                return  _Selector_[2]  ?  _Self_(iDOM,  '*' + _Selector_[2])  :  iDOM;
                        }
                    )
                );
            }
        });
    }
/* ---------- jQuery API ---------- */

    function iQuery(Element_Set, iContext) {
        /* ----- Global Wrapper ----- */
        var _Self_ = arguments.callee;

        if (! (this instanceof _Self_))
            return  new _Self_(Element_Set, iContext);
        if (Element_Set instanceof _Self_)
            return  Element_Set;

        /* ----- Constructor ----- */
        this.length = 0;

        if (! Element_Set) return;

        if (typeof Element_Set == 'string') {
            if (Element_Set[0] != '<') {
                this.context = iContext || DOM;
                this.selector = Element_Set;
                Element_Set = DOM_Search(this.context, Element_Set);
            } else
                Element_Set = DOM_Create(
                    Element_Set,  _Object_.isPlainObject(iContext) && iContext
                );
        }
        this.add( Element_Set );
    }

    var $ = BOM.iQuery = iQuery;
    $.fn = $.prototype;

    $.fn.add = function (Element_Set) {
        var iType = _Object_.type(Element_Set);

        if (iType == 'String')
            Element_Set = $(Element_Set, arguments[1]);
        else if (iType in Type_Info.DOM.element)
            Element_Set = [ Element_Set ];

        if (_Object_.likeArray( Element_Set )) {
            for (var i = 0;  i < Element_Set.length;  i++)
                if (Element_Set[i] && (
                    (Element_Set[i].nodeType == 1) ||
                    (_Object_.type(Element_Set[i]) in Type_Info.DOM.root)
                ))
                    Array.prototype.push.call(this, Element_Set[i]);

            if (this.length == 1)
                this.context = this[0].ownerDocument;
        }

        return this;
    };

    if (typeof BOM.jQuery != 'function')
        BOM.jQuery = BOM.$ = $;


    /* ----- iQuery Static Method ----- */

    _Object_.extend($, _Object_, _Time_, {
        browser:          _Browser_,
        isData:           function () {
            return  (this.type(arguments[0]) in Type_Info.Data);
        },
        isSelector:       function () {
            try {
                DOM.querySelector(arguments[0])
            } catch (iError) {
                return false;
            }
            return true;
        },
        trim:             function () {
            return  arguments[0].trim();
        },
        split:            function (iString, iSplit, iLimit, iJoin) {
            iString = iString.split(iSplit);
            if (iLimit) {
                iString[iLimit - 1] = iString.slice(iLimit - 1).join(
                    (typeof iJoin == 'string') ? iJoin : iSplit
                );
                iString.length = iLimit;
            }
            return iString;
        },
        byteLength:       function () {
            return  arguments[0].replace(
                /[^\u0021-\u007e\uff61-\uffef]/g,  'xx'
            ).length;
        },
        parseJSON:        BOM.JSON.parseAll,
        parseXML:         function (iString) {
            iString = iString.trim();
            if ((iString[0] != '<') || (iString[iString.length - 1] != '>'))
                throw 'Illegal XML Format...';

            var iXML = (new BOM.DOMParser()).parseFromString(iString, 'text/xml');

            var iError = iXML.getElementsByTagName('parsererror');
            if (iError.length)
                throw  new SyntaxError(1, iError[0].childNodes[1].nodeValue);
            iXML.cookie;    //  for old WebKit core to throw Error

            return iXML;
        },
        param:            function (iObject) {
            var iParameter = [ ],  iValue;

            if ( $.isPlainObject(iObject) )
                for (var iName in iObject) {
                    iValue = iObject[iName];

                    if ( $.isPlainObject(iValue) )
                        iValue = BOM.JSON.stringify(iValue);
                    else if (! $.isData(iValue))
                        continue;

                    iParameter.push(iName + '=' + BOM.encodeURIComponent(iValue));
                }
            else if ($.type(iObject) in Type_Info.DOM.set)
                for (var i = 0;  i < iObject.length;  i++)
                    iParameter.push(
                        iObject[i].name + '=' + BOM.encodeURIComponent(iObject[i].value)
                    );

            return iParameter.join('&');
        },
        paramJSON:        function (Args_Str) {
            Args_Str = (Args_Str || BOM.location.search).match(/[^\?&\s]+/g);
            if (! Args_Str)  return { };

            var _Args_ = {
                    toString:    function () {
                        return  BOM.JSON.format(this);
                    }
                };

            for (var i = 0, iValue; i < Args_Str.length; i++) {
                Args_Str[i] = $.split(Args_Str[i], '=', 2);

                iValue = BOM.decodeURIComponent( Args_Str[i][1] );
                try {
                    iValue = $.parseJSON(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return  Args_Str.length ? _Args_ : { };
        },
        fileName:         function () {
            return  (arguments[0] || BOM.location.pathname)
                    .split('?')[0].split('/').slice(-1)[0];
        },
        filePath:         function () {
            return  $.split(arguments[0] || BOM.location.href,  '?',  2)[0]
                    .split('/').slice(0, -1).join('/');
        },
        data:             function (iElement, iName, iValue) {
            return  _DOM_.operate('Data', [iElement], iName, iValue);
        },
        contains:         function (iParent, iChild) {
            if (! iChild)  return false;

            if ($.browser.modern)
                return  !!(iParent.compareDocumentPosition(iChild) & 16);
            else
                return  (iParent !== iChild) && iParent.contains(iChild);
        }
    });

    /* ----- iQuery Instance Method ----- */
    function DOM_Size(iName) {
        iName = {
            scroll:    'scroll' + iName,
            inner:     'inner' + iName,
            client:    'client' + iName,
            css:       iName.toLowerCase()
        };

        return  function () {
            switch ( $.type(this[0]) ) {
                case 'Document':    return  Math.max(
                        this[0].documentElement[iName.scroll],
                        this[0].body[iName.scroll]
                    );  break;
                case 'Window':      return  this[0][iName.inner] || Math.max(
                        this[0].document.documentElement[iName.client],
                        this[0].document.body[iName.client]
                    );  break;
                default:            return  this.css(iName.css, arguments[0]);
            }
        };
    }
    function DOM_Scroll(iName) {
        iName = {
            scroll:    'scroll' + iName,
            offset:    (iName == 'Top') ? 'pageYOffset' : 'pageXOffset'
        };

        return  function (iPX) {
            iPX = parseInt(iPX);

            if ( isNaN(iPX) ) {
                iPX = this[0][iName.scroll];
                return  (iPX !== undefined) ? iPX : (
                    this[0].documentElement[iName.scroll] ||
                    this[0].defaultView[iName.offset] ||
                    this[0].body[iName.scroll]
                );
            }
            for (var i = 0;  i < this.length;  i++)
                if (this[i][iName.scroll] !== undefined)
                    this[i][iName.scroll] = iPX;
                else
                    this[i].documentElement[iName.scroll] =
                    this[i].defaultView[iName.offset] =
                    this[i].body[iName.scroll] = iPX;
        };
    }

    function DOM_Insert(iName) {
        return  function () {
            if (this.length) {
                if (! this[0][iName])
                    this.append.apply(
                        (iName == 'firstElementChild')  ?  this  :  this.parent(),
                        arguments
                    );
                else
                    this.before.apply($(this[0][iName]), arguments);
            }
            return this;
        };
    }

    function Array_Concat(iSource) {
        if (! (iSource instanceof Array))
            iSource = $.makeArray(iSource);

        for (var i = 1;  i < arguments.length;  i++)
            iSource = Array.prototype.concat.apply(
                iSource,
                $.likeArray( arguments[i] )  ?  arguments[i]  :  [arguments[i]]
            );
        return iSource;
    }

    $.fn.extend = $.extend;

    $.fn.extend({
        splice:             Array.prototype.splice,
        jquery:             '1.9.1',
        iquery:             '1.0',
        pushStack:          function () {
            var $_New = Array.prototype.sort.call($(arguments[0]),  function (A, B) {
                    var $_A = Object_Seek.call(A, 'parentNode').reverse(),
                        $_B = Object_Seek.call(B, 'parentNode').reverse();

                    if ($_A.length != $_B.length)
                        return  $_B.length - $_A.length;

                    for (var i = 0;  i < $_A.length;  i++)
                        if ($_A[i] !== $_B[i])
                            return (
                                Object_Seek.call($_A[i], 'previousElementSibling').length  -
                                Object_Seek.call($_B[i], 'previousElementSibling').length
                            );
                });
            $_New.prevObject = this;

            return $_New;
        },
        refresh:            function () {
            if (! this.selector)  return this;

            var $_New = $(this.selector, this.context);

            if (this.prevObject instanceof $)
                $_New = this.prevObject.pushStack($_New);

            return $_New;
        },
        slice:              function () {
            return  this.pushStack( [ ].slice.apply(this, arguments) );
        },
        eq:                 function (Index) {
            return  this.pushStack(
                [ ].slice.call(this,  Index,  (Index + 1) || undefined)
            );
        },
        index:              function (iTarget) {
            if (! iTarget)
                return  Object_Seek.call(this[0], 'previousElementSibling').length;

            var iType = $.type(iTarget);
            switch (true) {
                case (iType == 'String'):
                    return  $.inArray(this[0], $(iTarget));
                case ((iType in Type_Info.DOM.set)  &&  (!! iTarget.length)):    {
                    iTarget = iTarget[0];
                    iType = $.type(iTarget);
                }
                case (iType in Type_Info.DOM.element):
                    return  $.inArray(iTarget, this);
            }
            return -1;
        },
        each:               function () {
            return  $.each(this, arguments[0]);
        },
        is:                 function (iSelector) {
            if ((! this[0])  ||  ($.type(this[0]) in Type_Info.DOM.root))
                return;

            if (! this[0].parentNode)  $('<div />')[0].appendChild( this[0] );

            return  ($.inArray(this[0],  $(iSelector, this[0].parentNode))  >  -1);
        },
        filter:             function (iSelector) {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ( $(this[i]).is(iSelector) )
                    $_Result.push( this[i] );

            return this.pushStack($_Result);
        },
        not:                function () {
            var $_Not = $(arguments[0]),
                $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ($.inArray(this[i], $_Not) < 0)
                    $_Result.push(this[i]);

            return this.pushStack($_Result);
        },
        attr:               function () {
            return  _DOM_.operate('Attribute', this, arguments[0], arguments[1]);
        },
        removeAttr:         function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        prop:               function () {
            return  _DOM_.operate('Property', this, arguments[0], arguments[1]);
        },
        data:               function () {
            return  _DOM_.operate('Data', this, arguments[0], arguments[1]);
        },
        addBack:            function () {
            return  this.pushStack( Array_Concat(this, this.prevObject) );
        },
        parent:             function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ($.inArray(this[i].parentNode, $_Result) == -1)
                    $_Result.push( this[i].parentNode );

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        parents:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat( Object_Seek.call(this[i], 'parentNode') );

            $_Result = $( $.unique($_Result) );

            return this.pushStack(
                arguments[0]  ?  $_Result.filter(arguments[0])  :  $_Result
            );
        },
        sameParents:        function () {
            if (this.length < 2)  return this.parents();

            var iMin = Object_Seek.call(this[0], 'parentNode'),  iPrev;

            for (var i = 1, iLast;  i < this.length;  i++) {
                iLast = Object_Seek.call(this[i], 'parentNode');
                if (iLast.length < iMin.length) {
                    iPrev = iMin;
                    iMin = iLast;
                }
            }
            iPrev = iPrev || iLast;

            var iDiff = iPrev.length - iMin.length,  $_Result = [ ];

            for (var i = 0;  i < iMin.length;  i++)
                if (iMin[i]  ===  iPrev[i + iDiff]) {
                    $_Result = iMin.slice(i);
                    break;
                }
            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        parentsUntil:       function () {
            return  this.parents().not(
                    $(arguments[0]).parents().addBack()
                );
        },
        children:           function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = Array_Concat($_Result, this[i].children);

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        contents:           function () {
            var $_Result = [ ],
                Type_Filter = parseInt(arguments[0]);

            for (var i = 0;  i < this.length;  i++)
                $_Result = Array_Concat(
                    $_Result,
                    (this[i].tagName.toLowerCase() != 'iframe') ?
                        this[i].childNodes : this[i].contentWindow.document
                );
            if ($.type(Type_Filter) == 'Number')
                for (var i = 0;  i < $_Result.length;  i++)
                    if ($_Result[i].nodeType != Type_Filter)
                        $_Result[i] = null;

            return this.pushStack($_Result);
        },
        nextAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    Object_Seek.call(this[i], 'nextElementSibling')
                );
            $_Result = $.unique($_Result);

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        prevAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    Object_Seek.call(this[i], 'previousElementSibling')
                );
            $_Result = $.unique($_Result).reverse();

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        siblings:           function () {
            var $_Result = this.prevAll().add( this.nextAll() );

            return this.pushStack(
                arguments[0]  ?  $_Result.filter(arguments[0])  :  $_Result
            );
        },
        find:               function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = Array_Concat($_Result,  $(arguments[0], this[i]));

            return  this.pushStack( $.unique($_Result) );
        },
        detach:             function () {
            for (var i = 0;  i < this.length;  i++)
                if (this[i].parentNode)
                    this[i].parentNode.removeChild(this[i]);

            return this;
        },
        remove:             function () {
            return this.detach().data();
        },
        empty:              function () {
            this.children().remove();

            for (var i = 0, iChild;  i < this.length;  i++) {
                iChild = this[i].childNodes;
                for (var j = 0;  j < iChild.length;  j++)
                    this[i].removeChild(iChild[j]);
            }

            return this;
        },
        text:               function (iText) {
            var iGetter = (! $.isData(iText)),  iResult = [ ];

            if (! iGetter)  this.empty();

            for (var i = 0;  i < this.length;  i++)
                if (iGetter)
                    iResult.push( _DOM_.innerText.get(this[i]) );
                else
                    _DOM_.innerText.set(this[i], iText);

            return  iResult.length ? iResult.join('') : this;
        },
        html:               function (iHTML) {
            if (! $.isData(iHTML))
                return this[0].innerHTML;

            this.empty();

            for (var i = 0;  i < this.length;  i++)
                _DOM_.innerHTML.set(this[i], iHTML);

            return  this;
        },
        css:                function () {
            return  _DOM_.operate('Style', this, arguments[0], arguments[1]);
        },
        hide:               function () {
            for (var i = 0, $_This;  i < this.length;  i++) {
                $_This = $(this[i]);
                $_This.data('display', $_This.css('display'))
                    .css('display', 'none');
            }
            return this;
        },
        show:               function () {
            for (var i = 0, $_This;  i < this.length;  i++) {
                $_This = $(this[i]);
                $_This.css({
                    display:       $_This.data('display') || 'origin',
                    visibility:    'visible',
                    opacity:       1
                });
            }
            return this;
        },
        width:              DOM_Size('Width'),
        height:             DOM_Size('Height'),
        scrollTop:          DOM_Scroll('Top'),
        scrollLeft:         DOM_Scroll('Left'),
        position:           function () {
            return  {
                left:    this[0].offsetLeft,
                top:     this[0].offsetTop
            };
        },
        offset:             function (iCoordinate) {
            if ( $.isPlainObject(iCoordinate) )
                return this.css($.extend({
                    position:    'fixed'
                }, iCoordinate));

            var _BOM_ = this[0].ownerDocument.defaultView,
                iBCR = this[0].getBoundingClientRect();

            return {
                left:    parseFloat( (_BOM_.pageXOffset + iBCR.left).toFixed(4) ),
                top:     parseFloat( (_BOM_.pageYOffset + iBCR.top).toFixed(4) )
            };
        },
        addClass:           function (new_Class) {
            if (typeof new_Class != 'string')  return this;

            new_Class = new_Class.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                old_Class = (old_Class || '').trim().split(/\s+/);

                for (var i = 0;  i < new_Class.length;  i++)
                    if ($.inArray(new_Class[i], old_Class) == -1)
                        old_Class.push( new_Class[i] );

                return  old_Class.join(' ').trim();
            });
        },
        removeClass:        function (iClass) {
            if (typeof iClass != 'string')  return this;

            iClass = iClass.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                old_Class = (old_Class || '').trim().split(/\s+/);
                if (! old_Class[0])  return;

                var new_Class = [ ];

                for (var i = 0;  i < old_Class.length;  i++)
                    if ($.inArray(old_Class[i], iClass) == -1)
                        new_Class.push( old_Class[i] );

                return  new_Class.join(' ');
            });
        },
        hasClass:           function (iClass) {
            return (
                (typeof iClass == 'string')  &&
                this[0]  &&
                this[0].classList.contains( iClass.trim() )
            );
        },
        bind:               function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.each(function () {
                var $_This = $(this);

                for (var i = 0;  i < iType.length;  i++)
                    $_This.data('_event_',  function () {
                        var Event_Data = arguments[1] || { };

                        if (! Event_Data[iType[i]]) {
                            Event_Data[iType[i]] = [ ];
                            this.addEventListener(iType[i], Proxy_Handler);
                        }
                        Event_Data[iType[i]].push(iCallback);

                        return Event_Data;
                    });
            });
        },
        unbind:             function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.each(function () {
                var $_This = $(this);

                for (var i = 0;  i < iType.length;  i++)
                    $_This.data('_event_',  function () {
                        var Event_Data = arguments[1] || { };
                        var This_Event = Event_Data[iType[i]];

                        if (iCallback)
                            This_Event.splice(This_Event.indexOf(iCallback), 1);
                        if ((! iCallback) || (! This_Event.length))
                            Event_Data[iType[i]] = null;
                        if (! Event_Data[iType[i]])
                            this.removeEventListener(iType[i], Proxy_Handler);

                        return Event_Data;
                    });
            });
        },
        on:                 function (iType, iFilter, iCallback) {
            if (typeof iFilter != 'string')
                return  this.bind.apply(this, arguments);

            return  this.bind(iType, function () {
                var iArgs = $.makeArray(arguments);

                var $_Filter = $(iFilter, this),
                    $_Target = $(iArgs[0].target),
                    iReturn;

                var $_Path = $_Target.parents();
                Array.prototype.unshift.call($_Path, $_Target[0]);

                for (var i = 0, _Return_;  i < $_Path.length;  i++) {
                    if ($_Path[i] === this)  break;
                    if ($.inArray($_Path[i], $_Filter) == -1)  continue;

                    if (iArgs[1] === null)
                        iArgs = [ iArgs[0] ].concat( $($_Path[i]).data('_trigger_') );
                    _Return_ = iCallback.apply($_Path[i], iArgs);
                    if (iReturn !== false)
                        iReturn = _Return_;
                }

                return iReturn;
            });
        },
        one:                function () {
            var iArgs = $.makeArray(arguments);
            var iCallback = iArgs[iArgs.length - 1];

            iArgs.splice(-1,  1,  function () {
                $.fn.unbind.apply($(this), iArgs);

                return  iCallback.apply(this, arguments);
            });

            return  this.on.apply(this, iArgs);
        },
        trigger:            function (iType) {
            if (typeof iType != 'string') {
                var _Event_ = iType;
                iType = iType.type;
            }
            this.data('_trigger_', arguments[1]);

            return  this.each(function () {
                _Type_ = (
                    (('on' + iType)  in  this.constructor.prototype)  ||
                    (iType in Type_Info.DOM_Event)
                ) ? 'HTMLEvents' : 'CustomEvent';

                var iEvent = DOM.createEvent(_Type_);
                iEvent['init' + (
                    (_Type_ == 'HTMLEvents')  ?  'Event'  :  _Type_
                )](iType, true, true, 0);
                this.dispatchEvent(
                    _Event_  ?  $.extend(iEvent, _Event_)  :  iEvent
                );
            });
        },
        triggerHandler:     function () {
            var iHandler = $(this[0]).data('_event_'),  iReturn;

            iHandler = iHandler && iHandler[arguments[0]];
            if (! iHandler)  return;

            for (var i = 0;  i < iHandler.length;  i++)
                iReturn = iHandler[i].apply(
                    this[0],  Array_Concat([ ], arguments)
                );

            return iReturn;
        },
        clone:              function (iDeep) {
            var $_Result = [ ];

            for (var i = 0, iEvent;  i < this.length;  i++) {
                $_Result[i] = this[i].cloneNode(iDeep);
                iEvent = _DOM_.Data.clone(this[i], $_Result[i]);

                for (var iType in iEvent)
                    $_Result[i].addEventListener(iType, Proxy_Handler, false);
            }

            return this.pushStack($_Result);
        },
        append:             function () {
            var $_Child = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            return  this.each(function (Index) {
                    var _Child_ = Index ? $_Child.clone(true) : $_Child,
                        _Cache_ = DOM_Cache.cloneNode();

                    for (var i = 0;  i < _Child_.length;  i++)
                        _Cache_.appendChild( _Child_[i] );

                    this.appendChild(_Cache_);
                });
        },
        appendTo:           function () {
            $(arguments[0], arguments[1]).append(this);

            return  this;
        },
        before:             function () {
            var $_Brother = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            return  this.each(function (Index) {
                    var _Brother_ = Index ? $_Brother.clone(true) : $_Brother,
                        _Cache_ = DOM_Cache.cloneNode();

                    for (var i = 0;  i < _Brother_.length;  i++)
                        _Cache_.appendChild( _Brother_[i] );

                    this.parentNode.insertBefore(_Cache_, this);
                });
        },
        prepend:            DOM_Insert('firstElementChild'),
        prependTo:          function () {
            $(arguments[0], arguments[1]).prepend(this);

            return  this;
        },
        after:              DOM_Insert('nextElementSibling'),
        val:                function () {
            if (! $.isData(arguments[0]))
                return  this[0] && this[0].value;
            else
                return  this.not('input[type="file"]').prop('value', arguments[0]);
        },
        serializeArray:     function () {
            var $_Value = this.find('*[name]:input').not(':button, [disabled]'),
                iValue = [ ];

            for (var i = 0;  i < $_Value.length;  i++) {
                if ($_Value[i].type.match(/radio|checkbox/i)  &&  (! $_Value[i].checked))
                    continue;

                iValue.push({
                    name:     $_Value[i].name,
                    value:    $_Value[i].value
                });
            }

            return iValue;
        },
        serialize:          function () {
            return  $.param( this.serializeArray() );
        }
    });

/* ---------- Event ShortCut ---------- */
    $.fn.off = $.fn.unbind;

    function Event_Method(iName) {
        return  function (iCallback) {
            if ((typeof iCallback == 'function')  ||  (iCallback === false))
                return  this.bind(iName, arguments[0]);

            for (var i = 0;  i < this.length;  i++)  try {
                this[i][iName]();
            } catch (iError) {
                $(this[i]).trigger(iName);
            }

            return this;
        };
    }

    for (var iName in _inKey_(
        'abort', 'error',
        'keydown', 'keypress', 'keyup',
        'mousedown', 'mouseup', 'mousemove', 'mousewheel',
        'click', 'dblclick', 'scroll',
        'select', 'focus', 'blur', 'change', 'submit', 'reset',
        'tap', 'press', 'swipe'
    ))
        $.fn[iName] = Event_Method(iName);

    if ($.browser.mobile)  $.fn.click = $.fn.tap;



/* ----- DOM UI Data Operator ----- */
    var RE_URL = /^(\w+:)?\/\/[\u0021-\u007e\uff61-\uffef]+$/;

    function Value_Operator(iValue) {
        var $_This = $(this),
            End_Element = (! this.children.length);

        var _Set_ = iValue || $.isData(iValue),
            iURL = (typeof iValue == 'string')  &&  iValue.trim().match(RE_URL);

        switch ( this.tagName.toLowerCase() ) {
            case 'a':           {
                if (_Set_) {
                    if (iURL)
                        $_This.attr('href', iURL[0]);
                    if (End_Element)
                        $_This.text(iValue);
                    return;
                }
                return  $_This.attr('href')  ||  (End_Element && $_This.text());
            }
            case 'img':         return  $_This.attr('src', iValue);
            case 'textarea':    ;
            case 'select':      ;
            case 'input':       {
                if ((this.type || '').match(/radio|checkbox/i)  &&  (this.value == iValue))
                    this.checked = true;
                return $_This.val(iValue);
            }
            default:            {
                if (_Set_) {
                    if ((! End_Element)  &&  iURL)
                        $_This.css('background-image',  'url("' + iValue + '")');
                    else
                        $_This.html(iValue);
                    return;
                }
                iURL = $_This.css('background-image').match(/^url\(('|")?([^'"]+)('|")?\)/);
                return  End_Element  ?  $_This.text()  :  (iURL && iURL[2]);
            }
        }
    }

    $.fn.value = function (iFiller) {
        var $_Name = this.filter('*[name]');
        if (! $_Name.length)
            $_Name = this.find('*[name]');

        if (! iFiller)
            return Value_Operator.call($_Name[0]);
        else if ( $.isPlainObject(iFiller) )
            var Data_Set = true;

        var $_This = this;

        for (var i = 0, iName;  i < $_Name.length;  i++) {
            iName = $_Name[i].getAttribute('name');

            Value_Operator.call(
                $_Name[i],
                Data_Set  ?  iFiller[iName]  :  iFiller.call($_Name[i], iName)
            );
        }
        return this;
    };


/* ---------- Smart zIndex ---------- */
    function Get_zIndex() {
        var $_This = $(this);

        var _zIndex_ = $_This.css('z-index');
        if (_zIndex_ != 'auto')  return parseInt(_zIndex_);

        var $_Parents = $_This.parents();
        _zIndex_ = 0;

        $_Parents.each(function () {
            var _Index_ = $(this).css('z-index');

            _zIndex_ = _zIndex_ + (
                (_Index_ == 'auto')  ?  1  :  _Index_
            );
        });

        return ++_zIndex_;
    }

    function Set_zIndex() {
        var $_This = $(this),  _Index_ = 0;

        $_This.siblings().addBack().filter(':visible').each(function () {
            _Index_ = Math.max(_Index_, Get_zIndex.call(this));
        });
        $_This.css('z-index', ++_Index_);
    }

    $.fn.zIndex = function (new_Index) {
        if (! $.isData(new_Index))
            return  Get_zIndex.call(this[0]);
        else if (new_Index == '+')
            return  this.each(Set_zIndex);
        else
            return  this.css('z-index',  parseInt(new_Index) || 'auto');
    };


/* ---------- CSS Rule ---------- */
    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        $.each(iRule,  function (iSelector) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iAttribute in this)
                _Rule_Block_.push(
                    _DOM_.operate('Style', [null], iAttribute, this[iAttribute])
                        .replace(/^(\w)/m,  Code_Indent + '$1')
                );

            Rule_Text.push(
                [Rule_Block, _Rule_Block_.join(";\n"), '}'].join("\n")
            );
        });
        Rule_Text.push('');

        return Rule_Text.join("\n");
    }

    $.cssRule = function (iMedia, iRule) {
        if (typeof iMedia != 'string') {
            iRule = iMedia;
            iMedia = null;
        }
        var CSS_Text = CSS_Rule2Text(iRule);

        return  $('<style />', {
            type:       'text/css',
            'class':    'jQuery_CSS-Rule',
            text:       (! iMedia) ? CSS_Text : [
                '@media ' + iMedia + ' {',
                CSS_Text.replace(/\n/m, "\n    "),
                '}'
            ].join("\n")
        }).appendTo(DOM.head)[0].sheet;
    };

    $.fn.cssRule = function (iRule, iCallback) {
        return  this.each(function () {
            var $_This = $(this);
            var _UUID_ = $_This.data('css') || $.uuid();

            $(this).attr('data-css', _UUID_);
            for (var iSelector in iRule) {
                iRule['*[data-css="' + _UUID_ + '"]' + iSelector] = iRule[iSelector];
                delete iRule[iSelector];
            }

            var iSheet = $.cssRule(iRule);

            if (iCallback)
                iCallback.call(this, iSheet);
        });
    };

    var Pseudo_RE = /:{1,2}[\w\-]+/g;

    $.cssPseudo = function () {
        var Pseudo_Rule = [ ];

        $.each(arguments[0] || DOM.styleSheets,  function () {
            var iRule = this.cssRules;
            if (! iRule)  return;

            for (var i = 0, iPseudo;  i < iRule.length;  i++)
                if (! iRule[i].cssRules) {
                    iPseudo = iRule[i].cssText.match(Pseudo_RE);
                    if (! iPseudo)  continue;

                    for (var j = 0;  j < iPseudo.length;  j++)
                        iPseudo[j] = iPseudo[j].split(':').slice(-1)[0];
                    iRule[i].pseudo = iPseudo;
                    iRule[i].selectorText = iRule[i].selectorText ||
                        iRule[i].cssText.match(/^(.+?)\s*\{/)[1];
                    Pseudo_Rule.push(iRule[i]);
                } else
                    arguments.callee.call(iRule[i], i, iRule[i]);
        });

        return Pseudo_Rule;
    };

/* ---------- Range of Selection ---------- */

    $.fn.selection = function (iContent) {
        var iSelection = (this[0].ownerDocument || this[0]).getSelection();

        if ($.type(this[0]) in Type_Info.DOM.root) {
            if (iContent === undefined)  return iSelection;
        } else if ( $.contains(this[0], iSelection.focusNode) )
            return iSelection;
    };

})(self, self.document);



/* ---------- IE 8- Patch to W3C ---------- */
(function (BOM, DOM, $) {

    if ($.browser.modern)  return;

    /* ----- DOM Attribute Name ----- */
    var iAlias = {
            'class':    'className',
            'for':      'htmlFor'
        },
        Get_Attribute = Element.prototype.getAttribute,
        Set_Attribute = Element.prototype.setAttribute,
        Remove_Attribute = Element.prototype.removeAttribute;

    $.extend(Element.prototype, {
        getAttribute:    function (iName) {
            return  Get_Attribute.call(this,  iAlias[iName] || iName,  0);
        },
        setAttribute:    function (iName) {
            return  Set_Attribute.call(this,  iAlias[iName] || iName,  arguments[1],  0);
        },
        removeAttribute:    function (iName) {
            return  Remove_Attribute.call(this,  iAlias[iName] || iName,  0);
        }
    });

    /* ----- DOM ShortCut ----- */
    var iGetter = {
            firstElementChild:         function () {
                return this.children[0];
            },
            lastElementChild:          function () {
                return  this.children[this.children.length - 1];
            },
            previousElementSibling:    function () {
                return this.previousSibling;
            },
            nextElementSibling:        function () {
                return this.nextSibling;
            }
        };

    for (var iName in iGetter)
        Object.defineProperty(Element.prototype, iName, {
            get:    iGetter[iName],
            set:    function () { }
        });


    /* ----- Computed Style ----- */
    function CSSStyleDeclaration() {
        $.extend(this, arguments[0].currentStyle, {
            length:       0,
            cssText:      '',
            ownerNode:    arguments[0]
        });

        for (var iName in this) {
            this[this.length++] = iName.toHyphenCase();
            this.cssText += [
                iName,  ': ',  this[iName],  '; '
            ].join('');
        }
        this.cssText = this.cssText.trim();
    }

    var Code_Indent = ' '.repeat(4);

    function toHexInt(iDec, iLength) {
        var iHex = parseInt( Number(iDec).toFixed(0) ).toString(16);

        if (iLength && (iLength > iHex.length))
            iHex = '0'.repeat(iLength - iHex.length) + iHex;

        return iHex;
    }

    function RGB_Hex(iRed, iGreen, iBlue) {
        var iArgs = $.makeArray(arguments);

        if ((iArgs.length == 1) && (typeof iArgs[0] == 'string'))
            iArgs = iArgs[0].replace(/rgb\(([^\)]+)\)/i, '$1').replace(/,\s*/g, ',').split(',');

        for (var i = 0;  i < 3;  i++)
            iArgs[i] = toHexInt(iArgs[i], 2);
        return iArgs.join('');
    }

    $.extend(CSSStyleDeclaration.prototype, {
        getPropertyValue:    function (iName) {
            var iScale = 1;

            switch (iName) {
                case 'opacity':    {
                    iName = 'filter';
                    iScale = 100;
                }
            }
            var iStyle = this[ iName.toCamelCase() ];
            var iNumber = parseFloat(iStyle);

            return  isNaN(iNumber) ? iStyle : (iNumber / iScale);
        },
        setPropertyValue:    function (iName, iValue) {
            this[this.length++] = iName;

            var iString = '',  iWrapper,  iScale = 1,  iConvert;
            if (typeof iValue == 'string')
                var iRGBA = iValue.match(/\s*rgba\(([^\)]+),\s*(\d\.\d+)\)/i);

            if (iName == 'opacity') {
                iName = 'filter';
                iWrapper = 'progid:DXImageTransform.Microsoft.Alpha(opacity={n})';
                iScale = 100;
            } else if (iRGBA) {
                iString = iValue.replace(iRGBA[0], '');
                if (iString)
                    iString += arguments.callee.call(this, arguments[0], iName, iString);
                if (iName != 'background')
                    iString += arguments.callee.call(
                        this,
                        arguments[0],
                        (iName.indexOf('-color') > -1) ? iName : (iName + '-color'),
                        'rgb(' + iRGBA[1] + ')'
                    );
                iName = 'filter';
                iWrapper = 'progid:DXImageTransform.Microsoft.Gradient(startColorStr=#{n},endColorStr=#{n})';
                iConvert = function (iAlpha, iRGB) {
                    return  toHexInt(parseFloat(iAlpha) * 256, 2) + RGB_Hex(iRGB);
                };
            }
            if (iWrapper)
                iValue = iWrapper.replace(/\{n\}/g,  iConvert ?
                      iConvert(iRGBA[2], iRGBA[1]) :
                      (iValue * iScale)
                );

            this[ this[this.length - 1].toCamelCase() ] = iValue + (arguments[2] ? ' !important' : '');

            if (this.ownerNode)
                this.ownerNode.style.setAttribute(iName,  iValue,  arguments[2] && 'important');
            else
                return  [iString, ";\n", iName, ':', Code_Indent, iValue].join('');
        }
    });

    BOM.getComputedStyle = function () {
        return  new CSSStyleDeclaration(arguments[0]);
    };


    /* ----- Event Object ----- */
    BOM.HTMLEvents = function (iEvent) {
        $.extend(this, DOM.createEventObject());

        if (! iEvent)  return;

        $.extend(this, {
            type:               iEvent.type,
            target:             iEvent.srcElement,
            which:              (iEvent.type && (iEvent.type.slice(0, 3) == 'key'))  ?
                iEvent.keyCode  :  [0, 1, 3, 0, 2, 0, 0, 0][iEvent.button],
            relatedTarget:      ({
                mouseover:     iEvent.fromElement,
                mouseout:      iEvent.toElement,
                mouseenter:    iEvent.fromElement || iEvent.toElement,
                mouseleave:    iEvent.toElement || iEvent.fromElement
            })[iEvent.type],
            bubbles:            true,
            eventPhase:         3,
            view:               BOM,
            isTrusted:          false,
            propertyName:       iEvent.propertyName
        });
    };

    $.extend(BOM.HTMLEvents.prototype, {
        initEvent:          function () {
            $.extend(this, {
                type:          arguments[0],
                bubbles:       !! arguments[1],
                cancelable:    !! arguments[2]
            });
        },
        preventDefault:     function () {
            BOM.event.returnValue = false;
            this.defaultPrevented = true;
        },
        stopPropagation:    function () {
            BOM.event.cancelBubble = true;
        }
    });

    BOM.CustomEvent = function () {
        BOM.HTMLEvents.call(this, arguments[0]);
    };
    BOM.CustomEvent.prototype = new BOM.HTMLEvents();
    BOM.CustomEvent.prototype.initCustomEvent = function () {
        $.extend(this, {
            type:          arguments[0],
            bubbles:       !! arguments[1],
            cancelable:    !! arguments[2],
            detail:        arguments[3] || 0
        });
    };

    DOM.createEvent = function () {
        return  new BOM[arguments[0]]();
    };

    function IE_Event_Type(iType) {
        if (
            ((BOM !== BOM.top)  &&  (iType == 'DOMContentLoaded'))  ||
            ((iType == 'load')  &&  ($.type(this) != 'Window'))
        )
            return 'onreadystatechange';

        iType = 'on' + iType;

        if (! (iType in this.constructor.prototype))
            return 'onpropertychange';

        return iType;
    }

    function IE_Event_DOM() {
        return  $(
            ((arguments[0] == 'onpropertychange')  &&  ($.type(this) == 'Document'))  ?
                this.documentElement  :  this
        );
    }

    function IE_Event_Handler(iElement, iCallback) {
        return  function () {
                var iEvent = new HTMLEvents(BOM.event),  Loaded;
                iEvent.currentTarget = iElement;

                switch (iEvent.type) {
                    case 'readystatechange':    iEvent.type = 'load';
//                      Loaded = iElement.readyState.match(/loaded|complete/);  break;
                    case 'load':
                        Loaded = (iElement.readyState == 'loaded');  break;
                    case 'propertychange':      {
                        var iType = iEvent.propertyName.match(/^on(.+)/i);
                        if (iType  &&  (IE_Event_Type(iType[1]) == 'onpropertychange'))
                            iEvent.type = iType[1];
                        else {
                            iEvent.type = 'DOMAttrModified';
                            iEvent.attrName = iEvent.propertyName;
                        }
                    }
                    default:                    Loaded = true;
                }
                if (Loaded  &&  (typeof iCallback == 'function'))
                    iCallback.call(iElement, iEvent);
            };
    }

    var IE_Event_Method = {
            addEventListener:       function (iType, iCallback) {
                iType = IE_Event_Type.call(this, iType);
                var $_This = IE_Event_DOM.call(this, iType);

                var _Handler_ = IE_Event_Handler(this, iCallback);

                $_This.data('ie-handler',  function () {
                    var iHandler = arguments[1] || {
                            user:     [ ],
                            proxy:    [ ]
                        };
                    iHandler.user.push(iCallback);
                    iHandler.proxy.push(_Handler_);
                    this.attachEvent(iType, _Handler_);

                    return iHandler;
                });
            },
            removeEventListener:    function (iType, iCallback) {
                iType = IE_Event_Type.call(this, iType);

                IE_Event_DOM.call(this, iType).data('ie-handler',  function () {
                    var iHandler = arguments[1];
                    var _Index_ = iHandler.user.indexOf(iCallback);

                    iHandler.user[_Index_] = null;
                    this.detachEvent(iType,  iHandler.proxy.splice(_Index_, 1, null)[0]);

                    return iHandler;
                });
            },
            dispatchEvent:          function (iEvent) {
                var _Type_ = IE_Event_Type.call(this, iEvent.type);
                var $_This = IE_Event_DOM.call(this, _Type_);

                var iOffset = $_This.offset();
                $.extend(iEvent, {
                    clientX:    iOffset.left,
                    clientY:    iOffset.top
                });

                if (_Type_ != 'onpropertychange')
                    this.fireEvent(_Type_, iEvent);
                else
                    $_This[0]['on' + iEvent.type] = $.now();
            }
        };

    $.extend(Element.prototype, IE_Event_Method);
    $.extend(DOM, IE_Event_Method);
    $.extend(BOM, IE_Event_Method);

    var $_DOM = $(DOM);

    //  DOM Content Loading
    if (BOM === BOM.top)
        $.every(0.01, function () {
            try {
                DOM.documentElement.doScroll('left');
                $_DOM.trigger('DOMContentLoaded');
                return false;
            } catch (iError) {
                return;
            }
        });
    //  Patch for Change Event
    $_DOM.on('click',  'input[type="radio"], input[type="checkbox"]',  function () {
        this.blur();
        this.focus();
    });


    /* ----- DOM Selection ----- */
    function Selection(_DOM_) {
        this._origin_ = _DOM_.selection;

        this.type = this.getRangeAt().text ? 'Range' : 'Caret';
        this.isCollapsed = true;
        this.rangeCount = 1;

        this.anchorNode = _DOM_.activeElement;
        this.anchorOffset = 0;
        this.focusNode = _DOM_.activeElement;
        this.focusOffset = 0;
    }

    $.extend(Selection.prototype, {
        getRangeAt:            function () {
            return  this._origin_.createRange();
        },
        toString:              function () {
            return  this.getRangeAt().text;
        },
        deleteFromDocument:    function () {
            if (this.type == 'Range')  this.focusNode.innerText = '';
        }
    });

    BOM.getSelection = DOM.getSelection = function () {
        return  new Selection(this.document || this);
    };


    /* ----- XML DOM Parser ----- */
    var IE_DOMParser = (function (MS_Version) {
            for (var i = 0; i < MS_Version.length; i++)  try {
                new ActiveXObject( MS_Version[i] );
                return MS_Version[i];
            } catch (iError) { }
        })([
            'MSXML2.DOMDocument.6.0',
            'MSXML2.DOMDocument.5.0',
            'MSXML2.DOMDocument.4.0',
            'MSXML2.DOMDocument.3.0',
            'MSXML2.DOMDocument',
            'Microsoft.XMLDOM'
        ]);

    function XML_Create() {
        var iXML = new ActiveXObject(IE_DOMParser);
        iXML.async = false;
        iXML.loadXML(arguments[0]);
        return iXML;
    }

    BOM.DOMParser = function () { };

    BOM.DOMParser.prototype.parseFromString = function () {
        var iXML = XML_Create(arguments[0]);

        if (iXML.parseError.errorCode)
            iXML = XML_Create([
                '<xml><parsererror><h3>This page contains the following errors:</h3><div>',
                iXML.parseError.reason,
                '</div></parsererror></xml>'
            ].join(''));

        return iXML;
    };

})(self, self.document, self.iQuery);



/* ---------- Complex Events ---------- */
(function (BOM, DOM, $) {

    /* ----- DOM Ready ----- */
    var $_DOM = $(DOM);
    $.start('DOM_Ready');

    function DOM_Ready_Event() {
        if (DOM.isReady || (
            (this !== DOM)  &&  (
                (DOM.readyState != 'complete')  ||  (! DOM.body.lastChild)
            )
        ))
            return;

        DOM.isReady = true;
        BOM.clearTimeout( $_DOM.data('Ready_Timer') );
        $_DOM.data('Load_During', $.end('DOM_Ready'))
            .data('Ready_Event', arguments[0]);
        console.info('[DOM Ready Event]');
        console.log(this, arguments);

        $_DOM.trigger('ready');

        return false;
    }

    $_DOM.data('Ready_Timer',  $.every(0.5, DOM_Ready_Event));
    $_DOM.one('DOMContentLoaded', DOM_Ready_Event);
    $(BOM).one('load', DOM_Ready_Event);

    $.fn.ready = function (iCallback) {
        if ($.type(this[0]) != 'Document')
            throw 'The Ready Method is only used for Document Object !';

        if (! DOM.isReady)
            $_DOM.one('ready', iCallback);
        else
            iCallback.call(this[0],  $.data(DOM, 'Ready_Event'));

        return this;
    };

    /* ----- Mouse Hover ----- */
    var _Float_ = {
            absolute:    true,
            fixed:       true
        };

    $.fn.hover = function (iEnter, iLeave) {
        return  this.bind('mouseover', function () {
                if (
                    $.contains(this, arguments[0].relatedTarget) ||
                    ($(arguments[0].target).css('position') in _Float_)
                )
                    return false;
                iEnter.apply(this, arguments);
            }).bind('mouseout', function () {
                if (
                    $.contains(this, arguments[0].relatedTarget) ||
                    ($(arguments[0].target).css('position') in _Float_)
                )
                    return false;
                (iLeave || iEnter).apply(this, arguments);
            });
    };

    /* ----- Single Finger Touch ----- */
    function get_Touch(iEvent) {
        if (! iEvent.timeStamp)
            iEvent.timeStamp = $.now();

        if (! $.browser.mobile)  return iEvent;

        try {
            return iEvent.changedTouches[0];
        } catch (iError) {
            return iEvent.touches[0];
        }
    }

    var Touch_Data;

    $_DOM.bind(
        $.browser.mobile ? 'touchstart MSPointerDown' : 'mousedown',
        function (iEvent) {
            var iTouch = get_Touch(iEvent);

            Touch_Data = {
                pX:      iTouch.pageX,
                pY:      iTouch.pageY,
                time:    iEvent.timeStamp
            };
        }
    ).bind(
        $.browser.mobile ? 'touchend touchcancel MSPointerUp' : 'mouseup',
        function (iEvent) {
            if (! Touch_Data)  return;

            var iTouch = get_Touch(iEvent);

            var swipeLeft = Touch_Data.pX - iTouch.pageX,
                swipeTop = Touch_Data.pY - iTouch.pageY,
                iTime = iEvent.timeStamp - Touch_Data.time;

            var iShift = Math.sqrt(
                    Math.pow(swipeLeft, 2)  +  Math.pow(swipeTop, 2)
                );

            $(iEvent.target).trigger((iShift < 22)  ?
                ((iTime > 300) ? 'press' : 'tap')  :  {
                    type:      'swipe',
                    pageX:     swipeLeft,
                    pageY:     swipeTop,
                    detail:    iShift
                }
            );
        }
    );
    /* ----- Text Input Event ----- */

    function TypeBack(iHandler, iEvent, iKey) {
        if (false !== iHandler.call(
            iEvent.target,  iEvent,  this[iKey]
        ))
            return;

        var iValue = this[iKey].split('');
        iValue.splice(
            BOM.getSelection().getRangeAt(0).startOffset - 1,  1
        );
        this[iKey] = iValue.join('');
    }

    $.fn.input = function (iHandler) {
        this.filter('input, textarea').on(
            $.browser.modern ? 'input' : 'propertychange',
            function (iEvent) {
                if ((! $.browser.modern)  &&  (iEvent.propertyName != 'value'))
                    return;

                TypeBack.call(this, iHandler, iEvent, 'value');
            }
        );

        this.not('input, textarea').on('paste',  function (iEvent) {

            return  iHandler.call(
                iEvent.target,
                iEvent,
                ($.browser.modern ? iEvent : BOM).clipboardData.getData(
                    $.browser.modern ? 'text/plain' : 'text'
                )
            );
        }).keyup(function (iEvent) {

            var iKey = iEvent.which;

            if (
                (iKey < 48)  ||  (iKey > 105)  ||
                ((iKey > 90)  &&  (iKey < 96))
            )
                return;

            if (iEvent.ctrlKey || iEvent.shiftKey || iEvent.altKey)
                return;

            TypeBack.call(iEvent.target, iHandler, iEvent, 'innerText');
        });

        return this;
    };

    /* ----- Cross Page Event ----- */

    function CrossPageEvent(iType, iSource) {
        if (typeof iType == 'string') {
            this.type = iType;
            this.target = iSource;
        } else
            $.extend(this, iType);

        if (! (iSource instanceof Element))  return;

        $.extend(this,  $.map(iSource.dataset,  function (iValue) {
            if (typeof iValue == 'string')  try {
                return  $.parseJSON(iValue);
            } catch (iError) { }

            return iValue;
        }));
    }

    CrossPageEvent.prototype.valueOf = function () {
        var iValue = $.extend({ }, this);

        delete iValue.data;
        delete iValue.target;
        delete iValue.valueOf;

        return iValue;
    };

    var $_BOM = $(BOM);

    $.fn.onReply = function (iType, iData, iCallback) {
        var iTarget = this[0],  $_Source;

        if ((iTarget === BOM)  ||  ($.type(iTarget) != 'Window'))
            return this;

        if (arguments.length == 4) {
            $_Source = $(iData);
            iData = iCallback;
            iCallback = arguments[3];
        }

        var _Event_ = new CrossPageEvent(iType,  ($_Source || { })[0]);

        $_BOM.on('message',  function (iEvent) {
            var iReturn = new CrossPageEvent(iEvent.data);

            if (
                (iEvent.source === iTarget)  &&
                (iReturn.type == iType)  &&
                $.isEqual(iReturn, _Event_)
            ) {
                iCallback.call($_Source ? $_Source[0] : this,  iReturn);
                $_BOM.off('message', arguments.callee);
            }
        });

        iTarget.postMessage(
            $.extend({data: iData},  _Event_.valueOf()),  '*'
        );
    };

    /* ----- Mouse Wheel Event ----- */

    if (! $.browser.ff)  return;

    $_DOM.on('DOMMouseScroll',  function (iEvent) {
        $(iEvent.target).trigger({
            type:          'mousewheel',
            wheelDelta:    -iEvent.detail * 40
        });
    });

})(self, self.document, self.iQuery);



/* ---------- DOM/CSS Animation ---------- */
(function ($) {

    var FPS = 20;

    function KeyFrame(iStart, iEnd, During_Second) {
        During_Second = Number(During_Second) || 1;

        var iKF = [ ],  KF_Sum = FPS * During_Second;
        var iStep = (iEnd - iStart) / KF_Sum;

        for (var i = 0, KFV = iStart; i < KF_Sum; i++) {
            KFV += iStep;
            iKF.push(Number( KFV.toFixed(2) ));
        }
        return iKF;
    }

    $.fn.animate = function (CSS_Final, During_Second) {
        var $_This = this;

        $_This.data('_animate_', 1);

        $.each(CSS_Final,  function (iName) {
            var iKeyFrame = KeyFrame($_This.css(iName), this, During_Second);

            $.every(1 / FPS,  function () {
                if ($_This.data('_animate_') && iKeyFrame.length)
                    $_This.css(iName, iKeyFrame.shift());
                else {
                    iKeyFrame = null;
                    return false;
                }
            });
        });

        return $_This;
    };

    $.fx = {interval:  1000 / FPS};

    /* ----- CSS 3 Animation ----- */
    $('head script').eq(0).before(
        $('<link />', {
            rel:     'stylesheet',
            type:    'text/css',
            href:    'http://cdn.bootcss.com/animate.css/3.3.0/animate.min.css'
        })
    );

    var Animate_End = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

    $.fn.cssAnimate = function (iType) {
        var _Args_ = $.makeArray(arguments).slice(1);

        var iDuring = (! isNaN(parseFloat(_Args_[0]))) && _Args_.shift();
        var iCallback = (typeof _Args_[0] == 'function') && _Args_.shift();
        var iLoop = _Args_[0];

        var iClass = 'animated ' + iType + (iLoop ? ' infinite' : '');

        this.one(Animate_End,  function () {
            $(this).removeClass(iClass);

            if (iCallback)
                iCallback.apply(this, arguments);
        });

        if (iDuring) {
            iDuring = (iDuring / 1000) + 's';
            this.cssRule({
                ' ': {
                       '-moz-animation-duration':    iDuring,
                    '-webkit-animation-duration':    iDuring,
                         '-o-animation-duration':    iDuring,
                        '-ms-animation-duration':    iDuring,
                            'animation-duration':    iDuring,
                }
            });
        }

        return  this.removeClass('animated').addClass(iClass);
    };

    /* ----- Animation ShortCut ----- */
    var CSS_Animation = [
            'fadeIn', 'fadeOut'
        ];

    function iAnimate(iType) {
        return  function (iCallback, iDuring, iLoop) {
                return  this.cssAnimate(iType, iCallback, iDuring, iLoop);
            };
    }

    for (var i = 0;  i < CSS_Animation.length;  i++)
        $.fn[ CSS_Animation[i] ] = iAnimate( CSS_Animation[i] );

    $.fn.stop = function () {
        return  this.data('_animate_', 0).removeClass('animated');
    };

})(self.iQuery);



/* ---------- HTTP Client ---------- */
(function (BOM, DOM, $) {

    /* ----- XML HTTP Request ----- */
    function X_Domain(Target_URL) {
        var iPort = BOM.location.port || (
                (BOM.location.protocol == 'http:')  &&  80
            ) || (
                (BOM.location.protocol == 'https:')  &&  443
            );
        Target_URL = Target_URL.match(/^(\w+?(s)?:)?\/\/([\w\d:]+@)?([^\/\:\@]+)(:(\d+))?/);

        if (! Target_URL)  return false;
        return (
            (Target_URL[1]  &&  (Target_URL[1] != BOM.location.protocol))  ||
            (Target_URL[4]  &&  (Target_URL[4] != BOM.location.hostname))  ||
            (Target_URL[6]  &&  (Target_URL[6] != iPort))
        );
    }

    function XD_Request(iData) {
        this.withCredentials = true;

        if (typeof iData == 'string')
            this.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        if (! this.crossDomain) {
            this.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            this.setRequestHeader('Accept', '*/*');
        }
        this.send(iData);

        return this;
    }

    var XHR_Extension = {
            timeOut:        function (iSecond, iCallback) {
                var iXHR = this;

                $.wait(iSecond, function () {
                    iXHR[
                        (iXHR.$_DOM || iXHR.crossDomain)  ?  'onload'  :  'onreadystatechange'
                    ] = null;
                    iXHR.abort();
                    iCallback.call(iXHR);
                    iXHR = null;
                });
            },
            responseAny:    function () {
                var iContent = this.responseText,
                    iType = this.responseType || 'text/plain';

                switch ( iType.split('/')[1] ) {
                    case 'plain':    ;
                    case 'json':     {
                        var _Content_ = iContent.trim();
                        try {
                            iContent = $.parseJSON(_Content_);
                            this.responseType = 'application/json';
                        } catch (iError) {
                            if ($.browser.msie != 9)  try {
                                if (! $.browser.ff)
                                    iContent = $.parseXML(_Content_);
                                else if (this.responseXML)
                                    iContent = this.responseXML;
                                else
                                    break;
                                this.responseType = 'text/xml';
                            } catch (iError) { }
                        }
                        break;
                    }
                    case 'xml':      iContent = this.responseXML;
                }

                return iContent;
            },
            retry:          function (Wait_Seconds) {
                var iXHR = new this.constructor,
                    iData = this.requestData;
                iXHR.onready = this.onready;
                iXHR.open.apply(iXHR, this.requestArgs);

                $.wait(Wait_Seconds, function () {
                    XD_Request.call(iXHR, iData);
                });
            }
        };

    var XHR_Open = BOM.XMLHttpRequest.prototype.open,
        XHR_Send = BOM.XMLHttpRequest.prototype.send;

    $.extend(BOM.XMLHttpRequest.prototype, XHR_Extension, {
        open:           function () {
            this.crossDomain = X_Domain(arguments[1]);

            var iXHR = this;
            this[
                this.crossDomain ? 'onload' : 'onreadystatechange'
            ] = function () {
                if (! (iXHR.crossDomain || (iXHR.readyState == 4)))  return;

                if (typeof iXHR.onready == 'function')
                    iXHR.onready.call(iXHR, iXHR.responseAny(), 'complete', iXHR);
                iXHR = null;
            };
            XHR_Open.apply(this,  this.requestArgs = arguments);
        },
        send:    function () {
            XHR_Send.call(this,  this.requestData = arguments[0]);
        }
    });

    if ($.browser.msie < 10)
        BOM.XDomainRequest.prototype.setRequestHeader = function () {
            console.warn("IE 8/9 XDR doesn't support Changing HTTP Headers...");
        };

    /* ----- HTML DOM SandBox ----- */
    $.fn.sandBox = function () {
        var iArgs = $.makeArray(arguments);

        var iCallback = (typeof iArgs.slice(-1)[0] == 'function')  &&  iArgs.pop();
        var iHTML = $.isSelector(iArgs[0]) ? '' : iArgs.shift();
        var iSelector = iArgs[0];

        var $_iFrame = this.filter('iframe').eq(0);
        if (! $_iFrame.length)
            $_iFrame = $('<iframe style="display: none"></iframe>');

        $_iFrame.one('load',  function () {
            var _DOM_ = this.contentWindow.document;

            function Frame_Ready() {
                if (! (_DOM_.body && _DOM_.body.childNodes.length))
                    return;

                var $_Content = $(iSelector || 'body > *',  _DOM_);
                if (! $_Content.length)
                    $_Content = _DOM_.body.childNodes;

                if (
                    (typeof iCallback == 'function')  &&
                    (false === iCallback.call(
                        $_iFrame[0],  $('head style', _DOM_).add($_Content).clone(true)
                    ))
                )
                    $_iFrame.remove();

                return false;
            }

            if (! iHTML)  Frame_Ready();

            $.every(0.04, Frame_Ready);
            _DOM_.write(iHTML);
            _DOM_.close();

        }).attr('src',  ((! iHTML.match(/<.+?>/)) && iHTML.trim())  ||  'about:blank');

        return  $_iFrame[0].parentNode ? this : $_iFrame.appendTo(DOM.body);
    };

    /* ----- DOM HTTP Request ----- */
    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text/plain';
    };
    BOM.DOMHttpRequest.JSONP = { };

    $.extend(BOM.DOMHttpRequest.prototype, XHR_Extension, {
        open:                function (iMethod, iTarget) {
            this.method = iMethod.toUpperCase();

            //  <script />, JSONP
            if (this.method == 'GET') {
                this.responseURL = iTarget;
                return;
            }

            //  <iframe />
            var iDHR = this,  $_Form = $(iTarget);

            var $_Button = $_Form.find(':button').attr('disabled', true),
                iTarget = $_Form.attr('target');
            if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
                iTarget = $.uuid('iframe');
                $_Form.attr('target', iTarget);
            }

            $('iframe[name="' + iTarget + '"]').sandBox(function () {
                $(this).on('load',  function () {
                    $_Button.prop('disabled', false);

                    if (iDHR.readyState)  try {
                        var $_Content = $(this).contents();
                        iDHR.responseText = $_Content.find('body').text();
                        iDHR.status = 200;
                        iDHR.readyState = 4;
                        iDHR.onready.call(
                            $_Form[0],  iDHR.responseAny(),  $_Content,  iDHR
                        );
                    } catch (iError) { }
                });
            }).attr('name', iTarget);

            this.$_DOM = $_Form;
            this.requestArgs = arguments;
        },
        send:                function () {
            if (this.method == 'POST')
                this.$_DOM.submit();    //  <iframe />
            else {
                //  <script />, JSONP
                var iURL = this.responseURL.match(/([^\?=&]+\?|\?)?(\w.+)?/);
                if (! iURL)  throw 'Illegal URL !';

                var _UUID_ = $.uuid(),  iDHR = this;

                BOM.DOMHttpRequest.JSONP[_UUID_] = function () {
                    if (iDHR.readyState) {
                        iDHR.status = 200;
                        iDHR.readyState = 4;
                        iDHR.onready.call(iDHR, arguments[0], 'success', iDHR);
                    }
                    delete this[_UUID_];
                    iDHR.$_DOM.remove();
                };
                this.requestData = arguments[0];
                this.responseURL = iURL[1] + $.param(
                    $.extend({ }, arguments[0], $.paramJSON(
                        iURL[2].replace(/(\w+)=\?/,  '$1=DOMHttpRequest.JSONP.' + _UUID_)
                    ))
                );
                this.$_DOM = $('<script />', {src:  this.responseURL}).appendTo(DOM.head);
            }
            this.readyState = 1;
        },
        setRequestHeader:    function () {
            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        abort:               function () {
            this.readyState = 0;
        }
    });

    /* ----- HTTP Wraped Method ----- */
    function iHTTP(iMethod, iURL, iData, iCallback) {
        var iXHR = BOM[
                (X_Domain(iURL) && ($.browser.msie < 10))  ?  'XDomainRequest' : 'XMLHttpRequest'
            ];

        if ($.type(iData) == 'HTMLElement') {
            var $_Form = $(iData);
            iData = { };

            if ($_Form[0].tagName.toLowerCase() == 'form') {
                if (! $_Form.find('input[type="file"]').length)
                    iData = $_Form.serializeArray();
                else if (! ($.browser.msie < 10))
                    iData = new FormData($_Form[0]);
                else
                    iXHR = BOM.DOMHttpRequest;
            }
        }
        if ((iData instanceof Array)  ||  $.isPlainObject(iData))
            iData = $.param(iData);

        iXHR = new iXHR();
        iXHR.onready = iCallback;
        iXHR.open(
            iMethod,
            ((! iData) && $_Form)  ?  $_Form  :  iURL,
            true
        );
        return  XD_Request.call(iXHR, iData);
    }

    function Idempotent_Args(iURL) {
        iURL = iURL.split('?');
        iURL[1] = $.extend(
            iURL[1] ? $.paramJSON(iURL[1]) : { },  arguments[1]
        );

        var iPrefetch;
        $('link[rel="next"], link[rel="prefetch"]').each(function () {
            if ($.fileName(this.href) == $.fileName(iURL[0]))
                iPrefetch = true;
        });
        if (! iPrefetch)  iURL[1]._ = $.now();

        return  (iURL[0] + '?' + $.param(iURL[1])).trim('?');
    }

    $.extend({
        get:         function (iURL, iData, iCallback) {
            if (typeof iData == 'function') {
                iCallback = iData;
                iData = { };
            }
            //  XHR
            if (! iURL.match(/\w+=\?/))
                return  iHTTP('GET',  Idempotent_Args(iURL, iData),  null,  iCallback);

            //  JSONP
            var iDHR = new BOM.DOMHttpRequest();
            iDHR.open('GET', iURL);
            iDHR.onready = iCallback;
            return iDHR.send(iData);
        },
        post:        function () {
            var iArgs = $.makeArray(arguments);
            iArgs.unshift('POST');

            return  iHTTP.apply(BOM, iArgs);
        },
        'delete':    function (iURL, iData, iCallback) {
            if (typeof iData == 'function') {
                iCallback = iData;
                iData = { };
            }
            return  iHTTP('DELETE',  Idempotent_Args(iURL, iData),  null,  iCallback);
        },
        put:         function () {
            var iArgs = $.makeArray(arguments);
            iArgs.unshift('PUT');

            return  iHTTP.apply(BOM, iArgs);
        }
    });

    $.getJSON = $.get;

    /* ----- Smart HTML Loading ----- */
    $.fn.load = function (iURL, iData, iCallback) {
        if (! this.length)  return this;

        var $_This = this;

        iURL = $.split(iURL.trim(), /\s+/, 2, ' ');
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }
        function Append_Back() {
            $_This.children().fadeOut();
            $(arguments[0]).appendTo( $_This.empty() ).fadeIn();

            if (typeof iCallback == 'function')
                for (var i = 0;  i < $_This.length;  i++)
                    iCallback.apply($_This[i], arguments);
        }
        function Load_Back(iHTML) {
            if (typeof iHTML != 'string')  return;

            if (! iHTML.match(/<\s*(html|head|body)(\s|>)/i)) {
                Append_Back.apply(this, arguments);
                return;
            }

            var _Context_ = [this, $.makeArray(arguments)];

            $(DOM.body).sandBox(iHTML,  iURL[1],  function ($_innerDOM) {
                _Context_[1].splice(0, 1, $_innerDOM);

                Append_Back.apply(_Context_[0], _Context_[1]);

                $(this).remove();
            });
        }
        if (! iData)
            $.get(iURL[0], Load_Back);
        else
            $.post(iURL[0], iData, Load_Back);

        return this;
    };

    /* ----- Form Element AJAX Submit ----- */
    $.fn.ajaxSubmit = function (iCallback) {
        if (! this.length)  return this;

        var $_Form = (
                (this[0].tagName.toLowerCase() == 'form') ?
                    this : this.find('form')
            ).eq(0);
        if (! $_Form.length)  return this;

        var $_Button = $_Form.find(':button').attr('disabled', true);

        function AJAX_Ready() {
            $_Button.prop('disabled', false);
            iCallback.call($_Form[0], arguments[0]);
        }

        $_Form.on('submit',  function (iEvent) {
            iEvent.preventDefault();
            iEvent.stopPropagation();
            $_Button.attr('disabled', true);

            var iMethod = ($_Form.attr('method') || 'Get').toLowerCase();

            if ( this.checkValidity() )  switch (iMethod) {
                case 'post':      ;
                case 'put':
                    $[iMethod](this.action, this, AJAX_Ready);    break;
                case 'get':       ;
                case 'delete':
                    $[iMethod](
                        this.action  +
                            (this.action.match(/\w+=[^&]+/) ? '&' : '')  +
                            $.param( $_Form.serializeArray() ),
                        AJAX_Ready
                    );
            } else
                $_Button.prop('disabled', false);
        });
        $_Button.prop('disabled', false);

        return this;
    };

})(self, self.document, self.iQuery);



/* ---------- W3C HTML 5  Shim ---------- */
(function (BOM, DOM, $) {

    if (! ($.browser.msie < 11))  return;


    /* ----- Element Data Set ----- */

    function DOMStringMap(iElement) {
        for (var i = 0, iAttr;  i < iElement.attributes.length;  i++) {
            iAttr = iElement.attributes[i];
            if (iAttr.nodeName.slice(0, 5) == 'data-')
                this[ iAttr.nodeName.toCamelCase() ] = iAttr.nodeValue;
        }
    }

    Object.defineProperty(Element.prototype, 'dataset', {
        get:    function () {
            return  new DOMStringMap(this);
        },
        set:    function () { }
    });


    if (! ($.browser.msie < 10))  return;

    /* ----- Error Useful Information ----- */

    //  Thanks "Kevin Yang" ---
    //
    //      http://www.imkevinyang.com/2010/01/%E8%A7%A3%E6%9E%90ie%E4%B8%AD%E7%9A%84javascript-error%E5%AF%B9%E8%B1%A1.html

    Error.prototype.valueOf = function () {
        return  $.extend(this, {
            code:       this.number & 0x0FFFF,
            helpURL:    'https://msdn.microsoft.com/en-us/library/1dk3k160(VS.85).aspx'
        });
    };

    /* ----- DOM Class List ----- */

    function DOMTokenList() {
        var iClass = arguments[0].getAttribute('class').trim().split(/\s+/);

        $.extend(this, iClass);

        this.length = iClass.length;
    }

    DOMTokenList.prototype.contains = function (iClass) {
        if (iClass.match(/\s+/))
            throw  new DOMException([
                "Failed to execute 'contains' on 'DOMTokenList': The token provided (",
                iClass,
                ") contains HTML space characters, which are not valid in tokens."
            ].join("'"));

        return  (Array.prototype.indexOf.call(this, iClass) > -1);
    };

    Object.defineProperty(Element.prototype, 'classList', {
        get:    function () {
            return  new DOMTokenList(this);
        },
        set:    function () { }
    });

    /* ----- History API ----- */

    var _State_ = [[null, DOM.title, DOM.URL]],
        _Pushing_ = false,
        $_BOM = $(BOM);

    BOM.history.pushState = function (iState, iTitle, iURL) {
        for (var iKey in iState)
            if (! $.isData(iState[iKey]))
                throw ReferenceError("The History State can't be Complex Object !");

        if (typeof iTitle != 'string')
            throw TypeError("The History State needs a Title String !");

        DOM.title = iTitle;
        _Pushing_ = true;
        BOM.location.hash = '_' + (_State_.push(arguments) - 1);
    };

    BOM.history.replaceState = function () {
        _State_ = [ ];
        this.pushState.apply(this, arguments);
    };

    $_BOM.on('hashchange',  function () {
        if (_Pushing_) {
            _Pushing_ = false;
            return;
        }

        var iState = _State_[ BOM.location.hash.slice(2) ];
        if (! iState)  return;

        BOM.history.state = iState[0];
        DOM.title = iState[1];

        $_BOM.trigger({
            type:     'popstate',
            state:    iState[0]
        });
    });

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    if (! (($.browser.msie < 10)  ||  $.browser.ios))
        return;

    /* ----- Form API ----- */

    function Value_Check() {
        var $_This = $(this);

        if ((typeof $_This.attr('required') == 'string')  &&  (! this.value))
            return false;

        var iRegEx = $_This.attr('pattern');
        if (iRegEx)  try {
            return  RegExp(iRegEx).test(this.value);
        } catch (iError) { }

        if ((this.tagName.toLowerCase() == 'input')  &&  (this.type == 'number')) {
            var iNumber = Number(this.value),
                iMin = Number( $_This.attr('min') );
            if (
                isNaN(iNumber)  ||
                (iNumber < iMin)  ||
                (iNumber > Number( $_This.attr('max') ))  ||
                ((iNumber - iMin)  %  Number( $_This.attr('step') ))
            )
                return false;
        }

        return true;
    }

    HTMLInputElement.prototype.checkValidity = Value_Check;
    HTMLSelectElement.prototype.checkValidity = Value_Check;
    HTMLTextAreaElement.prototype.checkValidity = Value_Check;

    HTMLFormElement.prototype.checkValidity = function () {
        var $_Input = $('*[name]:input', this);

        for (var i = 0;  i < $_Input.length;  i++)
            if (! $_Input[i].checkValidity())
                return false;
        return true;
    };

})(self, self.document, self.iQuery);



/* ---------- DOM 遮罩层  v0.2 ---------- */
(function (BOM, DOM, $) {

    $(DOM).ready(function () {
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
    });
    var _Instance_ = [ ];

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

})(self, self.document, self.iQuery);



/* ---------- DOM/BOM 模态框  v0.4 ---------- */
(function (BOM, DOM, $) {

    var $_BOM = $(BOM),  $_DOM = $(DOM);

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
            'resizable=no,menubar=no,toolbar=no,location=no,status=no,scrollbars=no'
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

})(self, self.document, self.iQuery);


//
//                >>>  EasyImport.js  <<<
//
//
//      [Version]    v1.2  (2015-9-22)  Stable
//
//      [Usage]      A Asynchronous & Responsive Loader
//                   for Resource File in Web Browser.
//
//
//              (C)2013-2015    SCU FYclub-RDD
//


(function (BOM, DOM, $) {

    var UA = BOM.navigator.userAgent,
        $_Head = $('head').append(
            $('<meta />', {
                'http-equiv':    'Window-Target',
                content:         '_top'
            })
        ),
        $_Title = $('head title');


/* ----------- Standard Mode Meta Patches ----------- */

    if ($.browser.mobile) {
        if ($.browser.modern) {
            var is_WeChat = UA.match(/MicroMessenger/i),
                is_UCWeb = UA.match(/UCBrowser|UCWeb/i);
            $_Title.before(
                $('<meta />', {
                    name:       "viewport",
                    content:    [
                        'width' + '=' + (
                            ($.browser.mobile && (is_WeChat || is_UCWeb))  ?  320  :  'device-width'
                        ),
                        'initial-scale=1.0',
                        'minimum-scale=1.0',
                        'maximum-scale=1.0',
                        'user-scalable=no',
                        'target-densitydpi=medium-dpi'
                    ].join(',')
                })
            );
        } else
            $_Title.before(
                $('<meta />', {
                    name:       'MobileOptimized',
                    content:    320
                }).add(
                    $('<meta />', {
                        name:       'HandheldFriendly',
                        content:    'true'
                    })
                )
            );
    }
    if ($.browser.msie)
        $('<meta />', {
            'http-equiv':    'X-UA-Compatible',
            content:         'IE=Edge, Chrome=1'
        }).appendTo($_Head);


/* ---------- Loading Queue ---------- */

    var Root_Path = (function ($_Script) {
            for (var i = 0, iPath;  i < $_Script.length;  i++) {
                iPath = $_Script[i].src.match(
                    /(.+)[^\/]*EasyImport[^\/]*\.js[^\/]*$/i
                );
                if (iPath)  return iPath[1];
            }
        })( $('head > script') );

    function Queue_Filter(iList) {
        for (var i = 0, _Group_;  i < iList.length;  i++) {
            _Group_ = iList[i];

            if (typeof _Group_ == 'string') {
                iList[i] = { };
                iList[i][_Group_] = true;
            }
            if ($.isPlainObject( iList[i] )) {
                _Group_ = [ ];

                for (var iScript in iList[i])
                    if ( iList[i][iScript] )  _Group_.push(iScript);

                iList[i] = _Group_;
            }
            for (var j = 0;  j < _Group_.length;  j++)
                if (! _Group_[j].match(/^http(s)?:\/\//))
                    _Group_[j] = Root_Path + _Group_[j];
        }

        return iList;
    }

/* ---------- DOM Cache ---------- */

    var $_Script = $('<script />', {
            type:       'text/javascript',
            charset:    'UTF-8',
            'class':    'EasyImport'
        }),
        $_BOM = $(BOM),  $_DOM = $(DOM);


/* ---------- DOM Load-Engine ---------- */

    function DOM_Load(iOrder, iFinal) {
        if (! iOrder[0]) {
            iFinal();
            return;
        }

        var This_Call = arguments;

        if ((! iOrder[1]) && (this !== DOM)) {
            $_DOM.ready(function () {
                This_Call.callee.apply(this, This_Call);
            });
            return;
        }

        var This_Group = 0;

        function _Next_() {
            if ( iOrder[0][++This_Group] )  return;

            if (typeof this != 'function')
                $(this).data('Load_During',  $.end( $.fileName(this.src) ));

            iOrder.shift();
            This_Call.callee.apply(this, This_Call);
        }

        for (var i = 0, iScript;  (iOrder[0] && (i < iOrder[0].length));  i++) {
            iScript = iOrder[0][i];

            if (typeof iScript == 'function') {
                iScript();
                _Next_.call(iScript);
                continue;
            }
            $_Script.clone().one('load', _Next_).attr('src', iScript).appendTo($_Head);

            $.start( $.fileName(iScript) );
        }
    }
/* ----------- Open API ----------- */

    var Load_Times = 0,  Load_Cover;

    function Load_End() {
        if ( Load_Times++ )  return;

        var iTimer = $.browser.modern && (! $.browser.ios) && BOM.performance.timing;

        var Async_Time = (! iTimer) ? $.end('DOM_Ready') : (
                (iTimer.domContentLoadedEventEnd - iTimer.navigationStart) / 1000
            ),
            Sync_Time = $_DOM.data('Load_During');
        $('head > script.EasyImport').each(function () {
            Sync_Time += $(this).data('Load_During') || 0;
        });
        console.info([
            '[ EasyImport.js ]  Time Statistics',
            '  Async Sum:    ' + Async_Time.toFixed(3) + ' s',
            '  Sync Sum:     ' + Sync_Time.toFixed(3) + ' s',
            '  Saving:       ' + (
                ((Sync_Time - Async_Time) / Sync_Time) * 100
            ).toFixed(2) + ' %'
        ].join("\n\n"));

        Load_Cover.close();

        $(DOM.body).trigger('ScriptLoad');
    }

    BOM.ImportJS = function () {
        var Func_Args = $.makeArray(arguments),
            JS_List,  CallBack;

        Root_Path = (typeof Func_Args[0] == 'string') ?
            Func_Args.shift() : Root_Path;
        if (Func_Args[0] instanceof Array)
            JS_List = Func_Args.shift();
        else
            throw "Format of Importing List isn't currect !";
        CallBack = (typeof Func_Args[0] == 'function') ?
            Func_Args.shift() : null;


        var JS_Item = Queue_Filter(JS_List);
        if (CallBack)  JS_Item.push( [CallBack] );

        if (! JS_Item[0].length)  return;

        DOM_Load(JS_Item, Load_End);
    };

/* ----------- Practical Extension ----------- */

    $_DOM.ready(function () {
        Load_Cover = BOM.showModalDialog($('<h1>Loading...</h1>'), {
            ' ': {
                background:    'darkgray'
            },
            ' h1': {
                color:    'white'
            }
        });
        $('body > .Cover :header').cssAnimate('fadeIn', 2000, true);

    /* ----- Lazy Loading  v0.1 ----- */
        var VP_Height = $_BOM.height(),
            $_Lazy = $('img[data-src], iframe[data-src]');
        var Lazy_List = $.extend({ }, {
                length:    $_Lazy.length
            }),
            Load_List = [ ];

        $_Lazy.each(function () {
            var Off_Top = $(this).offset().top;

            var i = Math.round(
                    (Off_Top < VP_Height)  ?  0  :  (Off_Top - VP_Height)
                );
            for (;  i < Off_Top;  i++)
                if (! Lazy_List[i])
                    Lazy_List[i] = [this];
                else
                    Lazy_List[i].push(this);
        });

        $_BOM.scroll(function () {
            var iLazy = Lazy_List[ $_DOM.scrollTop() ];
            if (! iLazy)  return;

            for (var i = 0;  i < iLazy.length;  i++) {
                if ($.inArray(iLazy[i], Load_List) != -1)  continue;

                iLazy[i].src = iLazy[i].attributes['data-src'].nodeValue;
                Load_List.push( iLazy[i] );

                if (--Lazy_List.length == 0) {
                    $_BOM.unbind('scroll', arguments.callee);
                    Lazy_List = Load_List = null;
                }
            }
        });
    });
    /* ----- Remote Error Log  v0.2 ----- */

    //  Thanks "raphealguo" --- http://rapheal.sinaapp.com/2014/11/06/javascript-error-monitor/

    var Console_URL = $('head link[rel="console"]').attr('href');

    BOM.onerror = function (iMessage, iURL, iLine, iColumn, iError){
        if (! Console_URL)  return;

        $.wait(0,  function () {
            var iData = {
                    message:    iMessage,
                    url:        iURL,
                    line:       iLine,
                    column:     iColumn  ||  (BOM.event && BOM.event.errorCharacter)  ||  0
                };

            if (iError)  iData.stack = String(iError.stack || iError.stacktrace);

            $[iData.stack ? 'post' : 'get'](Console_URL, iData);
        });

        return true;
    };

})(self, self.document, self.iQuery);