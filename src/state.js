function State(totalPixels, visiblePixels, scrolledPixels) {
  this._totalPixels = totalPixels;
  this._visiblePixels = visiblePixels;
  this._scrolledPixels = scrolledPixels;
}

State.prototype.equals = function(s) {
  return s.getTotalPixels() === this.getTotalPixels() &&
    s.getVisiblePixels() === this.getVisiblePixels() &&
    s.getScrolledPixels() === this.getScrolledPixels();
};

State.prototype.getTotalPixels = function() {
  return this._totalPixels;
};

State.prototype.getVisiblePixels = function() {
  return this._visiblePixels;
};

State.prototype.getScrolledPixels = function() {
  if (this._scrolledPixels < 0) {
    return 0;
  } else if (this._scrolledPixels >= this.maxScrolledPixels()) {
    return this.maxScrolledPixels();
  }
  return this._scrolledPixels;
};

State.prototype.maxScrolledPixels = function() {
  return Math.max(0, this._totalPixels-this._visiblePixels);
};

State.prototype.visibleRatio = function() {
  if (this._totalPixels === 0) {
    return 1;
  }
  return Math.min(1, this._visiblePixels/this._totalPixels);
};

State.prototype.scrolledRatio = function() {
  var maxScrolled = this.maxScrolledPixels();
  if (maxScrolled === 0) {
    return 0;
  }
  return this.getScrolledPixels() / maxScrolled;
};

exports.State = State;
