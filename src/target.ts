import { ImpulsusAction, ImpulsusController, ImpulsusControllerTarget, Impulsus } from './types';

/**
 * @param {HTMLElement} target
 * @param {string|null} targetName
 * @param {string|null} targetControllerName
 * @this {Impulsus}
 */
export default function (target: HTMLElement, targetName: string | null, targetControllerName: string | null) {
    /** @type {Impulsus} */
    const self: Impulsus = this;
    let subTargetNames = {};
    const refreshSubTargets =
        /**
         * @param {string} targetName
         * @param {string} targetControllerName
         * @return {{ [key: string]: ImpulsusControllerTarget }}
         */
        function (targetName: string, targetControllerName: string): { [key: string]: ImpulsusControllerTarget } {
            /** @type {{ [key: string]: ImpulsusControllerTarget }} */
            const subTargetNames: { [key: string]: ImpulsusControllerTarget } = {};
            if (null !== targetName && null !== targetControllerName) {
                const subTargets = Array.prototype.slice.call(document.querySelectorAll('[data-' + targetControllerName + '-target-' + targetName + ']'));
                subTargets.forEach(/** @param {HTMLElement} subTarget */ function (subTarget: HTMLElement) {
                    const subTargetName = subTarget.getAttribute('data-' + targetControllerName + '-target-' + targetName);
                    if (null == subTargetName) {
                        return;
                    }
                    const names = subTargetName.split(' ');
                    let namesUnique = '';
                    names.forEach((name) => {
                        const unique = new Date().getTime() + Math.floor((Math.random() * 8999) + 1000);
                        namesUnique += ' ' + name + ':' + unique;
                        subTargetNames[name + ':' + unique] = self.target(subTarget, null, null);
                    });
                    subTarget.setAttribute('data-' + targetControllerName + '-target-' + targetName, namesUnique.trim());
                });
            }

            return subTargetNames;
        }
    if (null !== targetName && null !== targetControllerName) {
        subTargetNames = refreshSubTargets(targetName, targetControllerName);
    }
    return {
        classList: target.classList,
        refreshTargets: function () {
            let subTargetNames = {};
            if (null !== targetName && null !== targetControllerName) {
                subTargetNames = refreshSubTargets(targetName, targetControllerName);
            }
            this.targets = 0 === Object.keys(subTargetNames).length ? null : subTargetNames
        },
        targets: 0 === Object.keys(subTargetNames).length ? null : subTargetNames,
        set:
            /**
             * @param {string|number|boolean} value
             * @return {void}
             **/
            function (value: string | number | boolean): void {
                if (Array.isArray(value) || 'object' === typeof value) {
                    return;
                }

                if ('input' === target.nodeName.toLowerCase()) {
                    /** @type {*} */
                    const input: any = target;
                    if ('checkbox' === target.getAttribute('type')) {
                        input.checked = parseInt(input.value) === parseInt('' + value) || true === value;
                        if (input.checked) {
                            target.setAttribute('checked', 'true');
                        } else {
                            target.removeAttribute('checked');
                        }
                    } else {
                        input.value = value;
                    }
                } else {
                    target.innerHTML = '' + value;
                }

                if ('section' === target.nodeName.toLowerCase()) {
                    self.bindLinks(target);
                    self.bindControllers(target);
                }

                const ev = new Event('change');
                target.dispatchEvent(ev);
            },
        get:
            /**
             * @return {string}
             */
            function (): string {
                if ('input' === target.nodeName.toLowerCase()) {
                    /** @type {*} */
                    const input: any = target;
                    if ('checkbox' === target.getAttribute('type')) {
                        return target.hasAttribute('checked') ? input.value : '0';
                    } else {
                        return input.value;
                    }
                }
                return target.innerHTML;
            },
        attr:
            /**
             * @param {string} name
             * @param {string|null} [value]
             * @return {string|null}
             */
            function (name: string, value: string | null): string | null {
                if (undefined !== value) {
                    if (null === value) {
                        target.removeAttribute(name);
                    } else {
                        target.setAttribute(name, value);
                    }
                }

                return target.getAttribute(name);
            },
        merge:
            /**
             * @param {unknown[]|{ [key: string]: unknown, [key: number]: unknown }} values
             * @this {ImpulsusController}
             */
            function (values: unknown[] | { [key: string]: unknown, [key: number]: unknown }) {
                /** @type {ImpulsusController} */
                const controller: ImpulsusController = this;
                if (null !== this.targets && !Array.isArray(values) && 'object' !== typeof values) {
                    return;
                }
                const merged = Array.prototype.slice.call(document.querySelectorAll('[data-' + targetControllerName + '-merged]'));
                merged.forEach(function (el: Element) {
                    el.remove(); // @todo - update instead of remove
                });
                target.setAttribute('data-' + targetControllerName + '-temp', new String(target.getAttribute('data-' + targetControllerName + '-target')).toString());
                target.removeAttribute('data-' + targetControllerName + '-target');
                target.style.display = target.hasAttribute('data-display') ? String(target.getAttribute('data-display')).toString() : target.style.display;
                target.removeAttribute('data-display');
                const actions = Array.prototype.slice.call(target.querySelectorAll('[data-action]'));
                const keys = Array.isArray(values) ? values.map((_, i) => i) : Object.keys(values);
                keys.forEach((key: string | number) => {
                    const node = target.cloneNode(true);
                    if (null !== target.parentNode) {
                        target.parentNode.insertBefore(node, target);
                    }
                    const el = document.querySelector('[data-' + targetControllerName + '-temp]');
                    if (null !== el) {
                        el.removeAttribute('data-' + targetControllerName + '-temp');
                        el.removeAttribute('data-model');
                        el.setAttribute('data-' + targetControllerName + '-merged', String(key));
                    }
                    actions.forEach(/** @param {ImpulsusAction} action */ function (action: ImpulsusAction) {
                        if ('events' in action && null !== el) {
                            const copy = el.querySelector('[data-action="' + action.getAttribute('data-action') + '"]');
                            Object.keys(action.events).forEach((listener) => {
                                action.events[listener].forEach(/** @param {*} callback */ function (callback: any) {
                                    if (null === copy) {
                                        return;
                                    }
                                    (copy as any).addEventListener(listener, callback);
                                });
                            });
                        }
                    });
                    Object.keys(controller.targets).forEach((subUnique) => {
                        const sub = String(subUnique.split(':').shift());
                        const selector = '[data-' + targetControllerName + '-target-' + targetName + ']';
                        const subTargets = null === el ? new Array() : Array.prototype.slice.call(el.querySelectorAll(selector));
                        subTargets.forEach(/** @param {Element} subTarget */ function (subTarget: Element) {
                            const name = subTarget.getAttribute('data-' + targetControllerName + '-target-' + targetName);
                            if (null === name) {
                                return;
                            }
                            const names = name.split(' ');
                            if (-1 === names.indexOf(subUnique)) {
                                return;
                            }
                            subTarget.setAttribute('data-' + targetControllerName + '-target-' + targetName + '-' + key, name);
                            let value = Array.isArray(values) ? values[parseInt(String(key))] : values[key as string];
                            if ('string' === typeof key && !Array.isArray(values)) {
                                value = values[key];
                                if (null !== value && 'object' === typeof value && sub in value) {
                                    /** @type {*} */
                                    const obj: { [key: string]: unknown } = value as unknown as { [key: string]: unknown };
                                    value = obj[sub];
                                } else {
                                    if ('$' === sub) {
                                        value = key;
                                    }
                                }
                            } else {
                                if (null !== value && 'object' === typeof value && sub in value) {
                                    /** @type {*} */
                                    var obj: { [key: string]: unknown } = value as unknown as { [key: string]: unknown };
                                    value = obj[sub];
                                }
                                else {
                                    if ('$' === sub) {
                                        value = key;
                                    }
                                }
                            }
                            if (subTarget.hasAttribute('data-' + targetControllerName + '-attr-' + targetName + '-' + key)) {
                                const attr = subTarget.getAttribute('data-' + targetControllerName + '-attr-' + targetName + '-' + key);
                                self.target(subTarget, null, null).attr(attr, value);
                            } else if (subTarget.hasAttribute('data-' + targetControllerName + '-attr-' + targetName)) {
                                const attr = subTarget.getAttribute('data-' + targetControllerName + '-attr-' + targetName);
                                self.target(subTarget, null, null).attr(attr, value);
                            } else {
                                self.target(subTarget, null, null).set(value);
                            }
                        });
                    });
                });
                target.setAttribute('data-' + targetControllerName + '-target', new String(target.getAttribute('data-' + targetControllerName + '-temp')).toString());
                target.removeAttribute('data-' + targetControllerName + '-temp');
                target.setAttribute('data-display', target.style.display);
                target.style.display = 'none';
            }
    };
}