function addClass(element, c) {
  var classes = element.className.split(' ');
  if (classes.indexOf(c) < 0) {
    classes.push(c);
    element.className = classes.join(' ');
  }
}

function removeClass(element, c) {
  var classes = element.className.split(' ');
  var idx = classes.indexOf(c);
  if (idx >= 0) {
    classes.splice(idx, 1);
    element.className = classes.join(' ');
  }
}
