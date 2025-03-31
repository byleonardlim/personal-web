import { NextApiRequest, NextApiResponse } from 'next';
import { getAllCaseStudies } from '@/lib/case-studies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Get all case studies
    const caseStudies = await getAllCaseStudies();
    
    // Remove content field to reduce payload size
    const studies = caseStudies.map(({ content, ...study }) => study);
    
    // Set cache headers
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );
    
    return res.status(200).json(studies);
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return res.status(500).json({ message: 'Error fetching case studies' });
  }
}