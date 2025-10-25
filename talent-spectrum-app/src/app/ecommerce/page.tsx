'use client';

import React, { useState, useRef, useEffect } from 'react'; // Import React, useRef and useEffect
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home, Package, ShoppingCart, LineChart, Settings, MessageSquare,
  Plus, Edit, Eye, Trash2, DollarSign, Clock, CheckCircle, XCircle,
  BarChart3, Camera, User, MapPin
} from 'lucide-react';

// Import Recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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

// Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={`flex h-10 w-full rounded-lg border border-[#e8e6f0] bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-lg border border-[#e8e6f0] bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Select components (functional implementation)
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  onClick?: () => void; // Added onClick prop
}
const SelectItem: React.FC<SelectItemProps> = ({ value, children, onClick, ...props }) => (
  <div
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    onClick={onClick} // Use the onClick prop
    {...props}
  >
    {children}
  </div>
);

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}
const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className, ...props }) => (
  <button className={`flex h-10 w-full items-center justify-between rounded-lg border border-[#e8e6f0] bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
    {children}
    <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </button>
);

interface SelectValueProps {
  placeholder: string;
  children?: React.ReactNode; // Can display children or placeholder
}
const SelectValue: React.FC<SelectValueProps> = ({ placeholder, children }) => (
  <span>{children || placeholder}</span>
);

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
const SelectContent: React.FC<SelectContentProps> = ({ children, className, ...props }) => (
  <div className={`absolute z-50 mt-1 w-full rounded-lg border border-[#e8e6f0] bg-white shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ children, onValueChange, defaultValue, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(defaultValue || '');
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    setCurrentValue(value);
    onValueChange(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <SelectValue placeholder={placeholder || "Select an option"}>
          {currentValue}
        </SelectValue>
      </SelectTrigger>
      {isOpen && (
        <SelectContent>
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === SelectItem) {
              const typedChild = child as React.ReactElement<SelectItemProps>;
              return React.cloneElement(typedChild, {
                onClick: () => handleSelect(typedChild.props.value)
              });
            }
            return child;
          })}
        </SelectContent>
      )}
    </div>
  );
};


// --- Main Dashboard Component ---

const EcommerceDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChatPartner, setSelectedChatPartner] = useState<string | null>(null); // State for selected chat

  // Placeholder data
  const products = [
    { id: 'p1', name: 'Hand-knitted Scarf', category: 'Handcrafts', price: 45.00, stock: 10, status: 'Active', imageUrl: 'ecomm/scarf.jfif' },
    { id: 'p2', name: 'Gluten-Free Chocolate Chip Cookies', category: 'Baked Goods', price: 12.50, stock: 25, status: 'Active', imageUrl: 'ecomm/gf_cookies.jfif' },
    { id: 'p3', name: 'Abstract Canvas Painting', category: 'Art & Design', price: 120.00, stock: 1, status: 'Draft', imageUrl: 'ecomm/painting.jfif' },
  ];

  const orders = [
    { id: 'o1', customer: 'Alice Smith', date: '2023-10-26', total: 57.50, status: 'Processing', items: ['Hand-knitted Scarf', 'Gluten-Free Chocolate Chip Cookies'] },
    { id: 'o2', customer: 'Bob Johnson', date: '2023-10-25', total: 545.00, status: 'Shipped', items: ['Hand-knitted Scarf'] },
    { id: 'o3', customer: 'Charlie Brown', date: '2023-10-24', total: 12.50, status: 'Delivered', items: ['Gluten-Free Chocolate Chip Cookies'] },
  ];

  // Updated messages data with chatHistory
  const messages = [
    { id: 'm1', sender: 'Alice Smith', senderAvatar: 'ecomm/chat/alice_smith.png', lastMessage: 'Great! I\'ll place an order soon.', time: '10:30 AM', chatHistory: [
        { type: 'received', text: 'Hi, is the scarf still available?' },
        { type: 'sent', text: 'Yes, it is! I have 10 in stock.' },
        { type: 'received', text: 'Great! I\'ll place an order soon.' },
      ]
    },
    { id: 'm2', sender: 'Platform Support', senderAvatar: 'ecomm/chat/ts_logo.png', lastMessage: 'Awesome, thanks for the update!', time: 'Yesterday', chatHistory: [
        { type: 'received', text: 'Your new product listing for "Hand-knitted Scarf" is now live!' },
        { type: 'sent', text: 'Awesome, thanks for the update!' },
      ]
    },
    { id: 'm3', sender: 'Bob Johnson', senderAvatar: 'ecomm/chat/bob_johnson.png', lastMessage: 'You\'re very welcome, Bob! Enjoy!', time: '2 days ago', chatHistory: [
        { type: 'received', text: 'Received the scarf, it\'s beautiful! Thank you so much.' },
        { type: 'sent', text: 'You\'re very welcome, Bob! Enjoy!' },
      ]
    },
  ];

  // Sample data for the Monthly Sales Trend chart
  const monthlySalesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
    { month: 'Jul', sales: 7000 },
    { month: 'Aug', sales: 6500 },
    { month: 'Sep', sales: 8000 },
    { month: 'Oct', sales: 7500 },
    { month: 'Nov', sales: 9000 },
    { month: 'Dec', sales: 8500 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products Listed</CardTitle>
                    <Package className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#3a4043]">{products.length}</div>
                    <p className="text-xs text-gray-500">+3 new products this month</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#3a4043]">{orders.filter(o => o.status === 'Processing').length}</div>
                    <p className="text-xs text-gray-500">2 new orders today</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales (RM)</CardTitle>
                    <DollarSign className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#3a4043]">RM {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</div>
                    <p className="text-xs text-gray-500">+15% from last month</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link href="#" className="text-sm font-medium text-[#635bff] hover:underline">View All</Link>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-[#e8e6f0]">
                  {orders.slice(0, 3).map((order) => (
                    <motion.div
                      key={order.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className="flex items-center justify-between py-4"
                    >
                      <div>
                        <p className="font-semibold text-[#3a4043]">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                        <p className="text-xs text-gray-500">{order.items.join(', ')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          order.status === 'Processing' ? 'warning' :
                          order.status === 'Shipped' ? 'info' :
                          order.status === 'Delivered' ? 'success' : 'default'
                        }>
                          {order.status}
                        </Badge>
                        <span className="font-medium text-[#635bff]">RM {order.total.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {products.map((product) => (
                    <li key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                        <div>
                          <p className="font-medium text-[#3a4043]">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#635bff]">RM {product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case 'my-products':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#3a4043]">My Products</h1>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Product
              </Button>
            </div>
            <div className="space-y-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
                  transition={{ duration: 0.1 }}
                >
                  <Card className="flex items-center p-4">
                    <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-md object-cover mr-4" />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-[#3a4043]">{product.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="purple">{product.category}</Badge>
                        <Badge variant={product.status === 'Active' ? 'success' : 'default'}>{product.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">RM {product.price.toFixed(2)} | Stock: {product.stock}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="Delete">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">My Orders</h1>
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
                  transition={{ duration: 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[#3a4043]">Order #{order.id}</h3>
                      <Badge variant={
                        order.status === 'Processing' ? 'warning' :
                        order.status === 'Shipped' ? 'info' :
                        order.status === 'Delivered' ? 'success' : 'default'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                    <p className="text-sm text-gray-600">Date: {order.date}</p>
                    <p className="text-sm text-gray-600">Items: {order.items.join(', ')}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e8e6f0]">
                      <span className="font-bold text-[#635bff]">RM {order.total.toFixed(2)}</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Update Status</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'sales-analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">Sales & Analytics</h1>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#635bff]">RM {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-2">Overall earnings from your shop.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Items Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#3a4043]">{orders.reduce((sum, o) => sum + o.items.length, 0)}</p>
                  <p className="text-sm text-gray-500 mt-2">Total number of products sold.</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64"> {/* Increased height for better chart visibility */}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlySalesData}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e6f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        cursor={{ fill: 'rgba(99, 91, 255, 0.1)' }} // Light violet background for tooltip cursor
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e8e6f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#3a4043' }}
                        itemStyle={{ color: '#635bff' }}
                        formatter={(value: number) => `RM ${value.toFixed(2)}`}
                      />
                      <Legend />
                      <Bar dataKey="sales" fill="#635bff" name="Sales (RM)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'shop-settings':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">Shop Settings</h1>
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                  <Input id="shopName" defaultValue="Creative Minds Crafts" />
                </div>
                <div>
                  <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
                  <Textarea id="shopDescription" defaultValue="Handcrafted goods and delicious baked treats made with love and unique perspectives." />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <Input id="contactEmail" type="email" defaultValue="my.shop@example.com" />
                </div>
                <div>
                  <label htmlFor="shopLocation" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input id="shopLocation" defaultValue="Kuala Lumpur, Malaysia" />
                </div>
                <div>
                  <label htmlFor="shopLogo" className="block text-sm font-medium text-gray-700 mb-1">Shop Logo</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <Camera className="h-8 w-8" />
                    </div>
                    <Button variant="outline">Upload New Logo</Button>
                  </div>
                </div>
                <Button className="mt-4">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment & Payout Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                  <Input id="bankAccount" type="text" placeholder="e.g., 1234567890" />
                </div>
                <div>
                  <label htmlFor="payoutFrequency" className="block text-sm font-medium text-gray-700 mb-1">Payout Frequency</label>
                  <Select
                    onValueChange={(value) => console.log('Payout Frequency:', value)} // Placeholder for actual state update
                    defaultValue="monthly"
                    placeholder="Select frequency"
                  >
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </Select>
                </div>
                <Button className="mt-4">Update Settings</Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'messages':
        // Find the currently selected conversation's data
        const currentConversation = messages.find(msg => msg.sender === selectedChatPartner);

        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">Messages</h1>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Conversation List */}
              <Card className="md:col-span-1 p-0">
                <CardHeader className="pb-3">
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#e8e6f0]">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        // Add onClick to select conversation and highlight it
                        onClick={() => setSelectedChatPartner(msg.sender)}
                        className={`flex items-center space-x-3 p-4 cursor-pointer ${selectedChatPartner === msg.sender ? 'bg-violet-50' : ''}`}
                      >
                        <img src={msg.senderAvatar || '/avatar-placeholder.jpg'} alt={msg.sender} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-grow">
                          <p className="font-semibold text-[#3a4043]">{msg.sender}</p>
                          <p className="text-sm text-gray-600">{msg.lastMessage}</p>
                        </div>
                        <p className="text-xs text-gray-500">{msg.time}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="md:col-span-2 flex flex-col h-[500px]">
                <CardHeader className="pb-3 border-b border-[#e8e6f0]">
                  <CardTitle>Chat with {selectedChatPartner || '...'}</CardTitle> {/* Dynamic title */}
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-4">
                  {selectedChatPartner ? (
                    <div className="space-y-4">
                      {currentConversation?.chatHistory.map((chatMsg, index) => (
                        <div key={index} className={`flex ${chatMsg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-lg max-w-[70%] break-words ${chatMsg.type === 'sent' ? 'bg-[#635bff] text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {chatMsg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                      Select a conversation to start chatting.
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t border-[#e8e6f0] flex space-x-2">
                  <Input placeholder="Type your message....." className="flex-grow" disabled={!selectedChatPartner} />
                  <Button disabled={!selectedChatPartner}>Send</Button>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background py-8 px-4 font-['Plus_Jakarta_Sans',_sans-serif]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a4043]">NeuroMarketplace: My Shop Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your unique creations and connect with buyers.</p>
          </div>
          {/* <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button> */}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit sticky top-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  CM
                </div>
                <div>
                  <p className="font-semibold text-[#3a4043]">Creative Minds Crafts</p>
                  <p className="text-sm text-gray-600 flex items-center"><MapPin className="h-3 w-3 mr-1" /> Kuala Lumpur</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Shop Health</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-[#635bff] h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">75% Complete - Add more details!</p>
              </div>

              <nav className="space-y-2">
                {[
                  { name: 'Overview', icon: Home, tab: 'overview' },
                  { name: 'My Products', icon: Package, tab: 'my-products' },
                  { name: 'Orders', icon: ShoppingCart, tab: 'orders' },
                  { name: 'Sales & Analytics', icon: LineChart, tab: 'sales-analytics' },
                  { name: 'Shop Settings', icon: Settings, tab: 'shop-settings' },
                  { name: 'Messages', icon: MessageSquare, tab: 'messages' },
                ].map((item) => (
                  <motion.div
                    key={item.tab}
                    whileHover={{ x: 5 }}
                    className="relative"
                  >
                    <button
                      onClick={() => setActiveTab(item.tab)}
                      className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200
                        ${activeTab === item.tab
                          ? 'bg-[#635bff] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </motion.div>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceDashboardPage;