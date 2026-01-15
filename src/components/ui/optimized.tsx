'use client';

import { useScrollPosition, useIntersectionObserver } from '@/hooks/use-optimization';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
}

export function ScrollToTop({ threshold = 300, className = '' }: ScrollToTopProps) {
  const { scrollY, isScrollingUp } = useScrollPosition();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(scrollY > threshold);
  }, [scrollY, threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="sm"
      className={`fixed bottom-8 right-8 z-40 rounded-full w-12 h-12 shadow-lg transition-all duration-300 ${
        isScrollingUp ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      <ArrowUp className="w-4 h-4" />
    </Button>
  );
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right';
  delay?: number;
}

export function AnimatedSection({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { hasIntersected } = useIntersectionObserver(sectionRef);

  useEffect(() => {
    if (hasIntersected) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [hasIntersected, delay]);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return 'opacity-0 translate-y-8';
        case 'fade-in':
          return 'opacity-0';
        case 'slide-left':
          return 'opacity-0 translate-x-8';
        case 'slide-right':
          return 'opacity-0 -translate-x-8';
        default:
          return 'opacity-0 translate-y-8';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0';
  };

  return (
    <section
      ref={sectionRef}
      className={`transition-all duration-700 ease-out ${getAnimationClass()} ${className}`}
    >
      {children}
    </section>
  );
}

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export function LazyImage({ src, alt, className = '', placeholder = '/placeholder.jpg' }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { hasIntersected } = useIntersectionObserver(imgRef);

  useEffect(() => {
    if (hasIntersected && !isLoaded) {
      setIsInView(true);
    }
  }, [hasIntersected, isLoaded]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        alt={alt}
        onLoad={handleLoad}
        className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-70'}`}
      />
    </div>
  );
}

interface OptimizedFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export function OptimizedForm({ children, onSubmit, className = '' }: OptimizedFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'button') {
          return React.cloneElement(child, {
            ...child.props,
            disabled: isSubmitting || child.props.disabled,
          });
        }
        return child;
      })}
    </form>
  );
}