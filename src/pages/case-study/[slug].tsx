/* eslint-disable react/display-name */
/* eslint-disable react/no-unused-vars */
import { motion, Variants, MotionProps } from 'motion/react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import Footer from '../components/footer';
import SEO from '../components/SEO';
import { OptimizedImage } from '../components/OptimizedImage';
import { ArrowLeft, MoveLeft, MoveRight, Asterisk } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useState, useCallback, useEffect, memo } from 'react';
import { CaseStudyPageProps, CaseStudy as CaseStudyType } from '@/types/case-study';
import { getCaseStudyBySlug, getAdjacentCaseStudies } from '@/lib/case-studies';
import { NextApiResponse } from 'next';
import { ParsedUrlQuery } from 'querystring';

// Define interfaces for components
interface SectionedMarkdownProps {
  content: string;
}

interface Section {
  type: 'intro' | 'section';
  content: string;
  index: number;
  heading?: string;
}

interface NotesSection {
  type: 'notes';
  heading: string;
  content: string;
  index: number;
}

// Type for image props
interface MarkdownImageProps {
  src: string;
  alt?: string;
}

// Enhanced image component with adaptive sizing based on image dimensions
const MarkdownImage = memo(({ src, alt }: MarkdownImageProps) => {
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

// Create a proper react-markdown components object
const MarkdownComponents: Components = {
  img: ({ src, alt }) => 
    src ? <MarkdownImage src={src} alt={alt} /> : null,
  
  h3: ({ children }) => (
    <h3 className="text-xl font-bold mt-6 mb-3 leading-relaxed bg-gradient-to-r from-[#a9b6c2] to-white bg-clip-text text-transparent">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <div className="text-gray-600 text-md leading-relaxed mb-4">
      {children}
    </div>
  ),

  ul: ({ children }) => (
    <ul className="my-8 space-y-4 list-none">
      {children}
    </ul>
  ),
  
  li: ({ children }) => {
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
              {children}
            </span>
          </div>
        </motion.div>
      </motion.li>
    );
  },
  
  ol: ({ children }) => (
    <ol className="list-decimal list-inside my-4 leading-relaxed">
      {children}
    </ol>
  ),

  a: ({ href, children }) => (
    <a 
      href={href || '#'}
      className="text-blue-600 underline cursor-pointer hover:text-blue-800"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),

  blockquote: ({ children }) => (
    <blockquote className="bg-gray-100 border-l-4 border-gray-300 p-4 my-4 text-xl italic">
      {children}
    </blockquote>
  ),

  table: ({ children }) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full border-separate border-spacing-0">
        {children}
      </table>
    </div>
  ),
  
  th: ({ children }) => (
    <th className="p-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  ),
  
  td: ({ children }) => (
    <td className="p-6 whitespace-nowrap text-sm text-gray-500">
      {children}
    </td>
  ),
};

// Define the SectionedMarkdown component with improved typing and error handling
const SectionedMarkdown: React.FC<SectionedMarkdownProps> = ({ content }) => {
  try {
    if (!content) {
      return <div>No content available</div>;
    }
    
    // Split content by h2 headings
    const sections = content.split(/(?=^## )/gm);
    
    // Store notes section separately with proper typing
    let notesSection: NotesSection | null = null;
    const mainSections: Section[] = [];
    
    sections.forEach((section: string, index: number) => {
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
      
      // Extract the heading and content using safer approach
      const headingMatch = section.match(/^## (.*?)$/m);
      const headingText = headingMatch?.[1]?.trim() || 'Untitled Section';
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
          {mainSections.length > 0 ? (
            mainSections.map((section) => {
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
            })
          ) : (
            // Fallback if no sections are found
            <div className="mb-8">
              <ReactMarkdown components={MarkdownComponents}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Notes column (sticky) */}
        {notesSection && (
          <div className="lg:w-1/3 lg:my-12 order-first lg:order-last">
            <div className="sticky lg:top-8 border border-gray-100 lg:rounded-lg p-6 bg-gray-50">
              <h2 className="text-lg font-bold mb-4 text-gray-700 uppercase">
                {(notesSection as NotesSection).heading}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed">
                <ReactMarkdown components={MarkdownComponents}>
                  {(notesSection as NotesSection).content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    // Fallback for any parsing errors
    console.error('Error parsing markdown content:', error);
    return (
      <div className="markdown-content">
        <ReactMarkdown components={MarkdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }
};

// Define proper types for animations
type TransitionDirection = number;

interface AnimationVariant {
  opacity: number;
  x: number;
  transition?: {
    x?: {
      type: string;
      stiffness: number;
      damping: number;
    };
    opacity?: {
      duration: number;
    };
  };
}

// Main CaseStudy component
export default function CaseStudy({ 
  study, 
  nextStudy, 
  prevStudy 
}: CaseStudyPageProps): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Set up router event listeners with proper types
    const handleStart = (url: string): void => {
      // Only set loading to true if we're navigating to a different page
      if (url !== router.asPath) {
        setIsLoading(true);
      }
    };

    const handleComplete = (): void => {
      setIsLoading(false);
    };

    const handleError = (): void => {
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
  }, [router.events, router.asPath]); // Add router.asPath to dependency array
  
  // Page transition variants with proper typing
  const pageVariants: {
    initial: (direction: TransitionDirection) => AnimationVariant;
    animate: AnimationVariant;
    exit: (direction: TransitionDirection) => AnimationVariant;
  } = {
    initial: (direction: TransitionDirection) => ({
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
    exit: (direction: TransitionDirection) => ({
      opacity: 0,
      x: direction > 0 ? -1000 : 1000,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Navigation handler with direction - properly typed
  const handleNavigation = useCallback(async (path: string, direction: number): Promise<void> => {
    await router.push({
      pathname: path,
      query: { direction }
    }, path);
  }, [router]);

  // Parse direction query parameter with safer type handling
  const direction = typeof router.query.direction === 'string' 
    ? parseInt(router.query.direction, 10) || 0 // Handle NaN case
    : 0;

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

  // Extract first image path with proper null checking
  const getFirstImage = (): string => {
    if (!study.content) return '/assets/images/og-image.png';
    const imgMatch = study.content.match(/!\[.*?\]\((.*?)\)/);
    return imgMatch && imgMatch[1] ? imgMatch[1] : '/assets/images/og-image.png';
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
        variants={pageVariants as unknown as Variants}
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

interface ServerSideProps extends ParsedUrlQuery {
  slug: string;
}

export const getServerSideProps: GetServerSideProps<CaseStudyPageProps, ServerSideProps> = async ({ 
  params, 
  res 
}) => {
  // Validate the slug parameter with proper type checking
  if (!params?.slug) {
    console.warn('No slug provided in getServerSideProps');
    return {
      notFound: true,
    };
  }

  const { slug } = params;
  
  // Set caching headers for performance optimization
  if (res) {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );
  }

  try {
    // Get case study
    const study = await getCaseStudyBySlug(slug);
    
    if (!study) {
      console.warn(`Case study not found for slug: ${slug}`);
      return {
        notFound: true,
      };
    }
    
    // Get adjacent case studies
    const { nextStudy, prevStudy } = await getAdjacentCaseStudies(slug);

    // Return the props with a timestamp for debugging
    return {
      props: {
        study,
        nextStudy,
        prevStudy,
        lastGenerated: new Date().toISOString(),
      },
    };
  } catch (error) {
    // Log the error with more context for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`Error loading case study [${slug}]:`, {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    // Return 404 to avoid exposing error details to the user
    return {
      notFound: true,
    };
  }
};