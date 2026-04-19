import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export function AnimatedCounter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(value * easeOutQuart);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration, isInView]);

  // Format with integer vs float depending on the value
  const displayVal = value % 1 !== 0 
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString('en-IN');

  return <span ref={ref}>{displayVal}</span>;
}
