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
    <section className="py-16 sm:py-20 bg-[#641B32] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A05A_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-[#C5A05A] text-xs font-semibold tracking-widest uppercase">
          Exclusive Privileges
        </span>

        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#FFF9F0]">
          Subscribe for Early Festive Access & Secret Sales
        </h2>

        <p className="text-xs sm:text-sm text-neutral-200 max-w-xl mx-auto leading-relaxed">
          Be the first to explore limited-edition Yeola Paithani weaves, bridal arrivals, and receive exclusive festive discount coupons.
        </p>

        {subscribed ? (
          <div className="p-4 bg-white/10 border border-[#C5A05A] rounded-sm max-w-md mx-auto flex items-center justify-center space-x-2 text-[#FFF9F0]">
            <CheckCircle className="w-5 h-5 text-[#C5A05A]" />
            <span className="text-xs font-medium">
              Thank you for subscribing! Your 10% coupon code is <strong>FIRST10</strong>.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
          >
            <div className="relative flex-1">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="bg-white text-[#292323] pl-10 border-none h-12"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-4" />
            </div>

            <Button
              type="submit"
              variant="gold"
              className="h-12 text-[#292323] font-semibold whitespace-nowrap shadow-md"
            >
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
