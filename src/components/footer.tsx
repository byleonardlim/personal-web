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
      className="border-t-1 border-gray-400 text-gray-900 py-12"
    >
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-xs text-center flex justify-center gap-6">
          <a href="mailto:me@byleonardlim.com" className="hover:text-gray-600 transition-colors">Send an Email</a>
          <a href="https://linkedin.com/in/byleonardlim" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">Connect on LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}