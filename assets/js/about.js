/**
 * HUMRAH ABOUT PAGE - RAW & CINEMATIC INTERACTION ENGINE
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // 1. Reveal Engine (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-up, .slow-reveal, .pencil-stroke');
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // For slow reveals, don't unobserve immediately if we want scroll-linked effects, 
          // but for basic classes, unobserve is fine.
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 2. Diorama & Parallax Engine (requestAnimationFrame)
  if (!prefersReducedMotion) {
    let scrollY = window.scrollY;
    let ticking = false;
    let windowHeight = window.innerHeight;
    let isMobile = window.innerWidth < 768;

    const textLayers = document.querySelectorAll('.diorama-text-layer');
    const imageLayers = document.querySelectorAll('.diorama-image-layer');
    const basicParallax = document.querySelectorAll('.diorama-layer');
    
    // Crossfade Elements
    const momentSection = document.querySelector('.moment-section');
    const momentAlone = document.getElementById('moment-alone');
    const momentGroup = document.getElementById('moment-group');

    const updateDiorama = () => {
      const intensity = isMobile ? 0.3 : 1;

      // Text Layers
      textLayers.forEach(layer => {
        const rect = layer.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0 && layer.classList.contains('is-visible')) {
          const translateZ = layer.getAttribute('data-depth') || 30;
          layer.style.transform = `translate3d(0, 0, ${translateZ * intensity}px)`;
        }
      });

      // Image Layers
      imageLayers.forEach(layer => {
        const rect = layer.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          const viewportCenter = windowHeight / 2;
          const elementCenter = rect.top + (rect.height / 2);
          const dist = (elementCenter - viewportCenter) / viewportCenter;
          const rotateX = dist * 2 * intensity; 
          const translateZ = layer.getAttribute('data-depth') || 20;
          layer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translate3d(0, 0, ${translateZ * intensity}px)`;
        }
      });

      // Basic Parallax
      basicParallax.forEach(layer => {
        const parent = layer.closest('.diorama-section');
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          const speed = layer.getAttribute('data-speed') || 0.1;
          const yPos = -(rect.top * speed * intensity);
          layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });

      // Moment Crossfade (The Sticky Section)
      if (momentSection && momentAlone && momentGroup) {
        const stickyInner = momentSection.querySelector('.sticky-container');
        if (stickyInner) {
          const rect = stickyInner.getBoundingClientRect();
          if (rect.top <= windowHeight && rect.bottom >= 0) {
            const totalScrollable = rect.height - windowHeight;
            const currentScrolled = -rect.top;
            let progress = currentScrolled / totalScrollable;
            progress = Math.max(0, Math.min(1, progress));
            
            const opacity = progress > 0.3 ? (progress - 0.3) * 1.5 : 0;
            momentGroup.style.opacity = Math.min(1, opacity);
            momentAlone.style.opacity = Math.max(0, 1 - (progress * 1.2));
            
            const aloneZ = -(progress * 100 * intensity);
            momentAlone.style.transform = `translate3d(0, 0, ${aloneZ}px)`;
            
            const groupZ = (progress * 20 * intensity);
            momentGroup.style.transform = `translate3d(0, 0, ${groupZ}px)`;
          }
        }
      }

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
