export default function Button({ icon, children, onClick, className, disabled, type = "button" }) {
  return (
    <button
      className={`bg-gray-800 text-white rounded-full py-3 px-4 flex items-center gap-2 shadow-sm transition-all duration-300 ${
        !disabled ? 'hover:shadow-md active:shadow-inner' : 'opacity-60 cursor-not-allowed'
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
