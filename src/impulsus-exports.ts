import { ImpulsusWindow, Impulsus } from './types';

/**
 * @param {ImpulsusWindow} global
 * @this {Impulsus}
 */
export default function (global: ImpulsusWindow) {
	/** @type {Impulsus} */
	const self: Impulsus = this;
	/** @type {HTMLElement|null} */
	const dataXhr: HTMLElement|null = document.querySelector('[data-xhr]');
	let xhrFunc = null;
	try {
		const f = dataXhr ? dataXhr.getAttribute('data-xhr') : null;
		xhrFunc = dataXhr && f ? new Function(f) : null;
	} catch {
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
