/**
 * HUMRAH EARLY ACCESS - 2.5D Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // 1. Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-up, .fade-in, .handwritten-text');
  
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
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 2. 2.5D Diorama Scroll Engine using requestAnimationFrame
  if (!prefersReducedMotion) {
    let scrollY = window.scrollY;
    let ticking = false;
    let windowHeight = window.innerHeight;
    let isMobile = window.innerWidth < 768;

    // Cache elements for performance
    const storySection = document.querySelector('.story-sticky');
    const imgAlone = document.getElementById('img-alone');
    const imgGroup = document.getElementById('img-group');
    
    const imageLayers = document.querySelectorAll('.diorama-image-layer');
    const textLayers = document.querySelectorAll('.diorama-text-layer');
    const basicParallax = document.querySelectorAll('.diorama-layer');
    
    // Scale down intensity for mobile
    const intensity = isMobile ? 0.5 : 1;

    // Setup Particles
    const particleContainer = document.getElementById('graphite-particles');
    const particleCount = isMobile ? 12 : 30; // FEW particles
    const particles = [];
    
    if (particleContainer) {
      for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        // Distribute randomly
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `${Math.random() * 200}vh`; // Spread over double viewport height initially
        
        const speed = Math.random() * 0.15 + 0.05;
        particleContainer.appendChild(p);
        particles.push({ el: p, speed: speed * intensity });
      }
    }

    const updateDiorama = () => {
      // A. Particles (Subtle float/parallax)
      particles.forEach(p => {
        const yOffset = -(scrollY * p.speed);
        p.el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      });

      // B. Loneliness Transition (The physical turning page depth effect)
      if (storySection && imgAlone && imgGroup) {
        const rect = storySection.getBoundingClientRect();
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          const totalScrollable = rect.height - windowHeight;
          const currentScrolled = -rect.top;
          let progress = currentScrolled / totalScrollable;
          progress = Math.max(0, Math.min(1, progress));
          
          // Crossfade
          const opacity = progress > 0.4 ? (progress - 0.4) * 2 : 0;
          imgGroup.style.opacity = Math.min(1, opacity);
          imgAlone.style.opacity = Math.max(0, 1 - (progress * 1.5));
          
          // Depth logic
          // Alone recedes
          const aloneZ = -(progress * 150 * intensity);
          imgAlone.style.transform = `translate3d(0, 0, ${aloneZ}px)`;
          
          // Group emerges slightly
          const groupZ = (progress * 30 * intensity);
          imgGroup.style.transform = `translate3d(0, 0, ${groupZ}px)`;
        }
      }

      // C. Image Card Layers (Features + Safety)
      imageLayers.forEach(layer => {
        const rect = layer.getBoundingClientRect();
        // Process if in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          // Center of element vs center of viewport (-1 to 1)
          const viewportCenter = windowHeight / 2;
          const elementCenter = rect.top + (rect.height / 2);
          const distanceFromCenter = (elementCenter - viewportCenter) / viewportCenter;
          
          // Max rotation 2 degrees
          const rotateX = distanceFromCenter * 2 * intensity;
          const translateZ = layer.getAttribute('data-depth') || 30;
          
          // Move forward as it enters center, rotate slightly based on position
          layer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translate3d(0, 0, ${translateZ * intensity}px) scale(1.02)`;
        }
      });

      // D. Text Layers (Pop out slightly)
      textLayers.forEach(layer => {
        const rect = layer.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          const translateZ = layer.getAttribute('data-depth') || 40;
          
          // For Handwritten text (You're early), add scale effect
          if (layer.classList.contains('handwritten-text') && layer.classList.contains('is-visible')) {
            const viewportCenter = windowHeight / 2;
            const elementCenter = rect.top + (rect.height / 2);
            // Grows slightly as it approaches center
            const dist = Math.abs(elementCenter - viewportCenter) / viewportCenter;
            const scale = 1 + (0.05 * (1 - dist) * intensity);
            layer.style.transform = `translate3d(0, 0, ${translateZ * intensity}px) scale(${scale})`;
          } else if (layer.classList.contains('is-visible')) {
            // Standard text layer depth
            layer.style.transform = `translate3d(0, 0, ${translateZ * intensity}px)`;
          }
        }
      });

      // E. Basic Background Parallax (Hero, Final CTA)
      basicParallax.forEach(layer => {
        const parent = layer.closest('.diorama-section');
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          const speed = layer.getAttribute('data-speed') || 0.1;
          const relativeScroll = rect.top; // Relative to viewport top
          const yPos = -(relativeScroll * speed * intensity);
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
    
    // Initial call
    updateDiorama();
  }

  // 3. Location Modal Logic
  const locationModal = document.getElementById('locationModal');
  const modalClose = document.getElementById('modalClose');
  const modalSecondaryBtn = document.getElementById('modalSecondaryBtn');
  
  if (locationModal && !localStorage.getItem('humrah_modal_seen')) {
    setTimeout(() => {
      locationModal.classList.add('is-visible');
    }, 2500);
  }

  const closeModal = () => {
    if (locationModal) {
      locationModal.classList.remove('is-visible');
      localStorage.setItem('humrah_modal_seen', 'true');
    }
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalSecondaryBtn) modalSecondaryBtn.addEventListener('click', closeModal);
  
  if (locationModal) {
    locationModal.addEventListener('click', (e) => {
      if (e.target === locationModal) closeModal();
    });
  }
});
