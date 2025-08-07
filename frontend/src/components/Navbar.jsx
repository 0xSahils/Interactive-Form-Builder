import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, Home, BarChart3 } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-secondary-900">
                Form Builder
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-primary-100 text-primary-700"
                  : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/builder"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith("/builder")
                  ? "bg-primary-100 text-primary-700"
                  : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Create Form</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
