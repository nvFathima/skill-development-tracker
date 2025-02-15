import { motion } from "framer-motion";
import { Users, Target, BarChart3 } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <motion.h1 
        className="text-4xl font-bold text-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        About Skillify
      </motion.h1>
      <p className="text-gray-600 mt-3 text-center max-w-xl">
        Skillify is a personalized platform designed to help individuals plan and track their skill enhancement journeys.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 max-w-5xl">
        <FeatureCard icon={<Users size={40} />} title="Community Learning" description="Join a growing community of learners and experts." />
        <FeatureCard icon={<Target size={40} />} title="Goal-Oriented" description="Set career-focused goals and track your progress." />
        <FeatureCard icon={<BarChart3 size={40} />} title="Data-Driven Insights" description="Monitor your learning growth with in-depth analytics." />
      </div>

      {/* Call to Action */}
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <a href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
          Start Your Journey
        </a>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center"
    whileHover={{ scale: 1.05 }}
  >
    <div className="mb-3 text-blue-600">{icon}</div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </motion.div>
);

export default About;
