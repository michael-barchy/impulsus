import { ImpulsusAction, ImpulsusControllerTarget, Impulsus } from './types';

/**
 * @param {Function} init
 * @param {CustomEvent} [event]
 * @this {Impulsus}
 */
export default function (init: Function, event: CustomEvent) {
    /** @type {Impulsus} */
    const self: Impulsus = this;
    const eventControllerName = event ? event.detail.controller : null;
    const scriptControllerName = document.currentScript ? document.currentScript.getAttribute('data-name') : 'controller';
    const controllerName = eventControllerName ? eventControllerName : scriptControllerName;
    const el = document.querySelector('[data-controller="' + controllerName + '"]');
    if (null === el) {
        return;
    }

    const targetControllerName = new String(controllerName).replace(/[^a-z0-9]/g, '-');
    const targets = Array.prototype.slice.call(el.querySelectorAll('[data-' + targetControllerName + '-target]'));
    /** @type {{ [key: string]: ImpulsusControllerTarget }} */
    const targetNames: { [key: string]: ImpulsusControllerTarget } = {};
    targets.forEach(/** @param {HTMLElement} target */ function (target: HTMLElement) {
        const targetName = target.getAttribute('data-' + targetControllerName + '-target');
        if (null == targetName) {
            return;
        }
        const names = targetName.split(' ');
        names.forEach((name) => targetNames[name] = self.target(target, name, targetControllerName));
    });

    /** @type {{ [key: string] : Function }} */
    var events: { [key: string] : Function } = {};
    var controller = {
        name: controllerName,
        targets: targetNames,
        on:
            /**
             * @param {string} event
             * @param {Function} callback
             **/
            function (event: string, callback: Function) {
                events[event] = callback;
            }
    };


    var actions = Array.prototype.slice.call(el.querySelectorAll('[data-action*="->' + controllerName + '#"]'));
    actions.forEach(function (el: Element) {
        const action = el as ImpulsusAction;
        var actionList = action.getAttribute('data-action').trim().split(' ');
        actionList.forEach(/** @param {string} actionItem */ function (actionItem: string) {
            var parts = actionItem.split('#');
            var event = new String(parts.pop()).toString();
            parts = new String(parts.pop()).split('->');
            var listener = new String(parts.shift()).toLowerCase();
            if (0 === listener.length) {
                listener = 'click';
            }
            if (!('events' in el)) {
                (el as ImpulsusAction).events = {};
            }
            if (!(listener in action.events)) {
                action.events[listener] = new Array();
            }
            var callback = /** @param {CustomEvent} e */ function (e: CustomEvent) {
                if (event in events) {
                    /** @type {Element} */
                    let target: Element = (null !== e.target ? e.target : action) as unknown as Element;
                    while (!target.hasAttribute('data-action') && target.parentNode) {
                        /** @type {*} */
                        const parent: Element = target.parentNode as unknown as Element;
                        target = parent;
                    }
                    const param = target.getAttribute('data-param-' + event);
                    events[event](param);
                    e.preventDefault();
                    e.stopPropagation();
                }
            };
            action.events[listener].push(callback);
            action.addEventListener(listener, callback);
            if ('render' === listener.toLowerCase()) {
                setTimeout(function () {
                    const e = self.customEvent('render');
                    action.dispatchEvent(e);
                }, 100);
            }
        });
    });

    init(controller);
}