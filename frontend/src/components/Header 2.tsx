import React from 'react';
import { UserIcon } from 'lucide-react';

interface Breadcrumb {
  name: string;
  screen: string;
}

interface HeaderProps {
  breadcrumbs: Breadcrumb[];
  onNavigate: (screen: string) => void;
  loginButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ breadcrumbs, onNavigate, loginButton }) => {
  return (
    <header className="bg-blue-900 text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-6">GembaFix.ai</h1>
          <nav className="hidden md:block">
            <ol className="flex space-x-2">
              {breadcrumbs.map((item: Breadcrumb, index: number) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-blue-300">/</span>}
                  <button
                    onClick={() => onNavigate(item.screen)}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full bg-blue-800 hover:bg-blue-700">
            <UserIcon size={20} />
          </button>
          {loginButton}
        </div>
      </div>
      <nav className="md:hidden mt-2">
        <ol className="flex flex-wrap space-x-2">
          {breadcrumbs.map((item: Breadcrumb, index: number) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-1 text-blue-300">/</span>}
              <button
                onClick={() => onNavigate(item.screen)}
                className="hover:text-blue-300 transition-colors text-sm"
              >
                {item.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </header>
  );
};
