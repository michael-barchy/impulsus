# Impulsus

Vanilla JavaScript library to implement Dynamic Sections (aka Turbo Frames)
and JavaScript controllers bindings (aka Stimulus)

## Install

The library can be installed using npm or just by loading the script.

### Using npm

```shell
npm install https://github.com/michael-barchy/impulsus
```

### Without npm

```shell
git submodule add https://github.com/michael-barchy/impulsus
```

```shell
git submodule update --remote
```

## Usage

### Loading using npm

```html
<html>
    <head>
        <script src="node_modules/impulsus/impulsus.js"></script>
    </head>
</html>
```

### Loading without npm
```html
<html>
    <head>
        <script src="impulsus/impulsus.js"></script>
    </head>
</html>
```

## Using the library

Dynamically loaded sections can be loaded from full content, section or section with matching id.

```html
<section>Hello</section>
<!-- This code is ignored -->
```


### Sections
```html
<section data-src="hello.html"></section>
```

### Links
```html
<section>
    <a href="hello.html">Click to show message</a>
</section>
```

```html
<section>
    <a href="hello.html" data-target="#below">Click to show message below</a>
</section>
<section id="below">
</section>
```

### Controllers

A controller is a javascript function loaded at runtime that connects to an HTML element (aka container) to dynamically update targets inside the controller's container and listen to actions (events).

```html
<div data-controller="counter">
    <button type="button" data-action="click->counter#increment">Click here to increment counter</button>
    <p>You clicked <span data-counter-target="counter">0</span> times</p>
</div>
```

```js
// controllers/counter.controller.js

/**
 * @external ImpulsusWindow
 * @external Impulsus
 * @external ImpulsusController
 */

/** @type {ImpulsusWindow} */
var global = window;
(
    /** 
    * @param {Impulsus} [impulsus] 
    */
    function (impulsus) {
        if (impulsus) {
            impulsus.controller(/** @param {ImpulsusController} controller */ function (controller) {
                controller.on('increment', function() {
                    var counter = controller.targets['counter'].get();
                    if (0 === counter.length) {
                        counter = '0';
                    }
                    controller.targets['counter'].set(parseInt(counter) + 1);
                });
            });
        }
    }
)(global.Impulsus);
```

