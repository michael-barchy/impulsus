/**
 * @param {string} url
 * @param {Function} callback
 * @param {string} [method]
 * @param {?string} [data]
 * @param {string} [dataType]
 * @return {void}
 */
export default function (url: string, callback: Function, method?: string, data?: string, dataType?: string): void {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
        if (4 === this.readyState && 200 === this.status) {
            callback(this.responseText);
        }
    });
    if (0 !== url.indexOf('http:') && 0 !== url.indexOf('https:') && 0 !== url.indexOf('/')) {
        const href = new String(location.pathname);
        const path = href.split('/');
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
