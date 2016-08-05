(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('iQuery', arguments[0]);

})(function () {

    var iQuery = {fn:  { }};


(function (BOM, DOM) {

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

    if (! [ ].reduce)
        Array.prototype.reduce = function () {
            var iResult = arguments[1];

            for (var i = 1;  i < this.length;  i++) {
                if (i == 1)  iResult = this[0];

                iResult = arguments[0](iResult, this[i], i, this);
            }

            return iResult;
        };

    /* ----- Function Extension ----- */

    function FuncName() {
        return  (this.toString().trim().match(/^function\s+([^\(\s]*)/) || '')[1];
    }

    if (! ('name' in Function.prototype)) {
        if (DOM.documentMode > 8)
            Object.defineProperty(Function.prototype,  'name',  {get: FuncName});
        else
            Function.prototype.name = FuncName;
    }

    /* ----- Date Extension ----- */

    if (! Date.now)
        Date.now = function () { return  +(new Date()); };

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

    /* ----- Console Fix  v0.1 ----- */

    if (BOM.console)  return;

    function _Notice_() {
        var iString = [ ];

        for (var i = 0, j = 0;  i < arguments.length;  i++)  try {
            iString[j++] = BOM.JSON.stringify( arguments[i].valueOf() );
        } catch (iError) {
            iString[j++] = arguments[i];
        }

        BOM.status = iString.join(' ');
    }

    BOM.console = { };

    var Console_Method = ['log', 'info', 'warn', 'error', 'dir'];

    for (var i = 0;  i < Console_Method.length;  i++)
        BOM.console[ Console_Method[i] ] = _Notice_;

})(self,  self.document);



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
        phone:            !! is_Phone,
        ios:              is_iOS  ?  parseFloat( is_iOS[2].replace('_', '.') )  :  NaN,
        android:          is_Android ? parseFloat(is_Android[2]) : NaN,
        versionNumber:    IE_Ver || FF_Ver || WK_Ver
    };

})(self,  self.document,  self.iQuery || iQuery);



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

        var Left_Key = Object.getOwnPropertyNames(iLeft),
            Right_Key = Object.getOwnPropertyNames(iRight);

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
        if (typeof iCount == 'function')  iCallback = iCount;
        iCount = parseInt(iCount);
        iCount = isNaN(iCount) ? Infinity : iCount;

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

    $.intersect = function () {
        if (arguments.length < 2)  return arguments[0];

        var iArgs = this.makeArray( arguments );
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

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    $.isPlainObject = function (iValue) {
        return  iValue && (iValue.constructor === Object);
    };

    function _Extend_(iTarget, iSource, iDeep) {
        iTarget = ((! iTarget)  &&  (iSource instanceof Array))  ?
            [ ]  :  Object(iTarget);

        iSource = Object(iSource);

        for (var iKey in iSource)
            if (Object.prototype.hasOwnProperty.call(iSource, iKey)) {
                iTarget[iKey] = (iDeep && (
                    (iSource[iKey] instanceof Array)  ||
                    $.isPlainObject( iSource[iKey] )
                ))  ?
                    arguments.callee(iTarget[iKey], iSource[iKey], iDeep)  :
                    iSource[iKey];
            }
        return iTarget;
    }

    $.makeArray = $.browser.modern ?
        function () {
            return  Array.apply(null, arguments[0]);
        } :
        function () {
            return  _Extend_([ ], arguments[0]);
        };

    $.fn.extend = $.extend = function () {
        var iArgs = $.makeArray( arguments );

        var iDeep = (iArgs[0] === true)  &&  iArgs.shift();

        if (iArgs.length < 2)  iArgs.unshift(this);

        for (var i = 1;  i < iArgs.length;  i++)
            iArgs[0] = _Extend_(iArgs[0], iArgs[i], iDeep);

        return iArgs[0];
    };

    $.extend({
        type:             function (iValue) {
            if (iValue === null)  return 'null';

            var iType = typeof (
                    (iValue && iValue.valueOf)  ?  iValue.valueOf()  :  iValue
                );
            return  (iType != 'object')  ?  iType  :
                Object.prototype.toString.call(iValue)
                    .split(' ')[1].slice(0, -1).toLowerCase();
        },
        isNumeric:        function (iValue) {
            iValue = (iValue && iValue.valueOf)  ?  iValue.valueOf()  :  iValue;

            if ((iValue === '')  ||  (iValue === Infinity)  ||  isNaN(iValue))
                return false;

            switch (typeof iValue) {
                case 'string':    break;
                case 'number':    break;
                default:          return false;
            }

            return  (typeof +iValue == 'number');
        },
        isEmptyObject:    function () {
            for (var iKey in arguments[0])
                return false;
            return true;
        },
        each:             function (Arr_Obj, iEvery) {
            if (this.likeArray( Arr_Obj ))
                for (var i = 0;  i < Arr_Obj.length;  i++)  try {
                    if (false  ===  iEvery.call(Arr_Obj[i], i, Arr_Obj[i]))
                        break;
                } catch (iError) {
                    console.dir( iError.valueOf() );
                }
            else
                for (var iKey in Arr_Obj)  try {
                    if (false === iEvery.call(
                        Arr_Obj[iKey],  iKey,  Arr_Obj[iKey]
                    ))
                        break;
                } catch (iError) {
                    console.dir( iError.valueOf() );
                }
            return Arr_Obj;
        },
        map:              function (iSource, iCallback) {
            var iTarget = { },  iArray;

            if (this.likeArray( iSource )) {
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
        inArray:          function () {
            return  Array.prototype.indexOf.call(arguments[1], arguments[0]);
        },
        merge:            function (iSource) {
            if (! (iSource instanceof Array))
                iSource = this.makeArray(iSource);

            for (var i = 1;  i < arguments.length;  i++)
                Array.prototype.splice.apply(iSource, Array.prototype.concat.apply(
                    [iSource.length, 0],
                    ($.likeArray( arguments[i] )  &&  (! $.browser.modern))  ?
                        $.makeArray( arguments[i] )  :  arguments[i]
                ));

            return iSource;
        },
        unique:           function (iArray) {
            var iResult = [ ];

            for (var i = iArray.length - 1, j = 0;  i > -1 ;  i--)
                if (this.inArray(iArray[i], iArray) == i)
                    iResult[j++] = iArray[i];

            return iResult.reverse();
        }
    });

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    $.extend({
        trim:             function () {
            return  arguments[0].trim();
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

            if ($.isPlainObject( iObject ))
                for (var iName in iObject) {
                    iValue = iObject[iName];

                    if ( $.isPlainObject(iValue) )
                        iValue = BOM.JSON.stringify(iValue);
                    else if (! $.isData(iValue))
                        continue;

                    iParameter.push(iName + '=' + BOM.encodeURIComponent(iValue));
                }
            else if ($.likeArray( iObject ))
                for (var i = 0, j = 0;  i < iObject.length;  i++)
                    iParameter[j++] = iObject[i].name + '=' +
                        BOM.encodeURIComponent( iObject[i].value );

            return iParameter.join('&');
        },
        contains:         function (iParent, iChild) {
            if (! iChild)  return false;

            if ($.browser.modern)
                return  !!(iParent.compareDocumentPosition(iChild) & 16);
            else
                return  (iParent !== iChild) && iParent.contains(iChild);
        }
    });

/* ---------- Function Wrapper ---------- */

    var ProxyCache = {
            origin:     [ ],
            wrapper:    [ ]
        };

    $.proxy = function (iFunction, iContext) {
        var iArgs = $.makeArray(arguments);

        for (var i = 0;  i < ProxyCache.origin.length;  i++)
            if ($.isEqual(ProxyCache.origin[i], iArgs))
                return ProxyCache.wrapper[i];

        var Index = ProxyCache.origin.push( iArgs ) - 1;

        iArgs = iArgs.slice(2);

        return  ProxyCache.wrapper[Index] = function () {
            return  iFunction.apply(
                iContext || this,  $.merge([ ], iArgs, arguments)
            );
        };
    };

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    var WindowType = $.makeSet('Window', 'DOMWindow', 'Global');

    $.extend({
        Type:    function (iVar) {
            var iType;

            try {
                iType = $.type( iVar );

                var iName = iVar.constructor.name;
                iName = (typeof iName == 'function')  ?
                    iName.call( iVar.constructor )  :  iName;

                if ((iType == 'object')  &&  iName)
                    iType = iName;
                else
                    iType = iType[0].toUpperCase() + iType.slice(1);
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
        isSelector:       function () {
            try {
                DOM.querySelector(arguments[0])
            } catch (iError) {
                return false;
            }
            return true;
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
        paramJSON:        function (Args_Str) {
            Args_Str = (
                Args_Str  ?  $.split(Args_Str, '?', 2)[1]  :  BOM.location.search
            ).match(/[^\?&\s]+/g);

            if (! Args_Str)  return { };

            var _Args_ = { };

            for (var i = 0, iValue;  i < Args_Str.length;  i++) {
                Args_Str[i] = this.split(Args_Str[i], '=', 2);

                iValue = BOM.decodeURIComponent( Args_Str[i][1] );

                if (
                    (! $.isNumeric(iValue))  ||
                    (parseInt(iValue).toString().length < 21)
                )  try {
                    iValue = $.parseJSON(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return _Args_;
        },
        extendURL:        function () {
            var iArgs = $.makeArray( arguments );
            var iURL = $.split(iArgs.shift(), '?', 2);

            if (! iArgs[0])  return arguments[0];

            iArgs.unshift( $.paramJSON('?' + iURL[1]) );

            return  iURL[0]  +  '?'  +  $.param($.extend.apply($, iArgs));
        },
        paramSign:        function (iData) {
            iData = (typeof iData == 'string')  ?  this.paramJSON(iData)  :  iData;

            return $.map(
                Object.getOwnPropertyNames(iData).sort(),
                function (iKey) {
                    switch (typeof iData[iKey]) {
                        case 'function':    return;
                        case 'object':      try {
                            return  iKey + '=' + JSON.stringify(iData[iKey]);
                        } catch (iError) { }
                    }
                    return  iKey + '=' + iData[iKey];
                }
            ).join(arguments[1] || '&');
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
        urlDomain:        function () {
            return ((
                arguments[0] || BOM.location.href
            ).match(/^(\w+:)?\/\/[^\/]+/) || [ ])[0];
        },
        isCrossDomain:    function X_Domain() {
            var iDomain = this.urlDomain( arguments[0] );

            return  iDomain && (
                iDomain != [
                    BOM.location.protocol, '//', DOM.domain, (
                        BOM.location.port  ?  (':' + BOM.location.port)  :  ''
                    )
                ].join('')
            );
        },
        cssPX:            RegExp([
            'width', 'height', 'padding', 'border-radius', 'margin',
            'top', 'right', 'bottom',  'left'
        ].join('|'))
    });

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    var _Timer_ = { };

    $.extend({
        _Root_:     BOM,
        now:        Date.now,
        every:      function (iSecond, iCallback) {
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
        wait:       function (iSecond, iCallback) {
            return  this.every(iSecond, function () {
                iCallback.apply(this, arguments);
                return false;
            });
        },
        start:      function (iName) {
            return  (_Timer_[iName] = this.now());
        },
        end:        function (iName) {
            return  (this.now() - _Timer_[iName]) / 1000;
        },
        uuid:       function () {
            return  (arguments[0] || 'uuid')  +  '_'  +
                (this.now() + Math.random()).toString(36)
                    .replace('.', '').toUpperCase();
        }
    });

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {


/* ---------- DOM Info Operator - Get first, Set all. ---------- */

    var _DOM_ = {
            TypeMap:          {
                element:    $.makeSet('Window', 'Document', 'HTMLElement'),
                root:       $.makeSet('Document', 'Window')
            },
            Get_Name_Type:    $.makeSet('string', 'array', 'undefined'),
            operate:          function (iType, iElement, iName, iValue) {
                if (iValue === null) {
                    if (this[iType].clear)
                        for (var i = 0;  i < iElement.length;  i++)
                            this[iType].clear(iElement[i], iName);
                    return iElement;
                }
                if (
                    (iValue === undefined)  &&
                    ($.type(iName) in this.Get_Name_Type)
                ) {
                    if (! iElement.length)  return;

                    if (iName instanceof Array) {
                        var iData = { };
                        for (var i = 0;  i < iName.length;  i++)
                            iData[iName[i]] = this[iType].get(iElement[0], iName[i]);
                        return iData;
                    }
                    return  this[iType].get(iElement[0], iName);
                }

                if (typeof iName == 'string') {
                    if (typeof iValue == 'function') {
                        for (var i = 0;  i < iElement.length;  i++)
                            this[iType].set(iElement[i], iName, iValue.call(
                                iElement[i],  i,  this[iType].get(iElement[i], iName)
                            ));
                        return iElement;
                    } else {
                        var _Value_ = { };
                        _Value_[iName] = iValue;
                        iName = _Value_;
                    }
                }
                for (var i = 0;  i < iElement.length;  i++)
                    for (var iKey in iName)
                        this[iType].set(iElement[i], iKey, iName[iKey]);

                return iElement;
            }
        };

    /* ----- DOM Attribute ----- */
    _DOM_.Attribute = {
        get:      function (iElement, iName) {
            if ($.Type(iElement) in _DOM_.TypeMap.root)  return;

            if (! iName)  return iElement.attributes;

            var iValue = iElement.getAttribute(iName);
            if (iValue !== null)  return iValue;
        },
        set:      function (iElement, iName, iValue) {
            if (
                (! ($.Type(iElement) in _DOM_.TypeMap.root))  &&
                (iValue !== undefined)
            )
                iElement.setAttribute(iName, iValue);
        },
        clear:    function (iElement, iName) {
            iElement.removeAttribute(iName);
        }
    };

    /* ----- DOM Property ----- */
    _DOM_.Property = {
        get:    function (iElement, iName) {
            return  iName ? iElement[iName] : iElement;
        },
        set:    function (iElement, iName, iValue) {
            iElement[iName] = iValue;
        }
    };

    /* ----- DOM Style ----- */
    _DOM_.Style = {
        get:    function (iElement, iName) {
            if ((! iElement)  ||  ($.Type(iElement) in _DOM_.TypeMap.root))
                return;

            var iStyle = DOM.defaultView.getComputedStyle(iElement, null);

            if (iName && iStyle) {
                iStyle = iStyle.getPropertyValue(iName);

                if (! iStyle) {
                    if (iName.match( $.cssPX ))
                        iStyle = 0;
                } else if (iStyle.indexOf(' ') == -1) {
                    var iNumber = parseFloat(iStyle);
                    iStyle = isNaN(iNumber) ? iStyle : iNumber;
                }
            }
            return  $.isData(iStyle) ? iStyle : '';
        },
        set:    function (iElement, iName, iValue) {
            if ($.Type(iElement) in _DOM_.TypeMap.root)  return false;

            if ($.isNumeric(iValue) && iName.match($.cssPX))
                iValue += 'px';

            iElement.style.setProperty(iName, String(iValue), 'important');
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
            var iData = this._Data_[iElement.dataIndex] || iElement.dataset;

            if (iName) {
                iData = iData || { };
                iData = iData[iName]  ||  iData[ iName.toCamelCase() ];

                if (typeof iData == 'string')  try {
                    iData = BOM.JSON.parseAll(iData);
                } catch (iError) { }
            }

            return  ((iData instanceof Array)  ||  $.isPlainObject(iData))  ?
                    $.extend(true, null, iData)  :  iData;
        },
        clear:     function (iElement, iName) {
            if (typeof iElement.dataIndex != 'number')  return;

            if (iName)
                delete this._Data_[iElement.dataIndex][iName];
            else {
                delete this._Data_[iElement.dataIndex];
                delete iElement.dataIndex;
            }
        }
    };
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

        var iType = $.Type(Element_Set);

        if (iType == 'String') {
            Element_Set = Element_Set.trim();

            if (Element_Set[0] != '<') {
                this.context = iContext || DOM;
                this.selector = Element_Set;
                Element_Set = $.find(Element_Set, this.context);
                Element_Set = (Element_Set.length < 2)  ?
                    Element_Set  :  $.uniqueSort(Element_Set);
            } else {
                Element_Set = $.map(_Self_.parseHTML(Element_Set),  function () {
                    if (arguments[0].nodeType == 1)  return arguments[0];
                });
                if ((Element_Set.length == 1)  &&  $.isPlainObject( iContext ))
                    for (var iKey in iContext) {
                        if (typeof this[iKey] == 'function')
                            (new _Self_( Element_Set[0] ))[iKey]( iContext[iKey] );
                        else
                            (new _Self_( Element_Set[0] )).attr(iKey, iContext[iKey]);
                    }
            }
        } else if (iType in _DOM_.TypeMap.element)
            Element_Set = [ Element_Set ];

        if (! $.likeArray(Element_Set))
            return;

        $.extend(this, Element_Set, {
            length:     Element_Set.length,
            context:    (Element_Set.length == 1)  ?
                Element_Set[0].ownerDocument  :  this.context
        });
    }

    /* ----- iQuery Static Method ----- */

    var TagWrapper = $.extend(
            {
                area:      {before: '<map>'},
                legend:    {before: '<fieldset>'},
                param:     {before: '<object>'}
            },
            $.makeSet(['caption', 'thead', 'tbody', 'tfoot', 'tr'],  {
                before:    '<table>',
                after:     '</table>',
                depth:     2
            }),
            $.makeSet(['th', 'td'],  {
                before:    '<table><tr>',
                depth:     3
            }),
            $.makeSet(['optgroup', 'option'],  {before: '<select multiple>'})
        );

    $ = BOM.iQuery = $.extend(iQuery, $, {
        parseHTML:    function (iHTML, AttrList) {
            var iTag = iHTML.match(
                    /^\s*<([^\s\/\>]+)\s*([^<]*?)\s*(\/?)>([^<]*)((<\/\1>)?)([\s\S]*)/
                ) || [ ];

            if (iTag[5] === undefined)  iTag[5] = '';

            if (
                (iTag[5]  &&  (! (iTag.slice(2, 5).join('') + iTag[6])))  ||
                (iTag[3]  &&  (! (iTag[2] + iTag.slice(4).join(''))))
            )
                return  [DOM.createElement( iTag[1] )];

            var iWrapper = TagWrapper[ iTag[1] ],
                iNew = DOM.createElement('div');

            if (! iWrapper)
                iNew.innerHTML = iHTML;
            else {
                iNew.innerHTML =
                    iWrapper.before  +  iHTML  +  (iWrapper.after || '');
                iNew = $.trace(iNew,  'firstChild',  iWrapper.depth || 1)
                    .slice(-1)[0];
            }

            return $.map(
                $.makeArray(iNew.childNodes),
                function (iDOM, _Index_) {
                    return iDOM.parentNode.removeChild(iDOM);
                }
            );
        },
        data:         function (iElement, iName, iValue) {
            return  _DOM_.operate('Data', [iElement], iName, iValue);
        }
    });

    /* ----- iQuery Instance Method ----- */

    $.fn = $.prototype;
    $.fn.extend = $.extend;

    $.fn.extend({
        splice:             Array.prototype.splice,
        jquery:             '1.9.1',
        iquery:             2.0,
        pushStack:          function ($_New) {
            $_New = $($.uniqueSort(
                ($_New instanceof Array)  ?  $_New  :  $.makeArray($_New)
            ));
            $_New.prevObject = this;

            return $_New;
        },
        attr:               function () {
            return  _DOM_.operate('Attribute', this, arguments[0], arguments[1]);
        },
        prop:               function () {
            return  _DOM_.operate('Property', this, arguments[0], arguments[1]);
        },
        data:               function () {
            return  _DOM_.operate('Data', this, arguments[0], arguments[1]);
        },
        css:                function () {
            return  _DOM_.operate('Style', this, arguments[0], arguments[1]);
        },
        index:              function (iTarget) {
            if (! iTarget)
                return  $.trace(this[0], 'previousElementSibling').length;

            var iType = $.Type(iTarget);

            switch (true) {
                case (iType == 'String'):
                    return  $.inArray(this[0], $(iTarget));
                case ($.likeArray( iTarget )):
                    if (! (iType in _DOM_.TypeMap.element)) {
                        iTarget = iTarget[0];
                        iType = $.Type(iTarget);
                    }
                case (iType in _DOM_.TypeMap.element):
                    return  $.inArray(iTarget, this);
            }
            return -1;
        }
    });

    return $;

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    function QuerySelector(iPath) {
        var iRoot = this;

        if ((this.nodeType == 9)  ||  (! this.parentNode))
            return iRoot.querySelectorAll(iPath);

        var _ID_ = this.getAttribute('id');

        if (! _ID_) {
            _ID_ = $.uuid('iQS');
            this.setAttribute('id', _ID_);
        }
        iPath = '#' + _ID_ + ' ' + iPath;
        iRoot = this.parentNode;

        iPath = iRoot.querySelectorAll(iPath);

        if (_ID_.slice(0, 3)  ==  'iQS')  this.removeAttribute('id');

        return iPath;
    }

    $.find = function (iSelector, iRoot) {
        var _Self_ = arguments.callee;

        return  $.map(iSelector.split(/\s*,\s*/),  function (_Selector_) {
            var iPseudo = [ ],  _Before_,  _After_ = _Selector_;

            while (! (iPseudo[1] in $.expr[':'])) {
                iPseudo = _After_.match(/:(\w+)(\(('|")?([^'"]*)\3?\))?/);

                if (! iPseudo)
                    return  $.makeArray(QuerySelector.call(iRoot, _Selector_));

                _Before_ = iPseudo.index  ?
                    _After_.slice(0, iPseudo.index)  :  '*';

                _After_ = _After_.slice(iPseudo.index + iPseudo[0].length)
            }

            if (_Before_.match(/[\s>\+~]\s*$/))  _Before_ += '*';

            iPseudo.splice(2, 1);

            return $.map(
                QuerySelector.call(iRoot, _Before_),
                function (iDOM, Index) {
                    if ($.expr[':'][iPseudo[1]](iDOM, Index, iPseudo))
                        return  _Self_(_After_, iDOM);
                }
            );
        });
    };
    $.uniqueSort = $.browser.msie ?
        function (iSet) {
            var $_Temp = [ ],  $_Result = [ ];

            for (var i = 0;  i < iSet.length;  i++) {
                $_Temp[i] = new String(iSet[i].sourceIndex + 1e8);
                $_Temp[i].DOM = iSet[i];
            }
            $_Temp.sort();

            for (var i = 0, j = 0;  i < $_Temp.length;  i++)
                if ((! i)  ||  (
                    $_Temp[i].valueOf() != $_Temp[i - 1].valueOf()
                ) || (
                    $_Temp[i].DOM.outerHTML  !=  $_Temp[i - 1].DOM.outerHTML
                ))
                    $_Result[j++] = $_Temp[i].DOM;

            return $_Result;
        } :
        function (iSet) {
            iSet.sort(function (A, B) {
                return  (A.compareDocumentPosition(B) & 2) - 1;
            });

            var $_Result = [ ];

            for (var i = 0, j = 0;  i < iSet.length;  i++) {
                if (i  &&  (iSet[i] === iSet[i - 1]))  continue;

                $_Result[j++] = iSet[i];
            }

            return $_Result;
        };

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    $.expr = { };

    var pVisible = {
            display:    'none',
            width:      0,
            height:     0
        };

    $.expr[':'] = $.expr.filters = {
        visible:    function () {
            var iStyle = BOM.getComputedStyle( arguments[0] );

            for (var iKey in pVisible)
                if (iStyle[iKey] === pVisible[iKey])  return;

            return true;
        },
        hidden:    function () {
            return  (! this.visible(arguments[0]));
        },
        header:      function () {
            return  (arguments[0] instanceof HTMLHeadingElement);
        },
        parent:      function (iDOM) {
            if (iDOM.children.length)  return true;

            iDOM = iDOM.childNodes;

            for (var i = 0;  iDOM[i];  i++)
                if (iDOM[i].nodeType == 3)  return true;
        },
        empty:       function () {
            return  (! this.parent(arguments[0]));
        },
        contains:    function (iDOM, Index, iMatch) {
            return  (iDOM.textContent.indexOf(iMatch[3]) > -1);
        },
        not:         function (iDOM, Index, iMatch) {
            return  (! $.fn.is.call([iDOM], iMatch[3]));
        }
    };

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

/* ---------- Enhanced :image ---------- */

    var pImage = $.extend($.makeSet('IMG', 'SVG', 'CANVAS'), {
            INPUT:    {type:  'image'},
            LINK:     {type:  'image/x-icon'}
        });

    $.expr[':'].image = function (iDOM) {
        if (iDOM.tagName in pImage)
            return  (pImage[iDOM.tagName] === true)  ||
                (pImage[iDOM.tagName].type == iDOM.type.toLowerCase());

        return  ($(iDOM).css('background-image') != 'none');
    };

/* ---------- Enhanced :button ---------- */

    var pButton = $.makeSet('button', 'image', 'submit', 'reset');

    $.expr[':'].button = function (iDOM) {
        return  (iDOM.tagName == 'BUTTON')  ||  (
            (iDOM.tagName == 'INPUT')  &&  (iDOM.type.toLowerCase() in pButton)
        );
    };

/* ---------- Enhanced :input ---------- */

    var pInput = $.makeSet('INPUT', 'TEXTAREA', 'BUTTON', 'SELECT');

    $.expr[':'].input = function (iDOM) {
        return  (iDOM.tagName in pInput)  ||
            (typeof iDOM.getAttribute('contentEditable') == 'string')  ||
            iDOM.designMode;
    };

/* ---------- iQuery Extended Pseudo ---------- */

    var pList = $.makeSet('UL', 'OL', 'DL', 'TBODY', 'SELECT', 'DATALIST');

    $.extend($.expr[':'], {
        list:    function () {
            return  (arguments[0].tagName in pList);
        },
        data:    function (iDOM, Index, iMatch) {
            return  Boolean($.data(iDOM, iMatch[3]));
        }
    });

    var pFocusable = [
            'a[href],  map[name] area[href]',
            'label, input, textarea, button, select, option, object',
            '*[tabIndex], *[contentEditable]'
        ].join(', ');

    $.expr[':'].focusable = function () {
        return arguments[0].matches(pFocusable);
    };

    var pMedia = $.makeSet('IFRAME', 'OBJECT', 'EMBED', 'AUDIO', 'VIDEO');

    $.expr[':'].media = function (iDOM) {
        if (iDOM.tagName in pMedia)  return true;

        if (! $.expr[':'].image(iDOM))  return;

        var iSize = $.map($(iDOM).css([
                'width', 'height', 'min-width', 'min-height'
            ]), parseFloat);

        return (
            (Math.max(iSize.width, iSize['min-width']) > 240)  ||
            (Math.max(iSize.height, iSize['min-height']) > 160)
        );
    };

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    var Array_Reverse = Array.prototype.reverse;

    function DOM_Size(iName) {
        iName = {
            scroll:    'scroll' + iName,
            inner:     'inner' + iName,
            client:    'client' + iName,
            css:       iName.toLowerCase()
        };

        return  function () {
            if (! this[0])  return  arguments.length ? this : 0;

            switch ( $.Type(this[0]) ) {
                case 'Document':
                    return  Math.max(
                        this[0].documentElement[iName.scroll],
                        this[0].body[iName.scroll]
                    );
                case 'Window':
                    return  this[0][iName.inner] || Math.max(
                        this[0].document.documentElement[iName.client],
                        this[0].document.body[iName.client]
                    );
            }
            var iValue = parseFloat(arguments[0]),
                iFix = this.is('table') ? 4 : 0;

            if (isNaN( iValue ))  return  this[0][iName.client] + iFix;

            for (var i = 0;  i < this.length;  i++)
                this[i].style[iName.css] = iValue - iFix;
            return this;
        };
    }

    function Scroll_DOM() {
        return (
            ($.browser.webkit || (
                (this.tagName || '').toLowerCase()  !=  'body'
            )) ?
            this : this.ownerDocument.documentElement
        );
    }

    function DOM_Scroll(iName) {
        iName = {
            scroll:    'scroll' + iName,
            offset:    (iName == 'Top') ? 'pageYOffset' : 'pageXOffset'
        };

        return  function (iPX) {
            iPX = parseInt(iPX);

            if ( isNaN(iPX) ) {
                iPX = Scroll_DOM.call(this[0])[iName.scroll];

                return  (iPX !== undefined) ? iPX : (
                    this[0].documentElement[iName.scroll] ||
                    this[0].defaultView[iName.offset] ||
                    this[0].body[iName.scroll]
                );
            }
            for (var i = 0;  i < this.length;  i++) {
                if (this[i][iName.scroll] !== undefined) {
                    Scroll_DOM.call(this[i])[iName.scroll] = iPX;
                    continue;
                }
                this[i].documentElement[iName.scroll] =
                    this[i].defaultView[iName.offset] =
                    this[i].body[iName.scroll] = iPX;
            }
        };
    }

    $.fn.extend({
        add:                function () {
            return this.pushStack(
                $.merge(this,  $.apply(BOM, arguments))
            );
        },
        slice:              function () {
            return  this.pushStack( [ ].slice.apply(this, arguments) );
        },
        eq:                 function (Index) {
            return  this.pushStack(
                [ ].slice.call(this,  Index,  (Index + 1) || undefined)
            );
        },
        each:               function () {
            return  $.each(this, arguments[0]);
        },
        is:                 function ($_Match) {
            var iPath = (typeof $_Match == 'string'),
                iMatch = (typeof Element.prototype.matches == 'function');

            for (var i = 0;  i < this.length;  i++) {
                if (this[i] === $_Match)  return true;

                if (iPath && iMatch)  try {
                    if (this[i].matches( $_Match ))  return true;
                } catch (iError) { }

                if (! this[i].parentNode)  $('<div />')[0].appendChild( this[i] );

                if (-1  <  $.inArray(this[i], (
                    iPath  ?  $($_Match, this[i].parentNode)  :  $($_Match)
                )))
                    return true;
            }

            return false;
        },
        filter:             function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if ($( this[i] ).is( arguments[0] ))
                    $_Result[j++] = this[i];

            return this.pushStack($_Result);
        },
        not:                function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if (! $( this[i] ).is( arguments[0] ))
                    $_Result[j++] = this[i];

            return this.pushStack($_Result);
        },
        removeAttr:         function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        addBack:            function () {
            return  this.pushStack( $.merge(this, this.prevObject) );
        },
        parent:             function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if ($.inArray(this[i].parentNode, $_Result) == -1)
                    $_Result[j++] = this[i].parentNode;

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        parents:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'parentNode').slice(0, -1)
                );

            return  Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
        },
        parentsUntil:       function () {
            return  Array_Reverse.call(
                this.parents().not( $(arguments[0]).parents().addBack() )
            );
        },
        children:           function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge($_Result, this[i].children);

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        contents:           function () {
            var $_Result = [ ],
                Type_Filter = parseInt(arguments[0]);

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge(
                    $_Result,
                    (this[i].tagName.toLowerCase() != 'iframe') ?
                        this[i].childNodes : this[i].contentWindow.document
                );
            if ($.Type(Type_Filter) == 'Number')
                for (var i = 0;  i < $_Result.length;  i++)
                    if ($_Result[i].nodeType != Type_Filter)
                        $_Result[i] = null;

            return this.pushStack($_Result);
        },
        nextAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'nextElementSibling')
                );

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        prevAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'previousElementSibling')
                );
            $_Result.reverse();

            return Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
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
                $_Result = $.merge($_Result,  $(arguments[0], this[i]));

            return  this.pushStack($_Result);
        },
        has:                function ($_Filter) {
            if (typeof $_Filter != 'string') {
                var _UUID_ = $.uuid('Has');
                $($_Filter).addClass(_UUID_);
                $_Filter = '.' + _UUID_;
            }

            return  this.pushStack($.map(this,  function () {
                if ( $($_Filter, arguments[0]).removeClass(_UUID_).length )
                    return arguments[0];
            }));
        },
        detach:             function () {
            for (var i = 0;  i < this.length;  i++)
                if (this[i].parentNode)
                    this[i].parentNode.removeChild(this[i]);

            return this;
        },
        remove:             function () {
            return this.detach();
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

            for (var i = 0, j = 0;  i < this.length;  i++)
                if (iGetter)
                    iResult[j++] = this[i].textContent;
                else
                    this[i].textContent = iText;

            return  iResult.length ? iResult.join('') : this;
        },
        html:               function (iHTML) {
            if (! $.isData(iHTML))
                return this[0].innerHTML;

            this.empty();

            for (var i = 0;  i < this.length;  i++)
                this[i].innerHTML = iHTML;

            return  this;
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

            var _DOM_ = (this[0] || { }).ownerDocument;
            var _Body_ = _DOM_  &&  $('body', _DOM_)[0];

            if (!  (_DOM_  &&  _Body_  &&  $.contains(_Body_, this[0])))
                return  {left: 0,  top: 0};

            var $_DOM_ = $(_DOM_),  iBCR = this[0].getBoundingClientRect();

            return {
                left:    parseFloat(
                    ($_DOM_.scrollLeft() + iBCR.left).toFixed(4)
                ),
                top:     parseFloat(
                    ($_DOM_.scrollTop() + iBCR.top).toFixed(4)
                )
            };
        },
        addClass:           function (new_Class) {
            if (typeof new_Class != 'string')  return this;

            new_Class = new_Class.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                old_Class = (old_Class || '').trim().split(/\s+/);

                for (var i = 0, j = old_Class.length;  i < new_Class.length;  i++)
                    if ($.inArray(new_Class[i], old_Class) == -1)
                        old_Class[j++] = new_Class[i];

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

                for (var i = 0, j = 0;  i < old_Class.length;  i++)
                    if ($.inArray(old_Class[i], iClass) == -1)
                        new_Class[j++] = old_Class[i];

                return  new_Class.join(' ');
            });
        },
        hasClass:           function (iName) {
            return  (!!  $.map(this,  function () {
                return arguments[0].classList.contains(iName);
            })[0]);
        },
        val:                function () {
            if (! $.isData(arguments[0]))
                return  this[0] && this[0].value;
            else
                return  this.not('input[type="file"]').prop('value', arguments[0]);
        },
        serializeArray:     function () {
            var $_Value = this.find('*[name]:input').not(':button, [disabled]'),
                iValue = [ ];

            for (var i = 0, j = 0;  i < $_Value.length;  i++)
                if (
                    (! $_Value[i].type.match(/radio|checkbox/i))  ||
                    $_Value[i].checked
                )
                    iValue[j++] = $($_Value[i]).prop(['name', 'value']);

            return iValue;
        },
        serialize:          function () {
            return  $.param( this.serializeArray() );
        }
    });

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    var Mutation_Event = $.makeSet(
            'DOMContentLoaded',
            'DOMAttrModified', 'DOMAttributeNameChanged',
            'DOMCharacterDataModified',
            'DOMElementNameChanged',
            'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
            'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
            'DOMSubtreeModified'
        );

    function isOriginalEvent() {
        return (
            ('on' + this.type)  in
            (this.target || DOM.documentElement).constructor.prototype
        ) || (
            $.browser.modern  &&  (this.type in Mutation_Event)
        );
    }

    function W3C_Event_Object(iType, iCustom, iDetail) {
        var iEvent = DOM.createEvent(iCustom ? 'CustomEvent' : 'HTMLEvents');

        iEvent['init' + (iCustom ? 'CustomEvent' : 'Event')](
            iType,  true,  true,  iDetail
        );
        return iEvent;
    }

    var IE_Event = {
            create:    function (iEvent) {
                iEvent = (iEvent && (typeof iEvent == 'object'))  ?  iEvent  :  { };

                return  this.isCustom ?
                    $.extend({ }, iEvent, arguments[1])  :  DOM.createEventObject();
            },
            fix:       function (iEvent) {
                var iOffset = $(iEvent.srcElement).offset() || { };

                $.extend(this, {
                    type:             iEvent.type,
                    pageX:            iOffset.left,
                    pageY:            iOffset.top,
                    target:           iEvent.srcElement,
                    relatedTarget:    ({
                        mouseover:     iEvent.fromElement,
                        mouseout:      iEvent.toElement,
                        mouseenter:    iEvent.fromElement || iEvent.toElement,
                        mouseleave:    iEvent.toElement || iEvent.fromElement
                    })[iEvent.type],
                    which:
                        (iEvent.type && (iEvent.type.slice(0, 3) == 'key'))  ?
                            iEvent.keyCode  :
                            [0, 1, 3, 0, 2, 0, 0, 0][iEvent.button],
                    wheelDelta:       iEvent.wheelDelta
                });
            }
        };

    $.Event = function (iEvent, iProperty) {
        //  Instantiation without "new"
        var _Self_ = arguments.callee;

        if (iEvent instanceof _Self_)
            return  $.isPlainObject(iProperty) ?
                $.extend(iEvent, iProperty)  :  iEvent;

        if (! (this instanceof _Self_))
            return  new _Self_(iEvent, iProperty);

        //  Default Property
        $.extend(this, {
            bubbles:       true,
            cancelable:    true,
            isTrusted:     true,
            detail:        0,
            view:          BOM,
            eventPhase:    3
        });

        //  Special Property
        var iCreate = (typeof iEvent == 'string');

        if (! iCreate) {
            if ($.isPlainObject( iEvent ))
                $.extend(this, iEvent);
            else if ($.browser.modern) {
                for (var iKey in iEvent)
                    if ((typeof iEvent[iKey] != 'function')  &&  (iKey[0] > 'Z'))
                        this[iKey] = iEvent[iKey];
            } else
                IE_Event.fix.call(this, iEvent);
        }
        if ($.isPlainObject( iProperty ))  $.extend(this, iProperty);

        this.type = iCreate ? iEvent : this.type;
        this.isCustom = (! isOriginalEvent.call(this));
        this.originalEvent = (iCreate || $.isPlainObject(iEvent))  ?
            (
                $.browser.modern ?
                    W3C_Event_Object(this.type, this.isCustom, this.detail)  :
                    IE_Event.create.apply(this, arguments)
            ) : iEvent;
    };

    $.extend($.Event.prototype, {
        preventDefault:     function () {
            if ($.browser.modern)
                this.originalEvent.preventDefault();
            else
                this.originalEvent.returnValue = false;

            this.defaultPrevented = true;
        },
        stopPropagation:    function () {
            if ($.browser.modern)
                this.originalEvent.stopPropagation();
            else
                this.originalEvent.cancelBubble = true;

            this.cancelBubble = true;
        }
    });

    function Proxy_Handler(iEvent, iCallback) {
        iEvent = $.Event(iEvent);

        var $_Target = $(iEvent.target);
        var iHandler = iCallback ?
                [iCallback] :
                ($(this).data('_event_') || { })[iEvent.type],
            iArgs = [iEvent].concat( $_Target.data('_trigger_') ),
            iThis = this;

        if (! (iHandler && iHandler.length))  return;

        for (var i = 0;  i < iHandler.length;  i++)
            if (false === (
                iHandler[i]  &&  iHandler[i].apply(iThis, iArgs)
            )) {
                iEvent.preventDefault();
                iEvent.stopPropagation();
            }

        $_Target.data('_trigger_', null);
    }

    $.event = {
        dispatch:    function (iEvent, iFilter) {
            iEvent = $.Event(iEvent);

            var iTarget = iEvent.target,  $_Path;

            switch ( $.Type(iTarget) ) {
                case 'HTMLElement':    {
                    $_Path = $(iTarget).parents().addBack();
                    $_Path = iFilter ?
                        Array.prototype.reverse.call( $_Path.filter(iFilter) )  :
                        $($.makeArray($_Path).reverse().concat([
                            iTarget.ownerDocument, iTarget.ownerDocument.defaultView
                        ]));
                    break;
                }
                case 'Document':       iTarget = [iTarget, iTarget.defaultView];
                case 'Window':         {
                    if (iFilter)  return;
                    $_Path = $(iTarget);
                }
            }

            for (var i = 0;  i < $_Path.length;  i++) {
                iEvent.currentTarget = $_Path[i];

                Proxy_Handler.call($_Path[i],  iEvent,  (! i) && arguments[2]);

                if (iEvent.cancelBubble)  break;
            }
        }
    };

    $.extend(IE_Event, {
        type:       function (iType) {
            if (
                ((BOM !== BOM.top)  &&  (iType == 'DOMContentLoaded'))  ||
                ((iType == 'load')  &&  ($.Type(this) != 'Window'))
            )
                return 'onreadystatechange';

            iType = 'on' + iType;

            if (! (iType in this.constructor.prototype))
                return 'onpropertychange';

            return iType;
        },
        handler:    function () {
            var iEvent = $.Event(BOM.event),  Loaded;
            iEvent.currentTarget = this;

            switch (iEvent.type) {
                case 'readystatechange':    iEvent.type = 'load';
                case 'load':
                    Loaded = (this.readyState == (
                        (this.tagName == 'SCRIPT')  ?  'loaded'  :  'complete'
                    ));
                    break;
                case 'propertychange':      {
                    var iType = iEvent.originalEvent.propertyName.match(/^on(.+)/i);
                    if (iType && (
                        IE_Event.type.call(this, iType[1])  ==  'onpropertychange'
                    ))
                        iEvent.type = iType[1];
                    else {
                        iEvent.type = 'DOMAttrModified';
                        iEvent.attrName = iEvent.propertyName;
                    }
                }
                default:                    Loaded = true;
            }
            if (Loaded)  arguments[0].call(this, iEvent);
        },
        bind:       function () {
            this[((arguments[0] == '+')  ?  'at'  :  'de')  +  'tachEvent'](
                IE_Event.type.call(this, arguments[1]),
                $.proxy(IE_Event.handler, this, arguments[2])
            );
        }
    });

    function Direct_Bind(iType, iCallback) {
        return  this.data('_event_',  function () {
            var Event_Data = arguments[1] || { };

            if (! Event_Data[iType]) {
                Event_Data[iType] = [ ];
                if ($.browser.modern)
                    this.addEventListener(iType, Proxy_Handler, false);
                else if (isOriginalEvent.call({
                    type:      iType,
                    target:    this
                }))
                    IE_Event.bind.call(this, '+', iType, Proxy_Handler);
            }
            Event_Data[iType].push(iCallback);

            return Event_Data;
        });
    }

    $.fn.extend({
        bind:              function (iType) {
            iType = (typeof iType == 'string')  ?
                $.makeSet.apply($, iType.trim().split(/\s+/))  :  iType;

            for (var _Type_ in iType)
                Direct_Bind.apply(this, [
                    _Type_,
                    (iType[_Type_] === true)  ?  arguments[1]  :  iType[_Type_]
                ]);

            return this;
        },
        unbind:            function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.data('_event_',  function () {
                var Event_Data = arguments[1] || { };

                for (var i = 0, iHandler;  i < iType.length;  i++) {
                    iHandler = Event_Data[iType[i]];
                    if (! iHandler)  continue;

                    if (typeof iCallback == 'function')
                        iHandler.splice(iHandler.indexOf(iCallback), 1);
                    else
                        delete Event_Data[iType[i]];

                    if ( Event_Data[iType[i]] )  continue;

                    if ($.browser.modern)
                        this.removeEventListener(iType[i], Proxy_Handler);
                    else
                        IE_Event.bind.call(this, '-', iType[i], Proxy_Handler);
                }
                return Event_Data;
            });
        },
        on:                function (iType, iFilter, iCallback) {
            if (typeof iFilter != 'string')
                return  this.bind.apply(this, arguments);

            return  this.bind(iType,  function () {
                $.event.dispatch(arguments[0], iFilter, iCallback);
            });
        },
        one:               function () {
            var iArgs = $.makeArray(arguments),  $_This = this;
            var iCallback = iArgs[iArgs.length - 1];

            iArgs.splice(-1,  1,  function () {
                $.fn.unbind.apply($_This, (
                    (iArgs.length > 2)  ?  [iArgs[0], iArgs[2]]  :  iArgs
                ));
                return  iCallback.apply(this, arguments);
            });

            return  this.on.apply(this, iArgs);
        },
        trigger:           function () {
            this.data('_trigger_', arguments[1]);

            for (var i = 0, iEvent;  i < this.length;  i++) {
                iEvent = $.Event(arguments[0],  {target: this[i]});

                if ($.browser.modern) {
                    this[i].dispatchEvent(
                        $.extend(iEvent.originalEvent, iEvent)
                    );
                    continue;
                }
                if (! iEvent.isCustom)
                    this[i].fireEvent(
                        'on' + iEvent.type,  $.extend(iEvent.originalEvent, iEvent)
                    );
                else
                    BOM.setTimeout(function () {
                        $.event.dispatch(iEvent);
                    });
            }
            return this;
        },
        triggerHandler:    function () {
            var iHandler = $(this[0]).data('_event_'),  iReturn;

            iHandler = iHandler && iHandler[arguments[0]];
            if (! iHandler)  return;

            for (var i = 0;  i < iHandler.length;  i++)
                iReturn = iHandler[i].apply(
                    this[0],  $.merge([ ], arguments)
                );

            return iReturn;
        },
        clone:             function (iDeep) {
            return  $($.map(this,  function () {
                var $_Old = $(arguments[0]);
                var $_New = $( $_Old[0].cloneNode(iDeep) );

                if (iDeep) {
                    $_Old = $_Old.find('*').addBack();
                    $_New = $_New.find('*').addBack();
                }
                for (var i = 0, iData;  i < $_Old.length;  i++) {
                    $_New[i].dataIndex = null;

                    iData = $($_Old[i]).data();
                    if ($.isEmptyObject( iData ))  continue;

                    $($_New[i]).data(iData);

                    for (var iType in iData._event_) {
                        if ($.browser.modern) {
                            $_New[i].addEventListener(iType, Proxy_Handler, false);
                            continue;
                        }
                        IE_Event.bind.call($_New[i], '+', iType, Proxy_Handler);
                    }
                }
                return $_New[0];
            }));
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

    for (var iName in $.makeSet(
        'abort', 'error',
        'keydown', 'keypress', 'keyup',
        'mousedown', 'mouseup', 'mousemove', 'mousewheel',
        'click', 'dblclick', 'scroll', 'resize',
        'select', 'focus', 'blur', 'change', 'submit', 'reset',
        'tap', 'press', 'swipe'
    ))
        $.fn[iName] = Event_Method(iName);


/* ---------- Complex Events ---------- */

    /* ----- DOM Ready ----- */
    var $_DOM = $(DOM);
    $.start('DOM_Ready');

    function DOM_Ready_Event() {
        if ((typeof arguments[2] == 'number')  &&  (
            (DOM.readyState != 'complete')  ||  (! (DOM.body || { }).lastChild)
        ))
            return;

        if (! DOM.isReady) {
            DOM.isReady = true;

            $_DOM.data('Load_During', $.end('DOM_Ready'))
                .data('Ready_Event', arguments[0]);
            console.info('[DOM Ready Event]');
            console.log(this, arguments);

            $_DOM.trigger('ready');
        }

        return false;
    }

    $.every(0.5, DOM_Ready_Event);
    $_DOM.one('DOMContentLoaded', DOM_Ready_Event);
    $(BOM).one('load', DOM_Ready_Event);

    $.fn.ready = function (iCallback) {
        if ($.Type(this[0]) != 'Document')
            throw 'The Ready Method is only used for Document Object !';

        if (! DOM.isReady)
            $_DOM.one('ready', iCallback);
        else
            iCallback.call(this[0], $_DOM.data('Ready_Event'));

        return this;
    };

    /* ----- Mouse Hover ----- */
    var _Float_ = {
            absolute:    true,
            fixed:       true
        };

    $.fn.hover = function (iEnter, iLeave) {
        return  this.bind('mouseover',  function () {
            if (
                $.contains(this, arguments[0].relatedTarget) ||
                ($(arguments[0].target).css('position') in _Float_)
            )
                return false;

            iEnter.apply(this, arguments);

        }).bind('mouseout',  function () {
            if (
                $.contains(this, arguments[0].relatedTarget) ||
                ($(arguments[0].target).css('position') in _Float_)
            )
                return false;

            (iLeave || iEnter).apply(this, arguments);
        });
    };

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

/* ---------- Event from Pseudo ---------- */

    $.Event.prototype.isPseudo = function () {
        var $_This = $(this.currentTarget);

        var iOffset = $_This.offset();

        return Boolean(
            (this.pageX  &&  (
                (this.pageX < iOffset.left)  ||
                (this.pageX  >  (iOffset.left + $_This.width()))
            ))  ||
            (this.pageY  &&  (
                (this.pageY < iOffset.top)  ||
                (this.pageY  >  (iOffset.top + $_This.height()))
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
            $(iEvent.target).data('_Gesture_Event_', get_Touch(iEvent));
        }
    ).bind(
        $.browser.mobile ? 'touchend touchcancel MSPointerUp' : 'mouseup',
        function (iEvent) {
            var $_Target = $(iEvent.target);

            var iStart = $_Target.data('_Gesture_Event_');

            if (! iStart)  return;

            $_Target.data('_Gesture_Event_', null);

            var iEnd = get_Touch(iEvent);

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

})(self,  self.document,  self.iQuery || iQuery);



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
                ('pixel-' + iName).toCamelCase()
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
        return  this[ arguments[0].toCamelCase() ];
    };

    BOM.getComputedStyle = function () {
        return  new CSSStyleDeclaration(arguments[0]);
    };

/* ---------- Set Style ---------- */

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

    DOM.documentElement.style.constructor.prototype.setProperty =
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
                    return  toHexInt(parseFloat(iAlpha) * 256, 2) + RGB_Hex(iRGB);
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

})(self,  self.document,  self.iQuery || iQuery);



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
                        "\\s+" + Stack_Prefix[iCore] + "(http(s)?:\\/\\/\\S+.js)"
                    ));

                    return  iURL && iURL[1];
                }
        }
    }

    if (! ('currentScript' in DOM))
        Object.defineProperty(DOM.constructor.prototype, 'currentScript', {
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

    function HTMLCollection() {
        var iChildren = arguments[0].childNodes;

        for (var i = 0, j = 0;  iChildren[i];  i++)
            if (iChildren[i].nodeType == 1){
                this[j] = iChildren[i];

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
                return  new HTMLCollection(this);
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


    if (! ($.browser.msie < 11))  return;

/* ---------- Element Data Set ---------- */

    function DOMStringMap(iElement) {
        for (var i = 0, iAttr;  i < iElement.attributes.length;  i++) {
            iAttr = iElement.attributes[i];
            if (iAttr.nodeName.slice(0, 5) == 'data-')
                this[ iAttr.nodeName.slice(5).toCamelCase() ] = iAttr.nodeValue;
        }
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

/* ---------- DOM Class List ---------- */

    function DOMTokenList() {
        var iClass = (arguments[0].getAttribute('class') || '').trim().split(/\s+/);

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

    Object.defineProperty(DOM_Proto, 'classList', {
        get:    function () {
            return  new DOMTokenList(this);
        }
    });

/* ---------- DOM InnerHTML ---------- */

    var InnerHTML = Object.getOwnPropertyDescriptor(DOM_Proto, 'innerHTML');

    Object.defineProperty(DOM_Proto, 'innerHTML', {
        set:    function (iHTML) {
            if (! String(iHTML).match(
                /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
            ))
                return  InnerHTML.set.call(this, iHTML);

            InnerHTML.set.call(this,  'IE_Scope' + iHTML);

            var iChild = this.childNodes;
            iChild[0].nodeValue = iChild[0].nodeValue.slice(8);

            if (! iChild[0].nodeValue[0])  this.removeChild( iChild[0] );
        }
    });

})(self,  self.document,  self.iQuery || iQuery);



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

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    $.fn.extend({
        appendTo:        function () {
            return  this.insertTo(arguments[0], Infinity);
        },
        prependTo:       function () {
            return  this.insertTo( arguments[0] );
        },
        insertBefore:    function ($_Target) {
            var $_This = this;

            return  this.pushStack($.map($($_Target),  function (iDOM) {
                return  $_This.insertTo(iDOM.parentNode, $(iDOM).index());
            }));
        },
        insertAfter:     function ($_Target) {
            var $_This = this;

            return  this.pushStack($.map($($_Target),  function (iDOM) {
                return  $_This.insertTo(iDOM.parentNode,  $(iDOM).index() + 1);
            }));
        }
    });

    $.each(
        {
            appendTo:        'append',
            prependTo:       'prepend',
            insertBefore:    'before',
            insertAfter:     'after'
        },
        function (iMethod) {
            $.fn[arguments[1]] = function () {
                $( arguments[0] )[iMethod](this);

                return this;
            };
        }
    );

    $.globalEval = function () {
        $('<script />').prop('text', arguments[0]).appendTo('head');
    };

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    /* ----- Atom Effect ----- */

    var Pseudo_Class = $.makeSet([
            ':link', 'visited', 'hover', 'active', 'focus', 'lang',
            'enabled', 'disabled', 'checked',
            'first-child', 'last-child', 'first-of-type', 'last-of-type',
            'nth-child', 'nth-of-type', 'nth-last-child', 'nth-last-of-type',
            'only-child', 'only-of-type', 'empty'
        ].join(' :').split(' '));

    function CSS_Selector_Priority(iSelector) {
        var iPriority = [0, 0, 0];

        if ( iSelector.match(/\#[^\s>\+~]+/) )  iPriority[0]++ ;

        var iPseudo = (iSelector.match(/:[^\s>\+~]+/g)  ||  [ ]);
        var pClass = $.map(iPseudo,  function () {
                if (arguments[0] in Pseudo_Class)  return arguments[0];
            });
        iPriority[1] += (
            iSelector.match(/\.[^\s>\+~]+/g)  ||  [ ]
        ).concat(
            iSelector.match(/\[[^\]]+\]/g)  ||  [ ]
        ).concat(pClass).length;

        iPriority[2] += ((
            iSelector.match(/[^\#\.\[:]?[^\s>\+~]+/g)  ||  [ ]
        ).length + (
            iPseudo.length - pClass.length
        ));

        return iPriority;
    }

    function CSS_Rule_Sort(A, B) {
        var pA = CSS_Selector_Priority(A.selectorText),
            pB = CSS_Selector_Priority(B.selectorText);

        for (var i = 0;  i < pA.length;  i++)
            if (pA[i] == pB[i])  continue;
            else
                return  (pA[i] > pB[i])  ?  -1  :  1;
        return 0;
    }

    var Tag_Style = { },  _BOM_;

    $(DOM).ready(function () {
        _BOM_ = $('<iframe />', {
            id:     '_CSS_SandBox_',
            src:    'about:blank',
            css:    {display:  'none'}
        }).appendTo(this.body)[0].contentWindow;
    });

    function Tag_Default_CSS(iTagName) {
        if (! Tag_Style[iTagName]) {
            var $_Default = $('<' + iTagName + ' />').appendTo(
                    _BOM_.document.body
                );
            Tag_Style[iTagName] = $.extend(
                { },  BOM.getComputedStyle( $_Default[0] )
            );
            $_Default.remove();
        }
        return Tag_Style[iTagName];
    }

    var Disable_Value = $.makeSet('none', '0', '0px', 'hidden');

    function Last_Valid_CSS(iName) {
        var iRule = [this[0]].concat(
                this.cssRule( iName ).sort( CSS_Rule_Sort ),
                {
                    style:    Tag_Default_CSS( this[0].tagName.toLowerCase() )
                }
            );
        for (var i = 0, iValue;  i < iRule.length;  i++) {
            iValue = iRule[i].style[iName];

            if (iValue  &&  (! (iValue in Disable_Value)))
                return iValue;
        }
    }

    $.fn.extend({
        hide:    function () {
            return  this.css('display',  function () {
                if (arguments[1] != 'none')
                    $(this).data('_CSS_Display_', arguments[1]);
                return 'none';
            });
        },
        show:    function () {
            return  this.each(function () {
                var $_This = $(this);
                var iStyle = $_This.css(['display', 'visibility', 'opacity']);

                if (iStyle.display == 'none')
                    $_This.css('display', (
                        $_This.data('_CSS_Display_') ||
                        Last_Valid_CSS.call($_This, 'display')
                    ));
                if (iStyle.visibility == 'hidden')
                    $_This.css('visibility', 'visible');

                if (iStyle.opacity == 0)
                    $_This.css('opacity', 1);
            });
        }
    });

    /* ----- KeyFrame Animation ----- */

    var FPS = 60,
        Animate_Property = {
            scrollLeft:    true,
            scrollTop:     true
        };

    function KeyFrame(iStart, iEnd, During_Second) {
        During_Second = Number(During_Second) || 1;

        var iKF = [ ],  KF_Sum = FPS * During_Second;
        var iStep = (iEnd - iStart) / KF_Sum;

        for (var i = 0, KFV = iStart, j = 0;  i < KF_Sum;  i++) {
            KFV += iStep;
            iKF[j++] = Number( KFV.toFixed(2) );
        }
        return iKF;
    }

    function KeyFrame_Animate(CSS_Final, During_Second, iEasing, iCallback) {
        var $_This = this.data('_Animate_', 0);

        $.each(CSS_Final,  function (iName) {
            if (! $.isNumeric(this))  return  $_This.css(iName, this);

            $_This.data('_Animate_',  $_This.data('_Animate_') + 1);

            var iSpecial = (iName in Animate_Property);
            var iKeyFrame = KeyFrame(
                    iSpecial ? $_This[iName]() : $_This.css(iName),
                    this,
                    During_Second
                );
            $.every(1 / FPS,  function () {
                if ($_This.data('_Animate_') && iKeyFrame.length) {
                    if (iSpecial)
                        $_This[iName]( iKeyFrame.shift() );
                    else
                        $_This.css(iName, iKeyFrame.shift());
                } else {
                    var iCount = $_This.data('_Animate_') - 1;
                    $_This.data('_Animate_', iCount);

                    if ((! iCount) && iCallback)  iCallback.call( $_This[0] );

                    return  iKeyFrame = false;
                }
            });
        });
        return $_This;
    }

    /* ----- Transition Animation ----- */

    var CSS_Prefix = (function (iHash) {
            for (var iKey in iHash)
                if ( $.browser[iKey] )  return iHash[iKey];
        })({
            mozilla:    'moz',
            webkit:     'webkit',
            msie:       'ms'
        });

    function CSS_AMP() {
        return  '-' + CSS_Prefix + '-' + arguments[0];
    }

    var End_Event = 'TransitionEnd';
    var Bind_Name = End_Event.toLowerCase() + ' ' + CSS_Prefix + End_Event;

    function Transition_Animate() {
        var iTransition = [
                'all',  (arguments[1] + 's'),  arguments[2]
            ].join(' ');

        return  this.on(Bind_Name, arguments[3])
                .css('transition', iTransition).css(
                    CSS_AMP('transition'),  iTransition
                )
                .css( arguments[0] );
    }

    $.fn.extend({
        animate:    function (CSS_Final) {
            if (! this[0])  return this;

            var iArgs = $.makeArray(arguments).slice(1),
                iCSS = Object.getOwnPropertyNames( CSS_Final );

            this.data('_CSS_Animate_',  function () {
                return  $.extend(arguments[1], $(this).css(iCSS));
            });

            return (
                (($.browser.msie < 10)  ||  (! $.isEmptyObject(
                    $.intersect($.makeSet.apply($, iCSS),  Animate_Property)
                ))) ?
                    KeyFrame_Animate  :  Transition_Animate
            ).call(
                this,
                CSS_Final,
                $.isNumeric( iArgs[0] )  ?  (iArgs.shift() / 1000)  :  0.4,
                (typeof iArgs[0] == 'string')  ?  iArgs.shift()  :  '',
                (typeof iArgs[0] == 'function')  &&  iArgs[0]
            );
        },
        stop:       function () {
            return  this.data('_Animate_', 0);
        }
    });

    /* ----- Animation ShortCut ----- */

    $.fn.extend($.map({
        fadeIn:     {opacity:  1},
        fadeOut:    {opacity:  0},
        slideUp:    {
            overflow:            'hidden',
            height:              0,
            'padding-left':      0,
            'padding-right':     0,
            'padding-top':       0,
            'padding-bottom':    0,
            opacity:             0
        },
        slideDown:    {
            overflow:            'auto',
            height:              'auto',
            'padding-left':      'auto',
            'padding-right':     'auto',
            'padding-top':       'auto',
            'padding-bottom':    'auto',
            opacity:             1
        }
    },  function (CSS_Next) {
        return  function () {
            if (! this[0])  return this;

            var $_This = this,  CSS_Prev = this.data('_CSS_Animate_');

            return  this.animate.apply(this, $.merge(
                [$.map(CSS_Next,  function (iValue, iKey) {
                    if (iValue == 'auto') {
                        iValue = (CSS_Prev || { })[iKey];
                        if ((! iValue)  &&  (iValue !== 0))
                            iValue = Last_Valid_CSS.call($_This, iKey);
                    }
                    return  (iValue  ||  (iValue === 0))  ?
                        iValue : CSS_Next[iKey];
                })],
                arguments
            ));
        };
    }));

    $.fn.toggle = function () {
        return  this[[
            ['show', 'hide'],  ['slideDown', 'slideUp']
        ][
            arguments.length && 1
        ][
            this.height() && 1
        ]].apply(
            this,  arguments
        );
    };

    $.fx = {interval:  1000 / FPS};

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

    var iOperator = {
            '+':    function () {
                return  arguments[0] + arguments[1];
            },
            '-':    function () {
                return  arguments[0] - arguments[1];
            }
        },
        Array_Reverse = Array.prototype.reverse,
        Rolling_Style = $.makeSet('auto', 'scroll');

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
            return Array_Reverse.call(this.pushStack(
                $.map(this.eq(0).parents(),  function ($_Parent) {
                    $_Parent = $($_Parent);

                    var iCSS = $_Parent.css([
                            'max-width', 'max-height', 'overflow-x', 'overflow-y'
                        ]);

                    if (
                        (
                            ($_Parent.width() || parseFloat(iCSS['max-width']))  &&
                            (iCSS['overflow-x'] in Rolling_Style)
                        )  ||
                        (
                            ($_Parent.height() || parseFloat(iCSS['max-height']))  &&
                            (iCSS['overflow-y'] in Rolling_Style)
                        )
                    )
                        return $_Parent[0];
                })
            ));
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
        var $_This = $(this),
            End_Element = (! this.children.length);

        var _Set_ = $.isData(iValue),
            iURL = (typeof iValue == 'string')  &&  iValue.trim();
        var isURL = iURL && iURL.split('#')[0].match(RE_URL);

        switch ( this.tagName.toLowerCase() ) {
            case 'a':           {
                if (_Set_) {
                    if (isURL)  $_This.attr('href', iURL);
                    if (End_Element)  $_This.text(iValue);
                    return;
                }
                return  $_This.attr('href')  ||  (End_Element && $_This.text());
            }
            case 'img':         return  $_This.attr('src', iValue);
            case 'textarea':    ;
            case 'select':      return $_This.val(iValue);
            case 'option':      return $_This.text(iValue);
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
                iURL = $_This.css('background-image')
                    .match(/^url\(('|")?([^'"]+)('|")?\)/);
                return  End_Element  ?  $_This.text()  :  (iURL && iURL[2]);
            }
        }
    }

    $.fn.value = function (iAttr, iFiller) {
        if (typeof iAttr == 'function') {
            iFiller = iAttr;
            iAttr = '';
        }
        var $_Value = iAttr  ?  this.filter('[' + iAttr + ']')  :  this;
        $_Value = $_Value.length  ?  $_Value  :  this.find('[' + iAttr + ']');

        if (! iFiller)  return Value_Operator.call($_Value[0]);

        var Data_Set = (typeof iFiller != 'function');

        for (var i = 0, iKey;  i < $_Value.length;  i++) {
            iKey = iAttr && $_Value[i].getAttribute(iAttr);

            Value_Operator.call(
                $_Value[i],
                Data_Set  ?  iFiller[iKey]  :  iFiller.apply($_Value[i], [
                    iKey || Value_Operator.call($_Value[i]),  i,  $_Value
                ])
            );
        }
        return this;
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

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

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

    $.cssRule = function (iMedia, iRule) {
        if (typeof iMedia != 'string') {
            iRule = iMedia;
            iMedia = null;
        }
        var CSS_Text = CSS_Rule2Text(iRule);

        var $_Style = $('<style />', {
                type:       'text/css',
                'class':    'iQuery_CSS-Rule',
                text:       (! iMedia) ? CSS_Text : [
                    '@media ' + iMedia + ' {',
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
        $.extend(this, arguments[0]);
        this.length = arguments[0].length;
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

})(self,  self.document,  self.iQuery || iQuery);



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

})(self,  self.document,  self.iQuery || iQuery);



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

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {


/* ---------- AJAX API ---------- */

    var $_DOM = $(DOM),  iAJAX = new $.Observer(1);

    function AJAX_Register(iName) {
        var iArgs = $.makeArray(arguments).slice(1);

        var iCallback = iArgs[iArgs.length - 1];

        if (typeof iCallback != 'function')  return;

        iArgs.splice(-1,  1,  function () {
            return  iCallback.apply(BOM, $.makeArray(arguments).slice(1));
        });

        iAJAX.on.apply(iAJAX, [iName].concat(iArgs));
    }

    $.extend({
        ajaxPrefilter:    $.proxy(AJAX_Register, $, 'prefilter'),
        ajaxTransport:    $.proxy(AJAX_Register, $, 'transport')
    });

    $.ajaxTransport(function (iOption) {
        var iXHR;

        return {
            send:    function (iHeader, iComplete) {
                iXHR = new BOM.XMLHttpRequest();

                iXHR.open(iOption.type, iOption.url, true);

                iXHR[iOption.crossDomain ? 'onload' : 'onreadystatechange'] =
                    function () {
                        if (! (iOption.crossDomain || (iXHR.readyState == 4)))
                            return;

                        var iResponse = {text:  iXHR.responseText};
                        iResponse[ iXHR.responseType ] = iXHR.response;

                        iComplete(
                            iXHR.status,
                            iXHR.statusText,
                            iResponse,
                            iXHR.getAllResponseHeaders()
                        );
                    };

                if (iOption.xhrFields)  $.extend(iXHR, iOption.xhrFields);

                if (! iOption.crossDomain)
                    iOption.headers = $.extend(iOption.headers || { },  iHeader,  {
                        'X-Requested-With':    'XMLHttpRequest',
                        Accept:                '*/*'
                    });

                for (var iKey in iOption.headers)
                    iXHR.setRequestHeader(iKey, iOption.headers[iKey]);

                var iData = iOption.data;

                if ((iData instanceof Array)  ||  $.isPlainObject(iData))
                    iData = $.param(iData);

                if ((typeof iData == 'string')  ||  iOption.contentType)
                    iXHR.setRequestHeader('Content-Type', (
                        iOption.contentType || 'application/x-www-form-urlencoded'
                    ));

                iOption.data = iData;

                iXHR.send(iData);
            },
            abort:    function () {
                iXHR.onload = iXHR.onreadystatechange = null;
                iXHR.abort();
                iXHR = null;
            }
        };
    });

    var ResponseType = $.makeSet('html', 'xml', 'json');

    function AJAX_Complete(iOption) {
        var iHeader = { };

        if (arguments[4])
            $.each(arguments[4].split("\r\n"),  function () {
                var _Header_ = $.split(this, /:\s+/, 2);

                iHeader[_Header_[0]] = _Header_[1];
            });

        var iType = (iHeader['Content-Type'] || '').split(';')[0].split('/');

        $.extend(this, {
            status:          arguments[1],
            statusText:      arguments[2],
            responseText:    arguments[3].text,
            responseType:
                ((iType[1] in ResponseType) ? iType[1] : iType[0])  ||  'text'
        });

        this.response = this.responseText;

        switch ( this.responseType ) {
            case 'text':    ;
            case 'html':    if (this.responseText.match(/^\s*<.+?>/)) {
                try {
                    this.response = $.parseXML( this.responseText );
                    this.responseType = 'xml';
                } catch (iError) {
                    this.response = $.buildFragment(
                        $.parseHTML( this.responseText )
                    );
                    this.responseType = 'html';
                }
                break;
            }
            case 'json':
                try {
                    this.response = $.parseJSON( this.responseText );
                    this.responseType = 'json';
                } catch (iError) { }
                break;
            case 'xml':     this.response = this.responseXML;
        }

        var iArgs = [this, iOption];

        $_DOM.trigger('ajaxComplete', iArgs);

        if (arguments[1] < 400)
            $_DOM.trigger('ajaxSuccess', iArgs);
        else
            $_DOM.trigger('ajaxError',  iArgs.concat(new Error(this.statusText)));

        if (typeof iOption.success == 'function')
            iOption.success(this.response, 'success', this);
    }

    function HTTP_Request(iMethod, iURL, iData, iCallback) {
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = { };
        }

        var iOption = {
                type:           iMethod,
                crossDomain:    $.isCrossDomain(iURL),
                dataType:       'text',
                data:           iData || { },
                success:        iCallback
            };

        iOption.url = iURL.replace(/&?(\w+)=\?/,  function () {
            if (iOption.jsonp = arguments[1])  iOption.dataType = 'jsonp';

            return '';
        });

        if (iMethod == 'GET') {
            var File_Name = $.fileName(iURL);

            if (!  (iOption.jsonp || $.browser.modern || $.map(
                $('link[rel="next"], link[rel="prefetch"]'),
                function () {
                    if ($.fileName( arguments[0].href )  ==  File_Name)
                        return iURL;
                }
            ).length))
                iOption.data._ = $.now();

            iOption.data = $.extend($.paramJSON(iOption.url), iOption.data);

            iOption.url = iOption.url.split('?')[0] + (
                $.isEmptyObject( iOption.data )  ?
                    ''  :  ('?' + $.param(iOption.data))
            );
        }
        var iXHR = new BOM.XMLHttpRequest(),  iArgs = [iOption, iOption, iXHR];

        iAJAX.trigger('prefilter', iArgs);

        iXHR = iAJAX.trigger('transport', iOption.dataType, iArgs).slice(-1)[0];

        iXHR.send({ },  $.proxy(AJAX_Complete, iXHR, iOption));

        if (iOption.timeout)
            $.wait(iOption.timeout / 1000,  function () {
                iXHR.abort();

                $_DOM.trigger('ajaxError', [
                    iXHR,  iOption,  new Error('XMLHttpRequest Timeout')
                ]);
            });

        $_DOM.trigger('ajaxSend',  [iXHR, iOption]);
    }

    var HTTP_Method = $.makeSet('GET', 'POST', 'PUT', 'DELETE');

    for (var iMethod in HTTP_Method)
        $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);

    $.getJSON = $.get;


/* ---------- Smart HTML Loading ---------- */

    $.fn.load = function (iURL, iData, iCallback) {
        if (! this[0])  return this;

        iURL = $.split(iURL.trim(), /\s+/, 2, ' ');

        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        var $_This = this;

        $[iData ? 'post' : 'get'](iURL[0], iData, function (iFragment) {
            $_This.children().fadeOut();

            $_This.empty()[0].appendChild( iFragment );

            var $_Script = $( iFragment.children )
                    .filter('script').not('[src]').remove();

            for (var i = 0;  $_Script[i];  i++)
                $.globalEval( $_Script[i].text );

            if (typeof iCallback == 'function')
                for (var i = 0;  $_This[i];  i++)
                    iCallback.apply($_This[i], arguments);
        });

        return this;
    };

})(self,  self.document,  self.iQuery || iQuery);



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


/* ---------- Form Element API ---------- */

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
            if (! $_Input[i].checkValidity()) {
                $_Input[i].style.borderColor = 'red';

                $.wait(1,  function () {
                    $_Input[i].style.borderColor = '';
                });
                return false;
            }

        return true;
    };

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

})(self,  self.document,  self.iQuery || iQuery);



