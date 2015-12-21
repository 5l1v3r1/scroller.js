// A VelocityTracker takes offsets as they come in and figures out
// an average velocity for a "flick" motion.
function VelocityTracker(offset0) {
  this._backstack = [];
  this.pushOffset(offset0);
}

VelocityTracker.TIMESPAN = 300;

VelocityTracker.prototype.pushOffset = function(x) {
  this._backstack.push({time: new Date().getTime(), x: x});
  this._cleanBackstack();
};

VelocityTracker.prototype.velocity = function() {
  this._cleanBackstack();
  if (this._backstack.length === 0) {
    return 0;
  }

  var first = this._backstack[0];
  var last = this._backstack[this._backstack.length-1];

  if (last.time <= first.time) {
    return 0;
  }

  var dx = (last.x - first.x);
  var dt = (last.time - first.time);

  return dx / dt;
};

VelocityTracker.prototype.lastOffset = function() {
  if (this._backstack.length === 0) {
    return 0;
  }
  return this._backstack[this._backstack.length-1].x;
};

VelocityTracker.prototype._cleanBackstack = function() {
  var now = new Date().getTime();
  for (var i = 0, len = this._backstack.length; i < len; ++i) {
    if (this._backstack[i].time > now-VelocityTracker.TIMESPAN) {
      this._backstack.splice(0, i);
      return;
    }
  }
  this._backstack = [];
};
