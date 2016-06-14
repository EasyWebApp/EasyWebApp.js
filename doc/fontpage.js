(function (BOM, DOM, $) {

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

    var Demo_File = ['html', 'css', 'js'];

    $('body > .Body > .Grid-Row > .Tab > pre').each(function () {
        var $_This = $(this);

        $.get('doc/demo/index.' + Demo_File[arguments[0]],  function () {
            $_This.text( arguments[0] );
        });
    });

    if ($.browser.phone)  $('body > .Body > .Grid-Row iframe').remove();

})(self, self.document, self.jQuery);