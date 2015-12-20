function Bar(position) {
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

  this._registerMouseEvents();
}

Bar.ORIENTATION_VERTICAL = 0;
Bar.ORIENTATION_HORIZONTAL = 1;

Bar.HIDE_TIMEOUT = 1000;
Bar.MIN_THUMB_SIZE = 30;

Bar.prototype.element = function() {
  return this._element;
};

Bar.prototype.layout = function() {
  var totalSize;
  if (this._orientation() === Bar.ORIENTATION_HORIZONTAL) {
    totalSize = this._element.offsetWidth;
  } else {
    totalSize = this._element.offsetHeight;
  }
  var barSize = Math.max(this._state.visibleRatio()*totalSize, Bar.MIN_THUMB_SIZE);

  var offsetSpace = totalSize - barSize;
  var offset = offsetSpace * this._state.scrolledRatio();

  if (this._orientation() === Bar.ORIENTATION_HORIZONTAL) {
    this._thumb.style.left = Math.round(offset) + 'px';
    this._thumb.style.width = Math.round(barSize) + 'px';
  } else {
    this._thumb.style.top = Math.round(offset) + 'px';
    this._thumb.style.height = Math.round(barSize) + 'px';
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

Bar.prototype._unflash = function() {
  this._hideTimeout = null;
  var classes = this._element.className.split(' ');
  for (var i = 0, len = classes.length; i < len; ++i) {
    if (classes[i] === 'scrollerjs-bar-flashing') {
      classes.splice(i, 1);
      break;
    }
  }
  this._element.className = classes.join(' ');
};

Bar.prototype._orientation = function() {
  return this._position & 1;
};

Bar.prototype._registerMouseEvents = function() {
  this._element.addEventListener('mouseleave', this.flash.bind(this));
};
