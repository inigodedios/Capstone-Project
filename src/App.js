import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserProfile from "./UserProfile";
import Login from "./login";

/**
 * App Component
 * This component sets up the main router for the application using React Router.
 * It defines a single route that matches a user ID pattern and renders the UserProfile component for that user.
 * 
 * The Router component wraps the entire application to enable client-side routing.
 * The Routes component is a container for all individual Route components, allowing for multiple routes to be defined.
 * Each Route component specifies a path and the component to render when that path is accessed.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Define a route for user profiles with a dynamic user ID. This will be implemented along with GCP in future deliveries.*/}
        <Route path="/overview" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
        {/* The ":userId" placeholder in the path indicates a dynamic segment that matches any user ID. */}
      </Routes>
    </Router>
  );
}

export default App;
