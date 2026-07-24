/**
 * @param {string} event
 * @param {*} [params]
 * @returns {*}
 */
export default function (event: string, params: any): any {
	if ('function' === typeof window.CustomEvent) return new window.CustomEvent(event, params);

	params = params || { bubbles: false, cancelable: false, detail: undefined };
	const customEvent = document.createEvent('CustomEvent');
	customEvent.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

	return customEvent;
}
