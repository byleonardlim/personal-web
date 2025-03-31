import { motion } from 'motion/react';

interface FooterProps {
  id?: string;
}

export default function Footer({ id }: FooterProps) {
  return (
    <motion.footer 
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t-1 border-gray-400 text-gray-900 py-12"
    >
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-xs text-center flex justify-center gap-6">
          <a href="mailto:me@byleonardlim.com" className="hover:text-gray-600 transition-colors">Send an Email</a>
          <a href="https://linkedin.com/in/byleonardlim" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">Connect on LinkedIn</a>
        </div>
      </div>
    </motion.footer>
  );
}