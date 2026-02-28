import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Swasth AI. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-6">
            <span className="hover:text-healthcare-blue cursor-pointer">Privacy Policy</span>
            <span className="hover:text-healthcare-blue cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
