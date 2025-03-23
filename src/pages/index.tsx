import { motion } from 'motion/react';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Footer from './components/footer';
import CaseStudyCard from './components/case-study-card';
import { useState } from 'react';
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
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Static Gradient Background */}
      <div
        className="fixed inset-0 w-full h-full -z-10"
        style={{
          background: 'radial-gradient(circle at top right, hsl(150, 80%, 95%) 0%, hsl(180, 80%, 90%) 50%, hsl(210, 70%, 85%) 100%)'
        }}
      />
      
      {/* Content with transparent background to let gradient show through */}
      <div className="relative z-10">
        {/* Landing Section */}
        <motion.section 
          id="intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 lg:py-24 max-w-4xl mx-auto min-h-screen flex items-center justify-center"
        >
          <h1 className="text-2xl lg:text-6xl font-bold uppercase leading-relaxed">
            Building Exciting AI Experiences: From 0 to 100
          </h1>
        </motion.section>
        
        <motion.section 
          id="about"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 lg:py-24 max-w-4xl mx-auto min-h-screen flex items-center justify-center"
        >
          <p className="text-2xl lg:text-3xl leading-relaxed">
            Meet Leonard: a tech enthusiast who geeks out over Spatial Computing and AI, always exploring tomorrow's technologies before they hit the mainstream. When he's not designing sleek digital products that solve real problems, you'll find him deep in code, building the future rather than just talking about it.
          </p>
        </motion.section>

        {/* Case Studies Section */}
        <ParentComponent caseStudies={caseStudies} />

        <Footer />
      </div>
    </main>
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