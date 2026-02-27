import { useState, useEffect } from 'react';

interface UseScrollPosition {
  scrollY: number;
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;
}

export function useScrollPosition(): UseScrollPosition {
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setScrollY(currentScrollY);
      setIsScrollingUp(currentScrollY < lastScrollY && currentScrollY > 0);
      setIsScrollingDown(currentScrollY > lastScrollY);
      setIsAtTop(currentScrollY === 0);
      setIsAtBottom(currentScrollY + windowHeight >= documentHeight - 1);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return {
    scrollY,
    isScrollingUp,
    isScrollingDown,
    isAtTop,
    isAtBottom,
  };
}

interface UseIntersectionObserver {
  isIntersecting: boolean;
  hasIntersected: boolean;
}

export function useIntersectionObserver(
  elementRef: React.RefObject<Element | null>,
  options?: IntersectionObserverInit
): UseIntersectionObserver {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
}

interface UseLocalStorage {
  value: string | null;
  setValue: (value: string) => void;
  removeValue: () => void;
}

export function useLocalStorage(key: string): UseLocalStorage {
  const [value, setValueState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      setValueState(item);
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
  }, [key]);

  const setValue = (newValue: string) => {
    try {
      window.localStorage.setItem(key, newValue);
      setValueState(newValue);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setValueState(null);
    } catch (error) {
      console.error('Error removing localStorage:', error);
    }
  };

  return { value, setValue, removeValue };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}