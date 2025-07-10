import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-16 px-4 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">About Ceylon Taste Lanka</h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-indigo-100 font-medium">
          Ceylon Taste Lanka is your go-to platform for discovering and ordering delicious food from your favorite local restaurants. Fast delivery, great service, and a world of flavors—right at your doorstep.
        </p>
      </div>

      {/* Mission Section */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-indigo-800 mb-3">Our Mission</h2>
        <p className="text-gray-700 text-lg mb-6">
          At Ceylon Taste Lanka, our mission is to connect people with the best local restaurants, making it easy and enjoyable to order food online. We believe in supporting local businesses and delivering happiness—one meal at a time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-indigo-50 rounded-xl p-6 shadow text-center">
            <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full p-3 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </span>
            <h3 className="font-bold text-lg mb-2">Local Love</h3>
            <p className="text-gray-600">We partner with local restaurants to bring you authentic flavors and support your community.</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6 shadow text-center">
            <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full p-3 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1a2 2 0 00-2 2v4a2 2 0 002 2h1a2 2 0 002-2v-4a2 2 0 00-2-2z" /></svg>
            </span>
            <h3 className="font-bold text-lg mb-2">Fast & Reliable</h3>
            <p className="text-gray-600">Enjoy quick delivery and real-time order tracking for a seamless experience every time.</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6 shadow text-center">
            <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full p-3 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8" /></svg>
            </span>
            <h3 className="font-bold text-lg mb-2">Customer First</h3>
            <p className="text-gray-600">Our support team is here for you 24/7, ensuring your satisfaction with every order.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-12 px-4">
        <h2 className="text-2xl font-bold text-indigo-800 mb-6 text-center">How It Works</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-indigo-100 text-indigo-700 rounded-full p-4 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" /></svg>
            </div>
            <h4 className="font-semibold text-lg mb-1">1. Browse</h4>
            <p className="text-gray-600 text-center">Explore top-rated restaurants and discover new favorites.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-indigo-100 text-indigo-700 rounded-full p-4 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8" /></svg>
            </div>
            <h4 className="font-semibold text-lg mb-1">2. Order</h4>
            <p className="text-gray-600 text-center">Choose your meal, customize your order, and check out in seconds.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-indigo-100 text-indigo-700 rounded-full p-4 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
            </div>
            <h4 className="font-semibold text-lg mb-1">3. Enjoy</h4>
            <p className="text-gray-600 text-center">Sit back and relax while your food is delivered hot and fresh.</p>
          </div>
        </div>
      </div>

      {/* Values or Team Section (Optional) */}
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-3">Our Values</h2>
        <p className="text-gray-700 text-lg mb-6">
          We’re passionate about food, technology, and community. Ceylon Taste Lanka is built on trust, transparency, and a love for great meals shared with friends and family.
        </p>
      </div>
    </div>
  );
};

export default About; 