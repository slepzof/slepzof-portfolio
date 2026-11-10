/* Block 02: one-shot scroll-triggered counters. Static "k+" is never touched. */
(function () {
  'use strict';
  function init() {
    var section = document.getElementById('numbers');
    if (!section) return;
    var counters = Array.prototype.slice.call(section.querySelectorAll('.sx27-count[data-count-target]'));
    if (!counters.length) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // HTML already contains final values: no animation or flash.

    var targets = counters.map(function (el) { return Math.max(0, Number(el.dataset.countTarget) || 0); });
    var started = false;
    var observer;

    function play() {
      if (started) return;
      started = true;
      if (observer) observer.disconnect();
      counters.forEach(function (el) { el.textContent = '0'; });
      var begin = null;
      var duration = 1600;
      function tick(now) {
        if (begin === null) begin = now;
        var t = Math.min((now - begin) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        counters.forEach(function (el, i) {
          el.textContent = String(Math.min(targets[i], Math.floor(targets[i] * eased)));
        });
        if (t < 1) {
          window.requestAnimationFrame(tick);
        } else {
          counters.forEach(function (el, i) { el.textContent = String(targets[i]); });
        }
      }
      window.requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) play();
      }, { threshold: 0.2, rootMargin: '0px 0px -5% 0px' });
      observer.observe(section);
    } else {
      play();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
