import { useEffect } from 'react';

/**
 * Custom hook for scroll-triggered animations
 * Observes elements with [data-animate] attribute and animates them when visible
 */
const useScrollAnimation = () => {
  useEffect(() => {
    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible classes when element enters viewport
            entry.target.classList.remove('opacity-0', 'translate-y-10');
            entry.target.classList.add('opacity-100', 'translate-y-0');
            
            // Optional: Stop observing after animation (animate only once)
            // observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before element is fully visible
      }
    );

    // Find and observe all elements with data-animate attribute
    const animateElements = document.querySelectorAll('[data-animate]');
    animateElements.forEach((el) => observer.observe(el));

    // Cleanup function
    return () => {
      animateElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);
};

export default useScrollAnimation;
