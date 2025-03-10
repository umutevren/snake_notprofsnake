'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// Types
type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type Theme = {
  name: string;
  snakeColor: string;
  foodColor: string;
  backgroundColor: string;
  boardColor: string;
};

const THEMES: Theme[] = [
  {
    name: 'Classic',
    snakeColor: '#4CAF50',
    foodColor: '#FF5252',
    backgroundColor: '#1a1a1a',
    boardColor: '#333',
  },
  {
    name: 'Neon',
    snakeColor: '#00ff00',
    foodColor: '#ff00ff',
    backgroundColor: '#000000',
    boardColor: '#1a1a1a',
  },
  {
    name: 'Ocean',
    snakeColor: '#00bcd4',
    foodColor: '#ff9800',
    backgroundColor: '#1a237e',
    boardColor: '#0d47a1',
  },
  {
    name: 'Sunset',
    snakeColor: '#ff5722',
    foodColor: '#ffc107',
    backgroundColor: '#311b92',
    boardColor: '#4527a0',
  },
];

// Styled Components
const GameContainer = styled.div<{ backgroundColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  min-height: 100vh;
  color: white;
`;

const GameBoard = styled.div<{ boardColor: string }>`
  display: grid;
  grid-template-columns: repeat(20, 20px);
  grid-template-rows: repeat(20, 20px);
  gap: 1px;
  background-color: ${({ boardColor }) => boardColor};
  border: 2px solid #666;
  margin: 20px;
`;

const Cell = styled.div<{ isSnake?: boolean; isFood?: boolean; snakeColor: string; foodColor: string }>`
  width: 20px;
  height: 20px;
  background-color: ${({ isSnake, isFood, snakeColor, foodColor }) =>
    isSnake ? snakeColor : isFood ? foodColor : '#1a1a1a'};
  border-radius: ${({ isSnake, isFood }) => (isSnake || isFood ? '4px' : '0')};
`;

const ScoreBoard = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  font-family: 'Arial', sans-serif;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;

  &:hover {
    background-color: #45a049;
  }
`;

const SettingsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  width: 300px;
`;

const ColorInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 5px 0;
`;

const ThemeButton = styled(Button)`
  background-color: ${({ theme }) => theme.snakeColor};
  margin: 5px;
  width: 100px;
`;

const BOARD_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 5, y: 5 };
const SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [customSnakeColor, setCustomSnakeColor] = useState(currentTheme.snakeColor);
  const [customFoodColor, setCustomFoodColor] = useState(currentTheme.foodColor);

  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setIsGameOver(false);
    setScore(0);
    setGameStarted(true);
  };

  const moveSnake = useCallback(() => {
    if (isGameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP':
          newHead.y = (head.y - 1 + BOARD_SIZE) % BOARD_SIZE;
          break;
        case 'DOWN':
          newHead.y = (head.y + 1) % BOARD_SIZE;
          break;
        case 'LEFT':
          newHead.x = (head.x - 1 + BOARD_SIZE) % BOARD_SIZE;
          break;
        case 'RIGHT':
          newHead.x = (head.x + 1) % BOARD_SIZE;
          break;
      }

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if snake ate food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 1);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood, isGameOver]);

  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = setInterval(moveSnake, SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake, gameStarted]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return;

      switch (e.key) {
        case 'ArrowUp':
          setDirection(prev => (prev !== 'DOWN' ? 'UP' : prev));
          break;
        case 'ArrowDown':
          setDirection(prev => (prev !== 'UP' ? 'DOWN' : prev));
          break;
        case 'ArrowLeft':
          setDirection(prev => (prev !== 'RIGHT' ? 'LEFT' : prev));
          break;
        case 'ArrowRight':
          setDirection(prev => (prev !== 'LEFT' ? 'RIGHT' : prev));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  const applyTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    setCustomSnakeColor(theme.snakeColor);
    setCustomFoodColor(theme.foodColor);
  };

  const renderBoard = () => {
    const board = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;
        board.push(
          <Cell
            key={`${x}-${y}`}
            isSnake={isSnake}
            isFood={isFood}
            snakeColor={customSnakeColor}
            foodColor={customFoodColor}
          />
        );
      }
    }
    return board;
  };

  return (
    <GameContainer backgroundColor={currentTheme.backgroundColor}>
      <h1>Snake Game</h1>
      <ScoreBoard>Score: {score}</ScoreBoard>
      <GameBoard boardColor={currentTheme.boardColor}>{renderBoard()}</GameBoard>
      <SettingsPanel>
        <h3>Color Settings</h3>
        <ColorInput>
          <label>Snake Color:</label>
          <input
            type="color"
            value={customSnakeColor}
            onChange={(e) => setCustomSnakeColor(e.target.value)}
          />
        </ColorInput>
        <ColorInput>
          <label>Food Color:</label>
          <input
            type="color"
            value={customFoodColor}
            onChange={(e) => setCustomFoodColor(e.target.value)}
          />
        </ColorInput>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          {THEMES.map((theme) => (
            <ThemeButton
              key={theme.name}
              onClick={() => applyTheme(theme)}
            >
              {theme.name}
            </ThemeButton>
          ))}
        </div>
      </SettingsPanel>
      {!gameStarted ? (
        <Button onClick={resetGame}>Start Game</Button>
      ) : isGameOver ? (
        <>
          <h2>Game Over!</h2>
          <Button onClick={resetGame}>Play Again</Button>
        </>
      ) : null}
    </GameContainer>
  );
} 