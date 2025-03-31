// This endpoint allows you to manually invalidate the case studies cache
// You can secure this endpoint with an API key in production
import { NextApiRequest, NextApiResponse } from 'next';
import { invalidateCaseStudiesCache } from '@/lib/case-studies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Check for API key (consider implementing this for production)
    // const { apiKey } = req.headers;
    // if (apiKey !== process.env.CACHE_INVALIDATION_KEY) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }
    
    // Invalidate cache
    invalidateCaseStudiesCache();
    
    return res.status(200).json({ message: 'Cache invalidated successfully' });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return res.status(500).json({ message: 'Error invalidating cache' });
  }
}