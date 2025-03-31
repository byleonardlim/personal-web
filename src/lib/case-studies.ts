import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CaseStudy } from '@/types/case-study';

// Cache for case studies
// This helps reduce file system reads between requests
let caseStudiesCache: Record<string, CaseStudy> = {};
let allCaseStudiesCache: CaseStudy[] | null = null;
let cacheTimestamp = 0;

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Check if the cache is still valid
 */
const isCacheValid = (): boolean => {
  return Date.now() - cacheTimestamp < CACHE_TTL;
};

/**
 * Get all case studies with optional cache
 */
export const getAllCaseStudies = async (useCache = true): Promise<CaseStudy[]> => {
  // Return from cache if valid
  if (useCache && allCaseStudiesCache && isCacheValid()) {
    return allCaseStudiesCache;
  }
  
  try {
    const files = fs.readdirSync(path.join(process.cwd(), 'content/case-studies'));
    
    const caseStudies = files.map(filename => {
      const slug = filename.replace('.md', '');
      const markdownWithMeta = fs.readFileSync(
        path.join(process.cwd(), 'content/case-studies', filename),
        'utf-8'
      );
      
      const { data, content } = matter(markdownWithMeta);
      
      return {
        slug,
        ...(data as Omit<CaseStudy, 'slug' | 'content'>),
        content,
      };
    });

    // Update cache
    allCaseStudiesCache = caseStudies;
    caseStudiesCache = caseStudies.reduce((acc, study) => {
      acc[study.slug] = study;
      return acc;
    }, {} as Record<string, CaseStudy>);
    cacheTimestamp = Date.now();
    
    return caseStudies;
  } catch (error) {
    console.error('Error getting all case studies:', error);
    return [];
  }
};

/**
 * Get a single case study by slug
 */
export const getCaseStudyBySlug = async (
  slug: string, 
  useCache = true
): Promise<CaseStudy | null> => {
  // Return from cache if valid
  if (useCache && caseStudiesCache[slug] && isCacheValid()) {
    return caseStudiesCache[slug];
  }
  
  try {
    const filePath = path.join(process.cwd(), 'content/case-studies', `${slug}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(markdownWithMeta);
    
    const study: CaseStudy = {
      slug,
      ...(data as Omit<CaseStudy, 'slug' | 'content'>),
      content,
    };
    
    // Update cache
    caseStudiesCache[slug] = study;
    cacheTimestamp = Date.now();
    
    return study;
  } catch (error) {
    console.error(`Error getting case study [${slug}]:`, error);
    return null;
  }
};

/**
 * Get next and previous case studies
 */
export const getAdjacentCaseStudies = async (
  currentSlug: string
): Promise<{ nextStudy: CaseStudy | null; prevStudy: CaseStudy | null }> => {
  const allStudies = await getAllCaseStudies();
  const currentIndex = allStudies.findIndex(study => study.slug === currentSlug);
  
  if (currentIndex === -1) {
    return { nextStudy: null, prevStudy: null };
  }
  
  const nextStudy = currentIndex < allStudies.length - 1 ? allStudies[currentIndex + 1] : null;
  const prevStudy = currentIndex > 0 ? allStudies[currentIndex - 1] : null;
  
  return { nextStudy, prevStudy };
};

/**
 * Invalidate the case studies cache
 * Useful for webhooks that trigger when content is updated
 */
export const invalidateCaseStudiesCache = (): void => {
  allCaseStudiesCache = null;
  caseStudiesCache = {};
  cacheTimestamp = 0;
};