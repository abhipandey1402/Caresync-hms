import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export function AnimatedCounter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Parse numeric part and prefix/suffix
  const stringVal = String(value);
  const numMatch = stringVal.match(/[\d,.]+/);
  const numericStr = numMatch ? numMatch[0].replace(/,/g, '') : '0';
  const targetNum = parseFloat(numericStr);
  const isNumber = !isNaN(targetNum);

  const prefix = numMatch ? stringVal.substring(0, numMatch.index) : '';
  const suffix = numMatch ? stringVal.substring(numMatch.index + numMatch[0].length) : stringVal;

  useEffect(() => {
    if (!isInView || !isNumber) return;
    
    let startTimestamp = null;
    let animationFrame;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(targetNum * easeOutQuart);
      
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setCount(targetNum); // ensure it ends exactly on target
      }
    };
    
    animationFrame = window.requestAnimationFrame(step);
    
    return () => window.cancelAnimationFrame(animationFrame);
  }, [targetNum, duration, isInView, isNumber]);

  if (!isNumber) return <span>{value}</span>;

  // Format with integer vs float depending on the value
  const displayNum = targetNum % 1 !== 0 
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString('en-IN');

  return <span ref={ref}>{prefix}{displayNum}{suffix}</span>;
}
