function Bar(position) {
  window.EventEmitter.call(this);

  this._position = position;
  this._element = document.createElement('div');
  this._element.className = 'scrollerjs-bar';

  this._thumb = document.createElement('div');
  this._thumb.className = 'scrollerjs-thumb';
  this._element.appendChild(this._thumb);

  if ((position & 1) === Bar.ORIENTATION_VERTICAL) {
    this._element.className += ' scrollerjs-vertical-bar';
    this._thumb.className += ' scrollerjs-vertical-thumb';
  } else {
    this._element.className += ' scrollerjs-horizontal-bar';
    this._thumb.className += ' scrollerjs-horizontal-thumb';
  }

  var positionName = '';
  switch (position) {
  case View.BAR_POSITION_LEFT:
    positionName = 'left';
    break;
  case View.BAR_POSITION_TOP:
    positionName = 'top';
    break;
  case View.BAR_POSITION_RIGHT:
    positionName = 'right';
    break;
  case View.BAR_POSITION_BOTTOM:
    positionName = 'bottom';
    break;
  }

  this._element.className += ' scrollerjs-' + positionName + '-bar';
  this._thumb.className += ' scrollerjs-' + positionName + '-thumb';

  this._hideTimeout = null;
  this._state = new State(0, 0, 0);

  this._isDragging = false;
  this._dragStartMousePos = 0;
  this._dragStartScrolledRatio = 0;
  this._boundMouseMove = this._handleMouseMove.bind(this);
  this._boundMouseUp = this._handleMouseUp.bind(this);
  this._registerMouseEvents();

  if ('ontouchstart' in document.documentElement) {
    this._disableTouchMouseEmulation();
  }
}

Bar.ORIENTATION_VERTICAL = 0;
Bar.ORIENTATION_HORIZONTAL = 1;

Bar.HIDE_TIMEOUT = 1000;
Bar.MIN_THUMB_SIZE = 30;

Bar.prototype = Object.create(window.EventEmitter.prototype);

Bar.prototype.element = function() {
  return this._element;
};

Bar.prototype.layout = function() {
  var params = this._visualParameters();
  if (this.getOrientation() === Bar.ORIENTATION_HORIZONTAL) {
    this._thumb.style.left = Math.round(params.offset) + 'px';
    this._thumb.style.width = Math.round(params.thumbSize) + 'px';
  } else {
    this._thumb.style.top = Math.round(params.offset) + 'px';
    this._thumb.style.height = Math.round(params.thumbSize) + 'px';
  }
};

Bar.prototype.flash = function() {
  if (this._hideTimeout !== null) {
    clearTimeout(this._hideTimeout);
  } else {
    this._element.className += ' scrollerjs-bar-flashing';
  }
  this._hideTimeout = setTimeout(this._unflash.bind(this), Bar.HIDE_TIMEOUT);
};

Bar.prototype.getState = function() {
  return this._state;
};

Bar.prototype.setState = function(s) {
  if (s.maxScrolledPixels() === 0) {
    addClass(this._element, 'scrollerjs-bar-useless');
  } else {
    removeClass(this._element, 'scrollerjs-bar-useless');
  }
  if (!this._state.equals(s)) {
    this._state = s;
    this.layout();
  }
};

Bar.prototype.getOrientation = function() {
  return this._position & 1;
};

Bar.prototype._unflash = function() {
  this._hideTimeout = null;
  var classes = this._element.className.split(' ');
  for (var i = 0, len = classes.length; i < len; ++i) {
    if (classes[i] === 'scrollerjs-bar-flashing') {
      classes.splice(i, 1);
      this._element.className = classes.join(' ');
      return;
    }
  }
};

Bar.prototype._visualParameters = function() {
  var size = this._size();
  var thumbSize = Math.max(Bar.MIN_THUMB_SIZE, size*this._state.visibleRatio());
  var maxOffset = size - thumbSize;
  var offset = maxOffset * this._state.scrolledRatio();
  return {
    size: size,
    thumbSize: thumbSize,
    maxOffset: maxOffset,
    offset: offset
  };
};

Bar.prototype._size = function() {
  if (this.getOrientation() === Bar.ORIENTATION_HORIZONTAL) {
    return this._element.offsetWidth;
  } else {
    return this._element.offsetHeight;
  }
};

Bar.prototype._registerMouseEvents = function() {
  this._element.addEventListener('mouseenter', this._handleMouseEnter.bind(this));
  this._element.addEventListener('mouseleave', this._handleMouseLeave.bind(this));
  this._element.addEventListener('mousedown', this._handleMouseDown.bind(this));
};

Bar.prototype._handleMouseEnter = function() {
  addClass(this._element, 'scrollerjs-bar-focus');
};

Bar.prototype._handleMouseLeave = function() {
  if (this._isDragging) {
    return;
  }
  removeClass(this._element, 'scrollerjs-bar-focus');
  this.flash();
};

Bar.prototype._handleMouseDown = function(e) {
  if (this._isDragging) {
    return;
  }
  this._isDragging = true;
  window.addEventListener('mousemove', this._boundMouseMove);
  window.addEventListener('mouseup', this._boundMouseUp);

  var params = this._visualParameters();
  var coordinate = this._mouseEventCoordinate(e);
  if (coordinate < params.offset || coordinate >= params.offset+params.thumbSize) {
    var newOffset = Math.max(0, Math.min(params.maxOffset, coordinate-(params.thumbSize/2)));
    this._state = new State(this._state.getTotalPixels(), this._state.getVisiblePixels(),
      (newOffset/params.maxOffset)*this._state.maxScrolledPixels());
    this.layout();
    this.emit('scroll');
  }

  this._dragStartScrolledRatio = this._state.scrolledRatio();
  this._dragStartMousePos = coordinate;

  e.preventDefault();
  e.stopPropagation();
};

Bar.prototype._handleMouseMove = function(e) {
  if (!this._isDragging) {
    throw new Error('got unexpected mousemove event');
  }

  var coordinate = this._mouseEventCoordinate(e);
  var diff = coordinate - this._dragStartMousePos;
  var params = this._visualParameters();

  var startOffset = this._dragStartScrolledRatio * params.maxOffset;
  var offset = Math.max(0, Math.min(params.maxOffset, startOffset+diff));

  this._state = new State(this._state.getTotalPixels(), this._state.getVisiblePixels(),
    (offset/params.maxOffset)*this._state.maxScrolledPixels());
  this.layout();
  this.emit('scroll');
};

Bar.prototype._handleMouseUp = function(e) {
  if (!this._isDragging) {
    throw new Error('got unexpected mouseup event');
  }
  this._isDragging = false;
  window.removeEventListener('mousemove', this._boundMouseMove);
  window.removeEventListener('mouseup', this._boundMouseUp);

  var barRect = this._element.getBoundingClientRect();
  if (e.clientX < barRect.left || e.clientY < barRect.top ||
      e.clientX >= barRect.left+this._element.offsetWidth ||
      e.clientY >= barRect.top+this._element.offsetHeight) {
    this._handleMouseLeave();
  }
};

Bar.prototype._mouseEventCoordinate = function(e) {
  if (this.getOrientation() === Bar.ORIENTATION_VERTICAL) {
    return e.clientY - this._element.getBoundingClientRect().top;
  } else {
    return e.clientX - this._element.getBoundingClientRect().left;
  }
}

Bar.prototype._disableTouchMouseEmulation = function() {
  this._element.addEventListener('touchstart', function(e) {
    e.preventDefault();
  });
};
