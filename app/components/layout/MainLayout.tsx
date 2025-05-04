import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, FileArchive, FileAudio, FileVideo, Coffee, Heart, IceCream } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  activeConversionType: string;
  onConversionTypeChange: (type: string) => void;
}

const conversionTypes = [
  { id: 'image', label: 'Image', icon: Image, color: 'from-indigo-500 to-purple-500' },
  { id: 'document', label: 'Document', icon: FileText, color: 'from-blue-500 to-cyan-500' },
  { id: 'archive', label: 'Archive', icon: FileArchive, color: 'from-amber-500 to-orange-500' },
  { id: 'audio', label: 'Audio', icon: FileAudio, color: 'from-green-500 to-emerald-500' },
  { id: 'video', label: 'Video', icon: FileVideo, color: 'from-red-500 to-rose-500' },
];

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeConversionType,
  onConversionTypeChange,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                File Converter Pro
              </h1>
            </div>
            <nav className="flex space-x-4">
              <button className="text-slate-600 hover:text-indigo-600">About</button>
              <button className="text-slate-600 hover:text-indigo-600">Help</button>
              <button className="text-slate-600 hover:text-indigo-600">Contact</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Conversion Type Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {conversionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.id}
                  onClick={() => onConversionTypeChange(type.id)}
                  className={`relative p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
                    activeConversionType === type.id
                      ? 'ring-2 ring-indigo-500'
                      : 'hover:ring-1 hover:ring-slate-200'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center mb-2`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{type.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Converter Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {children}
        </motion.div>
      </main>

      {/* Buy Us Ice Cream Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-pink-100 via-pink-200 to-sky-100 rounded-3xl p-8 shadow-lg overflow-hidden"
        >
          {/* Floating Ice Cream Icons */}
          <motion.div 
            className="absolute top-6 right-12"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          >
            <IceCream className="h-12 w-12 text-pink-400" />
          </motion.div>
          <motion.div 
            className="absolute bottom-6 right-24"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          >
            <IceCream className="h-10 w-10 text-blue-400" />
          </motion.div>
          <motion.div 
            className="absolute top-16 right-32"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          >
            <IceCream className="h-8 w-8 text-purple-400" />
          </motion.div>

          <div className="relative flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-md mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-600">
                  Enjoying our converter?
                </span>
              </h2>
              <p className="text-slate-700 mb-4">
                If our tool has saved you time and hassle, consider buying us an ice cream! Your support helps us continue developing free tools like this one.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-medium px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
                onClick={() => window.open('https://www.buymeacoffee.com/fileconverter', '_blank')}
              >
                <Heart className="h-5 w-5" />
                <span>Buy us an ice cream!</span>
              </motion.button>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <motion.div 
                  className="relative z-10"
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                >
                  <div className="bg-white p-4 rounded-2xl shadow-lg transform rotate-3">
                    <div className="flex items-center justify-center">
                      <IceCream className="h-16 w-16 text-pink-500" />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="block font-medium text-slate-800">$3</span>
                      <span className="text-xs text-slate-500">One scoop</span>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute -left-16 -bottom-2 z-0"
                  animate={{ rotate: [0, 5, -5, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                >
                  <div className="bg-white p-4 rounded-2xl shadow-lg transform -rotate-6">
                    <div className="flex items-center justify-center">
                      <IceCream className="h-16 w-16 text-blue-500" />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="block font-medium text-slate-800">$5</span>
                      <span className="text-xs text-slate-500">Double scoop</span>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute -right-16 -bottom-2 z-0"
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                >
                  <div className="bg-white p-4 rounded-2xl shadow-lg transform rotate-6">
                    <div className="flex items-center justify-center">
                      <IceCream className="h-16 w-16 text-indigo-500" />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="block font-medium text-slate-800">$10</span>
                      <span className="text-xs text-slate-500">Triple scoop!</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">About Us</h3>
              <p className="text-slate-600">
                File Converter Pro is your all-in-one solution for converting files between different formats.
                Fast, secure, and easy to use.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-600 hover:text-indigo-600">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-600 hover:text-indigo-600">Terms of Service</a></li>
                <li><a href="#" className="text-slate-600 hover:text-indigo-600">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact</h3>
              <p className="text-slate-600">
                Have questions? We're here to help!
                <br />
                <a href="mailto:support@fileconverterpro.com" className="text-indigo-600 hover:text-indigo-700">
                  support@fileconverterpro.com
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-slate-500">
            <p>© {new Date().getFullYear()} File Converter Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 