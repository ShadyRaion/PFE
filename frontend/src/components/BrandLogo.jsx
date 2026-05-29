import logo from "../assets/Logo_STB.png";
import darkLogo from "../assets/Logo_STB_dark.png";

const sizeClasses = {
  sm: "h-9",
  md: "h-12",
  lg: "h-16",
};

function BrandLogo({ size = "md", className = "" }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={logo}
        alt="STB Bank"
        className={`brand-logo-light ${sizeClasses[size] || sizeClasses.md} w-auto object-contain`}
      />
      <img
        src={darkLogo}
        alt=""
        aria-hidden="true"
        className={`brand-logo-dark hidden ${sizeClasses[size] || sizeClasses.md} w-auto object-contain`}
      />
    </span>
  );
}

export default BrandLogo;
