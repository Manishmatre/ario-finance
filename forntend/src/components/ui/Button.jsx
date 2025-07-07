export default function Button({ children, variant = "primary", size = "md", ...props }) {
  const base = "rounded font-medium transition focus:outline-none";
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700",
  };
  
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
} 