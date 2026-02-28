import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top if NOT navigating back to home or category pages
    // (let those components handle their own scroll restoration)
    const isHomePage = pathname === '/' || pathname === '/home';
    const isCategoryPage = pathname.startsWith('/category/');
    
    if (!isHomePage && !isCategoryPage) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;