# scroller.js

This will be a web API for creating custom scrolling views. It will support mouse scrolling, wheel scrolling, and touch scrolling.

# Dependencies

This uses [eventemitter.js](https://github.com/unixpickle/eventemitter.js).

This also requires window.requestAnimationFrame, so you must polyfill that if you wish to use this on older browsers.

# Usage

First, build everything. This will require [jsbuild](https://github.com/unixpickle/jsbuild) and `bash`. Once everything is built, you will see a build directory with two files. You may import them into your HTML file as follows:

```html
<link rel="stylesheet" href="scrollerjs.css" type="text/css">
<script src="scroller.js"></script>
```

(Note also that you must import the dependencies.)

Here is a full example of using scroller.js to create a horizontally scrolling bar graph:

```js
// This canvas will be used for drawing.
// We must make it fill up its container element, the scroll view.
var canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.backgroundColor = 'white';
canvas.height = 300;

var position = window.scrollerjs.View.BAR_POSITION_BOTTOM;
var v = new window.scrollerjs.View(position);
v.setContent(canvas);
v.element().style.width = '100%';
v.element().style.height = '300px';
document.body.appendChild(v.element());

// Set the initial total pixels, visible pixels, and scrolled pixels.
v.setState(new window.scrollerjs.State(2000, v.element().offsetWidth,
  2000-v.element().offsetWidth));
v.layout();

// Enable drag-to-scroll on mobile and desktop.
v.setDraggable(true);

var drawCanvas = function() {
  // Your drawing code could go here.
  var offset = v.getState().getScrolledPixels();
  var ctx = canvas.getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(-offset, 0);
  ctx.fillStyle = '#65bcd4';
  for (var i = 0; i < 50; ++i) {
    var x = i*40 + 5;
    var height = (123*i*i + 120*i + 15*i*i*i + 6) % 257;
    ctx.fillRect(x, canvas.height-5-height, 30, height);
  }
  ctx.restore();
};

// Update the scroll view whenever the window changes size.
window.addEventListener('resize', function() {
  canvas.width = v.element().offsetWidth;
  v.setState(new window.scrollerjs.State(2000, v.element().offsetWidth,
    v.getState().getScrolledPixels()));
  v.layout();
  drawCanvas();
});

canvas.width = v.element().offsetWidth;

v.on('scroll', drawCanvas);
drawCanvas();

// Flash the scrollbar so that the user initially sees that they can scroll.
v.flash();
```
