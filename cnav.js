// Canonical site nav: mobile menu toggle + active-item marker.
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    var btn = document.getElementById('cnav-burger');
    var menu = document.getElementById('cnav-mobile');
    if (btn && menu) {
      btn.addEventListener('click', function () {
        var isOpen = !menu.hasAttribute('hidden');
        if (isOpen) {
          menu.setAttribute('hidden', '');
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          menu.removeAttribute('hidden');
          btn.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Mark active item by URL → top-level section key.
    var path = (location.pathname || '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
    var key = null;
    if (path === '/' || path === '') key = null;
    else if (
      path === '/diagnostic' ||
      path === '/digital-infrastructure' ||
      path === '/signals-systems' ||
      path === '/leverage' ||
      path === '/get-started' ||
      path === '/diagnostic-journey' ||
      path === '/diagnostic-architecture' ||
      path === '/diagnostic-report'
    ) key = 'product';
    else if (path === '/findings') key = 'findings';
    else if (
      path === '/cluster-library' ||
      path.indexOf('/clusters/') === 0 ||
      path.indexOf('/superclusters/') === 0 ||
      path === '/national-diagnostic' ||
      path === '/data'
    ) key = 'cluster-library';
    else if (path === '/notes' || path.indexOf('/ln-') === 0) key = 'notes';
    else if (path === '/about') key = 'about';

    if (key) {
      document.querySelectorAll('.cnav-links a, .cnav-mobile a').forEach(function (a) {
        if (a.getAttribute('data-cnav') === key) a.classList.add('active');
      });
    }
  });
})();
