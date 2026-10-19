/* Humrah — About page
   Progressive enhancement only: every section is readable without this file.
   - Section menu on small screens
   - Gentle reveal on scroll
   - "Alone → together" bench sketch, changed once the reader reaches it
   Motion is skipped for people who prefer reduced motion. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ── Section menu ─────────────────────────────────────────────────── */
  var toggle = document.querySelector('.menu-toggle');
  var list = document.getElementById('page-nav-list');

  if (toggle && list) {
    var setOpen = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      list.classList.toggle('is-open', open);
      if (!open && returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', false);
    });

    list.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false, false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });

    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.page-nav')) setOpen(false, false);
    });

    var desktop = window.matchMedia('(min-width: 900px)');
    var onChange = function () { if (desktop.matches) setOpen(false, false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ── Reveal on scroll ─────────────────────────────────────────────── */
  var reveals = document.querySelectorAll('.reveal');

  if (reduceMotion || !hasIO) {
    for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('is-in');
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var j = 0; j < reveals.length; j++) revealer.observe(reveals[j]);
  }

  /* ── Alone → together ─────────────────────────────────────────────── */
  var scene = document.querySelector('[data-crossfade]');

  if (scene) {
    if (reduceMotion || !hasIO) {
      scene.classList.add('is-together');
    } else {
      var timer = null;
      var sceneObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            timer = window.setTimeout(function () {
              scene.classList.add('is-together');
              sceneObserver.disconnect();
            }, 900);
          } else if (timer) {
            window.clearTimeout(timer);
            timer = null;
          }
        });
      }, { threshold: 0.55 });
      sceneObserver.observe(scene);
    }
  }
})();
