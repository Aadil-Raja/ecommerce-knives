import { createContext, useContext, useState, useRef } from 'react';

const HomePageContext = createContext();

export function HomePageProvider({ children }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [cachedProducts, setCachedProducts] = useState({}); // Store products by ID
  const [cachedCategories, setCachedCategories] = useState({}); // Store category data by slug+page
  const [isCached, setIsCached] = useState(false);
  const scrollPositions = useRef({}); // Store scroll positions by route

  const cacheFeaturedProducts = (products) => {
    setFeaturedProducts(products);
    setIsCached(true);
  };

  const cacheBanners = (bannersData) => {
    setBanners(bannersData);
  };

  const cacheProduct = (productId, productData) => {
    setCachedProducts(prev => ({
      ...prev,
      [productId]: productData
    }));
  };

  const getCachedProduct = (productId) => {
    return cachedProducts[productId];
  };

  const cacheCategory = (categorySlug, page, data) => {
    const key = `${categorySlug}_page_${page}`;
    setCachedCategories(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const getCachedCategory = (categorySlug, page) => {
    const key = `${categorySlug}_page_${page}`;
    return cachedCategories[key];
  };

  const saveScrollPosition = (route, position) => {
    scrollPositions.current[route] = position;
  };

  const getScrollPosition = (route) => {
    return scrollPositions.current[route] || 0;
  };

  const clearCache = () => {
    setFeaturedProducts([]);
    setBanners([]);
    setCachedProducts({});
    setCachedCategories({});
    setIsCached(false);
    scrollPositions.current = {};
  };

  return (
    <HomePageContext.Provider
      value={{
        featuredProducts,
        banners,
        isCached,
        cacheFeaturedProducts,
        cacheBanners,
        cacheProduct,
        getCachedProduct,
        cacheCategory,
        getCachedCategory,
        saveScrollPosition,
        getScrollPosition,
        clearCache,
      }}
    >
      {children}
    </HomePageContext.Provider>
  );
}

export function useHomePage() {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error('useHomePage must be used within HomePageProvider');
  }
  return context;
}
