import View from './View';

import ObjectView from './ObjectView';


/**
 * View for Array model
 */
export default  class ArrayView extends View {

    constructor(element) {

        super( element ).name = element.dataset.array;

        this.template = element.firstElementChild;

        element.innerHTML = '';
    }

    /**
     * @param {Iterable} list
     *
     * @return {ArrayView}
     */
    render(list) {

        list = Array.from(
            list,
            item  =>
                (new ObjectView( this.template.cloneNode(true) )).render( item )
        );

        this.push(... list);

        this.element.append(... list.map(view => view.element));

        return this;
    }
}
