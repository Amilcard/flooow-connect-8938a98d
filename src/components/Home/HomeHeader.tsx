/**
 * LOT 4 - HomeHeader Component
 * Sticky header with logo, search button, and login/user section
 * Refactored with Tailwind CSS for consistency
 */

import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeaderLogo } from '@/components/common/HeaderLogo';
import { Button } from '@/components/ui/button';

export function HomeHeader() {
  const navigate = useNavigate();

  // TODO: Replace with actual auth state
  const isLoggedIn = false;
  const userInitials = 'JD';

  const handleSearchClick = () => {
    navigate('/recherche');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center px-4 py-3 md:px-6">
        {/* Logo Section */}
        <HeaderLogo />

        {/* Search Button */}
        <button
          onClick={handleSearchClick}
          className="flex-1 max-w-[400px] mx-4 flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-[10px] cursor-pointer transition-all duration-200 hover:border-[#FF8C42] hover:bg-white"
        >
          <Search size={20} className="text-gray-400" />
          <span className="hidden min-[480px]:inline font-poppins text-[15px] font-normal text-gray-400">
            Rechercher une activité...
          </span>
        </button>

        {/* User Section */}
        {isLoggedIn ? (
          <button className="w-10 h-10 bg-blue-50 text-[#4A90E2] rounded-full flex items-center justify-center cursor-pointer font-poppins text-base font-semibold transition-colors hover:bg-blue-100">
            {userInitials}
          </button>
        ) : (
          <Button
            onClick={handleLoginClick}
            className="px-4 py-2 bg-[#FF8C42] hover:bg-[#FF7A28] text-white rounded-lg font-poppins text-sm font-semibold border-0"
          >
            Se connecter
          </Button>
        )}
      </div>
    </header>
  );
}
