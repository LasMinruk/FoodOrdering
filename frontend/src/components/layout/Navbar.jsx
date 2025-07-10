import { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ShoppingCartIcon,
  UserCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  
  // Base navigation items
  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Restaurants', href: '/restaurants', current: location.pathname.includes('/restaurants') },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
  ];

  // Navigation based on user role
  const getNavigation = () => {
    if (!currentUser) return navigation;
    
    switch (currentUser.role) {
      case 'admin':
        return [
          ...navigation,
          { 
            name: 'Dashboard', 
            href: '/admin/dashboard', 
            current: location.pathname === '/admin/dashboard',
            highlight: true
          },
          { 
            name: 'Orders', 
            href: '/admin/orders', 
            current: location.pathname === '/admin/orders' 
          },
          { 
            name: 'Users', 
            href: '/admin/users', 
            current: location.pathname === '/admin/users' 
          },
          { 
            name: 'Restaurant Management', 
            href: '/admin/restaurants', 
            current: location.pathname === '/admin/restaurants' 
          },
        ];
      case 'restaurant_admin':
        return [
          ...navigation,
          { 
            name: 'Restaurant Dashboard', 
            href: '/restaurant/dashboard', 
            current: location.pathname === '/restaurant/dashboard',
            highlight: true
          },
          { 
            name: 'Manage Menu', 
            href: '/restaurant/menu', 
            current: location.pathname === '/restaurant/menu' 
          },
          { 
            name: 'Manage Orders', 
            href: '/restaurant/orders', 
            current: location.pathname === '/restaurant/orders' 
          },
        ];
      case 'delivery_person':
        return [
          ...navigation,
          { 
            name: 'My Deliveries', 
            href: '/deliveries', 
            current: location.pathname === '/deliveries',
            highlight: true
          },
          { 
            name: 'Earnings', 
            href: '/deliveries/earnings', 
            current: location.pathname === '/deliveries/earnings' 
          },
        ];
      default:
        return navigation;
    }
  };

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-xl border-b-2 border-indigo-700 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <motion.div 
                  className="flex flex-shrink-0 items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link to="/" className="flex items-center">
                    <span className="text-white font-bold text-2xl tracking-tight drop-shadow">
                      🍛 Ceylon Taste Lanka
                    </span>
                  </Link>
                </motion.div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-3">
                    {getNavigation().map((item) => (
                      <motion.div 
                        key={item.name} 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to={item.href}
                          className={classNames(
                            item.current 
                              ? 'bg-indigo-700 text-white' 
                              : 'text-white hover:bg-indigo-700 hover:text-white',
                            item.highlight && !item.current
                              ? 'border border-white'
                              : '',
                            'rounded-md px-3 py-2 text-sm font-medium transition-all duration-200'
                          )}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-3">
                {/* Favorites button - show for regular users */}
                {currentUser && !['admin', 'restaurant_admin', 'delivery_person'].includes(currentUser.role) && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link 
                      to="/favorites" 
                      className="relative rounded-full p-2 text-white hover:bg-white/10 transition-colors"
                      title="Favorites"
                    >
                      <HeartIcon className="h-6 w-6" aria-hidden="true" />
                    </Link>
                  </motion.div>
                )}
              
                {/* Cart button - don't show for admins */}
                {(!currentUser || !['admin', 'restaurant_admin'].includes(currentUser?.role)) && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={itemCount > 0 ? "animate-pulse" : ""}
                  >
                    <Link 
                      to="/cart" 
                      className="relative rounded-full p-2 text-white hover:bg-white/10 transition-colors"
                      title="Shopping Cart"
                    >
                      <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                      {itemCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-yellow-500 rounded-full">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                )}

                {/* Profile dropdown */}
                {currentUser ? (
                  <Menu as="div" className="relative ml-1">
                    <div>
                      <Menu.Button className="flex rounded-full bg-red-500 ring-2 ring-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 hover:bg-red-700 transition-all duration-200">
                        <span className="sr-only">Open user menu</span>
                        {currentUser.image ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={currentUser.image}
                            alt={currentUser.name}
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 text-white p-1" />
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="border-b border-gray-200 pb-2">
                          <Menu.Item>
                            {() => (
                              <span className="block px-4 py-2 text-sm text-gray-500 truncate">
                                Signed in as 
                                <p className="font-semibold text-gray-900">{currentUser.name}</p>
                              </span>
                            )}
                          </Menu.Item>
                        </div>
                        
                        {/* Role-specific menu items */}
                        {currentUser.role === 'admin' && (
                          <div className="py-1 border-b border-gray-200">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/admin/dashboard"
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  Admin Dashboard
                                </Link>
                              )}
                            </Menu.Item>
                          </div>
                        )}
                        
                        {currentUser.role === 'restaurant_admin' && (
                          <div className="py-1 border-b border-gray-200">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/restaurant/dashboard"
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  Restaurant Dashboard
                                </Link>
                              )}
                            </Menu.Item>
                          </div>
                        )}
                        
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/orders"
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Your Orders
                              </Link>
                            )}
                          </Menu.Item>
                          
                          {!['admin', 'restaurant_admin'].includes(currentUser.role) && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/favorites"
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  Favorite Restaurants
                                </Link>
                              )}
                            </Menu.Item>
                          )}
                        </div>
                        
                        <div className="py-1 border-t border-gray-200">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-red-600 font-medium'
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-2">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/login"
                        className="text-white hover:bg-red-700 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/register"
                        className="bg-white text-red-600 hover:bg-gray-100 rounded-md px-3 py-2 text-sm font-medium shadow-md transition-all duration-200"
                      >
                        Register
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 bg-red-600">
              {getNavigation().map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current ? 'bg-red-800 text-white' : 'text-white hover:bg-red-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              
              {/* Mobile-specific additional links */}
              {!currentUser && (
                <div className="border-t border-red-500 pt-2 mt-2 flex space-x-2">
                  <Link
                    to="/login"
                    className="bg-red-700 text-white hover:bg-red-800 rounded-md px-3 py-2 text-base font-medium w-1/2 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-red-600 hover:bg-gray-100 rounded-md px-3 py-2 text-base font-medium w-1/2 text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}