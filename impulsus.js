(function() {

    function Impulsus() {
    }
    
    Impulsus.init = function() {
        this.bind();
    };
    
    Impulsus.bind = function() {
        var sections = document.querySelectorAll('section');
        sections.forEach(function(section) {
            if ('false' === section.dataset.impulsus) {
                return;
            }
            if (section.dataset.src) {
                Impulsus.load(section, section.dataset.src);
            }
            var links = section.querySelectorAll('a');
            links.forEach(function(link) {
                link.addEventListener('click', function(event) {
                    var target = null;
                    if (link.dataset.target) {
                        target = document.querySelector(link.dataset.target);
                    }
                    if (null === target) {
                        target = section;
                    }
                    Impulsus.load(target, link.href);
                    event.preventDefault();
                    event.stopPropagation();
                });
            });
        });
    }
    
    /**
     * 
     * @param {Element} section 
     * @param {string} url 
     */
    Impulsus.load = function(section, url) {
        section.setAttribute('data-loading', 'true');
        Impulsus.xhr(url, function(r) {
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
            if (!section.hasAttribute('data-src')) {
                section.setAttribute('data-src', url);
            }
        });
    }
    
    /**
     * Load file using XHR
     * @param {string} url 
     * @param {function(string): void} callback
     * @return void
     */
    Impulsus.xhr = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function() {
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
    
    window.addEventListener('load', function() {
        Impulsus.init();
    });
    
})();
