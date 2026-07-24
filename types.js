/** @typedef {any} ImpulsusWindow */
/**
 * @typedef {Object} Impulsus
 * @property {Function} init
 * @property {Function} exports
 * @property {Function} customEvent
 * @property {Function} bind
 * @property {Function} bindLinks
 * @property {Function} bindControllers
 * @property {Function} bindSections
 * @property {any} [controller]
 * @property {Function} target
 * @property {Function} resolveTarget
 * @property {Function} load
 * @property {Function} [xhr]
 */
/**
 * @typedef {Object} ImpulsusController
 * @property {{ [key: string]: ImpulsusControllerTarget }} targets
 * @property {Function} on
 */
/**
 * @typedef {Object} ImpulsusControllerTarget
 * @property {Function} set
 * @property {Function} get
 * @property {Function} attr
 * @property {Function} merge
 * @property {DOMTokenList} classList
 */
/**
 * @typedef {{
 * 	events: { [key: string] : Function[] }
 * } & Element} ImpulsusAction
 */
