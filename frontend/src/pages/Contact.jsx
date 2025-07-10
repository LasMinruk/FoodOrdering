import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would normally send the form data to your backend or email service
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-16 px-4 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Contact Us</h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-indigo-100 font-medium">
          Have a question, feedback, or need help? Reach out to the Ceylon Taste Lanka team—we’re here for you!
        </p>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">Send Us a Message</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center font-semibold shadow">
              Thank you for contacting us! We’ll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-indigo-700 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-indigo-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-indigo-700 font-semibold mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact Details */}
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">Contact Details</h2>
          <div className="flex items-center mb-4">
            <span className="bg-indigo-100 text-indigo-700 rounded-full p-2 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" /></svg>
            </span>
            <span className="text-gray-700 text-lg">support@ceylontastelanka.com</span>
          </div>
          <div className="flex items-center mb-4">
            <span className="bg-indigo-100 text-indigo-700 rounded-full p-2 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2zm0 0V5a2 2 0 012-2h14a2 2 0 012 2v2" /></svg>
            </span>
            <span className="text-gray-700 text-lg">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center">
            <span className="bg-indigo-100 text-indigo-700 rounded-full p-2 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /></svg>
            </span>
            <span className="text-gray-700 text-lg">123 Main St, City, Country</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 