(function (BOM, DOM, $) {

/* ---------- DOM HTTP Request ---------- */

    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text';
    };
    BOM.DOMHttpRequest.JSONP = { };

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        };

    $.extend(BOM.DOMHttpRequest.prototype, {
        open:                function () {
            this.responseURL = arguments[1];
            this.readyState = 1;
        },
        setRequestHeader:    function () {
            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        send:                function (iData) {
            var iDHR = this,  _UUID_ = $.uuid('DHR');

            this.$_Transport =
                (iData instanceof BOM.FormData)  &&  $(iData.ownerNode);

            if (this.$_Transport && (
                iData.ownerNode.method.toUpperCase() == 'POST'
            )) {
                //  <iframe />
                var iTarget = this.$_Transport.submit(function () {
                        if ( $(this).data('_AJAX_Submitting_') )  return false;
                    }).attr('target');

                if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
                    this.$_Transport.attr('target', _UUID_);
                    iTarget = _UUID_;
                }

                $('iframe[name="' + iTarget + '"]').sandBox(function () {
                    iDHR.$_Transport.data('_AJAX_Submitting_', 0);
                    try {
                        iDHR.responseText = $(this).contents().find('body').text();
                    } catch (iError) { }

                    $.extend(iDHR, Success_State, {
                        responseType:    'text',
                        response:        iDHR.responseText
                    });
                    iDHR.onload();
                }).attr('name', iTarget);

                this.$_Transport.submit();
            } else {
                //  <script />, JSONP
                var iURL = this.responseURL.match(/([^\?=&]+\?|\?)?(\w.+)?/);

                if (! iURL)  throw 'Illegal JSONP URL !';

                this.constructor.JSONP[_UUID_] = function (iJSON) {
                    $.extend(iDHR, Success_State, {
                        responseType:    'json',
                        response:        iJSON,
                        responseText:    JSON.stringify(iJSON)
                    });
                    iDHR.onload();

                    delete this[_UUID_];
                    iDHR.$_Transport.remove();
                };
                this.responseURL = iURL[1] + $.param(
                    $.extend(arguments[0] || { },  $.paramJSON(
                        '?' + iURL[2].replace(
                            /(\w+)=\?/,  '$1=DOMHttpRequest.JSONP.' + _UUID_
                        )
                    ))
                );
                this.$_Transport = $('<script />', {
                    type:       'text/javascript',
                    charset:    'UTF-8',
                    src:        this.responseURL
                }).appendTo(DOM.head);
            }

            this.readyState = 2;
        },
        abort:               function () {
            this.$_Transport = null;
            this.readyState = 0;
        }
    });

