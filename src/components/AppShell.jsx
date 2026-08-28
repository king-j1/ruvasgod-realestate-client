import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function AppShell({ children }) {
  const location = useLocation();

  const isStaffPortal = location.pathname.startsWith("/staff");

  if (isStaffPortal) {
    return children;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default AppShell;