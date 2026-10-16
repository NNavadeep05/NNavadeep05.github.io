// Scroll animations with GSAP + ScrollTrigger, smooth scroll with Lenis.
// If the libraries fail to load or the viewer prefers reduced motion,
// nothing here runs and the simple CSS reveal in main.js is used instead.
(function () {
  'use strict';

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!gsap || !ScrollTrigger || reduceMotion) return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('has-gsap');
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });

  var DESKTOP = '(min-width: 901px)';
  var MOBILE = '(max-width: 900px)';
  var EASE = 'power3.out';

  /* ---------- Helpers ---------- */

  // Wrap each letter in a span so it can move on its own.
  // A hidden copy of the word keeps it readable for screen readers.
  function splitLetters(el) {
    var text = el.textContent.trim();
    var label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = text;

    var word = document.createElement('span');
    word.className = 'split-word';
    word.setAttribute('aria-hidden', 'true');
    text.split('').forEach(function (letter) {
      var ch = document.createElement('span');
      ch.className = 'ch';
      ch.textContent = letter;
      word.appendChild(ch);
    });

    el.textContent = '';
    el.appendChild(label);
    el.appendChild(word);
    el.classList.add('is-split');
    return word.querySelectorAll('.ch');
  }

  // Number letters so the CSS shine can ripple across them
  function indexLetters(letters) {
    letters.forEach(function (ch, i) { ch.style.setProperty('--i', i); });
  }

  // Prepare SVG strokes so they can be drawn in
  function prepStrokes(svg) {
    var lines = [];
    svg.querySelectorAll('.a-line:not(.a-dash)').forEach(function (shape) {
      if (typeof shape.getTotalLength !== 'function') return;
      var len = Math.ceil(shape.getTotalLength());
      shape.style.strokeDasharray = len;
      shape.style.strokeDashoffset = len;
      lines.push(shape);
    });
    return lines;
  }

  /* ---------- Smooth scroll (desktop pointer only) ---------- */

  var lenis = null;
  if (window.Lenis && window.matchMedia('(pointer: fine)').matches) {
    lenis = new window.Lenis({ duration: 1.15, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Shared pieces ---------- */

  var titleLetters = splitLetters(document.querySelector('.title-head .silver'));
  var thanksWords = document.querySelectorAll('.thanks .silver');
  var thanksLetters = [];
  thanksWords.forEach(function (w) {
    thanksLetters = thanksLetters.concat(Array.prototype.slice.call(splitLetters(w)));
  });
  indexLetters(titleLetters);
  indexLetters(thanksLetters);

  // Intro on page load
  var intro = gsap.timeline({ defaults: { ease: EASE } });
  intro
    .from('.d-block', { xPercent: -100, duration: 1.1, ease: 'expo.out' })
    .from(titleLetters, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: 'expo.out' }, '-=0.7')
    .from('.title-year', { opacity: 0, x: -16, duration: 0.6 }, '-=0.5')
    .from(['.title-name', '.title-role', '.title-tag', '.title-loc'], { opacity: 0, y: 20, duration: 0.6, stagger: 0.08 }, '-=0.4')
    .from('.game-menu a', { opacity: 0, x: -20, duration: 0.5, stagger: 0.08 }, '-=0.3')
    .add(function () { document.querySelector('.title-head').classList.add('shine'); });

  // Stack chips pop in
  gsap.from('.stack li', {
    scale: 0.6, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'back.out(2)',
    scrollTrigger: { trigger: '.stack', start: 'top 85%' }
  });

  // Timeline lines draw downward
  document.querySelectorAll('.entries').forEach(function (list) {
    var items = list.querySelectorAll('li');
    gsap.fromTo(items, { '--draw': 0 }, {
      '--draw': 1, duration: 0.8, stagger: 0.15, ease: 'power2.inOut',
      scrollTrigger: { trigger: list, start: 'top 80%' }
    });
    gsap.from(items, {
      opacity: 0, x: 16, duration: 0.6, stagger: 0.15, ease: EASE,
      scrollTrigger: { trigger: list, start: 'top 80%' }
    });
  });

  // Section headings, bio, highlights, button
  gsap.utils.toArray('.about-right .h-display, .about-right .h-sub, .bio, .btn').forEach(function (el) {
    gsap.from(el, {
      opacity: 0, y: 24, duration: 0.7, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  gsap.from('.highlights li', {
    opacity: 0, y: 20, duration: 0.5, stagger: 0.07, ease: EASE,
    scrollTrigger: { trigger: '.highlights', start: 'top 88%' }
  });
  gsap.from(['.hello', '.hello-name'], {
    opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: EASE,
    scrollTrigger: { trigger: '.about-left', start: 'top 80%' }
  });

  // Contact: letters rise, then shine
  gsap.from(thanksLetters, {
    yPercent: 110, duration: 0.9, stagger: 0.04, ease: 'expo.out',
    scrollTrigger: {
      trigger: '.thanks', start: 'top 80%',
      onEnter: function () {
        setTimeout(function () { document.querySelector('.thanks').classList.add('shine'); }, 700);
      }
    }
  });
  gsap.from('.contact-left .h-display', {
    opacity: 0, y: 24, duration: 0.7, ease: EASE,
    scrollTrigger: { trigger: '#contact', start: 'top 70%' }
  });
  gsap.from('.photo--circle', {
    scale: 0.7, opacity: 0, duration: 0.8, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.contact-card', start: 'top 85%' }
  });
  gsap.from(['.contact-name', '.contact-rows li'], {
    opacity: 0, x: -24, duration: 0.6, stagger: 0.08, ease: EASE,
    scrollTrigger: { trigger: '.contact-rows', start: 'top 90%' }
  });

  /* ---------- Desktop: pinned and scrubbed scenes ---------- */

  var mm = gsap.matchMedia();

  mm.add(DESKTOP, function () {
    // Title stays pinned while it zooms out of view.
    // These tweens use different elements or properties than the intro
    // (x, not xPercent; the wrappers, not the letters) so the two never fight.
    var out = gsap.timeline({
      scrollTrigger: { trigger: '#top', start: 'top top', end: '+=70%', pin: true, scrub: 0.6 }
    });
    out
      .to('.title-head', { scale: 1.18, transformOrigin: 'left center', ease: 'none' }, 0)
      .to('.title-copy', { y: -60, opacity: 0, ease: 'none' }, 0)
      .to('.d-block', { x: -320, opacity: 0.25, ease: 'none' }, 0);

    // About photo: depth and a glow that grows in
    gsap.fromTo('.photo--portrait', { yPercent: 10, scale: 0.92, filter: 'brightness(0.7)' }, {
      yPercent: -6, scale: 1, filter: 'brightness(1.1)', ease: 'none',
      scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'center center', scrub: true }
    });

    // Expertise heading grows in
    gsap.from('#expertise-heading', {
      scale: 0.82, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '#expertise', start: 'top 85%', end: 'top 35%', scrub: 0.5 }
    });

    // Tiles come together from the sides as you scroll, and their drawings trace in
    gsap.utils.toArray('.tile').forEach(function (tile, i) {
      var fromLeft = i % 2 === 0;
      var lines = prepStrokes(tile.querySelector('.tile__art'));
      var dots = tile.querySelectorAll('.a-fill-red, .a-fill-blue, .a-block, .a-dash');

      var tl = gsap.timeline({
        scrollTrigger: { trigger: tile, start: 'top 100%', end: 'top 70%', scrub: 0.6 }
      });
      tl.from(tile, { x: fromLeft ? -90 : 90, y: 50, rotation: fromLeft ? -3 : 3, opacity: 0, ease: 'none' }, 0)
        .to(lines, { strokeDashoffset: 0, ease: 'none', stagger: 0.05 }, 0.15)
        .from(dots, { scale: 0, opacity: 0, transformOrigin: '50% 50%', ease: 'none', stagger: 0.05 }, 0.5);
    });

    // Tiles tilt a little toward the pointer
    if (window.matchMedia('(pointer: fine)').matches) {
      gsap.utils.toArray('.tile').forEach(function (tile) {
        var rx = gsap.quickTo(tile, 'rotationX', { duration: 0.5, ease: 'power2.out' });
        var ry = gsap.quickTo(tile, 'rotationY', { duration: 0.5, ease: 'power2.out' });
        gsap.set(tile, { transformPerspective: 900 });
        tile.addEventListener('pointermove', function (e) {
          var r = tile.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          ry(px * 6);
          rx(-py * 6);
        });
        tile.addEventListener('pointerleave', function () { rx(0); ry(0); });
      });
    }
  });

  /* ---------- Small screens: simple reveals, no pinning ---------- */

  mm.add(MOBILE, function () {
    gsap.from('.photo--portrait', {
      opacity: 0, y: 30, scale: 0.95, duration: 0.8, ease: EASE,
      scrollTrigger: { trigger: '.photo--portrait', start: 'top 85%' }
    });
    gsap.from('#expertise-heading', {
      opacity: 0, y: 24, duration: 0.7, ease: EASE,
      scrollTrigger: { trigger: '#expertise', start: 'top 80%' }
    });
    gsap.utils.toArray('.tile').forEach(function (tile) {
      var lines = prepStrokes(tile.querySelector('.tile__art'));
      var tl = gsap.timeline({ scrollTrigger: { trigger: tile, start: 'top 85%' } });
      tl.from(tile, { opacity: 0, y: 40, duration: 0.6, ease: EASE })
        .to(lines, { strokeDashoffset: 0, duration: 0.9, stagger: 0.05, ease: 'power2.inOut' }, 0.2);
    });
  });

  // Recalculate positions once fonts have loaded
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
