/* eslint-disable react/display-name */
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import SEO from '@/components/SEO';
import { OptimizedImage } from '@/components/OptimizedImage';
import { ArrowLeft, MoveLeft, MoveRight, Asterisk } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { CaseStudyPageProps } from '@/types/case-study';
import { getCaseStudyBySlug, getAdjacentCaseStudies } from '@/lib/case-studies';
import { ParsedUrlQuery } from 'querystring';
import gsap from 'gsap';

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

// List item as a proper React component
const AnimatedListItem: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const liRef = useRef<HTMLLIElement>(null);
  
  useEffect(() => {
    if (liRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              liRef.current,
              { opacity: 0, x: -200 },
              { 
                opacity: 1, 
                x: 0, 
                duration: 0.4,
                ease: "power2.out"
              }
            );
            observer.disconnect();
          }
        });
      }, { rootMargin: "-100px" });
      
      observer.observe(liRef.current);
      
      return () => {
        observer.disconnect();
      };
    }
  }, []);
  
  return (
    <li 
      ref={liRef}
      className="group border border-stone-300 "
      style={{ opacity: 0, transform: 'translatex(-200px)' }}
    >
      <div className="p-6 lg:p-8 transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Asterisk className="w-4 h-4" />
          </div>
          <span className="text-sm leading-relaxed">
            {children}
          </span>
        </div>
      </div>
    </li>
  );
};

// Enhanced image component with adaptive sizing based on image dimensions
const MarkdownImage = memo(({ src, alt }: MarkdownImageProps) => {
  return (
    <figure className="w-full lg:my-12 rounded-xs bg-[url(/assets/images/universal/gradient-bg.png)] bg-cover p-8 md:p-16">      
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
    <h3 className="text-xl font-bold mt-6 mb-3 leading-relaxed">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <div className="leading-relaxed mb-4">
      {children}
    </div>
  ),

  ul: ({ children }) => (
    <ul className="my-8 space-y-4 list-none">
      {children}
    </ul>
  ),
  
  li: ({ children }) => <AnimatedListItem>{children}</AnimatedListItem>,
  
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
    <blockquote className="border-l-4 border-l-stone-900 px-8 my-16 text-lg font-bold">
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
                  <section key={`section-${section.index}`} className="mb-16">
                    <h2 className="text-lg font-bold">
                      {section.heading}
                    </h2>
                    <div className="text-md leading-8">
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
            <div className="mb-16">
              <ReactMarkdown components={MarkdownComponents}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Notes column (sticky) */}
        {notesSection && (
          <div className="lg:w-1/3 lg:my-12 order-first lg:order-last">
            <div className="sticky p-6 lg:top-8 border border-stone-300 rounded-xs">
              <h2 className="text-lg font-bold mb-4">
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

// Main CaseStudy component
export default function CaseStudy({ 
  study, 
  nextStudy, 
  prevStudy 
}: CaseStudyPageProps): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const backLinkRef = useRef<HTMLDivElement>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const direction = typeof router.query.direction === 'string' 
    ? parseInt(router.query.direction, 10) || 0 // Handle NaN case
    : 0;
  
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
  
  // Page transition animations
  useEffect(() => {
    if (pageContentRef.current) {
      // Initial position based on direction
      gsap.set(pageContentRef.current, {
        opacity: 0,
        x: direction > 0 ? 1000 : -1000
      });
      
      // Animate in
      gsap.to(pageContentRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Ensure opacity is set to 1 after animation completes
          if (pageContentRef.current) {
            gsap.set(pageContentRef.current, { opacity: 1 });
          }
        }
      });
    }

    return () => {
      // Store ref in variable to avoid the warning
      const currentRef = pageContentRef.current;
      if (currentRef) {
        // Cleanup animation
        gsap.killTweensOf(currentRef);
      }
    };
  }, [direction, router.asPath]);
  
  // Animate other elements
  useEffect(() => {
    if (backLinkRef.current) {
      gsap.fromTo(
        backLinkRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, delay: 0.2 }
      );
    }
    
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      );
    }
  }, []);

  // FIX: Navigation handler with direction to ensure proper opacity management
  const handleNavigation = useCallback(async (path: string, dir: number): Promise<void> => {
    if (pageContentRef.current) {
      // Store ref in variable
      const currentRef = pageContentRef.current;
      // Animate out before navigation
      gsap.to(currentRef, {
        opacity: 0,
        x: dir > 0 ? -1000 : 1000,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          router.push({
            pathname: path,
            query: { direction: dir }
          }, path);
        }
      });
    } else {
      router.push({
        pathname: path,
        query: { direction: dir }
      }, path);
    }
  }, [router]);

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

      <div
        ref={pageContentRef}
        className="min-h-screen"
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8 my-8">
          {/* Back to Main */}
          <div
            ref={backLinkRef}
            className="px-4 py-2 mb-8 w-fit border border-stone-300 block uppercase text-xs font-bold"
          >
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors group"
            >
              <div
                className="flex items-center"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { x: -4, duration: 0.2 });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { x: 0, duration: 0.2 });
                }}
              >
                <ArrowLeft className="w-4 h-4 group-hover: transition-colors group" />
              </div>
                Return
            </Link>
          </div>

          <div
            ref={mainContentRef}
          >
            <div className="pb-4">
              <h1 className="text-2xl lg:text-4xl font-bold">{study.title}</h1>
            </div>
            <div className="text-lg">
              <SectionedMarkdown content={study.content} />
            </div>
          </div>

          <div className="mt-16 flex justify-between">
            <div>
              {prevStudy && (
                <button
                  onClick={() => handleNavigation(`/case-study/${prevStudy.slug}`, -1)}
                  className="group flex items-left gap-3 px-4 py-2 mb-8 w-fit border border-stone-300 block uppercase text-xs font-bold hover:text-gray-600 transition-colors group cursor-pointer"
                >
                  <div 
                    className="flex items-left gap-2"
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, { x: -4, duration: 0.2 });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, { x: 0, duration: 0.2 });
                    }}
                  >
                    <MoveLeft className="w-6 h-6" />
                  </div>
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
                  className="group flex items-left gap-3 px-4 py-2 mb-8 w-fit border border-stone-300 block uppercase text-xs font-bold hover:text-gray-600 transition-colors group cursor-pointer"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-gray-400">Next</span>
                    <span className="truncate">{nextStudy.title}</span>
                  </div>
                  <div 
                    className="flex items-center gap-2"
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, { x: 4, duration: 0.2 });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, { x: 0, duration: 0.2 });
                    }}
                  >
                    <MoveRight className="w-6 h-6" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
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