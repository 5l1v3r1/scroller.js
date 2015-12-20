function createDemoContent() {
  var scrollingContent = document.createElement('canvas');
  scrollingContent.style.position = 'absolute';
  scrollingContent.style.width = '100%';
  scrollingContent.style.height = '100%';
  scrollingContent.style.top = '0';
  scrollingContent.style.left = '0';

  return {
    element: function() {
      return scrollingContent;
    }
  };
}

window.addEventListener('load', function() {
  var c = createDemoContent();
  var v = new window.scrollerjs.View(window.scrollerjs.View.BAR_POSITION_BOTTOM, c);
  v.element().style.width = '300px';
  v.element().style.height = '300px';
  document.body.appendChild(v.element());
  v.layout();
});
