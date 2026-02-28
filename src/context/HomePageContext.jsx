import { createContext, useContext, useState, useRef } from 'react';

const HomePageContext = createContext();

export function HomePageProvider({ children }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [cachedProducts, setCachedProducts] = useState({}); // Store products by ID
  const [isCached, setIsCached] = useState(false);
  const scrollPositionRef = useRef(0);

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

  const saveScrollPosition = (position) => {
    scrollPositionRef.current = position;
  };

  const getScrollPosition = () => {
    return scrollPositionRef.current;
  };

  const clearCache = () => {
    setFeaturedProducts([]);
    setBanners([]);
    setCachedProducts({});
    setIsCached(false);
    scrollPositionRef.current = 0;
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
