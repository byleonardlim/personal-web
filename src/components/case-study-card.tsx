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
        return `border border-stone-200 cursor-pointer transition-all duration-300 ${
            isExpanded ? 'border-b-4 border-b-stone-900' : ''
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
                <div className="p-8 flex flex-col items-start">
                    <h2 className="max-w-2xl flex items-center text-xl lg:text-2xl font-bold ">
                        <Link 
                            href={`/case-study/${study.slug}`}
                            className="transition-colors">
                            {study.title}
                            <ArrowUpRight className="ml-4 inline-block w-6 h-6" />
                        </Link>
                    </h2>
                    <div
                        ref={contentRef}
                        className="overflow-hidden"
                        style={{ 
                            height: 0, 
                            opacity: 0 
                        }}
                    >
                        {isExpanded && (
                            <p className="mt-8">{study.description}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CaseStudyCard);