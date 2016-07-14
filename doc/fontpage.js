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

    $('#QRcode > .Body').qrcode({
        render:     $.browser.modern ? 'image' : 'div',
        ecLevel:    'H',
        radius:     0.5,
        mode:       2,
        label:      'iDaily',
        text:       $.urlDomain() + '/idaily/'
    });

    if ($.browser.mobile  &&  (! $.browser.pad))
        $('body > .Body > .Grid-Row iframe').remove();


    $.ListView('body > .Body > .Grid-Row > .Tab',  function ($_This, iValue) {
        $_This.filter('label').text( $.fileName(iValue) )[0].title = iValue;

        $.get('../idaily/' + iValue,  function () {
            $_This.filter('pre').text( arguments[2].responseText );
        });
    }).clear().render([
        'index.html', 'css/index.css', 'javascript/index.js',
        'html/list.html', 'html/article.html', 'html/gallery.html'
    ]);

})(self, self.document, self.jQuery);