/* ---------- AJAX for IE 10- ---------- */

    $.ajaxTransport(function (iOption) {
        var iXHR;

        if (($.browser.msie < 10)  &&  iOption.crossDomain)
            return {
                send:     function (iHeader, iComplete) {
                    iXHR = new BOM.XDomainRequest();

                    iXHR.open(iOption.type, iOption.url, true);

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
                    iXHR.send(iOption.data);
                },
                abort:    function () {
                    iXHR.abort();
                    iXHR = null;
                }
            };
    });

    function DHR_Transport(iOption) {
        var iXHR,  iForm = iOption.data.ownerNode;

        switch (true) {
            case (
                (iOption.data instanceof BOM.FormData)  &&
                $(iForm).is('form')  &&
                $('input[type="file"]', iForm)[0]
            ):
                break;
            case ($.fn.iquery  &&  (iOption.dataType == 'jsonp')):
                break;
            default:    return;
        }

        return {
            send:     function (iHeader, iComplete) {
                if (iOption.dataType == 'jsonp')
                    iOption.url += (iOption.url.split('?')[1] ? '&' : '?')  +
                        iOption.jsonp + '=?';

                iXHR = new BOM.DOMHttpRequest();
                iXHR.open(iOption.type, iOption.url);
                iXHR.onload = function () {
                    var iResponse = {text:  iXHR.responseText};
                    iResponse[ iXHR.responseType ] = iXHR.response;

                    iComplete(iXHR.status, iXHR.statusText, iResponse);
                };
                iXHR.send(iOption.data);
            },
            abort:    function () {
                iXHR.abort();
            }
        };
    }

    $.ajaxTransport(DHR_Transport);

    $.ajaxTransport('jsonp', DHR_Transport);

