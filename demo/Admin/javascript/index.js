require([
    'iQuery+',
    'http://cdn.bootcss.com/marked/0.3.5/marked.min',
    '../css/EasyWebUI',
    'EasyWebApp'
],  function () {


$(document).ready(function () {

    var BOM = self,  DOM = self.document;

    var Image_Root = 'http://tnfs.tngou.net/img';

    function Data_Page(iSum, iUnit) {
        if (iSum > -1)
            return  $.map(Array(Math.ceil(iSum / iUnit)),  function () {
                return  {index:  arguments[1] + 1};
            });
    }

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

    var iWebApp = $('#Main_View').WebApp({ }, 'http://www.tngou.net/');

    iWebApp.on('pageRender',  function (This_Page, Prev_Page, iData) {
        var _TP_ = $.fileName(This_Page.HTML);

        if ((! $.isEmptyObject(iData))  &&  (iData.status === false))
            return BOM.alert(iData.msg);

        switch ( _TP_.split('.')[0] ) {
            case 'search':       {
                iData.page = Data_Page(iData.total);
                return iData;
            }
            case 'list':         {
                if (! iData._Data_Name_) {
                    iData = {
                        page:    Data_Page(
                            iData.total,
                            $.paramJSON( this.domRoot.find('form')[0].action ).rows
                        ),
                        list:    Data_Fix(iData.tngou)
                    };

                    var tBody = $.ListView.getInstance('tbody');
                    var $_tHead = tBody.$_View.prevAll('thead').find('th');

                    $.each(tBody.$_Template[0].children,  function () {
                        var iKey = this.getAttribute('name') || (
                                $('[name]', this)[0].getAttribute('name')
                            );
                        var iAction = (iKey in iData.list[0])  ?  'show'  :  'hide';

                        $($_tHead[ $(this)[iAction]().index() ])[iAction]();
                    });

                    return iData;
                }

                $.ListView(
                    $.ListView.findView( this.domRoot.find('form') ),
                    ['label', 'input'],
                    function ($_Item) {
                        var _UUID_ = $_Item.filter('input')[0].id = $.uuid();
                        $_Item.filter('label')[0].setAttribute('for', _UUID_);
                    }
                ).on('afterRender',  function () {
                    this.$_View.children('label')[0].click();
                });

                $('table', this.domRoot[0]).iTable(
                    'http://www.tngou.net/' + iData._Data_Path_ + '/list?rows=10&callback=?'
                );

                return {
                    _Data_Path_:     iData._Data_Path_,
                    content_type:    iData.tngou
                };
            }
            case 'gallery':      iData.list = Data_Fix(iData.list);
            case 'news_text':    return Data_Fix([iData])[0];
        }
    });

});


});