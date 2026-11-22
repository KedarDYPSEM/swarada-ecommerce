import React from 'react';
import AppRoutes from './routes';
import ScrollToTop from './components/common/ScrollToTop';

export function App() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}

export default App;
