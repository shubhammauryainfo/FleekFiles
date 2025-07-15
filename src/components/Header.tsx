import React from "react";
import { FiCloud, FiFolder, FiZap } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

interface HeaderProps {
  title: string;
  size?: "small" | "medium" | "large";
  className?: string;
  theme?: "default" | "tech" | "dark" | "minimal" | "fleek";
  animated?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  size = "large", 
  className = "",
  theme = "fleek",
  animated = true,
}) => {
  const sizeClasses = {
    small: "px-4 py-3",
    medium: "px-6 py-4", 
    large: "px-8 py-6"
  };

  const titleSizes = {
    small: "text-xl md:text-2xl",
    medium: "text-2xl md:text-3xl",
    large: "text-3xl md:text-4xl lg:text-5xl"
  };

  const iconSizes = {
    small: "w-6 h-6 md:w-8 md:h-8",
    medium: "w-8 h-8 md:w-10 md:h-10",
    large: "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
  };

  const themes = {
    default: "bg-gradient-to-br from-amber-400 to-orange-500",
    tech: "bg-gradient-to-br from-amber-300 to-yellow-500", 
    dark: "bg-gradient-to-br from-gray-800 to-black",
    minimal: "bg-white text-gray-900 border border-gray-200",
    fleek: "bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500"
  };

  const textColors = {
    default: "text-white",
    tech: "text-white", 
    dark: "text-white",
    minimal: "text-gray-900",
    fleek: "text-white"
  };

  return (
    <header 
      className={`
        relative overflow-hidden
        rounded-2xl shadow-2xl
        ${themes[theme] || themes.fleek}
        ${sizeClasses[size]}
        ${animated ? 'transform hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-3xl' : ''}
        ${className}
      `}
    >
      {/* Animated background elements */}
      {animated && (
        <>
          {/* FleekFiles-themed animated elements */}
          <div className="absolute inset-0">
            {/* Cloud-like floating elements */}
            <div className="absolute top-3 left-6 opacity-20">
              <FiCloud className="w-4 h-4 text-white animate-bounce" />
            </div>
            <div className="absolute top-4 right-8 opacity-15">
              <FiFolder className="w-3 h-3 text-white animate-pulse delay-500" />
            </div>
            <div className="absolute bottom-3 left-12 opacity-25">
              <HiSparkles className="w-5 h-5 text-white animate-ping delay-700" />
            </div>
            <div className="absolute bottom-4 right-6 opacity-20">
              <FiZap className="w-4 h-4 text-white animate-bounce delay-300" />
            </div>
            
            {/* Circuit-like animated lines with FleekFiles theme */}
            <div className="absolute top-2 left-4 w-16 h-0.5 bg-white/20 animate-pulse"></div>
            <div className="absolute top-2 right-4 w-12 h-0.5 bg-white/20 animate-pulse delay-300"></div>
            <div className="absolute bottom-2 left-8 w-20 h-0.5 bg-white/20 animate-pulse delay-700"></div>
            <div className="absolute bottom-2 right-8 w-14 h-0.5 bg-white/20 animate-pulse delay-500"></div>
            
            {/* Connection dots */}
            <div className="absolute top-2 left-4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 right-8 w-2 h-2 bg-white/30 rounded-full animate-ping delay-1000"></div>
            
            {/* Tech pattern overlay with teal accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-300/10 to-transparent animate-pulse"></div>
            
            {/* Floating particles */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping delay-200"></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping delay-800"></div>
              <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white/40 rounded-full animate-ping delay-1200"></div>
            </div>
          </div>
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex justify-center items-center text-center">
  
        
        <h1 className={`
          ${titleSizes[size]} 
          font-extrabold 
          tracking-tight 
          leading-tight
          ${textColors[theme] || textColors.fleek}
          drop-shadow-2xl
          text-shadow-lg
          ${animated ? 'hover:scale-105 transition-transform duration-200' : ''}
        `}>
          {title}
        </h1>
      </div>
      
      {/* Bottom glow effect with FleekFiles theme */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      
      {/* Side glow effects */}
      <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
      <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
    </header>
  );
};

export default Header;