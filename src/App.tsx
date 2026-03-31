// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";

function App() {
  return (
    <BrowserRouter>
      {/* Persistent Layout Elements */}
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Page details go here */}
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
