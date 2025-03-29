import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Footer from './components/footer';
import CaseStudyCard from './components/case-study-card';
import { useState, useEffect, useRef } from 'react';
import "@fontsource-variable/jetbrains-mono";

// Types
interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  content: string;
}

interface HomeProps {
  caseStudies: CaseStudy[];
}

const ParentComponent = ({ caseStudies }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleExpand = (index: number) => {
      setExpandedIndex(expandedIndex === index ? null : index); // Toggle the current index
  };

  return (
      <section id="case-studies" className="py-20 px-8">
          <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                  {caseStudies.map((study, index) => (
                      <CaseStudyCard 
                          key={study.slug} 
                          study={study} 
                          index={index} 
                          isExpanded={expandedIndex === index} // Check if this card is expanded
                          onExpand={() => handleExpand(index)} // Pass down the handler
                      />
                  ))}
              </div>
          </div>
      </section>
  );
};

// Main Page Component
export default function Home({ caseStudies }: HomeProps) {
  // Main container ref for scroll calculations
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Section refs
  const introRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const caseStudiesRef = useRef<HTMLElement>(null);
  
  // Store gradient states that will be updated by scrolling
  const [gradientState, setGradientState] = useState({
    position: "top right",
    colors: ["hsl(150, 80%, 95%)", "hsl(180, 80%, 90%)", "hsl(210, 70%, 85%)"]
  });
  
  // Get scroll progress for the entire page
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Create spring-based animation for smoother scrolling
  const smoothScrollYProgress = useSpring(scrollYProgress, { 
    damping: 20, 
    stiffness: 100 
  });
  
  // Effect to update gradient based on scroll position
  useEffect(() => {
    const unsubscribe = smoothScrollYProgress.onChange(value => {
      // Based on scroll position, update the gradient
      if (value < 0.33) {
        // First section (intro) - interpolate between first and second section styles
        const t = value / 0.33; // Normalized progress within this section
        setGradientState({
          position: `${100 - t * 100}% ${t * 50}%`, // Move from top right to center left
          colors: [
            `hsl(${interpolateHue(150, 280, t)}, 80%, 95%)`,
            `hsl(${interpolateHue(180, 320, t)}, ${interpolateValue(80, 70, t)}%, 90%)`,
            `hsl(${interpolateHue(210, 350, t)}, 70%, 85%)`
          ]
        });
      } else if (value < 0.67) {
        // Second section (about) - interpolate between second and third section styles
        const t = (value - 0.33) / 0.34; // Normalized progress within this section
        setGradientState({
          position: `${(1-t) * 0}% ${50 + t * 50}%`, // Move from center left to bottom center
          colors: [
            `hsl(${interpolateHue(280, 40, t)}, 80%, 95%)`,
            `hsl(${interpolateHue(320, 60, t)}, 70%, 90%)`,
            `hsl(${interpolateHue(350, 80, t)}, 70%, 85%)`
          ]
        });
      } else {
        // Final section (case studies)
        setGradientState({
          position: "50% 100%", // Bottom center
          colors: ["hsl(40, 80%, 95%)", "hsl(60, 70%, 90%)", "hsl(80, 70%, 85%)"]
        });
      }
    });
    
    return () => unsubscribe();
  }, [smoothScrollYProgress]);
  
  // Helper function to interpolate between two hue values
  function interpolateHue(start: number, end: number, t: number): number {
    // Handle the shortest path around the color wheel
    const diff = end - start;
    if (Math.abs(diff) > 180) {
      if (diff > 0) {
        return start + (diff - 360) * t;
      } else {
        return start + (diff + 360) * t;
      }
    }
    return start + diff * t;
  }
  
  // Helper function to interpolate between two values
  function interpolateValue(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }
  
  // Active section tracking (for potential future enhancements)
  const [activeSection, setActiveSection] = useState<string>("intro");
  
  useEffect(() => {
    // Set up a listener to track the active section
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      if (introRef.current && scrollPosition < aboutRef.current?.offsetTop) {
        setActiveSection("intro");
      } else if (aboutRef.current && scrollPosition < caseStudiesRef.current?.offsetTop) {
        setActiveSection("about");
      } else if (caseStudiesRef.current) {
        setActiveSection("case-studies");
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <main className="min-h-screen relative overflow-x-hidden">
        {/* Dynamic Gradient Background */}
        <div
          className="fixed inset-0 w-full h-full -z-10 transition-all duration-300"
          style={{
            background: `radial-gradient(circle at ${gradientState.position}, ${gradientState.colors[0]} 0%, ${gradientState.colors[1]} 50%, ${gradientState.colors[2]} 100%)`
          }}
        />
        
        {/* Content with transparent background to let gradient show through */}
        <div className="relative z-10">
          {/* Landing Section */}
          <motion.section 
            id="intro"
            ref={introRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 mt-32 mb-32 lg:py-24 max-w-4xl mx-auto flex items-center justify-center"
          >
            <h1 className="text-3xl lg:text-6xl font-bold uppercase">
              Building Exciting AI Experiences: From 0 to 100
            </h1>
          </motion.section>
          
          <motion.section 
            id="about"
            ref={aboutRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-32 mb-32 lg:py-24 max-w-4xl mx-auto flex items-center justify-center"
          >
            <p className="p-8 lg:p-32 text-xl lg:text-3xl leading-relaxed">
              Meet Leonard: a tech enthusiast who geeks out over Spatial Computing and AI, always exploring tomorrow's technologies before they hit the mainstream. When he's not designing sleek digital products that solve real problems, you'll find him deep in code, building the future rather than just talking about it.
            </p>
          </motion.section>

          {/* Case Studies Section */}
          <section id="case-studies" ref={caseStudiesRef}>
            <ParentComponent caseStudies={caseStudies} />
          </section>

          <Footer />
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const files = fs.readdirSync(path.join('content/case-studies'));
  const caseStudies = files.map(filename => {
      const slug = filename.replace('.md', '');
      const markdownWithMeta = fs.readFileSync(path.join('content/case-studies', filename), 'utf-8');
      const { data } = matter(markdownWithMeta);
      return { slug, ...data };
  });

  return {
      props: {
          caseStudies,
      },
  };
};