require(['jquery', 'jQuery+'],  function ($) {

    function iTimer(iCallback) {

        return  self.requestAnimationFrame(function () {

            if (false  !==  iCallback.apply(this, arguments))
                iTimer( iCallback );
        });
    }

    function tabSwitch() {

        var _This_ = this,  Index = 0;

        this.times = Infinity;

        iTimer($.throttle(2,  function () {

            if (++Index >= _This_.length)  Index = 0;

            if (! _This_.times)  return false;

            if (_This_[ Index ])
                _This_[ Index ].$_View[0].firstElementChild.click();
        }));
    }

    $().iWebApp().component(function () {

        var iSlide = this.$_View.find('ul').view();

        arguments[0].name = iSlide.__id__;

    //  幻灯播放

        iSlide.play = tabSwitch;

        iSlide.$_View.hover(function () {

            iSlide.times = 0;

        },  tabSwitch.bind( iSlide ));

        iSlide.play();
    });
});