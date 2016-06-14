(function (BOM, DOM, $) {

    function Data_Fix(iData, Image_Key) {
        Image_Key = Image_Key || 'img';

        for (var i = 0;  iData[i];  i++) {
            iData[i].time = (new Date(iData[i].time)).toLocaleString();

            iData[i][Image_Key] = 'http://tnfs.tngou.net/img' + iData[i][Image_Key];

            if (iData[i].list)  arguments.callee(iData[i].list, 'src');
        }
    }

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
            } else
                Data_Fix([iData]);

            return iData;
        });

    $('body > .Foot > :first-child').click();

})(self, self.document, self.jQuery);