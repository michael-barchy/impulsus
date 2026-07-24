export type ImpulsusWindow = any;

export type Impulsus = {
	init: Function,
	exports: Function,
	customEvent: Function,
	bind: Function,
	bindLinks: Function,
	bindControllers: Function,
	bindSections: Function,
	controller?: any
	target: Function,
	resolveTarget: Function,
	load: Function,
	xhr?: Function,
};

export type ImpulsusController = {
	targets: { [key: string]: ImpulsusControllerTarget },
	on: Function
}

export type ImpulsusControllerTarget = {
	set: Function,
	get: Function,
	attr: Function,
	merge: Function,
	classList: DOMTokenList
}

export type ImpulsusAction = {
	events: { [key: string] : Function[] }
} & Element;
