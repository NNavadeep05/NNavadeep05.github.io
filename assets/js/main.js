(function () {
  'use strict';

  // Reveal blocks as they scroll into view
  var revealEls = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // Highlight the nav tab for the section in view
  var tabs = document.querySelectorAll('.tab[data-tab]');
  var sections = ['top', 'about', 'expertise', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActive(id) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === id;
      tab.classList.toggle('is-active', on);
      if (on) {
        tab.setAttribute('aria-current', 'location');
      } else {
        tab.removeAttribute('aria-current');
      }
    });
  }

  function updateActive() {
    var line = window.innerHeight * 0.4;
    var current = sections[0].id;

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) {
        current = section.id;
      }
    });

    // Last section may be too short to reach the line, so check the bottom of the page
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) {
      current = sections[sections.length - 1].id;
    }

    setActive(current);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActive();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateActive();
})();
