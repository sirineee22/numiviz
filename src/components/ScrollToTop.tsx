import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Automatically resets the scroll position to the top of the window
 * whenever the route pathname changes in React Router.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If the navigation specifies an anchor hash (e.g. /#faq), handle it gracefully
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Default: Reset scroll position to the very top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, hash]);

  return null;
}
