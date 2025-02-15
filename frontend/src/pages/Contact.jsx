import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <motion.h1 
        className="text-4xl font-bold text-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Contact Us
      </motion.h1>
      <p className="text-gray-600 mt-3 text-center max-w-lg">
        Have any questions? Feel free to reach out to us. We're here to help!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-4xl w-full">
        <ContactCard icon={<Mail size={28} />} title="Email" detail="support@skillify.com" />
        <ContactCard icon={<Phone size={28} />} title="Phone" detail="+1 (234) 567-890" />
        <ContactCard icon={<MapPin size={28} />} title="Location" detail="123 Skillify Street, Tech City" />
      </div>

      {/* Contact Form */}
      <motion.form 
        className="bg-white shadow-lg rounded-lg p-6 mt-10 w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800">Send Us a Message</h2>
        <div className="mt-4 space-y-4">
          <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-lg" required />
          <input type="email" placeholder="Your Email" className="w-full p-3 border rounded-lg" required />
          <textarea placeholder="Your Message" className="w-full p-3 border rounded-lg h-32" required></textarea>
          <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center justify-center gap-2">
            <Send size={20} />
            Send Message
          </button>
        </div>
      </motion.form>
    </div>
  );
};

const ContactCard = ({ icon, title, detail }) => (
  <motion.div 
    className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center"
    whileHover={{ scale: 1.05 }}
  >
    <div className="mb-3 text-blue-600">{icon}</div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-gray-600">{detail}</p>
  </motion.div>
);

export default Contact;