/* ---------- Form Element AJAX Submit ---------- */

    $.fn.ajaxSubmit = function (iCallback) {
        if (! this.length)  return this;

        function AJAX_Submit() {
            var $_Form = $(this);

            if ((! this.checkValidity())  ||  $_Form.data('_AJAX_Submitting_'))
                return false;

            $_Form.data('_AJAX_Submitting_', 1);

            var iMethod = ($_Form.attr('method') || 'Get').toLowerCase();

            if (typeof $[iMethod] == 'function')
                $[iMethod](
                    this.action,
                    $.paramJSON('?' + $_Form.serialize()),
                    function () {
                        $_Form.data('_AJAX_Submitting_', 0);
                        iCallback.apply($_Form[0], arguments);
                    }
                );
            arguments[0].preventDefault();
        }

        var $_Form = this.filter('form');

        if ( $_Form[0] )
            $_Form.submit(AJAX_Submit);
        else
            this.on('submit', 'form:visible', AJAX_Submit);

        return this;
    };

})(self,  self.document,  self.iQuery || iQuery);


//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v2.0  (2016-08-05)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//          (C)2015-2016    shiy2008@gmail.com
//



(function (BOM, DOM, $) {

    if (typeof BOM.jQuery != 'function')  BOM.$ = BOM.jQuery = $;

    return $;

})(self,  self.document,  self.iQuery || iQuery);


});

