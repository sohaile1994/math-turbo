import { MenuProvider } from "./context/MenuContext";
import { ProblemProvider } from "./context/ProblemContext";
import { ScoreProvider } from "./context/ScoreContext";
import { AnswerProvider } from "./context/AnswerContext";

import MenuPanel from "./components/MenuPanel";
import ProblemLayout from "./components/ProblemLayout";
import ScoreDisplay from "./components/ScoreDisplay";
import AnswerFeedback from "./components/AnswerFeedback";

import CalculatorInput from "./components/CalculatorInput";

import "./App.css";

export default function App() {
  return (
    <MenuProvider>
      <ScoreProvider>
        <ProblemProvider>
          <AnswerProvider>
            <div class="game-container">
              <MenuPanel />
              <div id="game-panel" className="game-panel">
                  <ScoreDisplay />
                  <AnswerFeedback />
                  <ProblemLayout />
                  <CalculatorInput />
              </div>
            </div>
          </AnswerProvider>
        </ProblemProvider>
      </ScoreProvider>
    </MenuProvider>
  );
}
