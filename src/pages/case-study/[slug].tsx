import { motion } from 'motion/react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import ReactMarkdown from 'react-markdown';
import Footer from '../components/footer';
import SEO from '../components/SEO';
import { OptimizedImage } from '../components/OptimizedImage';
import { ArrowLeft, MoveLeft, MoveRight, Asterisk } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useState, useCallback, useEffect, memo } from 'react';
import { CaseStudyPageProps } from '@/types/case-study';
import { getCaseStudyBySlug, getAdjacentCaseStudies } from '@/lib/case-studies';

const SectionedMarkdown = ({ content }) => {
  // Split content by h2 headings
  const sections = content.split(/(?=^## )/gm);
  
  // Store notes section separately
  let notesSection = null;
  const mainSections = [];
  
  sections.forEach((section, index) => {
    if (!section.trim()) return;
    
    if (!section.startsWith('## ')) {
      // This is content before any heading (intro content)
      mainSections.push({
        type: 'intro',
        content: section,
        index
      });
      return;
    }
    
    // Extract the heading and content
    const headingMatch = section.match(/^## (.*?)$/m);
    const headingText = headingMatch ? headingMatch[1].trim() : '';
    const sectionContent = section.replace(/^## .*?$/m, '').trim();
    
    // Check if it's a notes section
    const isNotesSection = headingText.toLowerCase().includes('notes');
    
    if (isNotesSection) {
      notesSection = {
        type: 'notes',
        heading: headingText,
        content: sectionContent,
        index
      };
    } else {
      mainSections.push({
        type: 'section',
        heading: headingText,
        content: sectionContent,
        index
      });
    }
  });
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main content column */}
      <div className="lg:w-2/3">
        {mainSections.map((section) => {
          if (section.type === 'intro') {
            return (
              <div key={`intro-${section.index}`} className="mb-8">
                <ReactMarkdown components={MarkdownComponents}>
                  {section.content}
                </ReactMarkdown>
              </div>
            );
          } else {
            return (
              <section key={`section-${section.index}`} className="mb-8">
                <h2 className="text-lg font-bold mb-4 uppercase">
                  {section.heading}
                </h2>
                <div className="text-md leading-relaxed">
                  <ReactMarkdown components={MarkdownComponents}>
                    {section.content}
                  </ReactMarkdown>
                </div>
              </section>
            );
          }
        })}
      </div>
      
      {/* Notes column (sticky) */}
      {notesSection && (
        <div className="lg:w-1/3 lg:my-12 order-first lg:order-last">
          <div className="sticky lg:top-8 border border-gray-100 lg:rounded-lg p-6 bg-gray-50">
            <h2 className="text-lg font-bold mb-4 text-gray-700 uppercase">
              {notesSection.heading}
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed">
              <ReactMarkdown components={MarkdownComponents}>
                {notesSection.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced image component with adaptive sizing based on image dimensions
const MarkdownImage = memo(({ node, src, alt, ...props }: { node: any; src: string; alt?: string; }) => {
  return (
    <figure className="w-full lg:my-12 rounded-lg border border-gray-200 bg-[url(/assets/images/universal/gradient-bg.png)] bg-cover p-8 md:p-16">      
      {/* Image container with optimized Next.js Image */}
      <div className="relative z-10">
        <OptimizedImage 
          src={src} 
          alt={alt || 'Case study image'} 
          className="shadow-lg"
        />
      </div>
    </figure>
  );
});

MarkdownImage.displayName = 'MarkdownImage';

// Memoized Markdown components for better performance
const MarkdownComponents = {
  img: MarkdownImage,
  
  h3: memo<React.HTMLAttributes<HTMLHeadingElement>>((props) => (
    <h3 className="text-xl font-bold mt-6 mb-3 leading-relaxed bg-gradient-to-r from-[#a9b6c2] to-white bg-clip-text text-transparent" {...props} />
  )),

  p: memo((props) => (
    <div className="text-gray-600 text-md leading-relaxed mb-4" {...props} />
  )),


  ul: memo((props) => (
    <ul className="my-8 space-y-4 list-none" {...props} />
  )),
  
  li: memo((props) => {
    const text = typeof props.children === 'string' 
      ? props.children 
      : JSON.stringify(props.children);
    
    return (
      <motion.li 
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
        className="group"
      >
        <motion.div
          className="p-4 border border-current transition-all duration-300"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <Asterisk className="w-4 h-4 text-gray-900" />
            </div>
            <span className="text-sm">
              {props.children}
            </span>
          </div>
        </motion.div>
      </motion.li>
    );
  }),
  
  ol: memo((props) => (
    <ol className="list-decimal list-inside my-4 leading-relaxed" {...props} />
  )),

  a: memo(React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>((props, ref) => (
    <a ref={ref} className="text-blue-600 underline cursor-pointer hover:text-blue-800" {...props} />
  ))),

  code: memo(({ inline, ...props }: { inline?: boolean }) => (
    inline ? 
      <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} /> :
      <code className="block bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto" {...props} />
  )),

  blockquote: memo(React.forwardRef<HTMLQuoteElement, React.BlockquoteHTMLAttributes<HTMLQuoteElement>>((props, ref) => (
    <blockquote ref={ref} className="bg-gray-100 border-l-4 border-gray-300 p-4 my-4 text-xl italic" {...props} />
  ))),

  table: memo((props) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full border-separate border-spacing-0" {...props} />
    </div>
  )),
  
  th: memo((props) => (
    <th className="p-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
  )),
  
  td: memo((props) => (
    <td className="p-6 whitespace-nowrap text-sm text-gray-500" {...props} />
  )),
};

export { MarkdownComponents };

// Case Studies
interface CaseStudy {
  title: string;
  content: string;
  slug: string;
}

//interface CaseStudyProps {
//  study: CaseStudy;
//  nextStudy: CaseStudy | null;
//  prevStudy: CaseStudy | null;
// }

export default function CaseStudy({ study, nextStudy, prevStudy, lastGenerated }: CaseStudyPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Set up router event listeners
    const handleStart = (url: string) => {
      // Only set loading to true if we're navigating to a different page
      if (url !== router.asPath) {
        setIsLoading(true);
      }
    };

    const handleComplete = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
    };

    // Add event listeners
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    // Clean up event listeners
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  // Page transition variants
  const pageVariants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 1000 : -1000
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -1000 : 1000,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Navigation handler with direction
  const handleNavigation = useCallback(async (path: string, direction: number) => {
    await router.push({
      pathname: path,
      query: { direction }
    }, path);
  }, [router]);

  const direction = router.query.direction ? parseInt(router.query.direction as string) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  const getFirstImage = () => {
    const imgMatch = study.content.match(/!\[.*?\]\((.*?)\)/);
    return imgMatch ? imgMatch[1] : '/assets/images/og-image.png';
  };

  return (
    <>
      <SEO 
        title={`${study.title} | Leonard Lim`}
        description={study.description || ''}
        image={getFirstImage()}
        article={true}
      />

      <motion.div
        key={router.asPath}
        custom={direction}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen"
      >
        <div
          className="fixed inset-0 w-full h-full -z-10"
          style={{
            background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef, #a9b6c2)'
          }}
        />
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-20">
          {/* Back to Home Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-2 mb-8 w-fit border border-current block uppercase text-xs font-bold"
          >
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors group"
            >
              <motion.div
                whileHover={{ x: -4 }}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 group-hover: transition-colors group" />
              </motion.div>
              Back
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="pb-4">
              <h1 className="text-2xl lg:text-4xl font-bold leading-relaxed uppercase">{study.title}</h1>
            </div>
            <div className="text-lg">
              <SectionedMarkdown content={study.content} />
            </div>
          </motion.div>

          <div className="mt-16 flex justify-between">
            <div>
              {prevStudy && (
                <button
                  onClick={() => handleNavigation(`/case-study/${prevStudy.slug}`, -1)}
                  className="group flex items-left gap-3 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <motion.div
                    whileHover={{ x: -4 }}
                    className="flex items-left gap-2"
                  >
                    <MoveLeft className="w-6 h-6" />
                  </motion.div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500">Previous</span>
                    <span className="text-sm text-left">{prevStudy.title}</span>
                  </div>
                </button>
              )}
            </div>
            
            <div>
              {nextStudy && (
                <button
                  onClick={() => handleNavigation(`/case-study/${nextStudy.slug}`, 1)}
                  className="group flex items-left gap-3 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">Next</span>
                    <span className="text-sm truncate">{nextStudy.title}</span>
                  </div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2"
                  >
                    <MoveRight className="w-6 h-6" />
                  </motion.div>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const { slug } = params as { slug: string };
  
  // Set caching headers for performance optimization
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );

  try {
    // Get case study
    const study = await getCaseStudyBySlug(slug);
    
    if (!study) {
      return {
        notFound: true,
      };
    }
    
    // Get adjacent case studies
    const { nextStudy, prevStudy } = await getAdjacentCaseStudies(slug);

    return {
      props: {
        study,
        nextStudy,
        prevStudy,
        lastGenerated: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error(`Error loading case study [${slug}]:`, error);
    
    return {
      notFound: true,
    };
  }
};