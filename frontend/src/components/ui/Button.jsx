export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const base = "inline-flex items-center justify-center rounded font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
    xl: "px-5 py-3 text-lg"
  };
  
  const variants = {
    primary: {
      base: "bg-blue-600 text-white hover:bg-blue-700",
      focus: "focus:ring-blue-500",
      disabled: "bg-blue-500/50 text-white/50"
    },
    secondary: {
      base: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      focus: "focus:ring-gray-400",
      disabled: "bg-gray-200 text-gray-400"
    },
    success: {
      base: "bg-green-600 text-white hover:bg-green-700",
      focus: "focus:ring-green-500",
      disabled: "bg-green-500/50 text-white/50"
    },
    warning: {
      base: "bg-yellow-500 text-gray-900 hover:bg-yellow-600",
      focus: "focus:ring-yellow-500",
      disabled: "bg-yellow-500/50 text-gray-900/50"
    },
    danger: {
      base: "bg-red-600 text-white hover:bg-red-700",
      focus: "focus:ring-red-500",
      disabled: "bg-red-500/50 text-white/50"
    },
    outline: {
      base: "border-2 border-gray-300 text-gray-700 hover:bg-gray-100",
      focus: "focus:ring-gray-400",
      disabled: "border-gray-200 text-gray-400"
    },
    ghost: {
      base: "bg-transparent text-gray-700 hover:bg-gray-100",
      focus: "focus:ring-gray-400",
      disabled: "text-gray-400"
    }
  };
  
  const variantStyles = variants[variant];
  const baseStyles = `${base} ${sizes[size]} ${variantStyles.base} ${className}`;
  const focusStyles = disabled ? '' : variantStyles.focus;
  const loadingStyles = loading ? 'opacity-75 cursor-not-allowed' : '';
  const disabledStyles = disabled ? variantStyles.disabled : '';

  return (
    <button
      className={`${baseStyles} ${focusStyles} ${loadingStyles} ${disabledStyles}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </span>
      )}
    </button>
  );
}