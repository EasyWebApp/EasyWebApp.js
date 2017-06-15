//
//              >>>  jQueryKit  <<<
//
//
//    [Version]    v9.7  (2017-06-09)
//
//    [Require]    jQuery  v1.9+
//
//
//        (C)2014-2017  shiy2008@gmail.com
//


(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('jQueryKit', ['jquery'], arguments[0]);

})(function () {


(function (BOM, DOM) {

    /* ----- Object Patch ----- */

    if (! Object.keys)
        Object.keys = function (iObject) {
            var iKey = [ ];

            for (var _Key_ in iObject)
                if ( this.prototype.hasOwnProperty.call(iObject, _Key_) )
                    iKey.push(_Key_);

            return iKey;
        };

    Object.getPrototypeOf = Object.getPrototypeOf  ||  function (iObject) {

        return  (iObject != null)  &&  (
            iObject.constructor.prototype || iObject.__proto__
        );
    };

    Object.create = Object.create  ||  function (iProto, iProperty) {

        if (typeof iProto != 'object')
            throw TypeError('Object prototype may only be an Object or null');

        function iTemp() { }

        iTemp.prototype = iProto;

        var iObject = new iTemp();

        iObject.__proto__ = iProto;

        for (var iKey in iProperty)
            if (
                this.prototype.hasOwnProperty.call(iProperty, iKey)  &&
                (iProperty[iKey].value !== undefined)
            )
                iObject[iKey] = iProperty[iKey].value;

        return iObject;
    };

    /* ----- Number Patch ----- */

    Number.isInteger = Number.isInteger  ||  function (value) {

        return  (typeof value === 'number')  &&  isFinite( value )  &&
            (Math.floor(value) === value);
    };

    Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

    Number.MIN_SAFE_INTEGER = -Number.MAX_SAFE_INTEGER;

    Number.isSafeInteger = Number.isSafeInteger  ||  function (value) {

       return  this.isInteger( value )  &&  (
           Math.abs( value )  <=  this.MAX_SAFE_INTEGER
       );
    };

    /* ----- String Extension ----- */

    var _Trim_ = ''.trim;

    var Blank_Char = (! _Trim_)  &&  /(^\s*)|(\s*$)/g;

    String.prototype.trim = function (iChar) {
        if (! iChar)
            return  _Trim_  ?  _Trim_.call(this)  :  this.replace(Blank_Char, '');

        var iFrom = 0,  iTo;

        for (var i = 0;  iChar[i];  i++) {
            if ((! iFrom)  &&  (this[0] == iChar[i]))
                iFrom = 1;

            if ((! iTo)  &&  (this[this.length - 1] == iChar[i]))
                iTo = -1;

            if (iFrom && iTo)  break;
        }

        return  this.slice(iFrom, iTo);
    };

    String.prototype.repeat = String.prototype.repeat  ||  function (Times) {

        return  (new Array(Times + 1)).join(this);
    };

    /* ----- Array Patch ----- */

    function Array_push(value, mapCall, mapContext) {

        return Array.prototype.push.call(
            this,
            (mapCall instanceof Function)  ?
                mapCall.call(mapContext, value, this.length, this)  :  value
        );
    }

    Array.from = Array.from  ||  function (iterator) {

        var array, _This_;

        try {
            array = new this();
        } catch (error) {
            array = Object.create( this.prototype );
        }

        if (Number.isInteger( iterator.length )) {

            for (var i = 0;  i < iterator.length;  i++)
                Array_push.call(array, iterator[i], arguments[1], arguments[2]);

            return array;
        }

        if (iterator.next instanceof Function) {

            while ((_This_ = iterator.next()).done  ===  false)
                Array_push.call(array, _This_.value, arguments[1], arguments[2]);

            return array;
        }

        throw  TypeError('Cannot convert undefined or null to object');
    };

    Array.prototype.indexOf = Array.prototype.indexOf  ||  function () {

        for (var i = 0;  i < this.length;  i++)
            if (arguments[0] === this[i])
                return i;

        return -1;
    };

    Array.prototype.reduce = Array.prototype.reduce ||
        function (callback, value) {

            for (var i = 1;  i < this.length;  i++) {

                if (i == 1)  value = this[0];

                value = callback(value, this[i], i, this);
            }

            return value;
        };

    /* ----- Function Patch ----- */

    function FuncName() {
        return  (this.toString().trim().match(/^function\s+([^\(\s]*)/) || '')[1];
    }

    if (! ('name' in Function.prototype)) {

        if (DOM.documentMode > 8)
            Object.defineProperty(Function.prototype,  'name',  {get: FuncName});
        else
            Function.prototype.name = FuncName;
    }

    /* ----- Date Patch ----- */

    Date.now = Date.now  ||  function () { return  +(new Date()); };

})(self, self.document);



(function (BOM, DOM) {

    if (BOM.Promise instanceof Function)  return BOM.Promise;

/* ---------- Promise/A+ Core ---------- */

    function Promise() {

        this.__value__ = undefined;

        this.__state__ = -1;

        this.__callback__ = [ ];

        var _This_ = this;

        arguments[0](function () {

            _This_.resolve( arguments[0] );

        },  function () {

            _This_.reject( arguments[0] );
        });
    }

    var __Private__ = { };

    Promise.prototype.reject = function () {

        __Private__.endBy.call(this, 1, arguments[0]);
    };

    Promise.prototype.resolve = function (_Value_) {

        if (_Value_ == this)
            throw  TypeError("Can't return the same Promise object !");

        if (typeof (_Value_ || '').then != 'function')
            return  __Private__.endBy.call(this, 0, _Value_);

        var _This_ = this;

        _Value_.then(function () {

            _This_.resolve( arguments[0] );

        },  function () {

            _This_.reject( arguments[0] );
        });
    };

    __Private__.endBy = function (iState, iValue) {

        if (this.__state__ > -1)  return;

        var _This_ = this;

        setTimeout(function () {

            _This_.__value__ = iValue;

            _This_.__state__ = iState;

            __Private__.exec.call(_This_);
        });
    };

    __Private__.exec = function () {

        var _CB_;

        if (this.__state__ > -1)
            while (_CB_ = this.__callback__.shift())
                if (typeof _CB_[this.__state__]  ==  'function')  try {

                    _CB_[2]( _CB_[this.__state__]( this.__value__ ) );

                } catch (iError) {

                    _CB_[3]( iError );
                }
    };

    Promise.prototype.then = function (iResolve, iReject) {

        var _This_ = this;

        return  new Promise(function () {

            _This_.__callback__.push([
                iResolve,  iReject,  arguments[0],  arguments[1]
            ]);

            __Private__.exec.call(_This_);
        });
    };

/* ---------- ES 6  Promise Helper ---------- */

    Promise.resolve = function (iValue) {

        return  (iValue instanceof this)  ?  iValue  :  new this(function () {

            arguments[0]( iValue );
        });
    };

    Promise.reject = function (iError) {

        return  new this(function () {

            arguments[1]( iError );
        });
    };

    Promise.all = function (iQueue) {

        var iValue = [ ],  iSum = iQueue.length;

        return  iSum  ?  (new this(function (iResolve, iReject) {

            ' '.repeat( iSum ).replace(/ /g,  function (_, Index) {

                Promise.resolve( iQueue[Index] ).then(function () {

                    iValue[ Index ] = arguments[0];

                    if (! --iSum)  iResolve( iValue );

                },  iReject);
            });
        }))  :  this.resolve( iQueue );
    };

    Promise.race = function (iQueue) {

        return  new Promise(function () {

            for (var i = 0;  iQueue[i];  i++)
                Promise.resolve( iQueue[i] ).then(arguments[0], arguments[1]);
        });
    };

    return  BOM.Promise = Promise;

})(self, self.document);



(function (BOM, DOM, $) {

    var UA = BOM.navigator.userAgent;

    var is_Trident = UA.match(/MSIE (\d+)|Trident[^\)]+rv:(\d+)|Edge\/(\d+)\./i),
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

    $.browser = {
        msie:             IE_Ver,
        mozilla:          FF_Ver,
        webkit:           WK_Ver,
        modern:           !  (IE_Ver < 9),
        mobile:           !! is_Mobile,
        pad:              !! is_Pad,
        phone:            (!! is_Phone)  ||  (is_Mobile  &&  (! is_Pad)),
        ios:              is_iOS  ?  parseFloat( is_iOS[2].replace('_', '.') )  :  NaN,
        android:          is_Android ? parseFloat(is_Android[2]) : NaN,
        versionNumber:    IE_Ver || FF_Ver || WK_Ver
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    $.likeArray = function (iObject) {

        if ((! iObject)  ||  (typeof iObject != 'object'))
            return false;

        iObject = (typeof iObject.valueOf == 'function')  ?
            iObject.valueOf() : iObject;

        return Boolean(
            iObject  &&
            (typeof iObject.length == 'number')  &&
            (typeof iObject != 'string')
        );
    };

    $.makeSet = function () {

        var iArgs = arguments,  iValue = true,  iSet = { };

        if (this.likeArray( iArgs[1] )) {
            iValue = iArgs[0];
            iArgs = iArgs[1];
        } else if (this.likeArray( iArgs[0] )) {
            iValue = iArgs[1];
            iArgs = iArgs[0];
        }

        for (var i = 0;  i < iArgs.length;  i++)
            iSet[ iArgs[i] ] = (typeof iValue != 'function')  ?
                iValue  :  iValue( iArgs[i] );

        return iSet;
    };

    $.makeIterator = function (array) {

        var nextIndex = 0;

        return {
            next:    function () {

                return  (nextIndex >= array.length)  ?
                    {done: true}  :
                    {done: false,  value: array[nextIndex++]};
            }
        };
    };

    var DataType = $.makeSet('string', 'number', 'boolean');

    $.isData = function (iValue) {

        var iType = typeof iValue;

        return  Boolean(iValue)  ||  (iType in DataType)  ||  (
            (iValue !== null)  &&  (iType == 'object')  &&
            (typeof iValue.valueOf() in DataType)
        );
    };

    $.isEqual = function (iLeft, iRight, iDepth) {

        iDepth = iDepth || 1;

        if (!  (iLeft && iRight))
            return  (iLeft === iRight);

        iLeft = iLeft.valueOf();  iRight = iRight.valueOf();

        if ((typeof iLeft != 'object')  ||  (typeof iRight != 'object'))
            return  (iLeft === iRight);

        var Left_Key = Object.keys(iLeft),  Right_Key = Object.keys(iRight);

        if (Left_Key.length != Right_Key.length)  return false;

        Left_Key.sort();  Right_Key.sort();  --iDepth;

        for (var i = 0, _Key_;  i < Left_Key.length;  i++) {
            _Key_ = Left_Key[i];

            if (_Key_ != Right_Key[i])  return false;

            if (! iDepth) {
                if (iLeft[_Key_] !== iRight[_Key_])  return false;
            } else {
                if (! arguments.callee.call(
                    this, iLeft[_Key_], iRight[_Key_], iDepth
                ))
                    return false;
            }
        }
        return true;
    };

    $.trace = function (iObject, iName, iCount, iCallback) {

        if (iCount instanceof Function)  iCallback = iCount;

        iCount = parseInt( iCount );

        iCount = isNaN( iCount )  ?  Infinity  :  iCount;

        var iResult = [ ];

        for (
            var _Next_,  i = 0,  j = 0;
            iObject[iName]  &&  (j < iCount);
            iObject = _Next_,  i++
        ) {
            _Next_ = iObject[iName];
            if (
                (typeof iCallback != 'function')  ||
                (iCallback.call(_Next_, i, _Next_)  !==  false)
            )
                iResult[j++] = _Next_;
        }

        return iResult;
    };

    if ($.fn.iquery)  $.dir = $.trace;


    $.intersect = function () {

        if (arguments.length < 2)  return arguments[0];

        var iArgs = Array.from( arguments );

        var iArray = this.likeArray( iArgs[0] );

        iArgs[0] = this.map(iArgs.shift(),  function (iValue, iKey) {
            if ( iArray ) {
                if (iArgs.indexOf.call(iArgs[0], iValue)  >  -1)
                    return iValue;
            } else if (
                (iArgs[0][iKey] !== undefined)  &&
                (iArgs[0][iKey] === iValue)
            )
                return iValue;
        });

        return  arguments.callee.apply(this, iArgs);
    };

    $.inherit = function (iSup, iSub, iStatic, iProto) {

        for (var iKey in iSup)
            if (iSup.hasOwnProperty( iKey ))  iSub[iKey] = iSup[iKey];

        for (var iKey in iStatic)  iSub[iKey] = iStatic[iKey];

        iSub.prototype = $.extend(
            Object.create( iSup.prototype ),  iSub.prototype
        );
        iSub.prototype.constructor = iSub;

        for (var iKey in iProto)  iSub.prototype[iKey] = iProto[iKey];

        return iSub;
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    var WindowType = $.makeSet('Window', 'DOMWindow', 'Global');

    $.extend({
        Type:          function (iVar) {
            var iType;

            try {
                iType = Object.prototype.toString.call( iVar ).slice(8, -1);

                var iName = iVar.constructor.name;
                iName = (typeof iName == 'function')  ?
                    iName.call( iVar.constructor )  :  iName;

                if ((iType == 'Object')  &&  iName)  iType = iName;
            } catch (iError) {
                return 'Window';
            }

            if (! iVar)
                return  (isNaN(iVar)  &&  (iVar !== iVar))  ?  'NaN'  :  iType;

            if (WindowType[iType] || (
                (iVar == iVar.document) && (iVar.document != iVar)    //  IE 9- Hack
            ))
                return 'Window';

            if (iVar.location  &&  (iVar.location === (
                iVar.defaultView || iVar.parentWindow || { }
            ).location))
                return 'Document';

            if (
                iType.match(/HTML\w+?Element$/) ||
                (typeof iVar.tagName == 'string')
            )
                return 'HTMLElement';

            if ( this.likeArray(iVar) ) {
                iType = 'Array';
                if ($.browser.msie < 10)  try {
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
        },
        split:         function (iString, iSplit, iLimit, iJoin) {
            iString = iString.split(iSplit);
            if (iLimit) {
                iString[iLimit - 1] = iString.slice(iLimit - 1).join(
                    (typeof iJoin == 'string') ? iJoin : iSplit
                );
                iString.length = iLimit;
            }
            return iString;
        },
        hyphenCase:    function () {
            return  arguments[0].replace(/([a-z0-9])[\s_]?([A-Z])/g,  function () {
                return  arguments[1] + '-' + arguments[2].toLowerCase();
            });
        },
        byteLength:    function () {
            return arguments[0].replace(
                /[^\u0021-\u007e\uff61-\uffef]/g,  'xx'
            ).length;
        },
        leftPad:       function (iRaw, iLength, iPad) {
            iPad += '';

            if (! iPad) {
                if ($.isNumeric( iRaw ))
                    iPad = '0';
                else if (typeof iRaw == 'string')
                    iPad = ' ';
            }
            iRaw += '',  iLength *= 1;

            if (iRaw.length >= iLength)  return iRaw;

            return iPad.repeat(
                Math.ceil((iLength -= iRaw.length)  /  iPad.length)
            ).slice(-iLength) + iRaw;
        },
        curry:         function (iOrigin) {
            return  function iProxy() {
                return  (arguments.length >= iOrigin.length)  ?
                    iOrigin.apply(this, arguments)  :
                    $.proxy.apply($,  $.merge([iProxy, this],  arguments));
            };
        },
        isSelector:    function () {
            try {
                document.querySelector( arguments[0] );
            } catch (iError) {
                return false;
            }
            return true;
        },
        formatJSON:    function () {
            return  JSON.stringify(arguments[0], null, 4)
                .replace(/(\s+"[^"]+":) ([^\s]+)/g, '$1    $2');
        },
        cssPX:         RegExp([
            'width', 'height', 'padding', 'border-radius', 'margin',
            'top', 'right', 'bottom',  'left'
        ].join('|'))
    });

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- URL Search Parameter ---------- */

    function URLSearchParams() {

        this.length = 0;

        if (arguments[0] instanceof Array) {

            for (var i = 0;  arguments[i];  i++)
                this.append.apply(this, arguments[i]);

            return;
        }

        var _This_ = this;

        arguments[0].replace(/([^\?&=]+)=([^&]+)/g,  function (_, key, value) {

            _This_.append(key, value);
        });
    }

    var ArrayProto = Array.prototype;

    $.extend(URLSearchParams.prototype, {
        append:      function (key, value) {

            ArrayProto.push.call(this,  [key,  value + '']);
        },
        get:         function (key) {

            for (var i = 0;  this[i];  i++)
                if (this[i][0] === key)  return this[i][1];
        },
        getAll:      function (key) {

            return  $.map(this,  function (_This_) {

                if (_This_[0] === key)  return _This_[1];
            });
        },
        delete:      function (key) {

            for (var i = 0;  this[i];  i++)
                if (this[i][0] === key)  ArrayProto.splice.call(this, i, 1);
        },
        set:         function (key, value) {

            if (this.get( key )  != null)  this.delete( key );

            this.append(key, value);
        },
        toString:    function () {

            return  encodeURIComponent(Array.from(this,  function (_This_) {

                return  _This_[0] + '=' + _This_[1];

            }).join('&'));
        },
        entries:     function () {

            return  $.makeIterator( this );
        }
    });

    BOM.URLSearchParams = BOM.URLSearchParams || URLSearchParams;

    BOM.URLSearchParams.prototype.sort =
        BOM.URLSearchParams.prototype.sort  ||  function () {

            ArrayProto.sort.call(this,  function (A, B) {

                return  A[0].localeCompare( B[0] )  ||  A[1].localeCompare( B[1] );
            });
        };

/* ---------- URL Constructor ---------- */

    BOM.URL = BOM.URL || BOM.webkitURL;

    if (typeof BOM.URL != 'function')  return;


    function URL(path, base) {

        var absolute = arguments.length - 1;

        if (! arguments[ absolute ].match( /^\w+:\/\/.{2,}/ ))
            throw  new TypeError(
                "Failed to construct 'URL': Invalid " +
                (absolute ? 'base' : '')  +  ' URL'
            );

        var link = this.__data__ = DOM.createElement('a');

        link.href = base;

        link.href = link.origin + (
            (path[0] === '/')  ?  path  :  link.pathname.replace(/[^\/]+$/, path)
        );

        return  $.browser.modern ? this : link;
    }

    URL.prototype.toString = function () {  return this.href;  };

    $.each([
        BOM.location.constructor, BOM.HTMLAnchorElement, BOM.HTMLAreaElement
    ],  function () {

        Object.defineProperties(this.prototype, {
            origin:          function () {

                return  this.protocol + '//' + this.host;
            },
            searchParams:    function () {

                return  new URLSearchParams( this.search );
            }
        });
    });

    if ( $.browser.modern )
        $.each(BOM.location,  function (key) {

            if (typeof this != 'function')
                Object.defineProperty(URL.prototype, key, {
                    get:    function () {

                        return  this.__data__[key];
                    },
                    set:    function () {

                        this.__data__[key] = arguments[0];
                    }
                });
        });

    if ( BOM.URL ) {

        URL.createObjectURL = BOM.URL.createObjectURL;

        URL.revokeObjectURL = BOM.URL.revokeObjectURL;
    }

    BOM.URL = URL;

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    $.extend({
        paramJSON:        function (search) {
            var _Args_ = { };

            $.each(
                Array.from(
                    (new BOM.URLSearchParams(
                        (search || BOM.location.search).split('?')[1]
                    )).entries()
                ),
                function () {
                    this[1] = decodeURIComponent( this[1] );

                    if (
                        (! $.isNumeric(this[1]))  ||
                        Number.isSafeInteger( +this[1] )
                    )  try {
                        this[1] = JSON.parse( this[1] );
                    } catch (iError) { }

                    if (this[0] in _Args_)
                        _Args_[this[0]] = [ ].concat(_Args_[this[0]], this[1]);
                    else
                        _Args_[this[0]] = this[1];
                }
            );

            return _Args_;
        },
        extendURL:        function (iURL) {

            if (! arguments[1])  return iURL;

            var iURL = $.split(iURL, '?', 2);

            var iPath = iURL[0];    arguments[0] = iURL[1];

            return  iPath  +  '?'  +  $.param($.extend.apply($,  Array.from(
                arguments,  function (_This_) {

                    _This_ = _This_.valueOf();

                    return  (typeof _This_ != 'string')  ?
                        _This_  :  $.paramJSON('?' + _This_);
                }
            )));
        },
        fileName:         function () {
            return (
                arguments[0] || BOM.location.pathname
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(-1)[0];
        },
        filePath:         function () {
            return (
                arguments[0] || BOM.location.href
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(0, -1).join('/');
        },
        urlDomain:        function (iURL) {

            return  (! iURL)  ?  BOM.location.origin  :
                (iURL.match( /^(\w+:)?\/\/[^\/]+/ )  ||  '')[0];
        },
        isCrossDomain:    function () {
            return (
                BOM.location.origin ===
                (new BOM.URL(arguments[0],  this.filePath() + '/')).origin
            );
        }
    });

/* ---------- URL Parameter Signature  v0.1 ---------- */

    function JSON_Sign(iData) {

        return  '{'  +  $.map(Object.keys( iData ).sort(),  function (iKey) {

            return  '"'  +  iKey  +  '":'  +  JSON.stringify( iData[iKey] );

        }).join()  +  '}';
    }

    $.paramSign = function (iData) {

        iData = iData.valueOf();

        if (typeof iData === 'string')  iData = this.paramJSON( iData );

        var _Data_ = new BOM.URLSearchParams();

        $.each(iData,  function (name, value) {

            switch ( true ) {
                case  (this === BOM):
                    value = '';
                    break;
                case  (typeof value === 'object'):
                    value = JSON_Sign( this );
                    break;
                case  $.likeArray( this ):
                    value = '['  +  $.map(this, JSON_Sign).join()  +  ']';
                    break;
                case (this instanceof Function):
                    return;
            }

            _Data_.append(name, value);
        });

        _Data_.sort();

        return  _Data_ + '';
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    var _Timer_ = { };

    $.extend({
        _Root_:      BOM,
        now:         Date.now,
        every:       function (iSecond, iCallback) {
            var _BOM_ = this._Root_,
                iTimeOut = (iSecond || 0.01) * 1000,
                iStart = this.now(),
                Index = 0;

            return  _BOM_.setTimeout(function () {
                var iDuring = (Date.now() - iStart) / 1000;

                var iReturn = iCallback.call(_BOM_, ++Index, iDuring);

                if ((typeof iReturn == 'undefined')  ||  iReturn)
                    _BOM_.setTimeout(arguments.callee, iTimeOut);
            }, iTimeOut);
        },
        wait:        function (iSecond, iCallback) {
            return  this.every(iSecond, function () {
                iCallback.apply(this, arguments);
                return false;
            });
        },
        start:       function (iName) {
            return  (_Timer_[iName] = this.now());
        },
        end:         function (iName) {
            return  (this.now() - _Timer_[iName]) / 1000;
        },
        throttle:    function (iSecond, iOrigin) {
            if (typeof iSecond != 'number') {
                iOrigin = iSecond;
                iSecond = 0;
            }
            iSecond = (iSecond || 0.25)  *  1000;

            var Last_Exec = 0;

            return  function () {
                var iNow = Date.now();

                if (Last_Exec + iSecond  <=  iNow) {
                    Last_Exec = iNow;

                    return  iOrigin.apply(this, arguments);
                }
            };
        },
        uuid:        function () {
            return  (arguments[0] || 'uuid')  +  '_'  +
                (this.now() + Math.random()).toString(36)
                    .replace('.', '').toUpperCase();
        }
    });

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- Enhance jQuery Pseudo ---------- */

    /* ----- :image ----- */

    var pImage = $.extend($.makeSet('IMG', 'SVG', 'CANVAS'), {
            INPUT:    {type:  'image'},
            LINK:     {type:  'image/x-icon'}
        });

    $.expr[':'].image = function (iDOM) {
        if (iDOM.tagName in pImage)
            return  (pImage[iDOM.tagName] === true)  ||
                (pImage[iDOM.tagName].type == iDOM.type.toLowerCase());

        return  (! $(iDOM).css('background-image').indexOf('url('));
    };

    /* ----- :button ----- */

    var pButton = $.makeSet('button', 'image', 'submit', 'reset');

    $.expr[':'].button = function (iDOM) {
        return  (iDOM.tagName == 'BUTTON')  ||  (
            (iDOM.tagName == 'INPUT')  &&  (iDOM.type.toLowerCase() in pButton)
        );
    };

    /* ----- :input ----- */

    var pInput = $.makeSet('INPUT', 'TEXTAREA', 'BUTTON', 'SELECT');

    $.expr[':'].input = function (iDOM) {
        return  (iDOM.tagName in pInput)  ||
            (typeof iDOM.getAttribute('contentEditable') == 'string')  ||
            iDOM.designMode;
    };

/* ---------- iQuery Extended Pseudo ---------- */

    /* ----- :indeterminate ----- */

    var Check_Type = $.makeSet('radio', 'checkbox');

    $.expr[':'].indeterminate = function (iDOM) {

        switch ( iDOM.tagName.toLowerCase() ) {
            case 'input':
                if (! (iDOM.type in Check_Type))  break;
            case 'progress':
                return  (iDOM.indeterminate === true);
        }
    };

    /* ----- :list, :data ----- */

    var pList = $.makeSet('UL', 'OL', 'DL', 'TBODY', 'DATALIST');

    $.extend($.expr[':'], {
        list:    function () {
            return  (arguments[0].tagName in pList);
        },
        data:    function (iDOM, Index, iMatch) {
            return  Boolean($.data(iDOM, iMatch[3]));
        }
    });

    /* ----- :focusable ----- */

    var pFocusable = [
            'a[href],  map[name] area[href]',
            'label, input, textarea, button, select, option, object',
            '*[tabIndex], *[contentEditable]'
        ].join(', ');

    $.expr[':'].focusable = function () {
        return arguments[0].matches(pFocusable);
    };

    /* ----- :field ----- */

    $.expr[':'].field = function (iDOM) {
        return (
            iDOM.getAttribute('name')  &&  $.expr[':'].input(iDOM)
        )  &&  !(
            iDOM.disabled  ||
            $.expr[':'].button(iDOM)  ||
            $(iDOM).parents('fieldset[disabled]')[0]
        )
    };

    /* ----- :scrollable ----- */

    var Rolling_Style = $.makeSet('auto', 'scroll');

    $.expr[':'].scrollable = function (iDOM) {
        if (iDOM === iDOM.ownerDocument.scrollingElement)  return true;

        var iCSS = $(iDOM).css([
                'width',       'height',
                'max-width',   'max-height',
                'overflow-x',  'overflow-y'
            ]);

        return (
            (
                (parseFloat(iCSS.width) || parseFloat(iCSS['max-width']))  &&
                (iCSS['overflow-x'] in Rolling_Style)
            )  ||
            (
                (parseFloat(iCSS.height) || parseFloat(iCSS['max-height']))  &&
                (iCSS['overflow-y'] in Rolling_Style)
            )
        );
    };

    /* ----- :media ----- */

    var pMedia = $.makeSet('IFRAME', 'OBJECT', 'EMBED', 'AUDIO', 'VIDEO');

    $.expr[':'].media = function (iDOM) {

        return  (iDOM.tagName in pMedia)  ||  $.expr[':'].image(iDOM);
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- Event from Pseudo ---------- */

    $.Event.prototype.isPseudo = function () {
        var $_This = $(this.currentTarget);

        var iOffset = $_This.offset();

        return Boolean(
            (this.pageX  &&  (
                (this.pageX < iOffset.left)  ||
                (this.pageX  >  (iOffset.left + parseFloat($_This.css('width'))))
            ))  ||
            (this.pageY  &&  (
                (this.pageY < iOffset.top)  ||
                (this.pageY  >  (iOffset.top + parseFloat($_This.css('height'))))
            ))
        );
    };

/* ---------- Focus AnyWhere ---------- */

    var DOM_Focus = $.fn.focus;

    $.fn.focus = function () {
        this.not(':focusable').attr('tabIndex', -1).css('outline', 'none');

        return  DOM_Focus.apply(this, arguments);
    };

/* ---------- Single Finger Touch ---------- */

    var $_DOM = $(DOM);

    function get_Touch(iEvent) {
        var iTouch = iEvent;

        if ($.browser.mobile)  try {
            iTouch = iEvent.changedTouches[0];
        } catch (iError) {
            iTouch = iEvent.touches[0];
        }

        iTouch.timeStamp = iEvent.timeStamp || $.now();

        return iTouch;
    }

    $_DOM.bind(
        $.browser.mobile ? 'touchstart MSPointerDown' : 'mousedown',
        function (iEvent) {
            $(iEvent.target).data(
                '_Gesture_Event_',  get_Touch( iEvent.originalEvent )
            );
        }
    ).bind(
        $.browser.mobile ? 'touchend touchcancel MSPointerUp' : 'mouseup',
        function (iEvent) {
            var $_Target = $(iEvent.target);

            var iStart = $_Target.data('_Gesture_Event_');

            if (! iStart)  return;

            $_Target.data('_Gesture_Event_', null);

            var iEnd = get_Touch( iEvent.originalEvent );

            iEvent = {
                target:    $_Target[0],
                detail:    iEnd.timeStamp - iStart.timeStamp,
                deltaX:    iStart.pageX - iEnd.pageX,
                deltaY:    iStart.pageY - iEnd.pageY
            };

            var iShift = Math.sqrt(
                    Math.pow(iEvent.deltaX, 2)  +  Math.pow(iEvent.deltaY, 2)
                );

            if (iEvent.detail > 300)
                iEvent.type = 'press';
            else if (iShift < 22)
                iEvent.type = 'tap';
            else {
                iEvent.type = 'swipe';
                iEvent.detail = iShift;
            }

            $_Target.trigger(iEvent);
        }
    );

/* ---------- Text Input Event ---------- */

    function TypeBack(iHandler, iKey, iEvent) {
        var $_This = $(this);
        var iValue = $_This[iKey]();

        if (false  !==  iHandler.call(iEvent.target, iEvent, iValue))
            return;

        iValue = iValue.split('');
        iValue.splice(
            BOM.getSelection().getRangeAt(0).startOffset - 1,  1
        );
        $_This[iKey]( iValue.join('') );
    }

    $.fn.input = function (iHandler) {
        this.filter('input, textarea').on(
            $.browser.modern ? 'input' : 'propertychange',
            function (iEvent) {
                if ($.browser.modern  ||  (iEvent.propertyName == 'value'))
                    TypeBack.call(this, iHandler, 'val', iEvent);
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
                ((iKey > 90)  &&  (iKey < 96))  ||
                iEvent.ctrlKey  ||  iEvent.shiftKey  ||  iEvent.altKey
            )
                return;

            TypeBack.call(iEvent.target, iHandler, 'text', iEvent);
        });

        return this;
    };

/* ---------- User Idle Event ---------- */

    var End_Event = 'keydown mousedown scroll';

    $.fn.onIdleFor = function (iSecond, iCallback) {
        return  this.each(function () {
            var iNO,  _Self_ = arguments.callee,  $_This = $(this);

            function iCancel() {
                BOM.clearTimeout( iNO );

                $_This.off(End_Event, arguments.callee);

                _Self_.call( $_This[0] );
            }

            iNO = $.wait(iSecond,  function () {
                $_This.off(End_Event, iCancel);

                iCallback.call($_This[0], $.Event({
                    type:      'idle',
                    target:    $_This[0]
                }));

                _Self_.call( $_This[0] );
            });

            $_This.one(End_Event, iCancel);
        });
    };

/* ---------- Cross Page Event ---------- */

    function CrossPageEvent(iType, iSource) {
        if (typeof iType == 'string') {
            this.type = iType;
            this.target = iSource;
        } else
            $.extend(this, iType);

        if (! (iSource && (iSource instanceof Element)))  return;

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

        if (typeof iTarget.postMessage != 'function')  return this;

        if (arguments.length == 4) {
            $_Source = $(iData);
            iData = iCallback;
            iCallback = arguments[3];
        }

        var _Event_ = new CrossPageEvent(iType,  ($_Source || { })[0]);

        if (typeof iCallback == 'function')
            $_BOM.on('message',  function (iEvent) {
                iEvent = iEvent.originalEvent || iEvent;

                var iReturn = new CrossPageEvent(
                        (typeof iEvent.data == 'string')  ?
                            $.parseJSON(iEvent.data) : iEvent.data
                    );
                if (
                    (iEvent.source === iTarget)  &&
                    (iReturn.type == iType)  &&
                    $.isEqual(iReturn, _Event_)
                ) {
                    iCallback.call($_Source ? $_Source[0] : this,  iReturn);
                    $_BOM.off('message', arguments.callee);
                }
            });
        iData = $.extend({data: iData},  _Event_.valueOf());

        iTarget.postMessage(
            ($.browser.msie < 10) ? JSON.stringify(iData) : iData,  '*'
        );
    };

/* ---------- Mouse Wheel Event ---------- */

    if (! $.browser.mozilla)  return;

    $_DOM.on('DOMMouseScroll',  function (iEvent) {
        $(iEvent.target).trigger({
            type:          'mousewheel',
            wheelDelta:    -iEvent.detail * 40
        });
    });

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    if ($.browser.modern)  return;


/* ---------- Document ShortCut ---------- */

    DOM.defaultView = DOM.parentWindow;

    DOM.head = DOM.documentElement.firstChild;


/* ---------- DOM ShortCut ---------- */

    var iGetter = {
            firstElementChild:         function () {
                return this.children[0];
            },
            lastElementChild:          function () {
                return  this.children[this.children.length - 1];
            },
            previousElementSibling:    function () {
                return  $.trace(this,  'previousSibling',  1,  function () {
                    return  (this.nodeType == 1);
                })[0];
            },
            nextElementSibling:        function () {
                return  $.trace(this,  'nextSibling',  function () {
                    return  (this.nodeType == 1);
                })[0];
            }
        },
        DOM_Proto = Element.prototype;

    for (var iName in iGetter)
        Object.defineProperty(DOM_Proto,  iName,  {get: iGetter[iName]});


/* ---------- DOM Text Content ---------- */

    Object.defineProperty(DOM_Proto, 'textContent', {
        get:    function () {
            return this.innerText;
        },
        set:    function (iText) {
            switch ( this.tagName.toLowerCase() ) {
                case 'style':     return  this.styleSheet.cssText = iText;
                case 'script':    return  this.text = iText;
            }
            this.innerText = iText;
        }
    });

/* ---------- DOM Attribute Name ---------- */

    var iAlias = {
            'class':    'className',
            'for':      'htmlFor'
        },
        Get_Attribute = DOM_Proto.getAttribute,
        Set_Attribute = DOM_Proto.setAttribute,
        Remove_Attribute = DOM_Proto.removeAttribute;

    $.extend(DOM_Proto, {
        getAttribute:    function (iName) {
            return  iAlias[iName] ?
                this[iAlias[iName]]  :  Get_Attribute.call(this, iName,  0);
        },
        setAttribute:    function (iName, iValue) {
            if (iAlias[iName])
                this[iAlias[iName]] = iValue;
            else
                Set_Attribute.call(this, iName, iValue,  0);
        },
        removeAttribute:    function (iName) {
            return  Remove_Attribute.call(this,  iAlias[iName] || iName,  0);
        }
    });

/* ---------- Computed Style ---------- */

    var PX_Attr = $.makeSet('left', 'right', 'top', 'bottom', 'width', 'height'),
        DX_Filter = 'DXImageTransform.Microsoft.';

    function ValueUnit(iValue) {
        return  iValue.slice((parseFloat(iValue) + '').length);
    }

    function toPX(iName) {
        var iValue = this[iName];
        var iNumber = parseFloat(iValue);

        if (isNaN( iNumber ))  return;

        if (iNumber !== 0)
            switch (ValueUnit( iValue )) {
                case 'em':    {
                    var Font_Size =
                        this.ownerNode.parentNode.currentStyle.fontSize;

                    iNumber *= parseFloat(Font_Size);

                    if (ValueUnit(Font_Size) != 'pt')  break;
                }
                case 'pt':    iNumber *= (BOM.screen.deviceXDPI / 72);    break;
                default:      return;
            }

        this[iName] = iNumber + 'px';
    }

    function CSSStyleDeclaration(iDOM) {
        var iStyle = iDOM.currentStyle;

        $.extend(this, {
            length:       0,
            cssText:      '',
            ownerNode:    iDOM
        });

        for (var iName in iStyle) {
            this[iName] = (iName in PX_Attr)  &&  iStyle[
                $.camelCase('pixel-' + iName)
            ];
            this[iName] = (typeof this[iName] == 'number')  ?
                (this[iName] + 'px')  :  (iStyle[iName] + '');

            if (typeof this[iName] == 'string')  toPX.call(this, iName);

            this.cssText += [
                iName,  ': ',  this[iName],  '; '
            ].join('');
        }

        this.cssText = this.cssText.trim();

        var iAlpha = iDOM.filters.Alpha  ||  iDOM.filters[DX_Filter + 'Alpha'];

        this.opacity = (iAlpha  ?  (iAlpha.opacity / 100)  :  1)  +  '';
    }

    CSSStyleDeclaration.prototype.getPropertyValue = function () {
        return  this[$.camelCase( arguments[0] )];
    };

    BOM.getComputedStyle = function () {
        return  new CSSStyleDeclaration(arguments[0]);
    };

/* ---------- Set Style ---------- */

    function toHexInt(iDec, iLength) {

        return $.leftPad(
            parseInt( Number(iDec).toFixed(0) ).toString(16),  iLength || 2
        );
    }

    function RGB_Hex(iRed, iGreen, iBlue) {

        var iArgs = $.makeArray( arguments );

        if ((iArgs.length < 2)  &&  (typeof iArgs[0] == 'string'))
            iArgs = iArgs[0].replace(/rgb\(([^\)]+)\)/i, '$1')
                .replace(/,\s*/g, ',').split(',');

        for (var i = 0;  i < 3;  i++)  iArgs[i] = toHexInt( iArgs[i] );

        return iArgs.join('');
    }

    Object.getPrototypeOf( DOM.documentElement.style ).setProperty =
        function (iName, iValue) {
            var iString = '',  iWrapper,  iScale = 1,  iConvert;

            var iRGBA = (typeof iValue == 'string')  &&
                    iValue.match(/\s*rgba\(([^\)]+),\s*(\d\.\d+)\)/i);

            if (iName == 'opacity') {
                iName = 'filter';
                iWrapper = 'progid:' + DX_Filter + 'Alpha(opacity={n})';
                iScale = 100;
            } else if (iRGBA) {
                iString = iValue.replace(iRGBA[0], '');
                if (iString)
                    iString += arguments.callee.call(this, iName, iString);
                if (iName != 'background')
                    iString += arguments.callee.apply(this, [
                        (iName.indexOf('-color') > -1) ? iName : (iName + '-color'),
                        'rgb(' + iRGBA[1] + ')'
                    ]);
                iName = 'filter';
                iWrapper = 'progid:' + DX_Filter +
                    'Gradient(startColorStr=#{n},endColorStr=#{n})';
                iConvert = function (iAlpha, iRGB) {
                    return  toHexInt(parseFloat(iAlpha) * 256) + RGB_Hex(iRGB);
                };
            }
            if (iWrapper)
                iValue = iWrapper.replace(
                    /\{n\}/g,
                    iConvert  ?  iConvert(iRGBA[2], iRGBA[1])  :  (iValue * iScale)
                );

            this.setAttribute(iName, iValue, arguments[2]);
        };

/* ---------- DOM Event ---------- */

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
    var $_Change_Target = 'input[type="radio"], input[type="checkbox"]';

    $_DOM.on('click',  $_Change_Target,  function () {
        this.blur();
        this.focus();
    }).on('click',  'label',  function () {
        var $_This = $(this);
        var _ID_ = $_This.attr('for');

        if (_ID_)
            $('input[id="' + _ID_ + '"]')[0].click();
        else
            $_This.find($_Change_Target).click();
    });

    //  Submit & Reset  Bubble
    function Event_Hijack(iEvent) {
        iEvent.preventDefault();

        this[iEvent.type]();
    }

    $_DOM.on('click',  'input, button',  function () {

        if ( this.type.match(/submit|reset/) )
            $(this.form).one(this.type, Event_Hijack);

    }).on('keydown',  'form input, form select',  function () {

        if ((this.type != 'button')  &&  (arguments[0].which == 13))
            $(this.form).one((this.type == 'reset') ? 'reset' : 'submit',  Event_Hijack);
    });

    var $_BOM = $(BOM),
        _Submit_ = HTMLFormElement.prototype.submit,
        _Reset_ = HTMLFormElement.prototype.reset;

    function Fake_Bubble(iType, iMethod) {
        var $_This = $(this);

        $_BOM.on(iType,  function (iEvent) {
            if (iEvent.target !== $_This[0])  return;

            if (! iEvent.defaultPrevented)  iMethod.call(iEvent.target);

            $_BOM.off(iType, arguments.callee);
        });

        var iEvent = arguments.callee.caller.arguments[0];

        BOM.setTimeout(function () {
            $.event.dispatch(
                ((iEvent instanceof $.Event)  &&  (iEvent.type == iType))  ?
                    iEvent : {
                        type:      iType,
                        target:    $_This[0]
                    }
            );
        });
    }
    $.extend(HTMLFormElement.prototype, {
        submit:    $.proxy(Fake_Bubble, null, 'submit', _Submit_),
        reset:     $.proxy(Fake_Bubble, null, 'reset', _Reset_)
    });

/* ---------- XML DOM Parser ---------- */

    var IE_DOMParser = (function () {
            for (var i = 0;  arguments[i];  i++)  try {
                new  ActiveXObject( arguments[i] );
                return arguments[i];
            } catch (iError) { }
        })(
            'MSXML2.DOMDocument.6.0', 'MSXML2.DOMDocument.5.0',
            'MSXML2.DOMDocument.4.0', 'MSXML2.DOMDocument.3.0',
            'MSXML2.DOMDocument',     'Microsoft.XMLDOM'
        );

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

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- Document Current Script ---------- */

    var Stack_Prefix = {
            webkit:     'at ',
            mozilla:    '@',
            msie:       'at Global code \\('
        };

    function Script_URL() {
        try {
            throw  new Error('AMD_Loader');
        } catch (iError) {
            var iURL;

            for (var iCore in Stack_Prefix)
                if ( $.browser[iCore] ) {
                    iURL = iError.stack.match(RegExp(
                        "\\s+" + Stack_Prefix[iCore] + "(http(s)?:\\/\\/[^:]+)"
                    ));

                    return  iURL && iURL[1];
                }
        }
    }

    if (! ('currentScript' in DOM))
        Object.defineProperty(Object.getPrototypeOf(DOM), 'currentScript', {
            get:    function () {
                var iURL = ($.browser.msie < 10)  ||  Script_URL();

                for (var i = 0;  DOM.scripts[i];  i++)
                    if ((iURL === true)  ?
                        (DOM.scripts[i].readyState == 'interactive')  :
                        (DOM.scripts[i].src == iURL)
                    )
                        return DOM.scripts[i];
            }
        });

/* ---------- ParentNode Children ---------- */

    function HTMLCollection(DOM_Array) {

        for (var i = 0, j = 0;  DOM_Array[i];  i++)
            if (DOM_Array[i].nodeType == 1){
                this[j] = DOM_Array[i];

                if (this[j++].name)  this[this[j - 1].name] = this[j - 1];
            }

        this.length = j;
    }

    HTMLCollection.prototype.item = HTMLCollection.prototype.namedItem =
        function () {
            return  this[ arguments[0] ]  ||  null;
        };

    var Children_Define = {
            get:    function () {
                return  new HTMLCollection( this.childNodes );
            }
        };

    if (! DOM.createDocumentFragment().children)
        Object.defineProperty(
            ($.browser.modern ? DocumentFragment : DOM.constructor).prototype,
            'children',
            Children_Define
        );

    if (! DOM.head.children[0])
        Object.defineProperty(DOM_Proto, 'children', Children_Define);


/* ---------- Scrolling Element ---------- */

    if (! ('scrollingElement' in DOM))
        Object.defineProperty(DOM, 'scrollingElement', {
            get:    function () {
                return  ($.browser.webkit || (DOM.compatMode == 'BackCompat'))  ?
                    DOM.body  :  DOM.documentElement;
            }
        });

/* ---------- Selected Options ---------- */

    if ($.browser.msie < 12)
        Object.defineProperty(HTMLSelectElement.prototype, 'selectedOptions', {
            get:    function () {
                return  new HTMLCollection(
                    $.map(this.options,  function (iOption) {

                        return  iOption.selected ? iOption : null;
                    })
                );
            }
        });
/* ---------- Element CSS Selector Match ---------- */

    var DOM_Proto = Element.prototype;

    DOM_Proto.matches = DOM_Proto.matches || DOM_Proto.webkitMatchesSelector ||
        DOM_Proto.msMatchesSelector || DOM_Proto.mozMatchesSelector ||
        function () {
            if (! this.parentNode)  $('<div />')[0].appendChild(this);

            return  ($.inArray(
                this,  this.parentNode.querySelectorAll( arguments[0] )
            ) > -1);
        };

/* ---------- DOM Token List ---------- */

    function DOMTokenList(iDOM, iName) {

        this.length = 0;

        this.__Node__ = iDOM.attributes.getNamedItem( iName );

        this.value = (this.__Node__.nodeValue  ||  '').trim();

        $.merge(this, this.value.split(/\s+/));
    }

    var ArrayProto = Array.prototype;

    $.each({
        contains:    function () {

            return  ($.inArray(arguments[0], this)  >  -1);
        },
        add:         function (token) {

            if (this.contains( token ))  return;

            ArrayProto.push.call(this, token);

            updateToken.call( this );
        },
        remove:      function (token) {

            var index = $.inArray(token, this);

            if (index > -1)  ArrayProto.splice.call(this, index, 1);
        },
        toggle:      function (token, force) {

            var has = (typeof force === 'boolean')  ?
                    (! force)  :  this.contains( token );

            this[has ? 'remove' : 'add']( token );

            return  (! has);
        }
    },  function (key, method) {

        DOMTokenList.prototype[ key ]  =  function (token) {

            if ( token.match(/\s+/) )
                throw  (self.DOMException || Error)(
                    [
                        "Failed to execute '" + key + "' on 'DOMTokenList':",
                        "The token provided ('" + token + "') contains",
                        "HTML space characters, which are not valid in tokens."
                    ].join(" "),
                    'InvalidCharacterError'
                );

            token = method.call(this, token);

            if ( method.length )
                this.__Node__.nodeValue = this.value =
                    ArrayProto.join.call(this, ' ');

            return token;
        };
    });

    DOMTokenList.prototype.values = function () {

        return  $.makeIterator( this );
    };

    $.each(['', 'SVG', 'Link', 'Anchor', 'Area'],  function (key, proto) {

        proto += 'Element';

        if (key < 2)
            key = 'class';
        else {
            key = 'rel';    proto = 'HTML' + proto;
        }

        proto = (BOM[ proto ]  ||  '').prototype;

        if ((! proto)  ||  ((key + 'List')  in  proto))
            return;

        Object.defineProperty(proto,  key + 'List',  {
            get:    function () {
                return  new DOMTokenList(this, key);
            }
        });
    });

    if (BOM.DOMTokenList  &&  ($.browser.msie < 12))
        BOM.DOMTokenList.prototype.toggle = DOMTokenList.prototype.toggle;


    if (! ($.browser.msie < 11))  return;

/* ---------- Element Data Set ---------- */

    function DOMStringMap() {

        var iMap = this;

        $.each(arguments[0].attributes,  function () {

            if (! this.nodeName.indexOf('data-'))
                iMap[$.camelCase( this.nodeName.slice(5) )] = this.nodeValue;
        });
    }

    Object.defineProperty(DOM_Proto, 'dataset', {
        get:    function () {
            return  new DOMStringMap(this);
        }
    });

    if (! ($.browser.msie < 10))  return;

/* ---------- Error Useful Information ---------- */

    //  Thanks "Kevin Yang" ---
    //
    //      http://www.imkevinyang.com/2010/01/%E8%A7%A3%E6%9E%90ie%E4%B8%AD%E7%9A%84javascript-error%E5%AF%B9%E8%B1%A1.html

    Error.prototype.valueOf = function () {

        return  $.extend(this, {
            code:       this.number & 0x0FFFF,
            helpURL:    'https://msdn.microsoft.com/en-us/library/1dk3k160(VS.85).aspx'
        });
    };

/* ---------- DOM InnerHTML ---------- */

    var InnerHTML = Object.getOwnPropertyDescriptor(DOM_Proto, 'innerHTML');

    Object.defineProperty(DOM_Proto, 'innerHTML', {
        set:    function (iHTML) {

            if (! (iHTML + '').match(
                /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
            ))
                return  InnerHTML.set.call(this, iHTML);

            InnerHTML.set.call(this,  'IE_Scope' + iHTML);

            var iChild = this.childNodes;

            iChild[0].nodeValue = iChild[0].nodeValue.slice(8);

            if (! iChild[0].nodeValue[0])  this.removeChild( iChild[0] );
        }
    });

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    $.buildFragment = $.buildFragment  ||  function (iNode) {
        var iFragment = (arguments[1] || DOM).createDocumentFragment();

        for (var i = 0;  iNode[i];  i++)
            iFragment.appendChild( iNode[i] );

        return iFragment;
    };

    $.fn.insertTo = function ($_Target, Index) {
        var DOM_Set = $.buildFragment(this, DOM),  $_This = [ ];

        $($_Target).each(function () {
            var iAfter = $(this.children).eq(Index || 0)[0];

            DOM_Set = arguments[0] ? DOM_Set.cloneNode(true) : DOM_Set;

            $.merge($_This, DOM_Set.children);

            this[iAfter ? 'insertBefore' : 'appendChild'](DOM_Set, iAfter);
        });

        return this.pushStack($_This);
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- CSS Prefix ---------- */

    var CSS_Prefix = (function (iHash) {
            for (var iKey in iHash)
                if ( $.browser[iKey] )  return iHash[iKey];
        })({
            mozilla:    'moz',
            webkit:     'webkit',
            msie:       'ms'
        });

    $.cssName = $.curry(function (Test_Type, iName) {
        return  BOM[Test_Type]  ?  iName  :  ('-' + CSS_Prefix + '-' + iName);
    });

/* ---------- CSS Rule ---------- */

    var Code_Indent = $.browser.modern ? '' : ' '.repeat(4);

    function CSS_Attribute(iName, iValue) {
        if ($.isNumeric(iValue) && iName.match($.cssPX))
            iValue += 'px';

        return  [iName, ':', Code_Indent, iValue].join('');
    }

    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        $.each(iRule,  function (iSelector) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iName in this)
                _Rule_Block_.push(
                    CSS_Attribute(iName, this[iName])
                        .replace(/^(\w)/m,  Code_Indent + '$1')
                );

            Rule_Text.push(
                [Rule_Block, _Rule_Block_.join(";\n"), '}'].join("\n")
            );
        });
        Rule_Text.push('');

        return Rule_Text.join("\n");
    }

    $.cssRule = function (At_Wrapper, iRule) {
        if (typeof At_Wrapper != 'string') {
            iRule = At_Wrapper;
            At_Wrapper = null;
        }
        var CSS_Text = CSS_Rule2Text(iRule);

        var $_Style = $('<style />', {
                type:       'text/css',
                'class':    'iQuery_CSS-Rule',
                text:       (! At_Wrapper) ? CSS_Text : [
                    At_Wrapper + ' {',
                    CSS_Text.replace(/\n/m, "\n    "),
                    '}'
                ].join("\n")
            }).appendTo(DOM.head);

        return  ($_Style[0].sheet || $_Style[0].styleSheet);
    };

    function CSS_Rule_Search(iStyleSheet, iFilter) {
        return  $.map(iStyleSheet || DOM.styleSheets,  function () {
            var iRule = arguments[0].cssRules,  _Self_ = arguments.callee;
            if (! iRule)  return;

            return  $.map(iRule,  function (_Rule_) {
                return  (_Rule_.cssRules ? _Self_ : iFilter)(_Rule_);
            });
        });
    }

    function CSSRuleList() {

        this.length = 0;

        $.merge(this, arguments[0]);
    }

    if (typeof BOM.getMatchedCSSRules != 'function')
        BOM.getMatchedCSSRules = function (iElement, iPseudo) {
            if (! (iElement instanceof Element))  return null;

            if (typeof iPseudo == 'string') {
                iPseudo = (iPseudo.match(/^\s*:{1,2}([\w\-]+)\s*$/) || [ ])[1];

                if (! iPseudo)  return null;
            } else if (iPseudo)
                iPseudo = null;

            return  new CSSRuleList(CSS_Rule_Search(null,  function (iRule) {
                var iSelector = iRule.selectorText;

                if (iPseudo) {
                    iSelector = iSelector.replace(/:{1,2}([\w\-]+)$/,  function () {
                        return  (arguments[1] == iPseudo)  ?  ''  :  arguments[0];
                    });
                    if (iSelector == iRule.selectorText)  return;
                }
                if (iElement.matches( iSelector ))  return iRule;
            }));
        };

    $.fn.cssRule = function (iRule, iCallback) {
        if (! $.isPlainObject(iRule)) {
            var $_This = this;

            return  ($_This[0]  &&  CSS_Rule_Search(null,  function (_Rule_) {
                if ((
                    (typeof $_This.selector != 'string')  ||
                    ($_This.selector != _Rule_.selectorText)
                ) &&
                    (! $_This[0].matches(_Rule_.selectorText))
                )
                    return;

                if ((! iRule)  ||  (iRule && _Rule_.style[iRule]))
                    return _Rule_;
            }));
        }
        return  this.each(function () {
            var _Rule_ = { },  _ID_ = this.getAttribute('id');

            if (! _ID_) {
                _ID_ = $.uuid();
                this.setAttribute('id', _ID_);
            }
            for (var iSelector in iRule)
                _Rule_['#' + _ID_ + iSelector] = iRule[iSelector];

            var iSheet = $.cssRule(_Rule_);

            if (typeof iCallback == 'function')  iCallback.call(this, iSheet);
        });
    };

/* ---------- Smart zIndex ---------- */

    function Get_zIndex() {
        for (
            var $_This = $(this),  zIndex;
            $_This[0];
            $_This = $($_This[0].offsetParent)
        )
            if ($_This.css('position') != 'static') {
                zIndex = parseInt( $_This.css('z-index') );

                if (zIndex > 0)  return zIndex;
            }

        return 0;
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

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    $.fn.toggleAnimate = function (iClass, iData) {

        var CSS_Rule = BOM.getMatchedCSSRules(
                this.toggleClass( iClass ).children()[0]
            ) || '',
            $_This = this;

        for (var i = 0;  CSS_Rule[i];  i++)
            if (CSS_Rule[i].cssText.indexOf('transition') > 0)
                return  new Promise(function () {
                    $_This.one(
                        'transitionend webkitTransitionEnd',
                        (iData != null)  ?
                            $.proxy(arguments[0], null, iData)  :  arguments[0]
                    );
                });

        return  Promise.resolve( iData );
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    var iOperator = {
            '+':    function () {
                return  arguments[0] + arguments[1];
            },
            '-':    function () {
                return  arguments[0] - arguments[1];
            }
        },
        Array_Reverse = $.fn.iquery ?
            Array.prototype.reverse  :  function () { return this; };

    $.fn.extend({
        reduce:           function (iMethod, iKey, iCallback) {
            if (arguments.length < 3) {
                iCallback = iKey;
                iKey = undefined;
            }
            if (typeof iCallback == 'string')  iCallback = iOperator[iCallback];

            return  $.map(this,  function () {
                return  $( arguments[0] )[iMethod](iKey);
            }).reduce(iCallback);
        },
        sameParents:      function () {
            if (this.length < 2)  return this.parents();

            var iMin = $.trace(this[0], 'parentNode').slice(0, -1),
                iPrev;

            for (var i = 1, iLast;  i < this.length;  i++) {
                iLast = $.trace(this[i], 'parentNode').slice(0, -1);
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
            return Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
        },
        scrollParents:    function () {
            return Array_Reverse.call(this.pushStack($.merge(
                this.eq(0).parents(':scrollable'),  [ DOM ]
            )));
        },
        inViewport:       function () {
            for (var i = 0, _OS_, $_BOM, BOM_W, BOM_H;  this[i];  i++) {
                _OS_ = this[i].getBoundingClientRect();

                $_BOM = $( this[i].ownerDocument.defaultView );
                BOM_W = $_BOM.width(),  BOM_H = $_BOM.height();

                if (
                    (_OS_.left < 0)  ||  (_OS_.left > BOM_W)  ||
                    (_OS_.top < 0)  ||  (_OS_.top > BOM_H)
                )
                    return false;
            }

            return true;
        },
        scrollTo:         function () {
            if (! this[0])  return this;

            var $_This = this;

            $( arguments[0] ).each(function () {
                var $_Scroll = $_This.has(this);

                var iCoord = $(this).offset(),  _Coord_ = $_Scroll.offset();

                if (! $_Scroll.length)  return;

                $_Scroll.animate({
                    scrollTop:     (! _Coord_.top)  ?  iCoord.top  :  (
                        $_Scroll.scrollTop()  +  (iCoord.top - _Coord_.top)
                    ),
                    scrollLeft:    (! _Coord_.left)  ?  iCoord.left  :  (
                        $_Scroll.scrollLeft()  +  (iCoord.left - _Coord_.left)
                    )
                });
            });

            return this;
        }
    });

/* ----- DOM UI Data Operator ----- */

    var RE_URL = /^(\w+:)?\/\/[\u0021-\u007e\uff61-\uffef]+$/;

    function Value_Operator(iValue) {

        var $_This = $(this),  End_Element = (! this.children.length);

        var _Set_ = $.isData(iValue),
            iURL = (typeof iValue == 'string')  &&  iValue.trim();

        var isURL = iURL && iURL.split('#')[0].match(RE_URL);

        switch ( this.tagName.toLowerCase() ) {
            case 'a':           {
                if (_Set_) {
                    if ( isURL )
                        this.href = iURL;
                    else if (iURL.match( /.+?@[^@]{3,}/ ))
                        this.href = 'mailto:' + iURL;

                    if (End_Element)  this.textContent = iValue;
                    return;
                }
                return  this.href  ||  (End_Element && this.textContent);
            }
            case 'img':
                return  this[(_Set_ ? 'set' : 'get') + 'Attribute']('src', iValue);
            case 'textarea':    ;
            case 'select':      if (_Set_) {
                this.value = iValue;
                break;
            }
            case 'option':      if (_Set_) {
                this[this.hasAttribute('value') ? 'value' : 'textContent'] = iValue;
                break;
            } else
                return this.value;
            case 'input':       {
                var _Value_ = this.value;

                if (this.getAttribute('type') != 'tel')  try {
                    _Value_ = JSON.parse(_Value_);
                } catch (iError) { }

                if ((this.type || '').match(/radio|checkbox/i)) {
                    if (_Set_) {
                        if ((! _Value_)  ||  (_Value_ == 'on'))
                            this.value = iValue;
                        else if (_Value_ === iValue)
                            this.checked = true;
                    } else
                        return  this.checked && _Value_;
                } else if (_Set_)
                    this.value = iValue;

                return _Value_;
            }
            default:            {
                if (_Set_) {
                    if ((! End_Element)  &&  isURL)
                        $_This.css('background-image',  'url("' + iURL + '")');
                    else
                        $_This.html(iValue);
                    return;
                }
                iURL = $_This.css('background-image').match(
                    /^url\(('|")?([^'"]+)('|")?\)/
                );
                return  End_Element  ?  this.textContent  :  (iURL && iURL[2]);
            }
        }
    }

    $.fn.value = function (iAttr, iFiller) {
        var $_Value = $.isEmptyObject( iFiller )  ?
                ('[' + iAttr + ']')  :
                $.map(Object.keys(iFiller),  function () {
                    return  '[' + iAttr + '="' + arguments[0] + '"]';
                }).join(', ');

        $_Value = this.filter( $_Value ).add( this.find($_Value) );

        if (! iFiller)
            return  Value_Operator.call( $_Value[0] );

        var Data_Set = (typeof iFiller != 'function');

        $_Value = this.pushStack($.map($_Value,  function (iDOM) {
            var iKey = iDOM.getAttribute( iAttr );

            var iValue = Data_Set  ?  iFiller[iKey]  :  iFiller.apply(iDOM, [
                    iKey,  arguments[0],  $_Value
                ]);

            if (iValue != null) {
                Value_Operator.call(iDOM, iValue);
                return iDOM;
            }
        }));

        $_Value.filter(':input').change();

        return $_Value;
    };

/* ---------- HTML DOM SandBox ---------- */

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

                if (iCallback  &&  (false === iCallback.call(
                    $_iFrame[0],  $($.merge(
                        $.makeArray($('head style, head script',  _DOM_)),
                        $_Content[0] ? $_Content : _DOM_.body.childNodes
                    ))
                )))
                    $_iFrame.remove();

                if ($.browser.msie)  BOM.CollectGarbage();

                return false;
            }

            if (! iHTML)  Frame_Ready();

            $.every(0.04, Frame_Ready);
            _DOM_.write(iHTML);
            _DOM_.close();

        }).attr('src',  ((! iHTML.match(/<.+?>/)) && iHTML.trim())  ||  'about:blank');

        return  $_iFrame[0].parentElement ? this : $_iFrame.appendTo(DOM.body);
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    var W3C_Selection = (! ($.browser.msie < 10));

    function Select_Node(iSelection) {
        var iFocus = W3C_Selection ?
                iSelection.focusNode : iSelection.createRange().parentElement();
        var iActive = iFocus.ownerDocument.activeElement;

        return  $.contains(iActive, iFocus)  ?  iFocus  :  iActive;
    }

    function Find_Selection() {
        var iDOM = this.document || this.ownerDocument || this;

        if (iDOM.activeElement.tagName.toLowerCase() == 'iframe')  try {
            return  arguments.callee.call( iDOM.activeElement.contentWindow );
        } catch (iError) { }

        var iSelection = W3C_Selection ? iDOM.getSelection() : iDOM.selection;
        var iNode = Select_Node(iSelection);

        return  $.contains(
            (this instanceof Element)  ?  this  :  iDOM,  iNode
        ) && [
            iSelection, iNode
        ];
    }

    $.fn.selection = function (iContent) {
        if (iContent === undefined) {
            var iSelection = Find_Selection.call(this[0])[0];

            return  W3C_Selection ?
                iSelection.toString() : iSelection.createRange().htmlText;
        }

        return  this.each(function () {
            var iSelection = Find_Selection.call(this);
            var iNode = iSelection[1];

            iSelection = iSelection[0];
            iNode = (iNode.nodeType == 1)  ?  iNode  :  iNode.parentNode;

            if (! W3C_Selection) {
                iSelection = iSelection.createRange();

                return  iSelection.text = (
                    (typeof iContent == 'function')  ?
                        iContent.call(iNode, iSelection.text)  :  iContent
                );
            }
            var iProperty, iStart, iEnd;

            if ((iNode.tagName || '').match(/input|textarea/i)) {
                iProperty = 'value';
                iStart = Math.min(iNode.selectionStart, iNode.selectionEnd);
                iEnd = Math.max(iNode.selectionStart, iNode.selectionEnd);
            } else {
                iProperty = 'innerHTML';
                iStart = Math.min(iSelection.anchorOffset, iSelection.focusOffset);
                iEnd = Math.max(iSelection.anchorOffset, iSelection.focusOffset);
            }

            var iValue = iNode[iProperty];

            iNode[iProperty] = iValue.slice(0, iStart)  +  (
                (typeof iContent == 'function')  ?
                    iContent.call(iNode, iValue.slice(iStart, iEnd))  :  iContent
            )  +  iValue.slice(iEnd);
        });
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    function Observer() {
        this.requireArgs = arguments[0] || 0;
        this.filter = arguments[1] || [ ];
        this.table = [ ];

        return this;
    }

    function Each_Row() {
        var _This_ = this,  iArgs = $.makeArray(arguments);

        if (typeof iArgs[iArgs.length - 1]  !=  'function')  return;

        var WrapCall = iArgs.pop();

        $.each(this.table,  function () {
            var iCallback = this[this.length - 1];

            if (iCallback == null)  return;

            for (var i = 0;  i < iArgs.length;  i++) {
                if (typeof this[i] == 'function')  break;

                if (this[i] === undefined) {

                    if (i < _This_.requireArgs)  return;

                } else if (
                    (typeof _This_.filter[i] == 'function')  ?  (
                        false === _This_.filter[i].call(
                            _This_,  this[i],  iArgs[i]
                        )
                    )  :  (
                        (this[i] != iArgs[i])  &&  (! iArgs[i].match(this[i]))
                    )
                )
                    return;
            }

            if (false  ===  WrapCall.call(_This_, iCallback))
                this[this.length - 1] = null;
        });
    }

    $.extend(Observer.prototype, {
        on:         function () {
            if (typeof arguments[arguments.length - 1]  ==  'function') {
                var iArgs = $.makeArray(arguments);

                for (var i = 0;  this.table[i];  i++)
                    if ($.isEqual(this.table[i], iArgs))
                        return this;

                this.table.push(iArgs);
            }

            return this;
        },
        off:        function () {
            var iArgs = $.makeArray(arguments);

            var iCallback = (typeof iArgs[iArgs.length - 1]  ==  'function')  &&
                    iArgs.pop();

            iArgs.push(function () {
                return  (iCallback !== false)  &&  (iCallback !== arguments[0]);
            });

            Each_Row.apply(this, iArgs);

            return this;
        },
        one:        function () {
            var iArgs = $.makeArray(arguments);

            if (typeof iArgs[iArgs.length - 1]  ==  'function') {
                var iCallback = iArgs.pop();

                iArgs.push(function () {
                    this.off.apply(this, iArgs);

                    return  iCallback.apply(this, arguments);
                });

                this.on.apply(this, iArgs);
            }

            return this;
        },
        trigger:    function () {
            var iArgs = $.makeArray(arguments),  iReturn = [ ];

            var iData = $.likeArray(iArgs[iArgs.length - 1])  &&  iArgs.pop();

            iArgs.push(function () {
                var _Return_ = arguments[0].apply(this, iData);

                if ($.isData(_Return_))  iReturn.push(_Return_);
            });

            Each_Row.apply(this, iArgs);

            return iReturn;
        }
    });

    $.Observer = Observer;

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- RESTful API ---------- */

    function HTTP_Request(iMethod, iURL, iData, iCallback, DataType) {
        if (typeof iData == 'function') {
            DataType = iCallback;
            iCallback = iData;
            iData = null;
        }
        return  $.ajax({
            type:           iMethod,
            url:            iURL,
            crossDomain:    true,
            data:           iData,
            dataType:       DataType,
            success:        iCallback
        });
    }

    var _Patch_ = ($ !== BOM.iQuery);

    var HTTP_Method = $.makeSet.apply(
            $,  ['PUT', 'DELETE'].concat(_Patch_  ?  [ ]  :  ['GET', 'POST'])
        );

    for (var iMethod in HTTP_Method)
        $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);

    if (! _Patch_)  $.getJSON = $.get;


/* ---------- Smart Load ---------- */

    function HTML_Exec($_Fragment) {
        var $_Insert = [ ];

        for (var j = 0;  $_Fragment[0];  ) {
            if ($_Fragment[0].tagName != 'SCRIPT')
                $_Insert[j++] = $_Fragment[0];
            else {
                this.append( $_Insert );
                $_Insert.length = j = 0;

                if (! $_Fragment[0].src)
                    this.each(function () {
                        $('<script />').prop('text', $_Fragment[0].text)
                            .appendTo(this);
                    });
                else
                    return  Promise.all($.map(this,  function (_This_) {
                        return  new Promise(function () {
                            _This_.appendChild(
                                $('<script />')
                                    .on('load', arguments[0])
                                    .on('error', arguments[1])
                                    .prop('src', $_Fragment[0].src)[0]
                            );
                            $_Fragment.shift();
                        });
                    })).then($.proxy(arguments.callee, this, $_Fragment));
            }

            $_Fragment.shift();
        }

        this.append( $_Insert );

        return Promise.resolve('');
    }

    $.fn.htmlExec = function () {
        return  HTML_Exec.call(this,  $.makeArray( $(arguments[0]) ));
    };

    $.fn.load = function (iURL, iData, iCallback) {
        if (! this[0])  return this;

        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        var $_This = this;

        iURL = iURL.trim().split(/\s+/);

        $[iData ? 'post' : 'get'](iURL[0],  iData,  function (iHTML, _, iXHR) {

            iHTML = (typeof iHTML == 'string')  ?  iHTML  :  iXHR.responseText;

            Promise.resolve(
                $_This.children().fadeOut(200).promise()
            ).then(function () {

                $_This.empty();

                if (! iURL[1])  return $_This.htmlExec(iHTML);

                $('<div />').append( iHTML ).find( iURL[1] ).appendTo( $_This );

            }).then(function () {

                if (typeof iCallback == 'function')
                    $_This.each($.proxy(iCallback, null, iHTML, _, iXHR));
            });
        },  'html');

        return this;
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

    if (! (($.browser.msie < 10)  ||  $.browser.ios))
        return;

/* ---------- Placeholder ---------- */

    var _Value_ = {
            INPUT:       Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype, 'value'
            ),
            TEXTAREA:    Object.getOwnPropertyDescriptor(
                HTMLTextAreaElement.prototype, 'value'
            )
        };
    function getValue() {
        return _Value_[this.tagName].get.call(this);
    }

    function PH_Blur() {
        if (getValue.call( this ))  return;

        this.value = this.placeholder;
        this.style.color = 'gray';
    }

    function PH_Focus() {
        if (this.placeholder != getValue.call(this))  return;

        this.value = '';
        this.style.color = '';
    }

    var iPlaceHolder = {
            get:    function () {
                return this.getAttribute('placeholder');
            },
            set:    function () {
                if ($.browser.modern)
                    this.setAttribute('placeholder', arguments[0]);

                PH_Blur.call(this);

                $(this).off('focus', PH_Focus).off('blur', PH_Blur)
                    .focus(PH_Focus).blur(PH_Blur);
            }
        };
    Object.defineProperty(
        HTMLInputElement.prototype, 'placeholder', iPlaceHolder
    );
    Object.defineProperty(
        HTMLTextAreaElement.prototype, 'placeholder', iPlaceHolder
    );

    $(DOM).ready(function () {
        $('input[placeholder], textarea[placeholder]')
            .prop('placeholder',  function () {
                return this.placeholder;
            });
    });

/* ---------- Field Value ---------- */

    var Value_Patch = {
            get:    function () {
                var iValue = getValue.call(this);

                return (
                    (iValue == this.placeholder)  &&  (this.style.color == 'gray')
                ) ?
                    '' : iValue;
            }/*,
            set:    function () {
                _Value_.set.call(this, arguments[0]);

                if (this.style.color == 'gray')  this.style.color = '';
            }*/
        };
    Object.defineProperty(HTMLInputElement.prototype, 'value', Value_Patch);
    Object.defineProperty(HTMLTextAreaElement.prototype, 'value', Value_Patch);


/* ---------- Form Data Object ---------- */

    if (! ($.browser.msie < 10))  return;

    BOM.FormData = function () {
        this.ownerNode = arguments[0];
    };

    $.extend(BOM.FormData.prototype, {
        append:      function () {
            this[ arguments[0] ] = arguments[1];
        },
        toString:    function () {
            return $(this.ownerNode).serialize();
        }
    });

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- DOM HTTP Request ---------- */

    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text';
    };

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        },
        Fail_State = {
            readyState:    4,
            status:        500,
            statusText:    'Internal Server Error'
        };

    function Allow_Send() {
        return  (this.readyState == 1)  ||  (this.readyState == 4);
    }

    function iFrame_Send() {
        var iDHR = this,
            iTarget = this.$_Transport.submit(
                $.proxy(Allow_Send, this)
            ).attr('target');

        if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
            iTarget = $.uuid('DHR');
            this.$_Transport.attr('target', iTarget);
        }

        $('iframe[name="' + iTarget + '"]').sandBox(function () {

            var _DOM_ = this.contentWindow.document;

            $.extend(iDHR, Success_State, {
                responseHeader:    {
                    'Set-Cookie':      _DOM_.cookie,
                    'Content-Type':
                        _DOM_.contentType + '; charset=' + _DOM_.charset
                },
                responseType:      'text',
                response:          iDHR.responseText =
                    $(this).contents().find('body').text()
            });

            iDHR.onload();

            return false;

        }).attr('name', iTarget);

        this.$_Transport.submit();
    }

    var JSONP_Map = { };

    BOM.DOMHttpRequest.JSONP = function (iData) {

        var _This_ = DOM.currentScript;

        iData = $.extend({
            responseHeader:    {
                'Content-Type':    _This_.type + '; charset=' + _This_.charset
            },
            responseType:      'json',
            response:          iData,
            responseText:      JSON.stringify( iData )
        }, Success_State);

        var iDHR = JSONP_Map[ _This_.src ];

        for (var i = 0;  iDHR[i];  i++)  if ( iDHR[i].$_Transport ) {

            $.extend(iDHR[i], iData).onload();

            iDHR[i].$_Transport.remove();
        }

        iDHR.length = 0;
    };

    function Script_Send() {
        this.responseURL = $.extendURL(
            this.responseURL.replace(/(\w+)=\?/, '$1=DOMHttpRequest.JSONP'),
            arguments[0]
        );

        this.$_Transport = $('<script />', {
            type:       'text/javascript',
            charset:    'UTF-8',
            src:        this.responseURL
        }).on('error',  $.proxy(this.onerror, $.extend(this, Fail_State, {
            responseType:    'text',
            response:        '',
            responseText:    ''
        }))).appendTo( DOM.head );

        var iURL = this.$_Transport[0].src;

        (JSONP_Map[iURL] = JSONP_Map[iURL]  ||  [ ]).push( this );
    }

    $.extend(BOM.DOMHttpRequest.prototype, {
        open:                 function () {
            this.responseURL = arguments[1];
            this.readyState = 1;
        },
        send:                 function (iData) {
            if (! Allow_Send.call(this))  return;

            this.$_Transport =
                (iData instanceof BOM.FormData)  &&  $(iData.ownerNode);

            if (this.$_Transport && (
                iData.ownerNode.method.toUpperCase() == 'POST'
            ))
                iFrame_Send.call( this );
            else
                Script_Send.call(this, iData);

            this.readyState = 2;
        },
        abort:                function () {
            this.$_Transport.remove();
            this.$_Transport = null;

            this.readyState = 0;
        },
        setRequestHeader:     function () {
            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        getResponseHeader:    function () {
            return  this.responseHeader[ arguments[0] ]  ||  null;
        }
    });

/* ---------- Cacheable JSONP ---------- */

    function DHR_Transport(iOption) {
        var iXHR;

        if (iOption.dataType != 'jsonp')  return;

        iOption.cache = ('cache' in arguments[1])  ?  arguments[1].cache  :  true;

        if ( iOption.cache )  iOption.url = iOption.url.replace(/&?_=\d+/, '');

        if (! $.fn.iquery) {
            iOption.url = iOption.url.replace(
                RegExp('&?' + iOption.jsonp + '=\\w+'),  ''
            ).trim('?');

            iOption.dataTypes.shift();
        }

        return {
            send:     function (iHeader, iComplete) {

                iOption.url += (iOption.url.split('?')[1] ? '&' : '?')  +
                    iOption.jsonp + '=?';

                iXHR = new BOM.DOMHttpRequest();

                iXHR.open(iOption.type, iOption.url);

                iXHR.onload = iXHR.onerror = function () {

                    var iResponse = {text:  this.responseText};

                    iResponse[ this.responseType ] = this.response;

                    iComplete(this.status, this.statusText, iResponse);
                };

                iXHR.send( iOption.data );
            },
            abort:    function () {
                iXHR.abort();
            }
        };
    }

    //  JSONP for iQuery
    $.ajaxTransport('+script', DHR_Transport);

/* ---------- AJAX for IE 10- ---------- */

    if ($.browser.msie < 10)
        $.ajaxTransport('+*',  function (iOption) {
            var iXHR,  iForm = (iOption.data || '').ownerNode;

            if (
                (iOption.data instanceof BOM.FormData)  &&
                $(iForm).is('form')  &&
                $('input[type="file"]', iForm)[0]
            )
                return DHR_Transport(iOption);

            return  iOption.crossDomain && {
                send:     function (iHeader, iComplete) {
                    iXHR = new BOM.XDomainRequest();

                    iXHR.open(iOption.type, iOption.url, true);

                    iXHR.timeout = iOption.timeout || 0;

                    iXHR.onload = function () {
                        iComplete(
                            200,
                            'OK',
                            {text:  iXHR.responseText},
                            'Content-Type: ' + iXHR.contentType
                        );
                    };
                    iXHR.onerror = function () {
                        iComplete(500, 'Internal Server Error', {
                            text:    iXHR.responseText
                        });
                    };
                    iXHR.ontimeout = $.proxy(
                        iComplete,  null,  504,  'Gateway Timeout'
                    );

                    iXHR.send(iOption.data);
                },
                abort:    function () {
                    iXHR.abort();
                    iXHR = null;
                }
            };
        });

/* ---------- Form Field Validation ---------- */

    function Value_Check() {
        if ((! this.value)  &&  (this.getAttribute('required') != null))
            return false;

        var iRegEx = this.getAttribute('pattern');
        if (iRegEx)  try {
            return  RegExp( iRegEx ).test( this.value );
        } catch (iError) { }

        if (
            (this.tagName == 'INPUT')  &&
            (this.getAttribute('type') == 'number')
        ) {
            var iNumber = Number( this.value ),
                iMin = Number( this.getAttribute('min') );
            if (
                isNaN(iNumber)  ||
                (iNumber < iMin)  ||
                (iNumber > Number(this.getAttribute('max') || Infinity))  ||
                ((iNumber - iMin)  %  Number( this.getAttribute('step') ))
            )
                return false;
        }

        return true;
    }

    $.fn.validate = function () {
        var $_Field = this.find(':field').removeClass('invalid');

        for (var i = 0;  $_Field[i];  i++)
            if ((
                (typeof $_Field[i].checkValidity == 'function')  &&
                (! $_Field[i].checkValidity())
            )  ||  (
                ! Value_Check.call( $_Field[i] )
            )) {
                $_Field = $( $_Field[i] ).addClass('invalid');

                $_Field.scrollParents().eq(0).scrollTo( $_Field.focus() );

                return false;
            }

        return true;
    };

/* ---------- Form Element AJAX Submit ---------- */

    $.fn.ajaxSubmit = function (DataType, iCallback) {
        if (! this[0])  return this;

        if (typeof DataType == 'function') {
            iCallback = DataType;
            DataType = '';
        }

        function AJAX_Submit() {
            var $_Form = $(this);

            if ((! $_Form.validate())  ||  $_Form.data('_AJAX_Submitting_'))
                return false;

            $_Form.data('_AJAX_Submitting_', 1);

            var iMethod = ($_Form.attr('method') || 'Get').toLowerCase();

            if (typeof $[iMethod] != 'function')  return;

            arguments[0].preventDefault();

            var iOption = {
                    type:        iMethod,
                    dataType:    DataType || 'json'
                };

            if (! $_Form.find('input[type="file"]')[0])
                iOption.data = $_Form.serialize();
            else {
                iOption.data = new BOM.FormData( $_Form[0] );
                iOption.contentType = iOption.processData = false;
            }

            $.ajax(this.action, iOption).then(function () {
                $_Form.data('_AJAX_Submitting_', 0);

                if (typeof iCallback == 'function')
                    iCallback.call($_Form[0], arguments[0]);
            });
        }

        var $_This = (this.length < 2)  ?  this  :  this.sameParents().eq(0);

        if ($_This[0].tagName == 'FORM')
            $_This.submit( AJAX_Submit );
        else
            $_This.on('submit', 'form', AJAX_Submit);

        return this;
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- Bit Operation for Big Number  v0.1 ---------- */

    function Bit_Calculate(iType, iLeft, iRight) {
        iLeft = parseInt(iLeft, 2);
        iRight = parseInt(iRight, 2);

        switch (iType) {
            case '&':    return  iLeft & iRight;
            case '|':    return  iLeft | iRight;
            case '^':    return  iLeft ^ iRight;
            case '~':    return  ~iLeft;
        }
    }

    $.bitOperate = function (iType, iLeft, iRight) {

        iLeft = (typeof iLeft == 'string')  ?  iLeft  :  iLeft.toString(2);
        iRight = (typeof iRight == 'string')  ?  iRight  :  iRight.toString(2);

        var iLength = Math.max(iLeft.length, iRight.length);

        if (iLength < 32)
            return  Bit_Calculate(iType, iLeft, iRight).toString(2);

        iLeft = $.leftPad(iLeft, iLength, 0);
        iRight = $.leftPad(iRight, iLength, 0);

        var iResult = '';

        for (var i = 0;  i < iLength;  i += 31)
            iResult += $.leftPad(
                Bit_Calculate(
                    iType,  iLeft.slice(i, i + 31),  iRight.slice(i, i + 31)
                ).toString(2),
                Math.min(31,  iLength - i),
                0
            );

        return iResult;
    };

/* ---------- Local Storage Wrapper  v0.1 ---------- */

    var LS_Key = [ ];

    $.storage = function (iName, iData) {

        if (! (iData != null))  return  JSON.parse(BOM.localStorage[ iName ]);

        var iLast = 0,  iLength = Math.min(LS_Key.length, BOM.localStorage.length);

        do  try {
            BOM.localStorage[ iName ] = JSON.stringify( iData );

            if (LS_Key.indexOf( iName )  ==  -1)  LS_Key.push( iName );
            break;
        } catch (iError) {
            if (LS_Key[ iLast ]) {
                delete  BOM.localStorage[ LS_Key[iLast] ];

                LS_Key.splice(iLast, 1);
            } else
                iLast++ ;
        } while (iLast < iLength);

        return iData;
    };

/* ---------- Base64 to Blob  v0.1 ---------- */

//  Thanks "axes" --- http://www.cnblogs.com/axes/p/4603984.html

    $.toBlob = function (iType, iString) {
        if (arguments.length == 1) {
            iString = iType.match(/^data:([^;]+);base64,(.+)/);
            iType = iString[1];
            iString = iString[2];
        }
        iString = BOM.atob( iString );

        var iBuffer = new ArrayBuffer( iString.length );
        var uBuffer = new Uint8Array( iBuffer );

        for (var i = 0;  iString[i];  i++)
            uBuffer[i] = iString.charCodeAt(i);

        var BlobBuilder = BOM.WebKitBlobBuilder || BOM.MozBlobBuilder;

        if (! BlobBuilder)
            return  new BOM.Blob([iBuffer],  {type: iType});

        var iBuilder = new BlobBuilder();
        iBuilder.append( iBuffer );

        return  iBuilder.getBlob( iType );
    };

/* ---------- CRC-32  v0.1 ---------- */

//  Thanks "Bakasen" for http://blog.csdn.net/bakasen/article/details/6043797

    var CRC_32_Table = (function () {
            var iTable = new Array(256);

            for (var i = 0, iCell;  i < 256;  i++) {
                iCell = i;

                for (var j = 0;  j < 8;  j++)
                    if (iCell & 1)
                        iCell = ((iCell >> 1) & 0x7FFFFFFF)  ^  0xEDB88320;
                    else
                        iCell = (iCell >> 1)  &  0x7FFFFFFF;

                iTable[i] = iCell;
            }

            return iTable;
        })();

    function CRC_32(iRAW) {
        iRAW = '' + iRAW;

        var iValue = 0xFFFFFFFF;

        for (var i = 0;  iRAW[i];  i++)
            iValue = ((iValue >> 8) & 0x00FFFFFF)  ^  CRC_32_Table[
                (iValue & 0xFF)  ^  iRAW.charCodeAt(i)
            ];

        return  iValue ^ 0xFFFFFFFF;
    }

/* ---------- Hash Algorithm (Crypto API Wrapper)  v0.1 ---------- */

//  Thanks "emu" --- http://blog.csdn.net/emu/article/details/39618297

    if ( BOM.msCrypto ) {

        BOM.crypto = BOM.msCrypto;

        $.each(BOM.crypto.subtle,  function (key, _This_) {

            if (! (_This_ instanceof Function))  return;

            BOM.crypto.subtle[ key ] = function () {

                var iObserver = _This_.apply(this, arguments);

                return  new Promise(function (iResolve) {

                    iObserver.oncomplete = function () {

                        iResolve( arguments[0].target.result );
                    };

                    iObserver.onabort = iObserver.onerror = arguments[1];
                });
            };
        });
    }

    BOM.crypto.subtle = BOM.crypto.subtle || BOM.crypto.webkitSubtle;


    function BufferToString(iBuffer){
        var iDataView = new DataView(iBuffer),  iResult = '';

        for (var i = 0, iTemp;  i < iBuffer.byteLength;  i += 4) {
            iTemp = iDataView.getUint32(i).toString(16);

            iResult += ((iTemp.length == 8) ? '' : 0)  +  iTemp;
        }

        return iResult;
    }

    $.dataHash = function (iAlgorithm, iData) {

        if (arguments.length < 2) {

            iData = iAlgorithm;  iAlgorithm = 'CRC-32';
        }

        return  (iAlgorithm === 'CRC-32')  ?
            Promise.resolve( CRC_32( iData ) )  :
            BOM.crypto.subtle.digest(
                {name:  iAlgorithm},
                new Uint8Array(Array.from(iData,  function () {

                    return arguments[0].charCodeAt(0);
                }))
            ).then( BufferToString );
    };

})(self, self.document, self.jQuery);


});
