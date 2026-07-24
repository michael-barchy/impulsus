/**
 * @param {string} target
 * @return {Element|null}
 */
export default function (target: string): Element|null {
	var el = null;
	if (0 !== target.indexOf('_')) {
		el = document.querySelector(target);
	} else {
		if ('_top' === target) {
			el = document.body;
		}
	}

	return el;
}
