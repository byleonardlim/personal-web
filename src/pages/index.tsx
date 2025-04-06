// src/pages/index.tsx
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import CaseStudyCard from '@/components/case-study-card';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import SEO from '@/components/SEO';

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

const ParentComponent = ({ caseStudies }: { caseStudies: CaseStudy[] }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleExpand = (index: number) => {
      setExpandedIndex(expandedIndex === index ? null : index); // Toggle the current index
  };

  return (
      <section id="case-studies">
          <div className="space-y-4">
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
      </section>
  );
};

// Main Page Component
export default function Home({ caseStudies }: HomeProps) {
  // Main container ref
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Section refs
  const introRef = useRef<HTMLElement>(null);
  const caseStudiesRef = useRef<HTMLElement>(null);

  // Animation effect for intro section
  useEffect(() => {
    if (introRef.current) {
      gsap.fromTo(
        introRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          ease: "power2.out" 
        }
      );
    }
  }, []);

  return (
    <>
      {/* Add SEO Component with homepage specific meta info */}
      <SEO 
        title="Leonard Lim | AI Experience Designer" 
        description="I transform abstract possibilities into business-validated digital products, seamlessly blending intuitive user experiences with intelligent technology that navigates complexity."
      />
      
      <div ref={containerRef} className="relative">
        <main className="min-h-screen relative overflow-x-hidden">        
          <div className="relative z-10">
            {/* Landing Section */}
            <section 
              id="intro"
              ref={introRef}
              className="mt-32 mb-32 lg:py-24 max-w-4xl mx-auto flex items-center justify-center"
            >
              <h1 className="p-8 text-2xl lg:text-4xl font-bold leading-relaxed">
              I transform abstract possibilities into business-validated digital products, seamlessly blending intuitive user experiences with intelligent technology that navigates complexity.
              </h1>
            </section>

            {/* Case Studies Section */}
            <section id="case-studies" ref={caseStudiesRef} className="p-8 py-32 max-w-4xl mx-auto">
              <span className="mb-4 w-fit block uppercase text-xs font-bold">Featured Work</span>
              <ParentComponent caseStudies={caseStudies} /> 
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const files = fs.readdirSync(path.join('content/case-studies'));
  const caseStudies = files.map((filename: string) => {
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