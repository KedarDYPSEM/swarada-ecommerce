import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-[#FFF9F0]">
      <div className="max-w-md w-full text-center space-y-6">
        <span className="text-[#C5A05A] text-xs font-semibold tracking-widest uppercase">
          Page Not Found
        </span>
        <h1 className="font-heading text-6xl font-bold text-[#641B32]">404</h1>
        <p className="text-sm text-[#594E4E]">
          The saree or collection page you are looking for has been moved or is no longer available.
        </p>
        <div>
          <Link to="/">
            <Button variant="primary">Return to Storefront</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
