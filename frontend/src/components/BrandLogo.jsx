import logo from "../assets/Logo_STB.png";

const sizeClasses = {
  sm: "h-9",
  md: "h-12",
  lg: "h-16",
};

function BrandLogo({ size = "md", className = "" }) {
  return (
    <img
      src={logo}
      alt="STB Bank"
      className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain ${className}`}
    />
  );
}

export default BrandLogo;
