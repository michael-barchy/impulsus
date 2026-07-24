import { Impulsus } from './types';
import * as ImpulsusExports from './impulsus-exports';
import * as init from './init';
import * as customEvent from './custom-event';
import * as bind from './bind';
import * as bindLinks from './bind-links';
import * as bindControllers from './bind-controllers';
import * as bindSections from './bind-sections';
import * as controller from './controller';
import * as target from './target';
import * as resolveTarget from './resolve-target';
import * as load from './load';
import * as xhr from './xhr';

/** @type {Impulsus} */
const Impulsus: Partial<Impulsus> = {};

Impulsus.init = init.default;
Impulsus.exports = ImpulsusExports.default;
Impulsus.customEvent = customEvent.default;
Impulsus.bind = bind.default;
Impulsus.bindLinks = bindLinks.default;
Impulsus.bindControllers = bindControllers.default;
Impulsus.bindSections = bindSections.default;
Impulsus.controller =
	/**
	 * @param {Function} init
	 * @param {CustomEvent} [event]
	 * @this {Impulsus}
	 */
	function (init: Function, event: CustomEvent) {
		controller.default.bind(Impulsus)(init, event);
	};
Impulsus.target = target.default;
Impulsus.resolveTarget = resolveTarget.default;
Impulsus.load = load.default;
Impulsus.xhr = xhr.default;

window.addEventListener('load', function () {
	Impulsus.init(window);
});
