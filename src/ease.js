// Ease is used to gradually slow down a scroll view
// after being flicked by the user.
function Ease(startVelocity, startOffset) {
  window.EventEmitter.call(this);

  this._startVelocity = startVelocity;
  this._startOffset = startOffset;
  this._startTime = null;
  this._req = null;

  this._acceleration = -startVelocity / Ease.DURATION;

  this._boundTick = this._tick.bind(this);
}

Ease.DURATION = 1000;

Ease.prototype = Object.create(window.EventEmitter.prototype);

Ease.prototype.start = function() {
  this._req = window.requestAnimationFrame(this._boundTick);
};

Ease.prototype.cancel = function() {
  if (this._req !== null) {
    window.cancelAnimationFrame(this._req);
    this._req = null;
  }
};

Ease.prototype._tick = function(time) {
  this._req = window.requestAnimationFrame(this._boundTick);

  if (this._startTime === null) {
    this._startTime = time;
    return;
  }

  var elapsedTime = time - this._startTime;
  if (elapsedTime < 0) {
    this.cancel();
    this.emit('done');
    return;
  }

  var easeDone = (elapsedTime >= Ease.DURATION);
  if (easeDone) {
    elapsedTime = -this._startVelocity / this._acceleration;
  }

  var newOffset = this._startOffset + this._startVelocity*elapsedTime +
    0.5*this._acceleration*Math.pow(elapsedTime, 2);

  this.emit('offset', newOffset);

  if (easeDone) {
    this.cancel();
    this.emit('done');
  }
};
