function View(barPosition) {
  window.EventEmitter.call(this);

  this._barPosition = barPosition;
  this._element = document.createElement('div');
  this._element.style.position = 'relative';

  this._content = null;

  this._bar = new Bar(barPosition);
  this._element.appendChild(this._bar.element());

  this._draggable = false;

  this._isDragging = false;
  this._dragStartCursorPos = null;
  this._dragStartScrolledPixels = null;
  this._dragVelocityTracker = null;
  this._ease = null;

  this._touchTriggerClick = false;
  this._cancelMouseClick = false;

  this._mouseListenersBound = false;
  this._boundMouseUp = this._handleMouseUp.bind(this);
  this._boundMouseMove = this._handleMouseMove.bind(this);
  this._boundMouseClick = this._handleMouseClick.bind(this);

  this._registerMouseEvents();
  this._registerWheelEvents();

  if ('ontouchstart' in document.documentElement) {
    this._registerTouchEvents();
  }

  this._bar.on('scroll', this._handleBarScroll.bind(this));
}

View.BAR_POSITION_LEFT = 0;
View.BAR_POSITION_TOP = 1;
View.BAR_POSITION_RIGHT = 2;
View.BAR_POSITION_BOTTOM = 3;

View.prototype = Object.create(window.EventEmitter.prototype);
View.prototype.constructor = View;

View.prototype.element = function() {
  return this._element;
};

View.prototype.layout = function() {
  this._bar.layout();
};

View.prototype.getState = function() {
  return this._bar.getState();
};

View.prototype.setState = function(s) {
  this._bar.setState(s);
  this._stopEasing();
};

View.prototype.getDraggable = function() {
  return this._draggable;
};

View.prototype.setDraggable = function(f) {
  this._draggable = f;
};

View.prototype.getContent = function() {
  return this._content;
};

View.prototype.setContent = function(c) {
  if (this._content !== null) {
    this._element.removeChild(this._content);
  }
  this._content = c;
  if (c !== null) {
    this._element.insertBefore(c, this._bar.element());
  }
};

View.prototype.flash = function() {
  this._bar.flash();
};

View.prototype._handleBarScroll = function() {
  this._stopEasing();
  this._emitScroll();
};

View.prototype._registerMouseEvents = function() {
  this._element.addEventListener('mouseenter', function() {
    this.flash();
  }.bind(this));

  // NOTE: having two event listeners allows sub-elements to prevent dragging
  // by stopping mousedown events.
  this._element.addEventListener('mousedown', function() {
    this._setCancelMouseClick(false);
  }.bind(this), true);
  this._element.addEventListener('mousedown', this._handleMouseDown.bind(this));
};

View.prototype._handleMouseDown = function(e) {
  // NOTE: the user can't simultaneously click and stop easing.
  this._setCancelMouseClick(this._ease !== null);

  if (this._draggingStart(this._mouseEventCoordinate(e))) {
    e.stopPropagation();
    this._mouseListenersBound = true;
    window.addEventListener('mousemove', this._boundMouseMove, true);
    window.addEventListener('mouseup', this._boundMouseUp, true);
  }
};

View.prototype._handleMouseMove = function(e) {
  if (this._draggingMove(this._mouseEventCoordinate(e))) {
    this._setCancelMouseClick(true);
    e.stopPropagation();
  }
};

View.prototype._handleMouseUp = function(e) {
  if (this._draggingEnd()) {
    e.stopPropagation();
  }
};

View.prototype._handleMouseClick = function(e) {
  e.stopPropagation();
};

View.prototype._mouseEventCoordinate = function(e) {
  if (this._bar.getOrientation() === Bar.ORIENTATION_HORIZONTAL) {
    return e.clientX;
  } else {
    return e.clientY;
  }
};

View.prototype._setCancelMouseClick = function(flag) {
  if (flag === this._cancelMouseClick) {
    return;
  }
  if (flag) {
    this._element.addEventListener('click', this._boundMouseClick, true);
  } else {
    this._element.removeEventListener('click', this._boundMouseClick, true);
  }
  this._cancelMouseClick = flag;
};

View.prototype._registerTouchEvents = function() {
  this._element.addEventListener('touchstart', this._handleTouchStart.bind(this));
  this._element.addEventListener('touchmove', this._handleTouchMove.bind(this));
  this._element.addEventListener('touchend', this._handleTouchDone.bind(this));
  this._element.addEventListener('touchcancel', function() {
    this._touchTriggerClick = false;
    this._handleTouchDone();
  }.bind(this));
};

View.prototype._handleTouchStart = function(e) {
  e.preventDefault();

  // NOTE: the user can't simultaneously tap and stop easing.
  this._touchTriggerClick = (this._ease === null);

  this._draggingStart(this._touchEventCoordinate(e));
};

