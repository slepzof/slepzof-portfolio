/* SLEPZOF v35 · reveal only when Featured projects enters the viewport. */
(() => {
  const section = document.getElementById('selected');
  if (!section) return;
  const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) return;
  if (!('IntersectionObserver' in window)) return;

  let finished = false;
  const reveal = () => {
    if (finished) return;
    finished = true;
    section.classList.add('sx35-revealed');
    observer.disconnect();
  };
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) reveal();
  }, { rootMargin: '0px 0px -12% 0px', threshold: .08 });
  section.classList.add('sx35-reveal-ready');
  observer.observe(section);
})();
