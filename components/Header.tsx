
import React from 'react';

const Header: React.FC = () => {
  const logoUrl = "https://asiacar.vn/upload/filemanager/files/logo-qt.png";

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
          />
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            QT Solutions - <span className="text-blue-600">Master SEO AI-<span className="text-red-600">PRO</span></span>
          </h1>
        </div>
        {/* Navigation menu removed as requested */}
      </div>
    </header>
  );
};

export default Header;
