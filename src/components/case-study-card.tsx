import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';

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
    const cardRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
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

    // Animation for card appearance
    useEffect(() => {
        gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 20 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "power2.out" 
            }
        );
    }, [index]);

    // Animation for expanded content
    useEffect(() => {
        if (!contentRef.current) return;

        if (isExpanded) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, height: 0 },
                { 
                    opacity: 1, 
                    height: "auto", 
                    duration: 0.3,
                    ease: "power1.out" 
                }
            );
        } else {
            gsap.to(
                contentRef.current,
                { 
                    opacity: 0, 
                    height: 0, 
                    duration: 0.3,
                    ease: "power1.in" 
                }
            );
        }
    }, [isExpanded]);

    const cardClassName = useMemo(() => {
        return `p-4 lg:p-8 border border-current cursor-pointer transition-all duration-300 ${
            isExpanded ? ' border-none bg-gradient-to-r from-purple-100 via-blue-70 to-pink-50 drop-shadow-2xl' : ''
        }`;
    }, [isExpanded]);

    return (
        <div
            ref={cardRef}
            className="w-full"
        >
            <div
                className={cardClassName}
                onMouseEnter={handleHover}
                onMouseLeave={handleHover}
                onClick={handleTap}
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
                    <div
                        ref={contentRef}
                        className="overflow-hidden"
                        style={{ 
                            height: 0, 
                            opacity: 0 
                        }}
                    >
                        {isExpanded && (
                            <p className="mt-6 mb-8 text-md text-gray-700">{study.description}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CaseStudyCard);