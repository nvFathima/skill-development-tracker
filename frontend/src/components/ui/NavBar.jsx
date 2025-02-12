import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 fixed top-0 left-0 w-full bg-white shadow-md z-10 border-b border-gray-200">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img src="/Skillify_logo.png" alt="Skillify Logo" className="h-12 w-auto md:h-14 lg:h-16" />
      </Link>

      {/* Navigation Links */}
      <div className="flex-1 flex justify-center space-x-8">
        <NavLink to="/" className="text-gray-600 hover:text-blue-600">Home</NavLink>
        <NavLink to="/about" className="text-gray-600 hover:text-blue-600">About</NavLink>
        <NavLink to="/contact" className="text-gray-600 hover:text-blue-600">Contact</NavLink>
      </div>

      {/* Login/Sign Up Links */}
      <div className="flex items-center space-x-6">
        <Link to="/log-in" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-100">
          Login
        </Link>
        <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
