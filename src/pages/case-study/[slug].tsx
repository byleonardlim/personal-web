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
        <div className="lg:w-1/3 order-first lg:order-last">
          <div className="sticky top-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
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

// Simple image component without lightbox functionality
const MarkdownImage = memo(({ node, src, alt, ...props }: { node: any; src: string; alt?: string; }) => {
  // Clean and normalize image URLs
  const normalizeImageUrl = useCallback((url: string) => {
    if (!url) return '';
    
    // Remove any existing _next/image processing
    const cleanUrl = url.replace(/\/_next\/image\?url=/, '');
    
    // Ensure URL is properly decoded
    try {
      return decodeURIComponent(cleanUrl);
    } catch {
      return cleanUrl;
    }
  }, []);

  if (!src) return null;

  const normalizedSrc = normalizeImageUrl(src);

  return (
    <figure className="w-full aspect-[16/9] sm:aspect-[3/2] md:aspect-[16/9] relative my-8 rounded-md border border-gray-300">
      <Image 
        src={normalizedSrc}
        alt={alt || 'Case study image'}
        fill
        priority
        quality={90}
        className="rounded-lg object-contain transition-all duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
      />
    </figure>
  );
});

MarkdownImage.displayName = 'MarkdownImage';

// Memoized Markdown components for better performance
const MarkdownComponents = {
  img: MarkdownImage,
  
  h1: memo<React.HTMLAttributes<HTMLHeadingElement>>((props) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 leading-relaxed" {...props} />
  )),

  h3: memo<React.HTMLAttributes<HTMLHeadingElement>>((props) => (
    <h3 className="text-xl font-bold mt-6 mb-3 leading-relaxed" {...props} />
  )),

  p: memo((props: BaseProps) => (
    <div className="my-4 text-gray-700 leading-relaxed" {...props} />
  )),


  ul: memo((props: BaseProps) => (
    <ul className="my-8 space-y-4 list-none" {...props} />
  )),
  
  li: memo((props: BaseProps) => {
    const text = typeof props.children === 'string' 
      ? props.children 
      : JSON.stringify(props.children);
    const hashCode = text.split('').reduce((h, c) => (h + c.charCodeAt(0)) % 5, 0);
    
    return (
      <motion.li 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: 0.4, 
          delay: hashCode * 0.1,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
        className="group"
      >
        <motion.div
          className="p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-300"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <Asterisk className="w-6 h-6 text-black" />
            </div>
            <span className="text-gray-700">
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
    <blockquote ref={ref} className="bg-slate-50 border-l-4 border-gray-300 p-4 my-4 text-md font-bold" {...props} />
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
        <div className="max-w-6xl mx-auto px-8 py-20">
          {/* Back to Home Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <motion.div
                whileHover={{ x: -4 }}
                className="flex items-center"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 pb-4">
              <h1 className="text-4xl font-bold text-gray-900 uppercase">{study.title}</h1>
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