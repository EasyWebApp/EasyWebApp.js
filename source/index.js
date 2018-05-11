import Component, {_private_} from './Component';

import { extend } from './utility';


/**
 * Register a component
 *
 * @param {function} subClass
 *
 * @return {function} A proxy class of `subClass`
 */
export function component(subClass) {

    var {template, style} = Component.findTemplate();

    template = template.content;

    if ( style[0] )  template.prepend(... style);


    subClass = new Proxy(
        extend(subClass, Component),  {
            construct(target, argument, newTarget) {

                const _this_ = Reflect.construct(target, argument, newTarget);

                _private_.set(_this_,  { });

                return  _this_.boot( template );
            }
        }
    );

    customElements.define(subClass.tagName, subClass);

    return subClass;
}


/**
 * Set private data of an HTMLElement
 *
 * @param {Element} element
 * @param {string}  key
 * @param {*}       value
 *
 * @return {*} The `value` parameter
 */
export function set(element, key, value) {

    return _private_.get( element )[ key ] = value;
}


/**
 * Get private data of an HTMLElement
 *
 * @param {Element} element
 * @param {string}  key
 *
 * @return {*}
 */
export function get(element, key) {

    return _private_.get( element )[ key ];
}