View.prototype._handleTouchMove = function(e) {
  if (this._draggingMove(this._touchEventCoordinate(e))) {
    this._touchTriggerClick = false;
  }
};

View.prototype._handleTouchDone = function(e) {
  this._draggingEnd();
  if (this._touchTriggerClick) {
    this._triggerClickEvent(e.changedTouches[0]);
  }
};

View.prototype._touchEventCoordinate = function(e) {
  var touch = e.changedTouches[0];
  if (this._bar.getOrientation() === Bar.ORIENTATION_HORIZONTAL) {
    return touch.clientX;
  } else {
    return touch.clientY;
  }
};

View.prototype._triggerClickEvent = function(posInfo) {
  if (this._content === null) {
    return;
  }

  var evt;
  var needsManualConfig = true;
  if ('createEvent' in document) {
    evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 1, posInfo.screenX,
      posInfo.screenY, posInfo.clientX, posInfo.clientY, false, false, false,
      false, 0, null);
  } else {
    needsManualConfig = false;
    evt = new MouseEvent('click', posInfo);
  }

  this._content.dispatchEvent(evt);
};

View.prototype._draggingStart = function(coord) {
  if (!this.getDraggable() || this._isDragging) {
    return false;
  }
  this._isDragging = true;

  this._stopEasing();
  this._dragStartCursorPos = coord;
  this._dragStartScrolledPixels = this.getState().getScrolledPixels();
  this._dragVelocityTracker = new VelocityTracker(this._dragStartCursorPos);

  return true;
};

View.prototype._draggingMove = function(coord) {
  if (!this._isDragging) {
    return false;
  }

  var diff = coord - this._dragStartCursorPos;
  var newScrollX = this._dragStartScrolledPixels - diff;

  this._dragVelocityTracker.pushOffset(coord);

  var s = this.getState();
  this.setState(new State(s.getTotalPixels(), s.getVisiblePixels(), newScrollX));
  this._emitScroll();

  this.flash();
  return true;
};

View.prototype._draggingEnd = function() {
  if (!this._isDragging) {
    return false;
  }
  this._isDragging = false;

  if (this._mouseListenersBound) {
    this._mouseListenersBound = false;
    window.removeEventListener('mousemove', this._boundMouseMove);
    window.removeEventListener('mouseup', this._boundMouseUp);
  }

  var velocity = this._dragVelocityTracker.velocity();
  this._dragVelocityTracker = null;
  if (Math.abs(velocity) > 0) {
    this._startEasing(velocity);
  }

  return true;
};

View.prototype._startEasing = function(velocity) {
  this._stopEasing();
  this._ease = new Ease(-velocity, this.getState().getScrolledPixels());
  this._ease.on('offset', function(x) {
    if (x < 0 || x > this.getState().maxScrolledPixels()) {
      this._stopEasing();
    }
    var s = this.getState();
    this._bar.setState(new State(s.getTotalPixels(), s.getVisiblePixels(), x));
    this._emitScroll();
  }.bind(this));
  this._ease.on('done', function() {
    this._ease = null;
  }.bind(this));
  this._ease.start();
};

View.prototype._stopEasing = function() {
  if (this._ease !== null) {
    this._ease.cancel();
    this._ease = null;
  }
};

View.prototype._registerWheelEvents = function() {
  // NOTE: combining wheel events helps performance on several browsers.

  var pendingDelta = 0;
  var secondaryDelta = 0;
  var pendingRequest = false;
  this._element.addEventListener('wheel', function(e) {
    if (!pendingRequest) {
      pendingRequest = true;
      window.requestAnimationFrame(function() {
        pendingRequest = false;

        // NOTE: when you scroll vertically on a trackpad on OS X,
        // it unwantedly scrolls horizontally by a slight amount.
        if (Math.abs(secondaryDelta) > 2*Math.abs(pendingDelta)) {
          pendingDelta = 0;
          secondaryDelta = 0;
          return;
        }

        var state = this.getState();
        this.setState(new State(state.getTotalPixels(), state.getVisiblePixels(),
          state.getScrolledPixels() + pendingDelta));
        this._emitScroll();

        pendingDelta = 0;
        secondaryDelta = 0;

        this.flash();
      }.bind(this));
    }
    if (this._bar.getOrientation() === Bar.ORIENTATION_HORIZONTAL) {
      pendingDelta += e.deltaX;
      secondaryDelta += e.deltaY;
    } else {
      pendingDelta += e.deltaY;
      secondaryDelta += e.deltaX;
    }
    e.preventDefault();
  }.bind(this));
};

View.prototype._emitScroll = function() {
  if (this.getState().maxScrolledPixels() !== 0) {
    this.emit('scroll');
  }
};

exports.View = View;
