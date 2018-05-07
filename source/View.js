const view_element = new WeakMap();


/**
 * Abstract View
 */
export default  class View extends Array {
    /**
     * @param {Element} element
     */
    constructor(element) {

        view_element.set(super(), element);

        if (this.constructor === View)
            throw TypeError('"View" is an abstract class');
    }

    /**
     * @return {Element}
     */
    get element() {

        return  view_element.get( this );
    }

    /**
     * Render this view
     *
     * @return {View}
     */
    render() {

        throw TypeError('View.prototype.render() must be overwriten');
    }
}
