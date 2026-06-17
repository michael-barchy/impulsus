(function() {

    function Impulsus() {
    }
    
    Impulsus.init = function() {
        this.bind();
    };
    
    Impulsus.bind = function() {
        var sections = document.querySelectorAll('section');
        sections.forEach(function(section) {
            if (section.dataset.src) {
                Impulsus.xhr(section.dataset.src, function(r) {
                   section.innerHTML = r;
                });
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
