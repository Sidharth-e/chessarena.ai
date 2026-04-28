import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'info';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    info: "bg-indigo-600 hover:bg-indigo-700 text-white"
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
