window.addEventListener('load', function() {
  addHorizontalCanvas();
  addVerticalCanvas();
});

function addHorizontalCanvas() {
  var canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.backgroundColor = 'white';
  canvas.height = 600;

  var v = new window.scrollerjs.View(window.scrollerjs.View.BAR_POSITION_BOTTOM);
  v.setContent(canvas);
  v.element().style.width = '100%';
  v.element().style.height = '300px';
  document.body.appendChild(v.element());
  v.setState(new window.scrollerjs.State(2000, v.element().offsetWidth,
    2000-v.element().offsetWidth));
  v.layout();
  v.setDraggable(true);

  var drawCanvas = function() {
    var offset = v.getState().getScrolledPixels();
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);
    ctx.translate(-offset, 0);
    ctx.fillStyle = '#65bcd4';
    for (var i = 0; i < 50; ++i) {
      var x = i*40 + 5;
      var height = (123*i*i + 120*i + 15*i*i*i + 6) % 257;
      ctx.fillRect(x, 300-5-height, 30, height);
    }
    ctx.restore();
  };

  window.addEventListener('resize', function() {
    canvas.width = v.element().offsetWidth * 2;
    v.setState(new window.scrollerjs.State(2000, v.element().offsetWidth,
      v.getState().getScrolledPixels()));
    v.layout();
    drawCanvas();
  });

  canvas.width = v.element().offsetWidth * 2;

  v.on('scroll', drawCanvas);
  drawCanvas();

  v.flash();
}

function addVerticalCanvas() {
  var content = document.getElementById('vertical-content');
  document.body.removeChild(content);
  content.style.width = '100%';
  content.style.display = 'block';
  content.style.backgroundColor = 'white';

  var v = new window.scrollerjs.View(window.scrollerjs.View.BAR_POSITION_RIGHT);
  v.setContent(content);
  v.element().style.overflow = 'hidden';
  v.element().style.width = '200px';
  v.element().style.height = '300px';
  v.element().style.left = 'calc(50% - 100px)';
  v.element().style.top = '20px';
  v.element().style.marginBottom = '40px';
  document.body.appendChild(v.element());
  v.setState(new window.scrollerjs.State(content.getBoundingClientRect().height, 300, 0));
  v.layout();
  v.setDraggable(true);

  var update = function() {
    var offset = v.getState().getScrolledPixels();
    content.style.top = Math.round(-offset) + 'px';
  };

  v.on('scroll', update);
  update();

  v.flash();
}
