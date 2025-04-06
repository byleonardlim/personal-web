import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface FooterProps {
  id?: string;
}

export default function Footer({ id }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 0.6,
          ease: "power1.out"
        }
      );
    }
  }, []);

  return (
    <footer 
      id={id}
      ref={footerRef}
      className="border-t-1 border-stone-300 bg-gray-800 py-2"
    >
    </footer>
  );
}