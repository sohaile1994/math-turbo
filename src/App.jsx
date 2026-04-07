import { GameProvider, useGame } from "./context/GameContext";
import { Screen } from "./enums";
import MainMenu  from "./components/screens/MainMenu";
import GameScreen from "./components/GameScreen";
import GameOver  from "./components/screens/GameOver";
import "./App.css";

function AppContent() {
  const { screen } = useGame();
  return (
    <div className="game-container">
      {screen === Screen.MAIN_MENU  && <MainMenu />}
      {screen === Screen.GAME       && <GameScreen />}
      {screen === Screen.GAME_OVER  && <GameOver />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
