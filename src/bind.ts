import { Impulsus } from './types';

/**
 * @param {Element} [root]
 * @this {Impulsus}
 */
export default function (root: Element) {
	/** @type {Impulsus} */
	const self: Impulsus = this;
	self.bindSections(root);
	self.bindControllers(root);
}
