(function () {

    function Impulsus() {
    }

    /**
     * @param {string} event
     * @param {*} [params]
     * @returns {*}
     */
    Impulsus.customEvent = function (event, params) {
        if ('function' === typeof window.CustomEvent) return new window.CustomEvent(event, params);

        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

        return evt;
    }

    /**
     * @param {*} global
     */
    Impulsus.init = function (global) {
        this.exports(global);

        window.addEventListener('popstate', function (event) {
            if (event.state) {
                if ('target' in event.state && 'html' in event.state) {
                    var el = document.querySelector('#' + event.state.target);
                    if (null !== el) {
                        el.innerHTML = event.state.html;
                        el.setAttribute('data-src', event.state.src);
                        Impulsus.bindLinks(el);
                        Impulsus.bindControllers(el);

                        setTimeout(function () {
                            if (null !== el) {
                                var event = Impulsus.customEvent('impulsus:load');
                                el.dispatchEvent(event);
                            }
                        }, 100);
                    }
                }
            }
        });

        var root = document.querySelector('html');
        var observer = new MutationObserver(function (mutations) {
            Array.prototype.slice.call(mutations).forEach(function (mutation) {
                if ('data-controller' === mutation.attributeName || 'data-model' === mutation.attributeName) {
                    Impulsus.bindControllers();
                }

                if ('data-action' === mutation.attributeName) {
                    var parent = root;
                    if (null === root) {
                        parent = mutation.target.parentNode;
                    }
                    if (null !== parent) {
                        Impulsus.bindLinks(parent);
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
            var section = document.querySelector('#' + parts[0]);
            if (null === section) {
                return;
            }
            Impulsus.load(section, parts[1], function () {
                if (null === section) {
                    return;
                }
                Impulsus.bind(section);
                Impulsus.bind();
            });
            return;
        }

        this.bind();
        var event = this.customEvent('impulsus:ready');
        window.dispatchEvent(event);
    };

    /**
     * @param {*} global
     */
    Impulsus.exports = function (global) {
        var dataXhr = document.querySelector('[data-xhr]');
        var xhrFunc = null;
        try {
            var f = dataXhr ? dataXhr.getAttribute('data-xhr') : null;
            xhrFunc = dataXhr && f ? eval(f) : null;
        } catch {
            xhrFunc = null;
        }
        global.Impulsus = {
            xhr: xhrFunc ? xhrFunc : this.xhr,
            controller: this.controller
        };
        if (xhrFunc) {
            global.Impulsus._xhr = this.xhr;
        }
    }

    /**
     * @param {Element} [root]
     */
    Impulsus.bind = function (root) {
        this.bindSections(root);
        this.bindControllers(root);
    }

    /**
     * @param {Element|Document} [root]
     */
    Impulsus.bindSections = function (root) {
        if (undefined === root) {
            root = document;
        }
        var sections = Array.prototype.slice.call(root.querySelectorAll('section'));
        sections.forEach(function (section) {
            if ('false' === section.getAttribute('data-impulsus')) {
                return;
            }
            if (section.dataset.src) {
                Impulsus.load(section, section.dataset.src);
            }
            Impulsus.bindLinks(section);
        });
    }

    /**
     * @param {Element} section
     */
    Impulsus.bindLinks = function (section) {
        var links = Array.prototype.slice.call(section.querySelectorAll('a'));
        links.forEach(function (link) {
            if ('false' === link.getAttribute('data-impulsus')) {
                return;
            }

            link.addEventListener('click', /** @param {Event} event */ function (event) {
                var target = null;
                if (link.dataset.target) {
                    const dataTarget = '' + link.dataset.target;
                    target = Impulsus.resolveTarget(dataTarget);
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
                Impulsus.load(target, link.href, /** @param {Element} target */ function (target) {
                    Impulsus.bind(target);
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
     */
    Impulsus.bindControllers = function (root) {
        if (undefined === root) {
            root = document;
        }
        var controllers = Array.prototype.slice.call(root.querySelectorAll('[data-controller]'));
        controllers.forEach(function (controller) {
            var controllerName = controller.getAttribute('data-controller');
            var script = document.querySelector('script[data-name="' + controllerName + '"]');
            if (null !== script && !script.hasAttribute('src') && !script.hasAttribute('data-bind')) {
                var event = Impulsus.customEvent('impulsus:controller', {
                    detail: {
                        controller: controllerName
                    }
                });
                window.dispatchEvent(event);
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
     * Create a new Impulsus controller
     * @param {function} init
     * @param {CustomEvent} [event]
     */
    Impulsus.controller = function (init, event) {
        var eventControllerName = event ? event.detail.controller : null;
        var scriptControllerName = document.currentScript ? document.currentScript.getAttribute('data-name') : 'controller';
        var controllerName = eventControllerName ? eventControllerName : scriptControllerName;
        var el = document.querySelector('[data-controller="' + controllerName + '"]');
        if (null === el) {
            return;
        }

        var targetControllerName = new String(controllerName).replace(/[^a-z0-9]/g, '-');
        var targets = Array.prototype.slice.call(el.querySelectorAll('[data-' + targetControllerName + '-target]'));
        /** @type {Object<string, ImpulsusControllerTarget>} */
        var targetNames = {};
        targets.forEach(/** @param {HTMLElement} target */ function (target) {
            var targetName = target.getAttribute('data-' + targetControllerName + '-target');
            if (null == targetName) {
                return;
            }
            targetNames[targetName] = {
                classList: target.classList,
                set:
                    /**
                     * @param {string} value
                     * @return {void}
                     **/
                    function (value) {
                        if ('input' === target.nodeName.toLowerCase()) {
                            /** @type {*} */
                            var input = target;
                            if ('checkbox' === target.getAttribute('type')) {
                                input.checked = parseInt(input.value) === parseInt(value);
                                if (input.checked) {
                                    target.setAttribute('checked', 'true');
                                } else {
                                    target.removeAttribute('checked');
                                }
                            } else {
                                input.value = value;
                            }
                        } else {
                            target.innerHTML = value;
                        }

                        if ('section' === target.nodeName.toLowerCase()) {
                            Impulsus.bindLinks(target);
                            Impulsus.bindControllers(target);
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
                    function (name, value) {
                        if (undefined !== value) {
                            if (null === value) {
                                target.removeAttribute(name);
                            } else {
                                target.setAttribute(name, value);
                            }
                        }

                        return target.getAttribute(name);
                    }
            };
        });

        /** @type {Object<string, Function>} */
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
        actions.forEach(function (action) {
            var actionList = action.getAttribute('data-action').trim().split(' ');
            actionList.forEach(/** @param {string} actionItem */ function (actionItem) {
                var parts = actionItem.split('#');
                var event = new String(parts.pop()).toString();
                parts = new String(parts.pop()).split('->');
                var listener = new String(parts.shift());
                if (0 === listener.length) {
                    listener = 'click';
                }
                action.addEventListener(listener, /** @param {CustomEvent} e */ function (e) {
                    if (event in events) {
                        var param = action.getAttribute('data-param-' + event);
                        events[event](param);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            });
        });

        init(controller);
    }

    /**
     * @param {string} target
     * @return {Element|null}
     */
    Impulsus.resolveTarget = function (target) {
        var el = null;
        if (0 !== target.indexOf('_')) {
            el = document.querySelector(target);
        } else {
            if ('_top' === target) {
                el = document.body;
            }
        }

        return el;
    }

    /**
     * @param {Element} section
     * @param {string} url
     * @param {Function} [callback]
     */
    Impulsus.load = function (section, url, callback) {
        section.setAttribute('data-loading', 'true');
        var dataDelay = section.getAttribute('data-delay');
        var delay = dataDelay ? parseInt(dataDelay) : 0;
        setTimeout(function () {
            var event = Impulsus.customEvent('impulsus:before-load');
            section.dispatchEvent(event);

            Impulsus.xhr(url, /** @param {string} r */ function (r) {
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
                    var event = Impulsus.customEvent('impulsus:load');
                    section.dispatchEvent(event);
                }, 100);
            });
        }, delay);
    }

    /**
     * Load file using XHR
     * @param {string} url
     * @param {Function} callback
     * @param {string} [method]
     * @param {?string} [data]
     * @param {string} [dataType]
     * @return {void}
     */
    Impulsus.xhr = function (url, callback, method, data, dataType) {
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

    window.addEventListener('load', function () {
        Impulsus.init(window);
    });

})();
