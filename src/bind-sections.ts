import { Impulsus } from './types';

/**
 * @param {Element|Document} [root]
 * @this {Impulsus}
 */
export default function (root: Element|Document) {
    /** @type {Impulsus} */
    const self: Impulsus = this;
    if (undefined === root) {
        root = document;
    }
    const sections = Array.prototype.slice.call(root.querySelectorAll('section'));
    sections.forEach(function (section: HTMLElement) {
        if ('false' === section.getAttribute('data-impulsus')) {
            return;
        }
        if (section.dataset.src) {
            self.load(section, section.dataset.src);
        }
        self.bindLinks(section);
    });
}
