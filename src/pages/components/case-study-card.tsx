import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

interface CaseStudy {
    title: string;
    slug: string;
    description: string;
}

interface CaseStudyCardProps {
    study: CaseStudy;
    index: number;
    isExpanded: boolean;
    onExpand: () => void;
}

const MOBILE_BREAKPOINT = 768;

const CaseStudyCard: React.FC<CaseStudyCardProps> = ({ study, index, isExpanded, onExpand }) => {
    const handleTap = useCallback(() => {
        if (window.innerWidth < MOBILE_BREAKPOINT) {
            onExpand();
        }
    }, [onExpand]);

    const handleHover = useCallback(() => {
        if (window.innerWidth >= MOBILE_BREAKPOINT) {
            onExpand();
        }
    }, [onExpand]);

    const cardClassName = useMemo(() => {
        return `p-4 lg:p-8 bg-white/30 backdrop-blur-sm rounded-lg cursor-pointer transition-all duration-300 ${
            isExpanded ? 'bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 drop-shadow-2xl' : ''
        }`;
    }, [isExpanded]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="w-full"
        >
            <motion.div
                onHoverStart={handleHover}
                onHoverEnd={handleHover}
                onTap={handleTap}
                className={cardClassName}
            >
                <div className="flex flex-col items-start">
                    <div className="flex items-center">
                        <Link 
                            href={`/case-study/${study.slug}`}
                            className="text-lg lg:text-xl font-bold transition-colors">
                            {study.title}
                            <ArrowUpRight className="ml-4 inline-block w-6 h-6" />
                        </Link>
                    </div>
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <p className="mt-6 mb-8 text-md text-gray-700">{study.description}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default React.memo(CaseStudyCard);