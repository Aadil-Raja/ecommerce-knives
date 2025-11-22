import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ComingSoon from './pages/ComingSoon';
import Home from './pages/Home';
import About from './pages/About';
import Category from './pages/Category';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ComingSoon />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/category/:categoryName" element={<Category />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
