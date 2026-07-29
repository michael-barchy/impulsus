(function () {

    /**
     * @param {ImpulsusWindow} global
     * @this {Impulsus}
     */
    function impulsusExports (global) {
        /** @type {Impulsus} */
        var self = this;
        /** @type {HTMLElement|null} */
        var dataXhr = document.querySelector('[data-xhr]');
        var xhrFunc = null;
        try {
            var f = dataXhr ? dataXhr.getAttribute('data-xhr') : null;
            xhrFunc = dataXhr && f ? new Function(f) : null;
        }
        catch (_a) {
            xhrFunc = null;
        }
        global.Impulsus = {
            xhr: xhrFunc ? xhrFunc : self.xhr,
            controller: self.controller
        };
        if (xhrFunc) {
            global.Impulsus._xhr = self.xhr;
        }
    }

    /**
     * @param {ImpulsusWindow} global
     * @this {Impulsus}
     */
    function init (global) {
        /** @type {Impulsus} */
        var self = this;
        self.exports(global);
        window.addEventListener('popstate', function (event) {
            if (event.state) {
                if ('target' in event.state && 'html' in event.state) {
                    var el_1 = document.querySelector('#' + event.state.target);
                    if (null !== el_1) {
                        el_1.innerHTML = event.state.html;
                        el_1.setAttribute('data-src', event.state.src);
                        self.bindLinks(el_1);
                        self.bindControllers(el_1);
                        setTimeout(function () {
                            if (null !== el_1) {
                                var event_1 = self.customEvent('impulsus:load');
                                el_1.dispatchEvent(event_1);
                            }
                        }, 100);
                    }
                }
            }
        });
        /** @type {Element|null} */
        var root = document.querySelector('html');
        var observer = new MutationObserver(function (mutations) {
            Array.prototype.slice.call(mutations).forEach(function (mutation) {
                if ('data-controller' === mutation.attributeName || 'data-model' === mutation.attributeName) {
                    self.bindControllers();
                }
                if ('data-action' === mutation.attributeName) {
                    var parent_1 = root;
                    if (null === root) {
                        /** @type {*} */
                        var parentOfParent = mutation.target.parentNode;
                        parent_1 = parentOfParent;
                    }
                    if (null !== parent_1) {
                        self.bindLinks(parent_1);
                    }
                }
            });
        });
        if (null !== root) {
            observer.observe(root, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }
        var h = location.hash.substring(1);
        var parts = h.split('=');
        if (2 === parts.length) {
            var section_1 = document.querySelector('#' + parts[0]);
            if (null === section_1) {
                return;
            }
            self.load(section_1, parts[1], function () {
                if (null === section_1) {
                    return;
                }
                self.bind(section_1);
                self.bind();
            });
            return;
        }
        self.bind();
        var event = self.customEvent('impulsus:ready');
        window.dispatchEvent(event);
    }

    /**
     * @param {string} event
     * @param {*} [params]
     * @returns {*}
     */
    function customEvent (event, params) {
        if ('function' === typeof window.CustomEvent)
            return new window.CustomEvent(event, params);
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var customEvent = document.createEvent('CustomEvent');
        customEvent.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return customEvent;
    }

    /**
     * @param {Element} [root]
     * @this {Impulsus}
     */
    function bind (root) {
        /** @type {Impulsus} */
        var self = this;
        self.bindSections(root);
        self.bindControllers(root);
    }

    /**
     * @param {Element} section
     * @this {Impulsus}
     */
    function bindLinks (section) {
        /** @type {Impulsus} */
        var self = this;
        var links = Array.prototype.slice.call(section.querySelectorAll('a'));
        links.forEach(function (link) {
            if ('false' === link.getAttribute('data-impulsus')) {
                return;
            }
            if ('true' === link.getAttribute('data-bind')) {
                return;
            }
            link.setAttribute('data-bind', 'true');
            link.addEventListener('click', /** @param {Event} event */ function (event) {
                var target = null;
                if (link.dataset.target) {
                    var dataTarget = '' + link.dataset.target;
                    target = self.resolveTarget(dataTarget);
                }
                if (null === target) {
                    target = section;
                }
                if (!target.hasAttribute('id')) {
                    target.setAttribute('id', 'section-' + new Date().getTime());
                }
                if (link.hasAttribute('data-navigate')) {
                    history.replaceState({
                        target: target.getAttribute('id'),
                        src: target.getAttribute('data-src'),
                        html: target.innerHTML
                    }, '', location.href);
                }
                self.load(target, link.href, /** @param {Element} target */ function (target) {
                    self.bind(target);
                    if (link.hasAttribute('data-navigate')) {
                        var root = location.href.replace(location.hash, '');
                        if (root.lastIndexOf('/') !== root.length - 1) {
                            var parts = root.split('/');
                            parts.pop();
                            root = parts.join('/') + '/';
                        }
                        var href = link.href.replace(root, '');
                        history.pushState({
                            target: target.getAttribute('id'),
                            src: href,
                            html: target.innerHTML
                        }, '', root + '#' + target.getAttribute('id') + '=' + href);
                    }
                });
                event.preventDefault();
                event.stopPropagation();
            });
        });
    }

    /**
     * @param {Element|Document} [root]
     * @this {Impulsus}
     */
    function bindControllers (root) {
        /** @type {Impulsus} */
        var self = this;
        if (undefined === root) {
            root = document;
        }
        var controllers = Array.prototype.slice.call(root.querySelectorAll('[data-controller]'));
        controllers.forEach(function (controller) {
            var controllerName = controller.getAttribute('data-controller');
            var script = document.querySelector('script[data-name="' + controllerName + '"]');
            if (null !== script && !script.hasAttribute('src') && !script.hasAttribute('data-bind')) {
                var event_1 = self.customEvent('impulsus:controller', {
                    detail: {
                        controller: controllerName
                    }
                });
                window.dispatchEvent(event_1);
                script.setAttribute('data-bind', 'true');
                script.innerHTML = '';
            }
            if (null !== script && script.hasAttribute('data-bind')) {
                return;
            }
            script = document.createElement('script');
            script.setAttribute('src', 'controllers/' + controllerName + '.controller.js');
            script.setAttribute('data-name', controllerName);
            script.setAttribute('data-bind', 'true');
            var head = document.querySelector('head');
            if (null === head) {
                head = document.body;
            }
            head.appendChild(script);
        });
    }

    /**
     * @param {Element|Document} [root]
     * @this {Impulsus}
     */
    function bindSections (root) {
        /** @type {Impulsus} */
        var self = this;
        if (undefined === root) {
            root = document;
        }
        var sections = Array.prototype.slice.call(root.querySelectorAll('section'));
        sections.forEach(function (section) {
            if ('false' === section.getAttribute('data-impulsus')) {
                return;
            }
            if (section.dataset.src) {
                self.load(section, section.dataset.src);
            }
            self.bindLinks(section);
        });
    }

    /**
     * @param {Function} init
     * @param {CustomEvent} [event]
     * @this {Impulsus}
     */
    function controller (init, event) {
        /** @type {Impulsus} */
        var self = this;
        var eventControllerName = event ? event.detail.controller : null;
        var scriptControllerName = document.currentScript ? document.currentScript.getAttribute('data-name') : 'controller';
        var controllerName = eventControllerName ? eventControllerName : scriptControllerName;
        var el = document.querySelector('[data-controller="' + controllerName + '"]');
        if (null === el) {
            return;
        }
        var targetControllerName = new String(controllerName).replace(/[^a-z0-9]/g, '-');
        var targets = Array.prototype.slice.call(el.querySelectorAll('[data-' + targetControllerName + '-target]'));
        /** @type {{ [key: string]: ImpulsusControllerTarget }} */
        var targetNames = {};
        targets.forEach(/** @param {HTMLElement} target */ function (target) {
            var targetName = target.getAttribute('data-' + targetControllerName + '-target');
            if (null == targetName) {
                return;
            }
            targetNames[targetName] = self.target(target, targetName, targetControllerName);
        });
        /** @type {{ [key: string] : Function }} */
        var events = {};
        var controller = {
            name: controllerName,
            targets: targetNames,
            on: 
            /**
             * @param {string} event
             * @param {Function} callback
             **/
            function (event, callback) {
                events[event] = callback;
            }
        };
        var actions = Array.prototype.slice.call(el.querySelectorAll('[data-action*="->' + controllerName + '#"]'));
        actions.forEach(function (el) {
            var action = el;
            var actionList = action.getAttribute('data-action').trim().split(' ');
            actionList.forEach(/** @param {string} actionItem */ function (actionItem) {
                var parts = actionItem.split('#');
                var event = new String(parts.pop()).toString();
                parts = new String(parts.pop()).split('->');
                var listener = new String(parts.shift()).toLowerCase();
                if (0 === listener.length) {
                    listener = 'click';
                }
                if (!('events' in el)) {
                    el.events = {};
                }
                if (!(listener in action.events)) {
                    action.events[listener] = new Array();
                }
                var callback = /** @param {CustomEvent} e */ function (e) {
                    if (event in events) {
                        /** @type {Element} */
                        var target = (null !== e.target ? e.target : action);
                        while (!target.hasAttribute('data-action') && target.parentNode) {
                            /** @type {*} */
                            var parent_1 = target.parentNode;
                            target = parent_1;
                        }
                        var param = target.getAttribute('data-param-' + event);
                        events[event](param);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                };
                action.events[listener].push(callback);
                action.addEventListener(listener, callback);
                if ('render' === listener.toLowerCase()) {
                    setTimeout(function () {
                        var e = self.customEvent('render');
                        action.dispatchEvent(e);
                    }, 100);
                }
            });
        });
        init(controller);
    }

    /**
     * @param {HTMLElement} target
     * @param {string|null} targetName
     * @param {string|null} targetControllerName
     * @this {Impulsus}
     */
    function target (target, targetName, targetControllerName) {
        /** @type {Impulsus} */
        var self = this;
        var subTargetNames = {};
        var refreshSubTargets = 
        /**
         * @param {string} targetName
         * @param {string} targetControllerName
         * @return {Object<string, ImpulsusControllerTarget>}
         */
        function (targetName, targetControllerName) {
            /** @type {{ [key: string]: ImpulsusControllerTarget }} */
            var subTargetNames = {};
            if (null !== targetName && null !== targetControllerName) {
                var subTargets = Array.prototype.slice.call(document.querySelectorAll('[data-' + targetControllerName + '-target-' + targetName + ']'));
                subTargets.forEach(/** @param {HTMLElement} subTarget */ function (subTarget) {
                    var subTargetName = subTarget.getAttribute('data-' + targetControllerName + '-target-' + targetName);
                    if (null == subTargetName) {
                        return;
                    }
                    subTargetNames[subTargetName] = self.target(subTarget, null, null);
                });
            }
            return subTargetNames;
        };
        if (null !== targetName && null !== targetControllerName) {
            subTargetNames = refreshSubTargets(targetName, targetControllerName);
        }
        return {
            classList: target.classList,
            refreshTargets: function () {
                var subTargetNames = {};
                if (null !== targetName && null !== targetControllerName) {
                    subTargetNames = refreshSubTargets(targetName, targetControllerName);
                }
                this.targets = 0 === Object.keys(subTargetNames).length ? null : subTargetNames;
            },
            targets: 0 === Object.keys(subTargetNames).length ? null : subTargetNames,
            set: 
            /**
             * @param {string|number|boolean} value
             * @return {void}
             **/
            function (value) {
                if (Array.isArray(value) || 'object' === typeof value) {
                    return;
                }
                if ('input' === target.nodeName.toLowerCase()) {
                    /** @type {*} */
                    var input = target;
                    if ('checkbox' === target.getAttribute('type')) {
                        input.checked = parseInt(input.value) === parseInt('' + value) || true === value;
                        if (input.checked) {
                            target.setAttribute('checked', 'true');
                        }
                        else {
                            target.removeAttribute('checked');
                        }
                    }
                    else {
                        input.value = value;
                    }
                }
                else {
                    target.innerHTML = '' + value;
                }
                if ('section' === target.nodeName.toLowerCase()) {
                    self.bindLinks(target);
                    self.bindControllers(target);
                }
                var ev = new Event('change');
                target.dispatchEvent(ev);
            },
            get: 
            /**
             * @return {string}
             */
            function () {
                if ('input' === target.nodeName.toLowerCase()) {
                    /** @type {*} */
                    var input = target;
                    if ('checkbox' === target.getAttribute('type')) {
                        return target.hasAttribute('checked') ? input.value : '0';
                    }
                    else {
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
            function (name, value) {
                if (undefined !== value) {
                    if (null === value) {
                        target.removeAttribute(name);
                    }
                    else {
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
            function (values) {
                /** @type {ImpulsusController} */
                var controller = this;
                if (null !== this.targets && !Array.isArray(values) && 'object' !== typeof values) {
                    return;
                }
                var merged = Array.prototype.slice.call(document.querySelectorAll('[data-' + targetControllerName + '-merged]'));
                merged.forEach(function (el) {
                    el.remove(); // @todo - update instead of remove
                });
                target.setAttribute('data-' + targetControllerName + '-temp', new String(target.getAttribute('data-' + targetControllerName + '-target')).toString());
                target.removeAttribute('data-' + targetControllerName + '-target');
                target.style.display = target.hasAttribute('data-display') ? String(target.getAttribute('data-display')).toString() : target.style.display;
                target.removeAttribute('data-display');
                var actions = Array.prototype.slice.call(target.querySelectorAll('[data-action]'));
                var keys = Array.isArray(values) ? values.map(function (_, i) { return i; }) : Object.keys(values);
                keys.forEach(function (key) {
                    var node = target.cloneNode(true);
                    if (null !== target.parentNode) {
                        target.parentNode.insertBefore(node, target);
                    }
                    var el = document.querySelector('[data-' + targetControllerName + '-temp]');
                    if (null !== el) {
                        el.removeAttribute('data-' + targetControllerName + '-temp');
                        el.removeAttribute('data-model');
                        el.setAttribute('data-' + targetControllerName + '-merged', String(key));
                    }
                    actions.forEach(/** @param {ImpulsusAction} action */ function (action) {
                        if ('events' in action && null !== el) {
                            var copy_1 = el.querySelector('[data-action="' + action.getAttribute('data-action') + '"]');
                            Object.keys(action.events).forEach(function (listener) {
                                action.events[listener].forEach(/** @param {*} callback */ function (callback) {
                                    if (null === copy_1) {
                                        return;
                                    }
                                    copy_1.addEventListener(listener, callback);
                                });
                            });
                        }
                    });
                    Object.keys(controller.targets).forEach(function (sub) {
                        var selector = '[data-' + targetControllerName + '-target-' + targetName + '="' + sub + '"]';
                        var subTargets = null === el ? new Array() : Array.prototype.slice.call(el.querySelectorAll(selector));
                        subTargets.forEach(/** @param {Element} subTarget */ function (subTarget) {
                            subTarget.removeAttribute('data-' + targetControllerName + '-target-' + targetName);
                            subTarget.setAttribute('data-' + targetControllerName + '-target-' + targetName + '-' + key, sub);
                            var value = Array.isArray(values) ? values[Number(key)] : values[key];
                            if ('string' === typeof key && !Array.isArray(values)) {
                                value = values[key];
                                if (null !== value && 'object' === typeof value && sub in value) {
                                    /** @type {*} */
                                    var obj = value;
                                    value = obj[sub];
                                }
                                else {
                                    if ('$' === sub) {
                                        value = key;
                                    }
                                }
                            }
                            if (subTarget.hasAttribute('data-' + targetControllerName + '-attr-' + targetName)) {
                                var attr = subTarget.getAttribute('data-' + targetControllerName + '-attr-' + targetName);
                                self.target(subTarget, null, null).attr(attr, value);
                            }
                            else {
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

    /**
     * @param {string} target
     * @return {Element|null}
     */
    function resolveTarget (target) {
        var el = null;
        if (0 !== target.indexOf('_')) {
            el = document.querySelector(target);
        }
        else {
            if ('_top' === target) {
                el = document.body;
            }
        }
        return el;
    }

    /**
     * @param {HTMLElement} section
     * @param {string} url
     * @param {Function} [callback]
     * @this {Impulsus}
     */
    function load (section, url, callback) {
        /** @type {Impulsus} */
        var self = this;
        section.setAttribute('data-loading', 'true');
        var dataDelay = section.getAttribute('data-delay');
        var delay = dataDelay ? parseInt(dataDelay) : 0;
        setTimeout(function () {
            var event = self.customEvent('impulsus:before-load');
            section.dispatchEvent(event);
            var dataXhr = document.querySelector('[data-xhr]');
            var xhrFunc = null;
            try {
                var f = dataXhr ? dataXhr.getAttribute('data-xhr') : undefined;
                xhrFunc = dataXhr && f ? new Function(f) : self.xhr;
            }
            catch (_a) {
                xhrFunc = self.xhr;
            }
            if (undefined === xhrFunc) {
                return;
            }
            xhrFunc(url, /** @param {string} r */ function (r) {
                var div = document.createElement('div');
                div.innerHTML = r;
                var result = null;
                if (section.id) {
                    result = div.querySelector('section#' + section.id);
                }
                if (null === result) {
                    result = div.querySelector('section');
                }
                if (null === result) {
                    result = div;
                }
                section.innerHTML = result.innerHTML;
                section.removeAttribute('data-loading');
                section.removeAttribute('data-delay');
                section.setAttribute('data-src', url);
                section.setAttribute('data-result', r);
                if (callback) {
                    callback(section);
                }
                setTimeout(function () {
                    var event = self.customEvent('impulsus:load');
                    section.dispatchEvent(event);
                }, 100);
            });
        }, delay);
    }

    /**
     * @param {string} url
     * @param {Function} callback
     * @param {string} [method]
     * @param {?string} [data]
     * @param {string} [dataType]
     * @return {void}
     */
    function xhr (url, callback, method, data, dataType) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function () {
            if (4 === this.readyState && 200 === this.status) {
                callback(this.responseText);
            }
        });
        if (0 !== url.indexOf('http:') && 0 !== url.indexOf('https:') && 0 !== url.indexOf('/')) {
            var href = new String(location.pathname);
            var path = href.split('/');
            path.pop();
            url = path.join('/') + '/' + url;
        }
        if ('GET' === method && data) {
            if (-1 === url.indexOf('?')) {
                url += '?';
            }
            url += '&' + data;
            data = null;
        }
        xhr.open(method || 'GET', url);
        if (dataType) {
            xhr.setRequestHeader('Content-Type', dataType);
        }
        xhr.send(data || null);
    }

    /** @type {Impulsus} */
    var Impulsus = {};
    Impulsus.init = init;
    Impulsus.exports = impulsusExports;
    Impulsus.customEvent = customEvent;
    Impulsus.bind = bind;
    Impulsus.bindLinks = bindLinks;
    Impulsus.bindControllers = bindControllers;
    Impulsus.bindSections = bindSections;
    Impulsus.controller =
        /**
         * @param {Function} init
         * @param {CustomEvent} [event]
         * @this {Impulsus}
         */
        function (init, event) {
            controller.bind(Impulsus)(init, event);
        };
    Impulsus.target = target;
    Impulsus.resolveTarget = resolveTarget;
    Impulsus.load = load;
    Impulsus.xhr = xhr;
    window.addEventListener('load', function () {
        Impulsus.init(window);
    });

})();
