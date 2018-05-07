import { mapTree } from './utility';

import Template from './Template';

const view_element = new WeakMap(), template_element = new WeakMap();


export default  class ObjectView extends Array {

    constructor(element) {

        view_element.set(super(), element);

        this.scan();
    }

    get element() {

        return  view_element.get( this );
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

        if ( template[0] )
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
                    this.parseTag( node );  break;
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

    render(data) {

        for (let template of this)
            template.evaluate(template_element.get( template ),  data);

        return this;
    }
}
