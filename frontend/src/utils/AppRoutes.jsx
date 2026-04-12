import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import LoginModal from '../features/auth/components/Login.jsx';
import Home from '../pages/Home.jsx';
import Landing from '../pages/Landing.jsx';
import Task from '../pages/Task.jsx';

export default function AppRoutes() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  const handleModalClose = (result) => {
    setIsLoginModalOpen(false);
    if (result === 'canceled') {
      localStorage.clear();
      navigate('/');
    } else window.location.reload();
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="dashboard"
          element={
            // <PrivateRoute>
            <Home />
            /* </PrivateRoute>  */
          }
        />
        <Route path="/project/:id" element={<Task />} />
        <Route path="/project/:id/admin" element={<Task />} />
        <Route path="/project/:id/trash" element={<Task />} />
      </Routes>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onCancel={(result) => handleModalClose(result)}
          onLoginSuccess={() => {
            setIsLoginModalOpen(false);
            navigate('/dashboard');
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
