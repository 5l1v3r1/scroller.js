window.addEventListener('load', function() {
  addHorizontalCanvas();
});

function addHorizontalCanvas() {
  var canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.backgroundColor = 'white';
  canvas.height = 300;

  var v = new window.scrollerjs.View(window.scrollerjs.View.BAR_POSITION_BOTTOM,
    canvas);
  v.element().style.width = '100%';
  v.element().style.height = '300px';
  document.body.appendChild(v.element());
  v.setState(new window.scrollerjs.State(2000, v.element().offsetWidth, 2000-400));
  v.layout();
  v.setDraggable(true);

  var drawCanvas = function() {
    var offset = v.getState().getScrolledPixels();
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(-offset, 0);
    ctx.fillStyle = '#65bcd4';
    for (var i = 0; i < 50; ++i) {
      var x = i*40 + 5;
      var height = (123*i*i + 120*i + 15*i*i*i + 6) % 257;
      ctx.fillRect(x, canvas.height-5-height, 30, height);
    }
    ctx.restore();
  };

  window.addEventListener('resize', function() {
    canvas.width = v.element().offsetWidth;
    v.setState(new window.scrollerjs.State(2000, v.element().offsetWidth,
      v.getState().getScrolledPixels()));
    drawCanvas();
  });

  canvas.width = v.element().offsetWidth;

  v.on('scroll', drawCanvas);
  drawCanvas();
}
