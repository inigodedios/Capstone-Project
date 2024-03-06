import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserProfile from "./UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:userId" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
