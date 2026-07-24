import { Impulsus } from './types';

/**
 * @param {HTMLElement} section
 * @param {string} url
 * @param {Function} [callback]
 * @this {Impulsus}
 */
export default function (section: HTMLElement, url: string, callback?: Function) {
	/** @type {Impulsus} */
	const self: Impulsus = this;

	section.setAttribute('data-loading', 'true');
	const dataDelay = section.getAttribute('data-delay');
	const delay = dataDelay ? parseInt(dataDelay) : 0;
	setTimeout(function () {
		const event = self.customEvent('impulsus:before-load');
		section.dispatchEvent(event);

		const dataXhr = document.querySelector('[data-xhr]');
		let xhrFunc = null;
		try {
			const f = dataXhr ? dataXhr.getAttribute('data-xhr') : undefined;
			xhrFunc = dataXhr && f ? new Function(f) : self.xhr;
		} catch {
			xhrFunc = self.xhr;
		}
		if (undefined === xhrFunc) {
			return;
		}

		xhrFunc(url, /** @param {string} r */ function (r: string) {
			const div = document.createElement('div');
			div.innerHTML = r;
			let result = null;

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
				const event = self.customEvent('impulsus:load');
				section.dispatchEvent(event);
			}, 100);
		});
	}, delay);
}