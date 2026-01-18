import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
// import PrivateRoute from "./components/PrivateRoute"

// ✅ 상세 페이지 컴포넌트
import Project from "./pages/Project.jsx";
import Home from './pages/Home.jsx'
import Page from './pages/Landing.jsx'
import './App.css'
import LoginModal from "./pages/Login.jsx";


export default function App() {
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
      navigate('/');
    }
    else {
      window.location.reload();
    }
  }


  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={ <Page /> } />
            <Route path="dashboard" element={ 
              // <PrivateRoute>
                <Home />
              /* </PrivateRoute>  */
              }
            />
            <Route path="/project/:id" element={<Project />}/>
        </Routes>
      </BrowserRouter>

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
  )
}