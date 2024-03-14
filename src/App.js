import React from "react";
import UserProfile from "./UserProfile";
// Removed import for Login component as it's no longer directly utilized.

/**
 *
 * This component serves as the root of the application. In this simplified version,
 * it directly renders the UserProfile component. This approach is taken to streamline
 * the display process, focusing on showcasing the user profile information immediately
 * upon app launch.
 * 
 * Note: The previous version of this app included routing to different components (e.g., Login, UserProfile).
 * However, based on the current requirements of Google App Engine (static files), we've simplified the structure to directly load the user's profile,
 * eliminating the need for explicit routing.
 */
function App() {
  // Render UserProfile directly to display user's portfolio and other details.
  return <UserProfile />;
}

export default App;
