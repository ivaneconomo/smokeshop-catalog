import { Routes, Route } from 'react-router-dom';
import CatalogByCategory from './pages/CatalogByCategory';
import CreateProduct from './pages/CreateProduct';
import SortProducts from './pages/SortProducts';
import EditProduct from './pages/EditProduct';
import Navbar from './components/Navbar';
import SelectStore from './pages/SelectStore';
import { Footer } from './components/Footer';

export default function App() {
  // max-w-3xl centra el contenido en pantallas anchas; relative permite posicionar Footer/modals
  return (
    <main className='max-w-3xl mx-auto px-4 relative'>
      <Navbar />
      <Routes>
        <Route path='/' element={<SelectStore />} />
        <Route path='/products/new' element={<CreateProduct />} />
        <Route path='/products/sort' element={<SortProducts />} />
        <Route path='/products/:id/edit' element={<EditProduct />} />
        <Route path='/categories' element={<CatalogByCategory />} />
      </Routes>
      <Footer />
    </main>
  );
}
