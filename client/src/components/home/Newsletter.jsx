import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-br from-[#480C1E] via-[#641B32] to-[#2B0612] text-white relative overflow-hidden border-t border-[#D4AF37]/30">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 text-[#D4AF37] text-xs font-royal tracking-[0.25em] uppercase">
          <span>✦</span>
          <span>Swarada Privileged Circle</span>
          <span>✦</span>
        </div>

        <h2 className="text-3xl sm:text-4.5xl font-heading font-bold text-[#FFFDF9] tracking-tight">
          Join for Secret Handloom Drops & Festive Privileges
        </h2>

        <p className="text-xs sm:text-sm text-neutral-200/90 max-w-xl mx-auto leading-relaxed font-light">
          Be first to access limited-edition Yeola Paithani weaves, bridal heirloom arrivals, and receive private festive vouchers directly to your inbox.
        </p>

        {subscribed ? (
          <div className="p-4 bg-white/10 border border-[#D4AF37] rounded-2xl max-w-md mx-auto flex items-center justify-center space-x-2 text-[#FFFDF9] backdrop-blur-md shadow-lg">
            <CheckCircle className="w-5 h-5 text-[#F3E2B8]" />
            <span className="text-xs font-medium">
              Welcome to our privileged circle! Your 10% coupon code is <strong>FIRST10</strong>.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4"
          >
            <div className="relative flex-1">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="bg-white text-[#1E1719] pl-11 border-none h-13 rounded-full shadow-md text-xs sm:text-sm"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-4.5" />
            </div>

            <button
              type="submit"
              className="h-13 px-8 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E2B8] to-[#C5A05A] text-[#1E1719] font-bold text-xs tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-103 cursor-pointer whitespace-nowrap gold-shimmer-btn"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
