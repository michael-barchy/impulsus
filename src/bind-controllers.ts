import { Impulsus } from './types';

/**
 * @param {Element|Document} [root]
 * @this {Impulsus}
 */
export default function (root?: Element|Document) {
	/** @type {Impulsus} */
	const self: Impulsus = this;
	if (undefined === root) {
		root = document;
	}
	const controllers = Array.prototype.slice.call(root.querySelectorAll('[data-controller]'));
	controllers.forEach(function (controller: Element) {
		const controllerName = controller.getAttribute('data-controller');
		let script = document.querySelector('script[data-name="' + controllerName + '"]');
		if (null !== script && !script.hasAttribute('src') && !script.hasAttribute('data-bind')) {
			const event = self.customEvent('impulsus:controller', {
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