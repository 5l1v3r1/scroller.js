function View(barPosition, content) {
  window.EventEmitter.call(this);

  this._barPosition = barPosition;
  this._element = document.createElement('div');
  this._element.style.position = 'relative';

  this._element.appendChild(content);

  this._bar = new Bar(barPosition);
  this._element.appendChild(this._bar.element());

  this._draggable = false;

  this._isDragging = false;
  this._dragStartCursorPos = null;
  this._dragStartScrolledPixels = null;
  this._boundMouseUp = this._handleMouseUp.bind(this);
  this._boundMouseMove = this._handleMouseMove.bind(this);

  this._registerMouseEvents();
  this._registerWheelEvents();
  this._bar.on('scroll', this.emit.bind(this, 'scroll'));
}

View.BAR_POSITION_LEFT = 0;
View.BAR_POSITION_TOP = 1;
View.BAR_POSITION_RIGHT = 2;
View.BAR_POSITION_BOTTOM = 3;

View.prototype = Object.create(window.EventEmitter.prototype);

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
};

View.prototype.getDraggable = function() {
  return this._draggable;
};

View.prototype.setDraggable = function(f) {
  this._draggable = f;
};

View.prototype._registerMouseEvents = function() {
  this._element.addEventListener('mouseenter', function() {
    this._bar.flash();
  }.bind(this));
  this._element.addEventListener('mousedown', this._handleMouseDown.bind(this));
};

View.prototype._handleMouseDown = function(e) {
  if (!this.getDraggable() || this._isDragging) {
    return;
  }
  this._isDragging = true;
  this._dragStartCursorPos = this._mouseEventCoordinate(e);
  this._dragStartScrolledPixels = this.getState().getScrolledPixels();
  window.addEventListener('mousemove', this._boundMouseMove);
  window.addEventListener('mouseup', this._boundMouseUp);
};

View.prototype._handleMouseMove = function(e) {
  if (!this._isDragging) {
    return;
  }
  var diff = this._mouseEventCoordinate(e) - this._dragStartCursorPos;
  var newScrollX = this._dragStartScrolledPixels - diff;

  var s = this.getState();
  this.setState(new State(s.getTotalPixels(), s.getVisiblePixels(), newScrollX));
  this.emit('scroll');

  this._bar.flash();
};

View.prototype._handleMouseUp = function(e) {
  this._isDragging = false;
  window.removeEventListener('mousemove', this._boundMouseMove);
  window.removeEventListener('mouseup', this._boundMouseUp);
};

View.prototype._mouseEventCoordinate = function(e) {
  if (this._bar.getOrientation() === Bar.ORIENTATION_HORIZONTAL) {
    return e.clientX;
  } else {
    return e.clientY;
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
        this.emit('scroll');

        pendingDelta = 0;
        secondaryDelta = 0;

        this._bar.flash();
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

exports.View = View;
