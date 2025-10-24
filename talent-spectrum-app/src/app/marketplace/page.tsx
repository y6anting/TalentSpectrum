'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Package, Heart, User, Star } from 'lucide-react';

// --- Replicating components based on your provided files ---
// Assuming these components exist in your project at '@/app/components'
// You might need to adjust paths or create these if they don't exist.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'default', children, className, ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variantStyles = {
    primary: 'bg-[#635bff] text-white hover:bg-[#5748e5]',
    outline: 'border border-[#e8e6f0] bg-white hover:bg-gray-100 hover:text-[#3a4043]',
    ghost: 'hover:bg-gray-100 hover:text-[#3a4043]',
  };
  const sizeStyles = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={`rounded-xl border border-[#e8e6f0] bg-white shadow-md ${className}`} {...props}>
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}
const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight text-[#3a4043] ${className}`} {...props}>
    {children}
  </h3>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  children: React.ReactNode;
  className?: string;
}
const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className, ...props }) => {
  const baseStyle = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  const variantStyles = {
    default: 'border-transparent bg-gray-100 text-gray-800',
    success: 'border-transparent bg-emerald-100 text-emerald-800',
    warning: 'border-transparent bg-yellow-100 text-yellow-800',
    danger: 'border-transparent bg-red-100 text-red-800',
    info: 'border-transparent bg-blue-100 text-blue-800',
    purple: 'border-transparent bg-purple-100 text-purple-800',
  };
  return (
    <div className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// --- Main Landing Page Component ---

const EcommerceLandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
      id: 'p1',
      name: 'Hand-knitted Scarf',
      creator: 'Sarah M.',
      price: 45.00,
      category: 'Handcrafts',
      imageUrl: 'ecomm/scarf.jfif', // Placeholder image
      description: 'Cozy and unique hand-knitted scarf, perfect for any season.',
    },
    {
      id: 'p2',
      name: 'Gluten-Free Chocolate Chip Cookies',
      creator: 'David L.',
      price: 12.50,
      category: 'Baked Goods',
      imageUrl: 'ecomm/gf_cookies.jfif', // Placeholder image
      description: 'Delicious, melt-in-your-mouth gluten-free chocolate chip cookies.',
    },
    {
      id: 'p3',
      name: 'Abstract Canvas Painting',
      creator: 'Emily R.',
      price: 120.00,
      category: 'Art & Design',
      imageUrl: 'ecomm/painting.jfif', // Placeholder image
      description: 'Vibrant abstract painting, a unique piece for your home or office.',
    },
    {
      id: 'p4',
      name: 'Custom Engraved Wooden Coasters',
      creator: 'Michael B.',
      price: 25.00,
      category: 'Handcrafts',
      imageUrl: 'ecomm/coasters.jfif', // Placeholder image
      description: 'Personalized wooden coasters, perfect for gifts or home decor.',
    },
    {
      id: 'p5',
      name: 'Vegan Lemon Drizzle Cake',
      creator: 'Sophia K.',
      price: 35.00,
      category: 'Baked Goods',
      imageUrl: 'ecomm/lemon_cake.jfif', // Placeholder image
      description: 'Tangy and sweet vegan lemon drizzle cake, a delightful treat.',
    },
    {
      id: 'p6',
      name: 'Handmade Polymer Clay Earrings',
      creator: 'Olivia P.',
      price: 18.00,
      category: 'Jewelry',
      imageUrl: 'ecomm/earrings.jfif', // Placeholder image
      description: 'Lightweight and stylish polymer clay earrings, unique designs.',
    },
    {
      id: 'p7',
      name: 'Artisan Fidget Ring',
      creator: 'Alicia C.',
      price: 98.00,
      category: 'Jewelry',
      imageUrl: 'ecomm/ring.jfif', // Placeholder image
      description: 'Lightweight and stylish polymer clay earrings, unique designs.',
    },
    {
      id: 'p8',
      name: 'Low-Scent Candles',
      creator: 'Brayan K.',
      price: 28.00,
      category: 'Home Decor',
      imageUrl: 'ecomm/candle.jfif', // Placeholder image
      description: 'Lightweight and stylish polymer clay earrings, unique designs.',
    },        
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat py-8 px-4 font-['Plus_Jakarta_Sans',_sans-serif]"
      style={{ backgroundImage: "url('/marketplace-bg.jpg')", backgroundAttachment: "fixed" }}> {/* Placeholder background image */}

      <div className="max-w-[1400px] mx-auto text-left">
        {/* Condensed Hero Section */}
        <div className="py-12 md:py-16 text-center"> {/* Reduced padding */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3"> {/* Reduced font size */}
            <span className="bg-[linear-gradient(115deg,#1a1a1a,#635bff,#9a96ff)] text-transparent bg-clip-text">
              NeuroMarketplace:
            </span>{' '}
            <span className="text-[#2e2f34]">Where Creativity Thrives.</span>
          </h1>
          <p className="text-base md:text-lg text-[#3a4043]/80 font-medium leading-relaxed max-w-2xl mx-auto mb-6"> {/* Reduced font size and max-width */}
            Discover unique products by neurodivergent creators. Every purchase supports talent and independence.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-6"> {/* Reduced max-width and margin-bottom */}
            <input
              type="text"
              placeholder="Search products, creators, categories..."
              className="w-full px-5 py-3 pr-10 text-base border border-[#e8e6f0] rounded-xl bg-white/90 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-[#635bff] focus:border-transparent" // Reduced padding and font size
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:bg-transparent">
              <Search className="h-5 w-5" /> {/* Reduced icon size */}
            </Button>
          </div>

          {/* Popular Categories/Tags */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto"> {/* Reduced gap and max-width */}
            {['Baked Goods', 'Handcrafts', 'Art & Design', 'Jewelry', 'Home Decor', 'Gifts'].map((tag) => (
              <motion.div
                key={tag}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.1 }}
              >
                <Button
                  variant="outline"
                  className="px-3 py-1.5 rounded-full text-xs text-[#635bff] border-[#635bff]/50 bg-white/60 backdrop-blur-sm hover:bg-[#635bff] hover:text-white" // Reduced padding and font size
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Featured Products Section - Now higher on the page */}
        <section className="py-8"> {/* Reduced padding-top */}
          <h2 className="text-3xl md:text-4xl text-[#635bff] font-bold text-center mb-8">Top Selling Products</h2> {/* Reduced font size and margin-bottom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm h-full flex flex-col">
                  <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge variant="purple" className="absolute top-3 left-3">
                      {product.category}
                    </Badge>
                  </div>
                  <CardContent className="flex-grow p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#3a4043] mb-1 text-center">{product.name}</h3>
                      <p className="text-sm text-gray-600 text-center">by {product.creator}</p>
                      <p className="text-md font-bold text-[#635bff] mt-2 text-center">RM {product.price.toFixed(2)}</p>
                    </div>
                    <div className="mt-4 text-center">
                      <Button variant="primary" className="w-full">
                        <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-600 text-lg mt-8">No products found matching your search.</p>
          )}
        </section>

        {/* Call to Action: Become a Seller */}
        <section className="py-12 text-center"> {/* Reduced padding */}
          <Card className="bg-white/80 backdrop-blur-sm p-8 max-w-2xl mx-auto"> {/* Reduced padding and max-width */}
            <h2 className="text-2xl font-bold text-[#3a4043] mb-3">Are You a Neurodivergent Creator?</h2> {/* Reduced font size */}
            <p className="text-base text-gray-700 mb-5"> {/* Reduced font size */}
              Join our community and showcase your unique talents to a supportive audience. It's free to get started!
            </p>
            <Link href="/dashboard/ecommerce/signup" passHref>
              <Button variant="primary" size="lg" className="rounded-full">
                <Star className="h-5 w-5 mr-2" /> Become a Seller Today!
              </Button>
            </Link>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default EcommerceLandingPage;