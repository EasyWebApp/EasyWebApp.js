import View from './View';

import { mapTree } from './utility';

import Template from './Template';

import ArrayView from './ArrayView';

const template_element = new WeakMap();


/**
 * View for Object model
 */
export default  class ObjectView extends View {

    constructor(element) {

        super( element ).name = element.dataset.object;

        this.scan();
    }

    /**
     * @private
     */
    static templateOf(node, renderer) {

        return  new Template(node.value || node.nodeValue,  ['view'],  renderer);
    }

    /**
     * @private
     */
    register(element, template) {

        if (element instanceof View)
            this[ this.length ] = element;
        else if ( template[0] )
            template_element.set(this[ this.length ] = template,  element);
    }

    /**
     * @private
     */
    parseTag(element) {

        for (let attr of element.attributes) {

            let name = attr.name;

            let template = ObjectView.templateOf(
                attr,
                (name in element)  ?
                    (value  =>  element[ name ] = value)  :
                    (value  =>  element.setAttribute(name, value))
            );

            if (template == '')  element.removeAttribute( name );

            this.register(element, template);
        }
    }

    /**
     * @private
     */
    scan() {

        var root = this.element;

        root = root.parentNode  ?  root  :  {childNodes: [ root ]};

        mapTree(root,  'childNodes',  (node) => {

            switch ( node.nodeType ) {
                case 1:
                    if ( node.dataset.object )
                        this.register(new ObjectView( node ));
                    else if ( node.dataset.array )
                        this.register(new ArrayView( node ));
                    else
                        this.parseTag( node );
                    break;
                case 3:
                    this.register(
                        node,
                        ObjectView.templateOf(
                            node,  value => node.nodeValue = value
                        )
                    );
            }

            return node;
        });
    }

    /**
     * @param {Object} data
     *
     * @return {ObjectView}
     */
    render(data) {

        for (let template of this)
            if (template instanceof Template)
                template.evaluate(template_element.get( template ),  data);
            else if (template instanceof View)
                template.render( data[ template.name ] );

        return this;
    }
}
