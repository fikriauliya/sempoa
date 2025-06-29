import React, { useState, ReactNode, createContext, useContext } from "react";
import { GameState } from "../types";

export interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  currentValue: number;
  setCurrentValue: (value: number) => void;
  feedback: string | null;
  setFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  checkAnswer: () => boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    score: 0,
    level: 1,
    mistakes: 0,
  });

  const [currentValue, setCurrentValue] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const checkAnswer = () => {
    if (!gameState.currentQuestion) return false;

    const isCorrect = currentValue === gameState.currentQuestion.answer;

    if (isCorrect) {
      setGameState((prev: GameState) => ({
        ...prev,
        score: prev.score + 1,
      }));
    } else {
      setGameState((prev: GameState) => ({
        ...prev,
        mistakes: prev.mistakes + 1,
      }));
    }

    return isCorrect;
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        currentValue,
        setCurrentValue,
        feedback,
        setFeedback,
        checkAnswer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
