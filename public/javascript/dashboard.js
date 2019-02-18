// https://stackoverflow.com/questions/36873753/make-table-auto-scroll-vertically-via-html-css
var $el = $("table#fixHeaderTable > tbody");
function anim() {
  // current scroll bar's top's position
  var stop = $el.scrollTop();
  // Total height - inner height: bottom position
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
  var sbottom = $el.prop("scrollHeight")-$el.innerHeight();
  // smoothly adjust scrollTop 
  // st < sb / 2: check whether scrollTop position is on the first half or second half
  // if on the first half, it will go to bottom
  // if on the second half, it will go to top
  // 0: go back to the top
  $el.animate({scrollTop: stop<sbottom/2 ? sbottom : 0}, 4000, anim);
}

// fix header at top: https://stackoverflow.com/questions/673153/html-table-with-fixed-headers


function stop(){
  $el.stop();
}
anim();
$el.hover(stop, anim);
