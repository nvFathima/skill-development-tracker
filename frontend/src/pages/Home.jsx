import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle, Lightbulb } from "lucide-react";

const Home = () => {
  return (
    <>
      {/* Navbar */}
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

      {/* Main Content */}
      <div className="min-h-screen w-full bg-[#f3f4f6]">
        {/* Hero Section */}
        <section className="relative flex flex-col justify-center items-center text-center min-h-screen px-6 pt-20">
          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold text-gray-900"
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1 }}
          >
            Your Path to <span className="text-blue-700">Skill Growth</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 mt-4 max-w-lg"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5, duration: 1 }}
          >
            Track, improve, and achieve your learning goals with Skillify.
          </motion.p>
          <motion.div 
            className="mt-6 flex gap-4"
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Link to="/register">
              <Button className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white text-center">
          <h2 className="text-4xl font-bold text-gray-900">Why Choose Skillify?</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
            <FeatureCard 
              icon={<Rocket size={40} className="text-blue-700" />} 
              title="Track Your Progress" 
              description="Monitor your learning journey with detailed analytics." 
            />
            <FeatureCard 
              icon={<CheckCircle size={40} className="text-green-600" />} 
              title="Set Learning Goals" 
              description="Define your personal skill-building roadmap." 
            />
            <FeatureCard 
              icon={<Lightbulb size={40} className="text-yellow-500" />} 
              title="Stay Inspired" 
              description="Join a community that motivates you to keep growing." 
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-center">
          <h2 className="text-4xl font-bold">Ready to Skill Up?</h2>
          <p className="mt-4 text-lg">Sign up now and start your journey today!</p>
          <div className="mt-6">
            <Link to="/register">
              <Button className="bg-white text-blue-700 px-6 py-3 rounded-lg hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    className="p-6 bg-gray-50 rounded-lg shadow-lg flex flex-col items-center"
    initial={{ opacity: 0, y: 20 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-600 mt-2">{description}</p>
  </motion.div>
);

export default Home;