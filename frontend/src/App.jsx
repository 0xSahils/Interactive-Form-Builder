import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Toaster } from "react-hot-toast";

// Pages
import HomePage from "./pages/HomePage";
import FormBuilder from "./pages/FormBuilder";
import FormPreview from "./pages/FormPreview";
import FormFill from "./pages/FormFill";
import FormAnalytics from "./pages/FormAnalytics";

// Components
import Navbar from "./components/Navbar";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/builder" element={<FormBuilder />} />
              <Route path="/builder/:id" element={<FormBuilder />} />
              <Route path="/preview/:id" element={<FormPreview />} />
              <Route path="/form/:id" element={<FormFill />} />
              <Route path="/analytics/:id" element={<FormAnalytics />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
      </Router>
    </DndProvider>
  );
}

export default App;
