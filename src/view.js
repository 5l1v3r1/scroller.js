function View(barPosition, content) {
  this.barPosition = barPosition;
  this._element = document.createElement('div');
  this._element.style.position = 'relative';

  this._element.appendChild(content.element());

  this._bar = new Bar(barPosition);
  this._element.appendChild(this._bar.element());

  this._registerMouseEvents();
}

View.BAR_POSITION_LEFT = 0;
View.BAR_POSITION_TOP = 1;
View.BAR_POSITION_RIGHT = 2;
View.BAR_POSITION_BOTTOM = 3;

View.prototype.element = function() {
  return this._element;
};

View.prototype.layout = function() {
  this._bar.layout();
};

View.prototype._registerMouseEvents = function() {
  this._element.addEventListener('mouseenter', function() {
    this._bar.flash();
  }.bind(this));
};

exports.View = View;
