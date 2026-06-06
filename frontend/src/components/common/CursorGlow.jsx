import React, { useEffect, useRef, useState } from 'react';

const CursorGlow = () => {
  const cursorRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on desktop/devices with a mouse pointer
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovering = false;
    let animationFrameId;

    // The easing factor for smooth trailing
    const ease = 0.15;

    const onMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      // Interpolate current position towards actual mouse position
      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;

      // Ensure we offset by half the width/height (which is handled by transform in CSS)
      // but we apply the exact coordinates to top/left via CSS vars or translate
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    // Global Hover Detection using Event Delegation
    const handleMouseOver = (e) => {
      const target = e.target;
      // Define selectors that trigger the hover state (growth/glow intensity)
      const interactiveElements = 'button, a, [role="button"], img, .glass-card, .nav-item, input, select, textarea';
      
      if (target.closest(interactiveElements)) {
        isHovering = true;
        cursor.classList.add('cursor-hovering');
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      const interactiveElements = 'button, a, [role="button"], img, .glass-card, .nav-item, input, select, textarea';
      
      if (target.closest(interactiveElements)) {
        isHovering = false;
        cursor.classList.remove('cursor-hovering');
      }
    };

    // Global document leaving/entering
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <>
      <div 
        ref={cursorRef} 
        className={`cursor-glow-element ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      />
    </>
  );
};

export default CursorGlow;
