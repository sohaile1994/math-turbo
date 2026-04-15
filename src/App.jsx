import { GameProvider, useGame } from "./context/GameContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Screen } from "./enums";
import MainMenu         from "./components/screens/MainMenu";
import GameScreen       from "./components/GameScreen";
import GameOver         from "./components/screens/GameOver";
import LoginScreen      from "./components/screens/LoginScreen";
import LeaderboardScreen from "./components/screens/LeaderboardScreen";
import AdminScreen       from "./components/screens/AdminScreen";
import SuperAdminScreen  from "./components/screens/SuperAdminScreen";
import "./App.css";

function AppContent() {
  const { screen }          = useGame();
  const { user, authReady } = useAuth();

  if (!authReady) return null;
  if (!user)      return <LoginScreen />;

  if (screen === Screen.LEADERBOARD) return <div className="game-container"><LeaderboardScreen /></div>;
  if (screen === Screen.ADMIN)       return <div className="game-container"><AdminScreen /></div>;
  if (screen === Screen.SUPER_ADMIN) return <div className="game-container"><SuperAdminScreen /></div>;

  return (
    <div className="game-container">
      {screen === Screen.MAIN_MENU && <MainMenu />}
      {screen === Screen.GAME      && <GameScreen />}
      {screen === Screen.GAME_OVER && <GameOver />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}
