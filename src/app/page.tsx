"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { useSession, signIn, signOut } from "next-auth/react";
import {  FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { 
  FiUploadCloud, 
  FiShield, 
  FiZap, 
  FiUsers, 
  FiDownload, 
  FiLock,
  FiStar,
  FiArrowRight,
  FiCheck,
  FiGlobe,
  FiSmartphone,
  FiDatabase,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend
} from "react-icons/fi";
import { 
  AiOutlineCloudUpload,
  AiOutlineStar 
} from "react-icons/ai";
import { FaSignInAlt } from "react-icons/fa";

export default function HomePage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Handle text input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://nexbytes-backend.vercel.app/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-key": process.env.NEXT_PUBLIC_CONTACT_API_KEY || "", 
        },
        body: JSON.stringify({
          ...formData,
          site: "Fleek Files",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });

      Swal.fire({
        title: 'Message Sent!',
        text: "Thank you for your message! We'll get back to you soon.",
        icon: 'success',
        confirmButtonText: 'Great!',
        confirmButtonColor: '#10b981',
        background: '#ffffff',
        color: '#374151',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Beautiful error alert
      Swal.fire({
        title: 'Oops!',
        text: 'Sorry, there was an error submitting your message. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#ef4444',
        background: '#ffffff',
        color: '#374151',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <FiUploadCloud className="w-8 h-8" />,
      title: "Secure Cloud Storage",
      description: "Upload and store your files with enterprise-grade security and FTP backend reliability."
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Data Protection",
      description: "Your files are protected with advanced encryption and secure access controls."
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Experience blazing-fast file uploads and downloads with our optimized infrastructure."
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Easy Sharing",
      description: "Share files with colleagues and friends using secure, customizable sharing links."
    }
  ];

  const stats = [
    { number: "10K+", label: "Files Stored" },
    { number: "500+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  const techStack = [
    { name: "Next.js", description: "React framework for production" },
    { name: "TypeScript", description: "Type-safe development" },
    { name: "MongoDB", description: "Modern database solution" },
    { name: "FTP", description: "Reliable file storage backend" }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
   
      
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-white via-slate-50 to-slate-100 backdrop-blur-md shadow-xl shadow-slate-200/50 border-b border-slate-200/60 px-8 py-5 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    {/* Logo Section */}
    <div className="flex items-center space-x-4 group">
      <div className="relative flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full opacity-20 blur-md group-hover:opacity-30 transition-opacity duration-300"></div>
        <Image 
          src="/logo.png" 
          alt="FleekFiles Logo" 
          width={44} 
          height={44} 
          className="relative z-10 drop-shadow-md"
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent hover:from-teal-500 hover:via-cyan-500 hover:to-blue-500 transition-all duration-500">
          FleekFiles
        </h1>
        <div className="h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500 ease-out"></div>
      </div>
    </div>

    {/* Navigation */}
    <nav className="hidden md:flex items-center space-x-1">
      {/* Navigation Links */}
      <div className="flex items-center space-x-1 mr-6">
        <Link 
          href="#features" 
          className="relative px-4 py-2 text-slate-700 font-medium rounded-lg hover:text-teal-600 hover:bg-white/60 transition-all duration-300 group"
        >
          <span className="relative z-10">Features</span>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        <Link 
          href="#about" 
          className="relative px-4 py-2 text-slate-700 font-medium rounded-lg hover:text-teal-600 hover:bg-white/60 transition-all duration-300 group"
        >
          <span className="relative z-10">About</span>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        <Link 
          href="#tech" 
          className="relative px-4 py-2 text-slate-700 font-medium rounded-lg hover:text-teal-600 hover:bg-white/60 transition-all duration-300 group"
        >
          <span className="relative z-10">Technology</span>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        <Link 
          href="#contact" 
          className="relative px-4 py-2 text-slate-700 font-medium rounded-lg hover:text-teal-600 hover:bg-white/60 transition-all duration-300 group"
        >
          <span className="relative z-10">Contact</span>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* Auth Section */}
      <div className="flex items-center">
        {session ? (
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm">
              <div className="relative">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-teal-500/20 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <FaUserCircle className="text-white text-sm" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <span className="text-slate-800 font-semibold text-sm truncate max-w-24">
                {session.user?.name}
              </span>
            </div>

            {/* Logout Button */}
            <button 
              onClick={() => signOut()} 
              className="group flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium text-white 
              bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25
              hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/30 
              hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white"
            >
              <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link 
            href='/auth/register' 
            className="group flex items-center gap-2.5 px-6 py-2.5 text-sm font-medium text-white 
            bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl shadow-lg shadow-teal-500/25
            hover:from-teal-600 hover:to-blue-700 hover:shadow-xl hover:shadow-teal-500/30 
            hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-white"
          >
            <FaSignInAlt className="group-hover:translate-x-0.5 transition-transform duration-300" />
            <span>Get Started</span>
          </Link>
        )}
      </div>
    </nav>
  </div>
</header>


      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 rounded-full text-sm font-medium mb-8">
              <AiOutlineStar className="w-4 h-4 mr-2" />
              New: Enhanced file sharing capabilities
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-teal-700 to-blue-800 bg-clip-text text-transparent">
              Store and Share Your Files with
              <span className="block mt-2">Ultimate Ease</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              FleekFiles is your secure, FTP-backed file storage solution with a modern interface and MongoDB-powered metadata. 
              Built for learning, engineered for production.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/files">
                <button className="group bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:via-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center">
                   Free Try
                  <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="text-gray-600  px-8 py-4 border border-gray-300 rounded-xl hover:border-teal-400 hover:text-teal-600 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage, store, and share your files securely and efficiently.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-teal-200">
                <div className="text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">About FleekFiles</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                FleekFiles is a comprehensive file storage solution that bridges modern web technologies 
                with reliable FTP infrastructure. Our platform serves as both a learning project and a 
                production-ready application.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiCheck className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Modern React/Next.js architecture</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">TypeScript for type safety</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">MongoDB for flexible data modeling</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">FTP integration for reliable storage</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 rounded-2xl p-8 relative overflow-hidden">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <FiGlobe className="w-8 h-8 text-teal-600 mb-2" />
                    <div className="text-sm font-medium">Global Access</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <FiSmartphone className="w-8 h-8 text-cyan-600 mb-2" />
                    <div className="text-sm font-medium">Mobile Ready</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <FiLock className="w-8 h-8 text-blue-600 mb-2" />
                    <div className="text-sm font-medium">Secure Storage</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <FiDatabase className="w-8 h-8 text-teal-500 mb-2" />
                    <div className="text-sm font-medium">Smart Metadata</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="tech" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Built with Modern Technology</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leveraging the best tools and frameworks for optimal performance and developer experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{tech.name}</h4>
                <p className="text-gray-600 text-sm">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about FleekFiles? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h4>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                      <FiMail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">hello@fleekfiles.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                      <FiPhone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                      <FiMapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Office</p>
                      <p className="text-gray-600">123 Tech Street, San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-8 rounded-2xl">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Why Choose FleekFiles?</h5>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <FiCheck className="w-5 h-5 text-teal-600 mr-3" />
                    24/7 Customer Support
                  </li>
                  <li className="flex items-center">
                    <FiCheck className="w-5 h-5 text-teal-600 mr-3" />
                    99.9% Uptime Guarantee
                  </li>
                  <li className="flex items-center">
                    <FiCheck className="w-5 h-5 text-teal-600 mr-3" />
                    Enterprise-Grade Security
                  </li>
                  <li className="flex items-center">
                    <FiCheck className="w-5 h-5 text-teal-600 mr-3" />
                    Scalable Storage Solutions
                  </li>
                </ul>
              </div>
            </div>
            
                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:via-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Send Message
                      <FiSend className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-teal-100 mb-10 leading-relaxed">
            Join thousands of users who trust FleekFiles for their file storage needs. 
            Start your journey today with our free tier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/files">
              <button className="bg-white text-teal-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-lg">
                Start Free Trial
              </button>
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-teal-600 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
              <div className=" flex items-center justify-center">
              <Image src="/logo.png" alt="FleekFiles Logo" width={40} height={40}  />
            </div>
                <h4 className="text-xl font-bold">FleekFiles</h4>
              </div>
              <p className="text-gray-400 mb-4">
                Modern file storage solution built for developers and businesses. 
                Secure, fast, and reliable.
              </p>
              <div className="text-sm text-gray-500">
                Next.js • MongoDB • FTP • TypeScript
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} FleekFiles. Built for learning and file mastery.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}