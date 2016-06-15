(function (BOM, DOM, $) {

    function Data_Fix(iData, Image_Key) {
        var _Self_ = arguments.callee;

        Image_Key = Image_Key || 'img';

        return  $.each(iData,  function () {
            this.title = this.title || this.name;

            if ( this.time )
                this.time = (new Date(this.time)).toLocaleString();

            this[Image_Key] = 'http://tnfs.tngou.net/img' + this[Image_Key];

            this.fromname = this.fromname || "天狗云平台";
            this.fromurl = this.fromurl || this.url;

            if (this.list)  _Self_(this.list, 'src');
        });
    }

    var $_Foot = $('body > .Foot');

    $('body > .Body').WebApp('http://www.tngou.net/')
        .on('pageRender',  function (This_Page, Prev_Page, iData) {

            if (This_Page.JSON)
                $('div[multiple] > .Item-Box.visible')
                    .attr('href',  function () {
                        return  (This_Page.JSON.indexOf('tnfs') > -1)  ?
                            'html/gallery.html'  :  arguments[1];
                    })
                    .attr('src',  function () {
                        return  $.filePath(This_Page.JSON) + arguments[1];
                    });

            if (This_Page.HTML.indexOf('list.html') > -1) {
                iData = iData.tngou;
                Data_Fix(iData);
                $_Foot.show();
                this.domRoot.css('height', '80%');
            } else {
                Data_Fix([iData]);
                $_Foot.hide();
                this.domRoot.css('height', '90%');
            }

            return iData;
        });

    $('body > .Foot > :first-child').click();

})(self, self.document, self.jQuery);