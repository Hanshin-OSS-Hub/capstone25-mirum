import { Routes, Route, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Landing from '../pages/Landing.jsx'
import Home from '../pages/Home.jsx'
import Project from '../pages/Project.jsx'
import LoginModal from '../features/auth/components/Login.jsx'

export default function AppRoutes() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    }

    window.addEventListener("openLoginModal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
    }
  }, []);

  const handleModalClose = (result) => {
    setIsLoginModalOpen(false);
    if (result === 'canceled') {
      localStorage.clear();
      navigate('/');
    } else
      window.location.reload();
  }

  return (
      <>
        <Routes>
          <Route path="/" element={ <Landing /> } />
          <Route path="dashboard" element={
            // <PrivateRoute>
            <Home />
            /* </PrivateRoute>  */
          }
          />
          <Route path="/api/project/:id" element={<Project />}/>
        </Routes>

        {/* Modals */}
        {isLoginModalOpen && (
            <LoginModal
                onClose={() => setIsLoginModalOpen(false)}
                onCancel={(result) => handleModalClose(result)}
                onLoginSuccess={() => {
                  setIsLoginModalOpen(false);
                  navigate("/dashboard");
                }}
                // onClickSignUp={() => {
                //   setIsLoginOpen(false);
                //   setIsSignupOpen(true);
                // }}
            />
        )}
      </>
  );
}
