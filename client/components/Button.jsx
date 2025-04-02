export default function Button({ icon, children, onClick, className, disabled, type = "button" }) {
  return (
    <button
      className={`bg-gray-800 text-white rounded-full py-2 md:py-3 px-3 md:px-4 flex items-center justify-center gap-1 md:gap-2 shadow-sm transition-all duration-300 text-xs md:text-sm ${
        !disabled ? 'hover:shadow-md active:shadow-inner active:scale-95' : 'opacity-60 cursor-not-allowed'
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children && <span className="font-medium">{children}</span>}
    </button>
  );
}
