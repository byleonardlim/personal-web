export interface CaseStudy {
    title: string;
    description?: string;
    content: string;
    slug: string;
    coverImage?: string;
    date?: string;
    author?: string;
    tags?: string[];
    // Add any other properties from your frontmatter
  }
  
  export interface CaseStudyPageProps {
    study: CaseStudy;
    nextStudy: CaseStudy | null;
    prevStudy: CaseStudy | null;
    lastGenerated: string; // For debugging and cache validation
  }