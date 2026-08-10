/**
 * HUMRAH EARLY ACCESS - Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-up, .fade-in, .handwritten-text');
  
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  };
  
  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  revealElements.forEach(el => {
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
    } else {
      revealObserver.observe(el);
    }
  });


  // 2. Story Section Transition (Scroll based)
  const storySection = document.querySelector('.story-sticky');
  const imgGroup = document.getElementById('img-group');
  
  if (storySection && imgGroup && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const rect = storySection.getBoundingClientRect();
      // Calculate scroll progress through the sticky container
      // rect.top is 0 when the top of the element hits the top of the viewport
      // rect.bottom is window.innerHeight when the element is fully scrolled past
      
      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        const totalScrollable = rect.height - window.innerHeight;
        const currentScrolled = -rect.top;
        let progress = currentScrolled / totalScrollable;
        
        // Clamp between 0 and 1
        progress = Math.max(0, Math.min(1, progress));
        
        // Use a sharper curve for the crossfade
        const opacity = progress > 0.4 ? (progress - 0.4) * 2 : 0;
        imgGroup.style.opacity = Math.min(1, opacity);
      } else if (rect.top > 0) {
        imgGroup.style.opacity = 0;
      } else if (rect.bottom < window.innerHeight) {
        imgGroup.style.opacity = 1;
      }
    }, { passive: true });
  }

  // 3. Subtle Parallax for hero and final CTA backgrounds
  const parallaxBgs = document.querySelectorAll('.hero-bg img, .final-bg img');
  
  if (parallaxBgs.length > 0 && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      parallaxBgs.forEach(bg => {
        const parent = bg.closest('.hero, .final-cta');
        if (!parent) return;
        
        const rect = parent.getBoundingClientRect();
        
        // Only calculate if in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
          const parentTop = parent.offsetTop;
          const relativeScroll = scrollPos - parentTop;
          
          // Move background at 20% of scroll speed
          const yPos = relativeScroll * 0.2;
          bg.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    }, { passive: true });
  }
});
