import React from "react";
import { Link } from "react-router-dom";
import { CircleArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <div className="w-full min-h-screen bg-[#f3f4f6] p-6">
      
      {/* Back to Home Link */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-blue-700 hover:underline text-sm">
        <CircleArrowLeft size={16} /> Back to Home
      </Link>

      {/* Animated Terms Container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-bold text-blue-700 text-center">Terms & Conditions</h1>
        <p className="text-gray-600 text-center text-sm mt-2">Last Updated: January 2025</p>
        
        {/* Table of Contents */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">Table of Contents</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
            <li><a href="#introduction" className="text-blue-600 hover:underline">1. Introduction</a></li>
            <li><a href="#account" className="text-blue-600 hover:underline">2. Account Registration</a></li>
            <li><a href="#usage" className="text-blue-600 hover:underline">3. Acceptable Usage</a></li>
            <li><a href="#privacy" className="text-blue-600 hover:underline">4. Privacy Policy</a></li>
            <li><a href="#termination" className="text-blue-600 hover:underline">5. Termination of Service</a></li>
            <li><a href="#contact" className="text-blue-600 hover:underline">6. Contact Us</a></li>
          </ul>
        </div>

        {/* Terms Content */}
        <div className="mt-6 space-y-6">
          <section id="introduction">
            <h2 className="text-xl font-semibold text-gray-700">1. Introduction</h2>
            <p className="text-gray-600 mt-2">
              Welcome to Skillify! By using our platform, you agree to abide by these Terms & Conditions. Please read them carefully.
            </p>
          </section>

          <section id="account">
            <h2 className="text-xl font-semibold text-gray-700">2. Account Registration</h2>
            <p className="text-gray-600 mt-2">
              To access Skillify, you must create an account using accurate and complete information. You are responsible for keeping your login details secure.
            </p>
          </section>

          <section id="usage">
            <h2 className="text-xl font-semibold text-gray-700">3. Acceptable Usage</h2>
            <p className="text-gray-600 mt-2">
              You agree not to misuse the platform, including engaging in illegal activities, harassing users, or violating intellectual property rights.
            </p>
          </section>

          <section id="privacy">
            <h2 className="text-xl font-semibold text-gray-700">4. Privacy Policy</h2>
            <p className="text-gray-600 mt-2">
              Your personal information is protected in accordance with our Privacy Policy. By using Skillify, you consent to data collection as outlined in our policy.
            </p>
          </section>

          <section id="termination">
            <h2 className="text-xl font-semibold text-gray-700">5. Termination of Service</h2>
            <p className="text-gray-600 mt-2">
              We reserve the right to suspend or terminate accounts that violate our Terms & Conditions or engage in harmful activities.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-semibold text-gray-700">6. Contact Us</h2>
            <p className="text-gray-600 mt-2">
              If you have any questions regarding these Terms & Conditions, please contact us at <a href="mailto:support@skillify.com" className="text-blue-600 hover:underline">support@skillify.com</a>.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Terms;
