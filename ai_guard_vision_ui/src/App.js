import { Route,Routes } from "react-router-dom";
import Home from "./components/login/Home";
import Dashboard from "./components/dashboard/Dashboard";


function App() {
  return(
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  )
}
export default App;
