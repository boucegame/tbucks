import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Package, LogOut, Settings } from 'lucide-react';
import { User } from '../types';
import { auth } from '../firebase';

interface NavbarProps {
  user: User | null;
  showAdmin?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, showAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
              <Store className="h-6 w-6" />
              <span>T-Bucks Store</span>
            </Link>
            {user && (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Store className="h-5 w-5" />
                  <span>Store</span>
                </Link>
                <Link 
                  to="/orders" 
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Package className="h-5 w-5" />
                  <span>Orders</span>
                </Link>
                {showAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="bg-blue-100 px-4 py-2 rounded-full">
                  <span className="text-blue-800 font-medium">{user.tBucks} T-Bucks</span>
                </div>
                <span className="text-gray-600">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;