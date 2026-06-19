/**
 * Impulsus global used for exports
 * @typedef {*} ImpulsusWindow
 * @property {Impulsus} [Impulsus]
 */

/**
 * Exposed Impulsus functions
 * @typedef {Object} Impulsus
 * @property {Function} controller
 */

/**
 * @typedef ImpulsusController
 * @property {Object<string, ImpulsusControllerTarget>} targets
 * @property {Function} on
 */

/**
 * @typedef ImpulsusControllerTarget
 * @property {Function} set
 * @property {Function} get
 * @property {Function} attr
 * @property {DOMTokenList} classList
 */
