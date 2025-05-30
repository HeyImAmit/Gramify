import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Converter from "./pages/Converter/Converter";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LoginSignup from "./components/LoginPopup/Login";
import RecipeTipsPage from "./pages/RecipeTips/RecipeTipsPage";
import './index.css';
import ForumPage from "./pages/Forum/ForumPage";
import ScrollToTop from "./components/ScrollTop/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/convert-units" element={<Converter/>} />
          <Route path="/login" element={<LoginSignup/>} />
          <Route path="/recipe-tips" element={<RecipeTipsPage/>} />
          <Route path="/forum" element={<ForumPage/>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
