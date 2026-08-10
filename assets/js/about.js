/**
 * HUMRAH ABOUT PAGE - Diorama Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // 1. Initial Hero Mask Reveal
  setTimeout(() => {
    document.body.classList.add('is-loaded');
  }, 100);

  // 2. Standard Reveal (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-up, .slow-reveal');
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -15% 0px', threshold: 0.1 });
    
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 3. 2.5D Diorama Scroll Engine
  if (!prefersReducedMotion) {
    let scrollY = window.scrollY;
    let ticking = false;
    let windowHeight = window.innerHeight;
    let isMobile = window.innerWidth < 768;

    const textLayers = document.querySelectorAll('.diorama-text-layer');
    const imageLayers = document.querySelectorAll('.diorama-image-layer, .diorama-image-container');
    const basicParallax = document.querySelectorAll('.diorama-layer');

    const updateDiorama = () => {
      const intensity = isMobile ? 0.4 : 1;

      // Text Layers depth pop
      textLayers.forEach(layer => {
        const rect = layer.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0 && layer.classList.contains('is-visible')) {
          const translateZ = layer.getAttribute('data-depth') || 30;
          layer.style.transform = `translate3d(0, 0, ${translateZ * intensity}px)`;
        }
      });

      // Image Layers Parallax and slight tilt
      imageLayers.forEach(layer => {
        const rect = layer.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          const viewportCenter = windowHeight / 2;
          const elementCenter = rect.top + (rect.height / 2);
          const distanceFromCenter = (elementCenter - viewportCenter) / viewportCenter;
          
          const rotateX = distanceFromCenter * 2 * intensity; // subtle 2deg max
          const translateZ = layer.getAttribute('data-depth') || 20;
          
          layer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translate3d(0, 0, ${translateZ * intensity}px)`;
        }
      });

      // Basic Parallax (Hero, Backgrounds)
      basicParallax.forEach(layer => {
        const parent = layer.closest('.diorama-section');
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          const speed = layer.getAttribute('data-speed') || 0.1;
          const yPos = -(rect.top * speed * intensity);
          layer.style.transform = `translate3d(0, ${yPos}px, -10px)`;
        }
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateDiorama);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      windowHeight = window.innerHeight;
      isMobile = window.innerWidth < 768;
    }, { passive: true });

    updateDiorama();
  }
});
