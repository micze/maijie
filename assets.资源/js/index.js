var alllanglinks = document.getElementById('alllangs').getElementsByTagName('a');
for (var i = 0; i < alllanglinks.length; i++) {
  alllanglinks[i].setAttribute('href', alllanglinks[i].getAttribute('href') +
    window.location.pathname.replace(/^\/lang\/(.+?)\//, '/').substring(1));
}
function _same_height() {
  var bs = document.getElementById('box_side');
  var bm = document.getElementById('box_main');
  bs.style.height = '';
  bm.style.height = '';
  if (bs.offsetHeight < bm.offsetHeight) {
    bs.style.height = bm.offsetHeight - 2 + 'px';
  } else if (bm.offsetHeight < bs.offsetHeight) {
    bm.style.height = bs.offsetHeight - 2 + 'px';
  }
}
_same_height();
window.onload = _same_height;
