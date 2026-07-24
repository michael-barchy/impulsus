import { ImpulsusWindow, Impulsus } from './types';

/**
 * @param {ImpulsusWindow} global
 * @this {Impulsus}
 */
export default function (global: ImpulsusWindow) {
	/** @type {Impulsus} */
	const self: Impulsus = this;
	self.exports(global);

	window.addEventListener('popstate', function (event) {
		if (event.state) {
			if ('target' in event.state && 'html' in event.state) {
				const el = document.querySelector('#' + event.state.target);
				if (null !== el) {
					el.innerHTML = event.state.html;
					el.setAttribute('data-src', event.state.src);
					self.bindLinks(el);
					self.bindControllers(el);

					setTimeout(function () {
						if (null !== el) {
							const event = self.customEvent('impulsus:load');
							el.dispatchEvent(event);
						}
					}, 100);
				}
			}
		}
	});

	/** @type {Element|null} */
	const root: Element = document.querySelector('html');
	const observer = new MutationObserver(function (mutations) {
		Array.prototype.slice.call(mutations).forEach(function (mutation: MutationRecord) {
			if ('data-controller' === mutation.attributeName || 'data-model' === mutation.attributeName) {
				self.bindControllers();
			}

			if ('data-action' === mutation.attributeName) {
				let parent = root;
				if (null === root) {
					/** @type {*} */
					const parentOfParent: Element = mutation.target.parentNode as unknown as Element;
					parent = parentOfParent;
				}
				if (null !== parent) {
					self.bindLinks(parent);
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

	const h = location.hash.substring(1);
	const parts = h.split('=');
	if (2 === parts.length) {
		const section = document.querySelector('#' + parts[0]);
		if (null === section) {
			return;
		}
		self.load(section, parts[1], function () {
			if (null === section) {
				return;
			}
			self.bind(section);
			self.bind();
		});
		return;
	}

	self.bind();
	const event = self.customEvent('impulsus:ready');
	window.dispatchEvent(event);
}
