import Landing from "./pages/Landing";
import { UserContextProvider } from "./context/UserContext";

import "./App.css";

function App() {
  return (
    <UserContextProvider>
      <Landing />
    </UserContextProvider>
  );
}

export default App;
