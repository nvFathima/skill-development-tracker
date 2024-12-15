import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login"; // Import the Login page component
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register"; // Import the Register page component

function Layout (){
  const user = ""

  const location = useLocation();
  return user ? (
    <div className='w-full h-screen flex flex-col md:flex-row'>
      <div className='w-1/5 h-screen bg-white sticky top-0 hidden md:block'>
        {/* <Sidebar /> */}
      </div>

      {/* <MobileSidebar /> */}

      <div className='flex-1 overflow-y-auto'>
        {/* <Navbar /> */}
        <div className='p-4 2xl:px-10'>
          {/* <Outlet /> */}
        </div>
      </div>
    </div>
  )
  :(
    <Navigate to='/log-in' state={{ from: location }} replace />
  );
}

function App() {
  return (
    <main className='w-full min-h-screen bg-[#f3f4f6] '>
      <Routes>
        <Route element={<Layout />}>
          <Route index path='/' element={<Navigate to='/dashboard' />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Route>

        <Route path='/log-in' element={<Login />} />
        <Route path='/register' element={<Register />} /> {/* Add this line */}
      </Routes>

      <Toaster richColors />
    </main>
  );
}

export default App;
