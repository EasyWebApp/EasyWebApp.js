(function (BOM, DOM, $) {

    var URL_Args = $.paramJSON(),  $_Body = $(DOM.body);



/* ---------- 通用模块 ---------- */
    BOM.iDaily = {
        Error_Check:    function (iError) {
            iError = iError || arguments.callee.caller.arguments[0];
            if (iError.code == 200) return;

            BOM.alert([
                iError.message,
                "（出错信息已上报，我们的程序猿已垂死病中惊坐起……）"
            ].join("\n\n"));

            throw Error(iError.message);
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
    var API_Host = 'http://apix.sinaapp.com/',
        Date_Ready = 0,
        User_Data = {
            WeChat_AppKey:    URL_Args.wechat_appkey || BOM.prompt('微信公众平台 AppKey') || 'trialuser'
        },
        Index_Data = { };

    function Main_Logic() {
        $_Body.on('pageRender',  function (iEvent, This_Page, Prev_Page, iData) {

            BOM.iDaily.Load_Cover();
            //  激活 EasyWebUI 对老版现代浏览器 Flex 布局的修复
            $('.Flex-Box').addClass('Flex-Box');

            if ($.fileName(This_Page.HTML) == 'index.html')
                return Index_Data;

            return iData;

        }).on('pageReady',  function () {

            BOM.iShadowCover.close();

        }).WebApp(User_Data, API_Host);
    }

    $.get(API_Host + 'joke?appkey=' + User_Data.WeChat_AppKey,  function () {
        Index_Data.joke = eval(arguments[0]).split("\n")[0];

        if (++Date_Ready == 3)  Main_Logic();
    });

    $.get(API_Host + 'history?appkey=' + User_Data.WeChat_AppKey,  function () {
        Index_Data.history = eval(arguments[0]);

        if (++Date_Ready == 3)  Main_Logic();
    });

    $.getJSON('http://www.telize.com/geoip?callback=?',  function () {
        $.getJSON('http://ip.taobao.com/service/getIpInfo.php?ip=' + arguments[0].ip,  function () {
            BOM.iDaily.Error_Check();

            $.extend(User_Data, arguments[0].data);

            $.getJSON(
                API_Host + 'weather',
                {
                    appkey:    User_Data.WeChat_AppKey,
                    city:      User_Data.city.slice(0, 2)
                },
                function (iWeather) {
                    $.extend(Index_Data, {
                        now:        iWeather[1].Title,
                        suggest:    iWeather[2].Title,
                        days:       iWeather.slice(3)
                    });

                    if (++Date_Ready == 3)  Main_Logic();
                }
            );
        });
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