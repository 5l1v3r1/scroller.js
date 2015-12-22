# scroller.js

This will be a web API for creating custom scrolling views. It will support mouse scrolling, wheel scrolling, and touch scrolling.

# Dependencies

This uses [eventemitter.js](https://github.com/unixpickle/eventemitter.js).

This also requires window.requestAnimationFrame, so you must polyfill that if you wish to use this on older browsers.

# Usage

First, build everything. This will require [jsbuild](https://github.com/unixpickle/jsbuild) and `bash`. Once everything is built, you will see a build directory with two files. You may import them into your HTML page as follows:

```html
<link rel="stylesheet" href="scrollerjs.css" type="text/css">
<script src="scroller.js"></script>
```

Note that you must import the [dependencies](#dependencies) before the *scroller.js* file.

Once you have imported scroller.js, you can instantiate a [View](#the-view-class). In order to maintain the state of a View, you must update its [State](#the-state-class) and call its `layout()` method.

## The View class

The View class gives the user a number of ways to "scroll" around content. Note that, while a View can display a content element, scrolling does not directly affect this content; rather, scrolling simply changes a number (i.e. pixels scrolled). It is up to the View's content to change itself based on this number. It should also be noted that a View must be given lots of information about how large it is and how much invisible content there is.

The View class can be instantiated as follows:

```js
var myView = new window.scrollerjs.View(position);
```

The `position` argument specifies where the scrollbar should be. It can be any of the following values:

 * `window.scrollerjs.View.BAR_POSITION_BOTTOM`
 * `window.scrollerjs.View.BAR_POSITION_RIGHT`
 * `window.scrollerjs.View.BAR_POSITION_TOP`
 * `window.scrollerjs.View.BAR_POSITION_LEFT`

For bottom and top scrollbars, scrolling will be done horizontally. For left and right scrollbars, scrolling will be done vertically. Currently, a View cannot scroll both horizontally and vertically.

An instance of View implements the following methods:

 * *DOMElement* **element**() - get the DOM element for the View. This element will be relatively positioned by default. It is up to you to determine how this element is presented to the user. Whenever the element's size changes, you should call `layout()`.
 * *void* **layout**() - notify the View that its element has changed size. You should call this immediately after adding the View's root element to the DOM.
 * [State](#the-state-class) **getState**() - get the current scrolling state. You may call this in order to get the scroll offset when drawing your content.
 * *void* **setState**(s) - set the current scrolling state. This can be used to manually scroll the view to a given offset. In addition, you should use this to update the View's information about the content and viewport size. Before you display a View, you should set its state at least once so that it knows how big to make the scrollbar.
 * *bool* **getDraggable**() - get the draggable setting. See `setDraggable()` for more info.
 * *void* **setDraggable**(flag) - enable or disable the draggable setting. If the View is draggable, then the user can use their mouse or finger to "flick" the content in order to scroll.
 * *DOMElement* **getContent**() - get the View's content element. See `setContent()` for more info.
 * *void* **setContent**() - set the View's content element. The content element is added as a child of the View's root element. The content element will be behind the scrollbar in the DOM, so it should not worry about z-indexing. The content element is responsible for sizing itself; I suggest that you use absolute positioning with a width and height of "100%".

In addition, a *View* is an [EventEmitter](https://github.com/unixpickle/eventemitter.js). It emits the following events:

 * **scroll** - this is sent to notify listeners that the View has been scrolled. This will not be triggered by a `setState()` call. It will only be triggered if the user manually scrolls the content.

## The State class

The State class maintains information about the scrolling content and the View itself. It can be constructed as follows:

```js
var state = new window.scrollerjs.State(totalPixels, visiblePixels, scrolledPixels);
```

For more information on the constructor arguments, see the corresponding getters. Speaking of which, State implements the following methods:

 * *bool* **equals**(s) - check if this state is equal to another state.
 * *number* **getTotalPixels**() - get the total content size in pixels. This is a width or a height, depending on the View's orientation. Essentially, this is the amount of content that the user would see if their screen was big enough that they did not need to scroll.
 * *number* **getVisiblePixels**() - get the amount of content (width or height) that the user can see without scrolling. If this is greater than or equal to `getTotalPixels()`, then the View does not need to scroll.
 * *number* **getScrolledPixels**() - get the number of pixels from the left that the View is scrolled. If this is 0, then the leftmost part of the content should be showing. This will always be non-negative.
 * *number* **maxScrolledPixels**() - get the maximum number of pixels the View could be scrolled. Usually, this is `getTotalPixels() - getVisiblePixels()`. If the View does not need to scroll, this is 0.
 * *number* **visibleRatio**() - get a number between 0 and 1 representing how much of the content is visible at any given time.
 * *number* **scrolledRatio**() - get a number between 0 and 1 representing how far from the left the View is scrolled.

Note that a State will always clip its values to valid ranges. For example, you will never be able to specify a *scrolledPixels* value greater than *maxScrolledPixels*.

## Example

There are two examples in [demo/demo.js](demo/demo.js).
