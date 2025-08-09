import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInner() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return <Dashboard userRole={user.role || "admin"} />;
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
