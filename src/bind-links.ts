import { Impulsus } from './types';

/**
 * @param {Element} section
 * @this {Impulsus}
 */
export default function (section: HTMLElement) {
	/** @type {Impulsus} */
	const self: Impulsus = this;
	var links = Array.prototype.slice.call(section.querySelectorAll('a'));
	links.forEach(function (link: HTMLAnchorElement) {
		if ('false' === link.getAttribute('data-impulsus')) {
			return;
		}

		if ('true' === link.getAttribute('data-bind')) {
			return;
		}

		link.setAttribute('data-bind', 'true');

		link.addEventListener('click', /** @param {Event} event */ function (event: Event) {
			let target = null;
			if (link.dataset.target) {
				const dataTarget = '' + link.dataset.target;
				target = self.resolveTarget(dataTarget);
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
			self.load(target, link.href, /** @param {Element} target */ function (target) {
				self.bind(target);
				if (link.hasAttribute('data-navigate')) {
					let root = location.href.replace(location.hash, '');
					if (root.lastIndexOf('/') !== root.length - 1) {
						const parts = root.split('/');
						parts.pop();
						root = parts.join('/') + '/';
					}
					const href = link.href.replace(root, '');
					history.pushState({
						target: target.getAttribute('id'),
						src: href,
						html: target.innerHTML
					}, '', root + '#' + target.getAttribute('id') + '=' + href);
				}
			});
			event.preventDefault();
			event.stopPropagation();
		});
	});
}