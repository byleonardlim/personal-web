import { NextApiRequest, NextApiResponse } from 'next';
import { getCaseStudyBySlug } from '@/lib/case-studies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Get slug from request
  const { slug } = req.query;
  
  if (!slug || Array.isArray(slug)) {
    return res.status(400).json({ message: 'Invalid slug parameter' });
  }
  
  try {
    // Get case study
    const study = await getCaseStudyBySlug(slug);
    
    if (!study) {
      return res.status(404).json({ message: 'Case study not found' });
    }
    
    // Set cache headers
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );
    
    return res.status(200).json(study);
  } catch (error) {
    console.error(`Error fetching case study [${slug}]:`, error);
    return res.status(500).json({ message: 'Error fetching case study' });
  }
}