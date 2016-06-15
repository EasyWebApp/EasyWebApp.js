(function (BOM, DOM, $) {

/* ---------- 顶部导航栏 ---------- */

    $('a[href^="#"]').click(function () {
        arguments[0].preventDefault();

        $(DOM.body).scrollTo( this.getAttribute('href') );
    });


    $('body > .Head form').submit(function () {
        var $_KeyWord = $('input[type="search"]', this);

        var iValue = $_KeyWord[0].value;

        $_KeyWord.one('blur',  function () {

            this.value = iValue;

        })[0].value += ' site:tech_query.oschina.io';
    });

/* ---------- 演示程序 面板 ---------- */

    var $_QRcode = $('#QRcode > .Body').empty();

    var $_Phone = $_QRcode.parentsUntil('.Grid-Row').find('iframe');

    $_QRcode.qrcode({
        render:     $.browser.modern ? 'image' : 'div',
        ecLevel:    'H',
        radius:     0.5,
        text:       $_Phone[0].src
    });

    if ($.browser.mobile  &&  (! $.browser.pad))
        $_Phone.remove();


    $.ListView('body > .Body > .Grid-Row > .Tab',  function ($_This, iValue) {
        $_This.filter('label').text(iValue);

        $.get('doc/demo/' + iValue,  function () {
            $_This.filter('pre').text( arguments[0] );
        });
    }).clear().render([
        'html/gallery.html', 'index.html', 'index.css', 'index.js',
        'html/list.html', 'html/article.html'
    ]);

})(self, self.document, self.jQuery);