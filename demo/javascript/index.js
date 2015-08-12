(function (BOM, DOM, $) {

    var URL_Args = $.paramJSON(),  $_Body = $(DOM.body);



/* ---------- 通用模块 ---------- */
    BOM.iDaily = {
        Error_Check:    function (iResponse) {
            iResponse = iResponse || arguments.callee.caller.arguments[0];
            if (iResponse.code == 200)  return iResponse;

            BOM.alert([
                iResponse.message,
                "（出错信息已上报，我们的程序猿已垂死病中惊坐起……）"
            ].join("\n\n"));

            throw Error(iResponse.message);
        },
        Load_Cover:    function () {
            BOM.showModalDialog($("<h1>今天，世界又是新的……</h1>"), {
                ' ': {
                    background:    'rgb(53, 52, 57)  !important',
                    color:         'white'
                }
            });
            $('body > .Cover').find('h1').cssAnimate('fadeIn', 2000, true);
        }
    };

/* ---------- 数据 API ---------- */
    var Proxy_API = 'php/proxy.php?url=',
        API_Host = 'http://apix.sinaapp.com/';


    $.getJSON('php/proxy.php',  function () {

        var User_Data = $.extend(BOM.iDaily.Error_Check().data, {
                WeChat_AppKey:    URL_Args.wechat_appkey || 'trialuser',
                city:             arguments[0].data.city.replace(/(市|自治|特别).*/, '')
            });

        $_Body.on('apiCall',  function () {

            var iData = arguments[4];

            switch ( $.fileName(arguments[3]) ) {
                case 'joke':       return {
                    joke:    iData.split("\n")[0]
                };
                case 'weather':    return {
                    now:        iData[1].Title,
                    suggest:    iData[2].Title,
                    days:       iData.slice(3)
                };
            }
        }).on('pageRender',  function (iEvent, This_Page, Prev_Page, iData) {

            BOM.iDaily.Load_Cover();
            //  激活 EasyWebUI 对老版现代浏览器 Flex 布局的修复
            $('.Flex-Box').addClass('Flex-Box');

            switch ( $.fileName(This_Page.HTML) ) {
                case 'history.html':    {
                    var iTimeLine = iData.split("\n");

                    for (var i = 0;  i < iTimeLine.length;  i++) {
                        iTimeLine[i] = $.split(iTimeLine[i], /\s+/, 2, ' ');
                        iTimeLine[i] = {
                            year:     iTimeLine[i][0],
                            event:    iTimeLine[i][1]
                        };
                    }
                    return iTimeLine;
                }
                case 'english.html':    return iData[0];
            }
            return iData;

        }).on('pageReady',  function () {

            BOM.iShadowCover.close();

        }).WebApp(User_Data,  Proxy_API + API_Host);
    });

/* ---------- 全局功能 ---------- */
    $_Body.on('ScriptLoad', BOM.iDaily.Load_Cover)
        .on($.browser.mobile ? 'tap' : 'click',  '.Button[href^="#"]',  function () {
            var iTips = {text: '',  image: ''};

            switch ( $(this).attr('href').slice(1) ) {
                case 'share':     {
                    iTips.text = "分享到 朋友圈、QQ 好友";
                    iTips.image = 'Tips_Share.png';
                }  break;
                case 'store':     {
                    iTips.text = "添加到 微信收藏夹";
                    iTips.image = 'Tips_Store.png';
                }  break;
                case 'return':    {
                    BOM.history.back();
                    return;
                }
            }

            var iHTML = [
                    "<h3>点击右上角的“...”功能菜单<br />",
                    iTips.text,  '</h3>',
                    '<img src="image/icon/Arrow_Up.png" />',
                    '<img class="Logo" src="image/',  iTips.image,  '" />'
                ];
            BOM.showModalDialog($(iHTML.join('')), {
                ' ': {
                    background:    'rgb(53, 52, 57)  !important',
                    color:         'white'
                },
                ' > *': {
                    'vertical-align':    'top  !important',
                    padding:             '1em  0'
                },
                ' h3': {
                    'text-align':     'right',
                    margin:           '1em',
                    'font-size':      '1em',
                    'line-height':    '2em',
                    display:          'inline-block'
                },
                ' h3:before': {
                    content:            '"↑"',
                    position:           'relative',
                    display:            'block',
                    'margin-bottom':    '1em'
                },
                ' img:first-of-type': {
                    width:    '3.5em'
                },
                ' img.Logo': {
                    display:             'inline-block',
                    'border-radius':     '5px',
                    'vertical-align':    'middle'
                }
            });
        });

})(self, self.document, self.iQuery);