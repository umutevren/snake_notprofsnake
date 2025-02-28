'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// Types
type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Styled Components
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: white;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(20, 20px);
  grid-template-rows: repeat(20, 20px);
  gap: 1px;
  background-color: #333;
  border: 2px solid #666;
  margin: 20px;
`;

const Cell = styled.div<{ isSnake?: boolean; isFood?: boolean }>`
  width: 20px;
  height: 20px;
  background-color: ${({ isSnake, isFood }) =>
    isSnake ? '#4CAF50' : isFood ? '#FF5252' : '#1a1a1a'};
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

  const renderBoard = () => {
    const board = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;
        board.push(<Cell key={`${x}-${y}`} isSnake={isSnake} isFood={isFood} />);
      }
    }
    return board;
  };

  return (
    <GameContainer>
      <h1>Snake Game</h1>
      <ScoreBoard>Score: {score}</ScoreBoard>
      <GameBoard>{renderBoard()}</GameBoard>
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