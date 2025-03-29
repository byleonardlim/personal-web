import { motion } from 'motion/react';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Footer from './components/footer';
import CaseStudyCard from './components/case-study-card';
import { useState, useRef } from 'react';
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
      <section id="case-studies">
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

      </section>
  );
};

// Main Page Component
export default function Home({ caseStudies }: HomeProps) {
  // Main container ref
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Section refs
  const introRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const caseStudiesRef = useRef<HTMLElement>(null);

  return (
    <div ref={containerRef} className="relative">
      <main className="min-h-screen relative overflow-x-hidden">
        {/* Static Gradient Background */}
        <div
          className="fixed inset-0 w-full h-full -z-10"
          style={{
            background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe, #bae6fd)'
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
            className="mt-32 mb-32 lg:py-24 max-w-4xl mx-auto flex items-center justify-center"
          >
            <h1 className="p-8 text-2xl lg:text-4xl font-bold leading-relaxed uppercase">
            I transform abstract possibilities into business-validated digital products, seamlessly blending intuitive user experiences with intelligent technology that navigates complexity.
            </h1>
          </motion.section>

          {/* Case Studies Section */}
          <section id="case-studies" ref={caseStudiesRef} className="py-32 max-w-4xl mx-auto">
            <span className="px-4 py-2 mb-8 w-fit border border-current block uppercase text-xs font-bold">Featured Work</span>
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