//
//                >>>  EasyImport.js  <<<
//
//
//      [Version]    v1.2  (2016-06-14)  Stable
//
//      [Usage]      A Asynchronous & Responsive Loader
//                   for Resource File in Web Browser.
//
//
//            (C)2013-2016    SCU FYclub-RDD
//



(function (BOM, DOM, $) {

/* ----------- Standard Mode Meta Patches ----------- */

    var $_Meta = [ ],  $_Head = $('head');

    if ($.browser.mobile) {
        if ($.browser.modern)
            $_Meta.push(
                $('<meta />', {
                    name:       "viewport",
                    content:    [
                        'width' + '=' + (
                            BOM.navigator.userAgent.match(
                                /MicroMessenger|UCBrowser|UCWeb/i
                            )  ?
                            320  :  'device-width'
                        ),
                        'initial-scale=1.0',
                        'minimum-scale=1.0',
                        'maximum-scale=1.0',
                        'user-scalable=no',
                        'target-densitydpi=medium-dpi'
                    ].join(',')
                })[0]
            );
        else
            $_Meta = $_Meta.concat([
                $('<meta />', {
                    name:       'MobileOptimized',
                    content:    320
                })[0],
                $('<meta />', {
                    name:       'HandheldFriendly',
                    content:    'true'
                })[0]
            ]);
    }
    if ($.browser.msie)
        $_Meta.push(
            $('<meta />', {
                'http-equiv':    'X-UA-Compatible',
                content:         'IE=Edge, Chrome=1'
            })[0]
        );

    $_Meta = $($_Meta);

    if (! $('head meta').slice(-1).after($_Meta).length)
        $_Head.find('link, title, script').eq(0).before($_Meta);


/* ---------- Loading Queue ---------- */

    var Root_Path = $.filePath( DOM.currentScript.src )  +  '/';

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
                if (! _Group_[j].match(/^(\w+:)?\/\//))
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
        $_DOM = $(DOM);


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

            $_Head.trigger({
                type:      'loading',
                detail:    0,
                data:      'Web Loading ...'
            });
            if (typeof iScript == 'function') {
                iScript();
                _Next_.call(iScript);
                continue;
            }
            $_Script.clone().one('load', _Next_)
                .attr('src', iScript).appendTo($_Head);

            $.start( $.fileName(iScript) );
        }
    }
/* ----------- Open API ----------- */

    var Load_Times = 0;

    function Load_End() {
        $(DOM.body).trigger({
            type:      'loading',
            detail:    1
        });

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

    /* ----- Lazy Loading  v0.2 ----- */

    function Scroll_Queue() {
        this.$_ViewPort = $(arguments[0] || BOM);
        this.vpHeight = this.$_ViewPort.height();
        this.count = 0;
        this.finish = [ ];
    }

    Scroll_Queue.prototype.watch = function () {
        var _This_ = this,  $_DOM = $(this.$_ViewPort[0].document);

        this.$_ViewPort.scroll(function () {
            var iLazy = _This_[ $_DOM.scrollTop() ];
            if (! iLazy)  return;

            for (var i = 0;  i < iLazy.length;  i++)
                if (
                    ($.inArray(iLazy[i], _This_.finish)  ==  -1)  &&
                    (false  !==  _This_.onScroll( iLazy[i] ))
                ) {
                    _This_.finish.push( iLazy[i] );

                    if (--_This_.count == 0)
                        _This_.$_ViewPort.unbind('scroll', arguments.callee);
                }
        });
    };

    Scroll_Queue.prototype.register = function (Item) {
        if (! Item)  return;

        Item = $.likeArray(Item) ? Item : [Item];

        if ((! this.count)  &&  Item.length)  this.watch();

        for (var i = 0, Off_Top, iNO;  i < Item.length;  i++) {
            Off_Top = $(Item[i]).offset().top;

            iNO = Math.round(
                (Off_Top < this.vpHeight)  ?  0  :  (Off_Top - this.vpHeight)
            );
            for (;  iNO < Off_Top;  iNO++)
                if (! this[iNO])
                    this[iNO] = [ Item[i] ];
                else
                    this[iNO].push( Item[i] );
        }
        this.count += Item.length;
    };

    $_DOM.ready(function () {
        var iQueue = new Scroll_Queue(),  Lazy_Tag = $.makeSet('IMG', 'IFRAME');

        iQueue.onScroll = function (iLazy) {
            if ( iLazy.dataset.src )
                iLazy.src = iLazy.dataset.src;
            else
                iLazy.style.backgroundImage = iLazy.dataset.background;
        };

        if ( $.browser.modern )
            this.addEventListener('DOMNodeInserted',  function () {
                var iTarget = arguments[0].target;

                if (iTarget.nodeType != 1)  return;

                if (iTarget.tagName in Lazy_Tag) {
                    if (! iTarget.dataset.src)  return;
                } else if (! iTarget.dataset.background)
                    return;

                iQueue.register( iTarget );
            });

        iQueue.register(
            $('img[data-src], iframe[data-src], *[data-background]', this.body)
        );
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
                    column:
                        iColumn  ||  (BOM.event && BOM.event.errorCharacter)  ||  0
                };

            if (iError)  iData.stack = String(iError.stack || iError.stacktrace);

            $[iData.stack ? 'post' : 'get'](Console_URL, iData);
        });

        return true;
    };

})(self, self.document, self.iQuery);
