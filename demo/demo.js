window.addEventListener('load', function() {
  var scrollingContent = document.createElement('canvas');
  scrollingContent.style.position = 'absolute';
  scrollingContent.style.width = '100%';
  scrollingContent.style.height = '100%';
  scrollingContent.style.top = '0';
  scrollingContent.style.left = '0';
  scrollingContent.style.backgroundColor = 'white';

  var v = new window.scrollerjs.View(window.scrollerjs.View.BAR_POSITION_BOTTOM,
    scrollingContent);
  v.element().style.width = '400px';
  v.element().style.height = '300px';
  document.body.appendChild(v.element());
  v.setState(new window.scrollerjs.State(2000, 400, 2000-400));
  v.layout();
});
