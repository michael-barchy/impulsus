(function () {

    function Impulsus() {
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
                        console.debug(event.state);
                        el.innerHTML = event.state.html;
                        el.setAttribute('data-src', event.state.src);
                        Impulsus.bindLinks(el);
                        Impulsus.bindControllers(el);

                        setTimeout(function () {
                            if (null !== el) {
                                var event = new CustomEvent('impulsus:load');
                                el.dispatchEvent(event);
                            }
                        }, 100);
                    }
                }
            }
        });

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
    };

    /**
     * @param {*} global
     */
    Impulsus.exports = function (global) {
        global.Impulsus = {
            controller: this.controller
        };
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
                        var root = location.href;
                        if (!root.endsWith('/')) {
                            var parts = root.split('/');
                            parts.pop();
                            root = parts.join('/') + '/';
                        }
                        var href = link.href.replace(root, '');
                        history.pushState({
                            target: target.getAttribute('id'),
                            src: href,
                            html: target.innerHTML
                        }, '', '#' + target.getAttribute('id') + '=' + href);
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
            var script = document.createElement('script');
            script.setAttribute('src', 'controllers/' + controllerName + '.controller.js');
            script.setAttribute('data-name', controllerName);
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
     */
    Impulsus.controller = function (init) {
        var controllerName = document.currentScript ? document.currentScript.getAttribute('data-name') : 'controller';
        var el = document.querySelector('[data-controller="' + controllerName + '"]');
        if (null === el) {
            return;
        }

        var targets = Array.prototype.slice.call(el.querySelectorAll('[data-' + controllerName + '-target]'));
        /** @type {Object<string, ImpulsusControllerTarget>} */
        var targetNames = {};
        targets.forEach(/** @param {HTMLElement} target */ function (target) {
            var targetName = target.getAttribute('data-' + controllerName + '-target');
            if (null == targetName) {
                return;
            }
            targetNames[targetName] = {
                set: /** @param {*} value */ function (value) {
                    if ('input' === target.nodeName.toLowerCase()) {
                        /** @type {*} */
                        var input = target;
                        input.value = value;
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
                get: function () {
                    if ('input' === target.nodeName.toLowerCase()) {
                        /** @type {*} */
                        var input = target;
                        return input.value;
                    }
                    return target.innerHTML;
                },
                attr: /** @param {string} name */ function (name) {
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


        var actions = Array.prototype.slice.call(el.querySelectorAll('[data-action]'));
        actions.forEach(function (action) {
            var parts = action.getAttribute('data-action').split('#');
            var event = parts.pop();
            parts = new String(parts.pop()).split('->');
            var listener = new String(parts.shift());
            if (0 === listener.length) {
                listener = 'click';
            }
            action.addEventListener(listener, function () {
                if (event in events) {
                    events[event]();
                }
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

                if (callback) {
                    callback(section);
                }

                setTimeout(function () {
                    var event = new CustomEvent('impulsus:load');
                    section.dispatchEvent(event);
                }, 100);
            });
        }, delay);
    }

    /**
     * Load file using XHR
     * @param {string} url 
     * @param {Function} callback
     * @return {void}
     */
    Impulsus.xhr = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function () {
            if (4 === this.readyState && 200 === this.status) {
                callback(this.responseText);
            }
        });
        if (!url.startsWith('http:') && !url.startsWith('https:') && !url.startsWith('/')) {
            var href = new URL(location.href);
            var path = href.pathname.split('/');
            path.pop();
            href.pathname = path.join('/') + '/' + url;
            url = href.toString();
        }
        xhr.open('GET', url);
        xhr.send();
    }

    window.addEventListener('load', function () {
        Impulsus.init(window);
    });

})();
