// src/pages/api/robots.txt.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set the appropriate content type
  res.setHeader('Content-Type', 'text/plain');
  
  // Define the robots.txt content
  const robotsTxt = `# robots.txt file for byleonardlim.com
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://byleonardlim.com/sitemap.xml`;

  // Return the robots.txt content
  res.status(200).send(robotsTxt);
}