// Ease is used to gradually slow down a scroll view
// after being flicked by the user.
function Ease(harmonizer, startVelocity, startOffset) {
  window.EventEmitter.call(this);

  this._harmonizer = harmonizer;
  this._startVelocity = startVelocity;
  this._startOffset = startOffset;
  this._startTime = null;
  this._req = null;

  this._acceleration = -startVelocity / Ease.DURATION;
  this._harmonizer.on('animationFrame', this._tick.bind(this));
}

Ease.DURATION = 1000;

Ease.prototype = Object.create(window.EventEmitter.prototype);
Ease.prototype.constructor = Ease;

Ease.prototype.harmonizer = function() {
  return this._harmonizer;
};

Ease.prototype.start = function() {
  this._harmonizer.start();
};

Ease.prototype.cancel = function() {
  this._harmonizer.stop();
};

Ease.prototype._tick = function(elapsedTime) {
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
