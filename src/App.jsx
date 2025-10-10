import { Routes, Route } from 'react-router-dom';
import ProductsCatalog from './pages/ProductsCatalog';
import Navbar from './components/Navbar';
import SelectStore from './pages/SelectStore';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <main className='mx-auto min-h-screen'>
      <Navbar />
      <Routes>
        <Route path='/' element={<SelectStore />} />
        <Route path='/products' element={<ProductsCatalog />} />
      </Routes>
      <Footer />
    </main>
  );
}
