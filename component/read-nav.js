require(['jquery'],  function ($) {

//  树型转换：平铺 变 立体

    function Array2Tree() {

        var TempMap = { };

        $.each($.extend(true, [ ], arguments[0]),  function () {

            var _This_ = TempMap[ this.id ];

            _This_ = TempMap[ this.id ] = _This_ ?
                $.extend(this, _This_)  :  this;

            this.pid = this.pid || 0;

            var _Parent_ = TempMap[ this.pid ] = TempMap[ this.pid ]  ||  { };

            (_Parent_.children = _Parent_.children || [ ]).push(_This_);
        });

        return TempMap[0].children;
    }

//  标题层级抽取

    function Header2Tree() {

        var $_Header = this.find(':header');

        $_Header = $.map($_Header,  function (_This_) {
            return {
                level:    _This_.nodeName[1],
                title:    _This_.textContent.trim(),
                id:
                    _This_.id = _This_.id.trim('-') || $.uuid('Read-Nav')
            };
        });

        $.each($_Header,  function (Index) {

            while ( $_Header[--Index] )
                if ($_Header[ Index ].level  <  this.level) {

                    this.pid = $_Header[ Index ].id;

                    break;
                }
        });

        return  Array2Tree( $_Header );
    }

//  SPA 内页联动

    var iWebApp = $().iWebApp();

    iWebApp.component(function () {

        var iTree = this.$_View.find('[tabindex]:list').view();

        function Updater() {

            iTree.clear().render( Header2Tree.call( iWebApp.$_View ) );
        }

        iWebApp.on({
            type:      'ready',
            target:    iWebApp.$_View[0]
        },  function () {

            Updater();

            arguments[1].on('attach', Updater);
        });

        this.$_View.on('click',  'a',  function () {

            $( document.scrollingElement ).scrollTo( this.getAttribute('href') );

            return false;
        });
    });
});