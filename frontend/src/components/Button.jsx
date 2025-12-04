// src/base/Button.jsx
import React from "react";

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap";

  const variantClasses = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100",
    outline:
      "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white focus:ring-4 focus:ring-indigo-200",
    ghost:
      "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
