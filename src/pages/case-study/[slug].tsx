import { motion } from 'motion/react';
import Link from 'next/link';
import { GetStaticProps, GetStaticPaths } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Footer from '../components/footer';
import { ArrowLeft, HomeIcon, MoveLeft, MoveRight, Asterisk } from 'lucide-react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import React, { useState, useCallback, useEffect, useRef, memo } from 'react';

// Base component for common props
interface BaseProps {
  node?: any; // Replace with the actual type if known
  [key: string]: any; // Allow additional props
}

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
    <div className="flex flex-col lg:flex-row gap-8 mt-8">
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

// Base styled component
const StyledComponent = memo(({ className, children, ...props }: { className: string; children: React.ReactNode }) => (
  <div className={className} {...props}>
      {children}
  </div>
));

// Enhanced image component with adaptive sizing based on image dimensions
const MarkdownImage = memo(({ node, src, alt, ...props }: { node: any; src: string; alt?: string; }) => {
  // Preprocess the URL immediately to avoid even attempting bad requests
  const processImageSrc = (sourcePath: string): string => {
    // Check if the image is remote (starts with http:// or https://)
    const isRemoteImage = sourcePath.startsWith('http://') || sourcePath.startsWith('https://');
    
    if (isRemoteImage) {
      return sourcePath;
    }
    
    // Process local path
    let processedPath = sourcePath;
    
    // Remove 'public/' from the beginning as Next.js serves from public as root
    processedPath = processedPath.replace(/^\/public\//, '/').replace(/^public\//, '/');
    
    // Ensure the path starts with a slash
    if (!processedPath.startsWith('/')) {
      processedPath = '/' + processedPath;
    }
    
    // Remove any trailing slashes that would cause 400 errors
    processedPath = processedPath.replace(/\/+$/, '');
    
    // Check for test-image.png or other patterns that indicate placeholder content
    const isTestImage = /test-image\.(png|jpg|jpeg|svg)/i.test(processedPath);
    
    return processedPath;
  };

  // Process the source immediately 
  const initialSrc = processImageSrc(src);
  const [imageSrc, setImageSrc] = useState<string>(initialSrc);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle image load errors
  const handleImageError = () => {
    console.error('Image loading error for path:', imageSrc);
    setImageError(true);
  //  setImageSrc('/api/placeholder/800/450');
  };

  // Track when image successfully loads
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <figure className="w-full lg:my-12 rounded-lg border border-gray-200 bg-[url(/assets/images/universal/gradient-bg.png)] p-4 md:p-6">      
      {/* Image container */}
      <div className="relative z-10">
        {imageError ? (
          // Display a placeholder with error message when the image fails to load
          <div className="bg-white rounded-md px-8 py-16 shadow-lg text-center min-h-[200px] flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500">
              <div className="mb-2 font-medium">Image not available</div>
              <div className="text-xs opacity-75">Original path: {src}</div>
            </div>
          </div>
        ) : (
          // Image with natural proportions
          <div className="relative shadow-lg overflow-hidden rounded-md">
            {/* Using a regular img element with next/image's unoptimized prop isn't ideal for responsive images */}
            <img 
              src={imageSrc}
              alt={alt || 'Case study image'}
              className="w-full h-auto rounded-md transition-all duration-300"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </figure>
  );
});

MarkdownImage.displayName = 'MarkdownImage';

// Memoized Markdown components for better performance
const MarkdownComponents = {
  img: MarkdownImage,
  
  h1: memo<React.HTMLAttributes<HTMLHeadingElement>>((props) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 leading-relaxed bg-gradient-to-r from-blue-900 to-white bg-clip-text text-transparent" {...props} />
  )),

  h3: memo<React.HTMLAttributes<HTMLHeadingElement>>((props) => (
    <h3 className="text-xl font-bold mt-6 mb-3 leading-relaxed bg-gradient-to-r from-blue-900 to-white bg-clip-text text-transparent" {...props} />
  )),

  p: memo((props: BaseProps) => (
    <div className="text-gray-600 text-md leading-relaxed mb-4" {...props} />
  )),


  ul: memo((props: BaseProps) => (
    <ul className="my-8 space-y-4 list-none" {...props} />
  )),
  
  li: memo((props: BaseProps) => {
    const text = typeof props.children === 'string' 
      ? props.children 
      : JSON.stringify(props.children);
    
    return (
      <motion.li 
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-100px" }}
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
  
  ol: memo((props: BaseProps) => (
    <ol className="list-decimal list-inside my-4 leading-relaxed" {...props} />
  )),

  a: memo(React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>((props, ref) => (
    <a ref={ref} className="text-blue-600 underline cursor-pointer hover:text-blue-800" {...props} />
  ))),

  code: memo(({ inline, ...props }: BaseProps & { inline?: boolean }) => (
    inline ? 
      <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} /> :
      <code className="block bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto" {...props} />
  )),

  blockquote: memo(React.forwardRef<HTMLQuoteElement, React.BlockquoteHTMLAttributes<HTMLQuoteElement>>((props, ref) => (
    <blockquote ref={ref} className="bg-gray-100 border-l-4 border-gray-300 p-4 my-4 text-xl italic" {...props} />
  ))),

  table: memo((props: BaseProps) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full border-separate border-spacing-0" {...props} />
    </div>
  )),
  
  th: memo((props: BaseProps) => (
    <th className="p-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
  )),
  
  td: memo((props: BaseProps) => (
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

interface CaseStudyProps {
  study: CaseStudy;
  nextStudy: CaseStudy | null;
  prevStudy: CaseStudy | null;
}

export default function CaseStudy({ study, nextStudy, prevStudy }: CaseStudyProps) {
  const router = useRouter();
  
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

  const direction = parseInt(router.query.direction as string) || 0;

  return (
    <>
      <motion.div
        key={router.asPath}
        custom={direction}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen bg-white"
      >
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
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
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
            <div className="mb-8 pb-4">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 uppercase">{study.title}</h1>
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
                  className="group flex items-left gap-3 text-gray-600 hover:text-gray-900 transition-colors"
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
                  className="group flex items-left gap-3 text-gray-600 hover:text-gray-900 transition-colors"
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

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join('content/case-studies'));
  
  const paths = files.map(filename => ({
    params: {
      slug: filename.replace('.md', ''),
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };
  
  // Get all case studies
  const files = fs.readdirSync(path.join('content/case-studies'));
  const caseStudies = files.map(filename => {
    const currentSlug = filename.replace('.md', '');
    const markdownWithMeta = fs.readFileSync(
      path.join('content/case-studies', filename),
      'utf-8'
    );
    
    const { data, content } = matter(markdownWithMeta);
    
    return {
      slug: currentSlug,
      ...data,
      content,
    };
  });

  // Find current, next and previous studies
  const currentIndex = caseStudies.findIndex(s => s.slug === slug);
  const study = caseStudies[currentIndex];
  
  // Only set next/prev if they exist
  const nextStudy = currentIndex < caseStudies.length - 1 ? caseStudies[currentIndex + 1] : null;
  const prevStudy = currentIndex > 0 ? caseStudies[currentIndex - 1] : null;

  if (!study) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      study,
      nextStudy,
      prevStudy,
    },
  };
};

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

const extractTextContent = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractTextContent).join('');
  if (React.isValidElement(children)) return extractTextContent(children.props.children);
  return '';
};