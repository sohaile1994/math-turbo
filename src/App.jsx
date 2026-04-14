import { GameProvider, useGame } from "./context/GameContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Screen } from "./enums";
import MainMenu         from "./components/screens/MainMenu";
import GameScreen       from "./components/GameScreen";
import GameOver         from "./components/screens/GameOver";
import LoginScreen      from "./components/screens/LoginScreen";
import LeaderboardScreen from "./components/screens/LeaderboardScreen";
import "./App.css";

function AppContent() {
  const { screen }          = useGame();
  const { user, authReady } = useAuth();

  if (!authReady) return null;
  if (!user)      return <LoginScreen />;

  if (screen === Screen.LEADERBOARD) return <div className="game-container"><LeaderboardScreen /></div>;

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
