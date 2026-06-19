/**
 * @external ImpulsusWindow
 * @external Impulsus
 * @external ImpulsusController
 */

/** @type {ImpulsusWindow} */
var w = window;
(
    /**
    * @param {Impulsus} [impulsus]
    */
    function (impulsus) {
        if (impulsus) {
            impulsus.controller(/** @param {ImpulsusController} controller */ function (controller) {
                controller.on('beforeLoad', function() {
                    var wiki = controller.targets['wiki'];
                    wiki.classList.add('is-hidden');
                });

                controller.on('menu', function () {
                    var menu = controller.targets['menu'];
                    var src = new String(menu.attr('data-src'));
                    var md = menu.attr('data-result');
                    if (0 === md.indexOf('<') || !src.endsWith('/Home.md')) {
                        return;
                    }
                    /** @type {string[]} */
                    var links = md.match(/\[.*\]\(.*\)/g);
                    if (null == links) {
                        links = [];
                    }
                    var html = '';
                    html += '<aside class="menu"><ul class="menu-list"><p class="menu-label">Documentation</p>';
                    links.forEach(function (link) {
                        var label = new String(link.match(/\[.*\]/));
                        var url = new String(link.match(/\(.*\)/));
                        label = label.replace(/\[(.*)\]/, '$1');
                        url = url.replace(/\((.*)\)/, '$1');
                        url = url.replace('https://github.com/michael-barchy/impulsus/wiki/', 'https://raw.githubusercontent.com/wiki/michael-barchy/impulsus/');
                        url += '.md';
                        html += '<li><a href="' + url + '" data-target="#page" data-navigate>' + label + '</a></li>';
                    });
                    html += '</ul></aside>';
                    menu.set(html);

                    setTimeout(function() {
                        menu.classList.remove('is-hidden');
                    }, 100);
                });

                controller.on('page', function () {
                    var wiki = controller.targets['wiki'];
                    var src = wiki.attr('data-src');

                    var prevMenuItem = document.querySelector('[data-target="#page"].is-active');
                    if (prevMenuItem) {
                        prevMenuItem.classList.remove('is-active');
                    }
                    var srcPath = src.substring(src.lastIndexOf('/'));
                    var menuItem = document.querySelector('[href*="' + srcPath.replace('.md', '') + '"][data-target="#page"]');
                    if (menuItem) {
                        menuItem.classList.add('is-active');
                    }

                    var md = wiki.attr('data-result');
                    if (0 === md.indexOf('<')) {
                        return;
                    }

                    /** @type {*} */
                    var s = 'showdown' in window ? window.showdown : null;
                    if (null === s) {
                        var html = '<pre>' + md + '</pre>';
                    } else {
                        var converter = new s.Converter();
                        var html = new String(converter.makeHtml(md)).toString();
                    }
                    wiki.set(html);

                    /** @type {*} */
                    var h = 'hljs' in window ? window.hljs : null;
                    if (null !== h) {
                        h.highlightAll();
                    }

                    setTimeout(function () {
                        var headings = Array.prototype.slice.call(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                        headings.forEach(function (h) {
                            var level = h.nodeName.toLowerCase().replace('h', '');
                            h.classList.add('title');
                            h.classList.add('is-' + level);
                        });
                        wiki.classList.remove('is-hidden');
                    }, 100);
                });
            });
        }
    }
)(w.Impulsus);
