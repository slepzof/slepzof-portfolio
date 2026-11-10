/* HERO Lottie animation, v20. Preserves original uploaded animation JSON. */
(function () {
  'use strict';
  var el = document.getElementById('sx20-hero-lottie');
  if (!el) return;
  var providers = ['https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js', 'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js'];
  var url = el.getAttribute('data-animation');
  var instance = null;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var compact = window.matchMedia && window.matchMedia('(max-width: 800px)').matches;
  function boot() {
    if (!window.lottie || !url) { el.classList.add('sx20-failed'); return; }
    try {
      instance = window.lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: !reducedMotion,
        autoplay: !reducedMotion,
        path: url,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true, hideOnTransparent: true }
      });
      instance.addEventListener('DOMLoaded', function () {
        el.classList.add('sx20-ready');
        if(compact && instance && typeof instance.setSubframe === 'function') instance.setSubframe(false);
        if (reducedMotion) instance.goToAndStop(0, true);
      });
      instance.addEventListener('data_failed', function () {
        el.classList.add('sx20-failed');
        el.setAttribute('aria-label', 'Не удалось загрузить анимацию');
      });
      if ('IntersectionObserver' in window && !reducedMotion) {
        var observer = new IntersectionObserver(function (entries) {
          if (!instance || !el.classList.contains('sx20-ready')) return;
          if (entries[0].isIntersecting) instance.play();
          else instance.pause();
        }, { threshold: 0.03 });
        observer.observe(el);
      }
    } catch (error) {
      el.classList.add('sx20-failed');
    }
  }
  if (window.lottie) { boot(); return; }
  function loadLibrary(index) {
    if (index >= providers.length) { el.classList.add('sx20-failed'); return; }
    var lib = document.createElement('script');
    lib.src = providers[index];
    lib.async = true;
    lib.onload = function () { if (window.lottie) boot(); else loadLibrary(index + 1); };
    lib.onerror = function () { loadLibrary(index + 1); };
    document.head.appendChild(lib);
  }
  loadLibrary(0);
})();
