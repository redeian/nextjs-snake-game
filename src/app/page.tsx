"use client";
import React, { useState, useEffect, useCallback } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_FOOD = { x: 15, y: 15 };

interface ParticleProps {
  x: number;
  y: number;
  color: string;
  lifespan: number;
}

interface Point {
  x: number;
  y: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  lifespan: number;
}

const Particle = ({ x, y, color, lifespan }: ParticleProps) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(0), lifespan);
    return () => clearTimeout(timer);
  }, [lifespan]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 4,
        height: 4,
        backgroundColor: color,
        borderRadius: "50%",
        opacity,
        transition: `opacity ${lifespan}ms linear`,
      }}
    />
  );
};

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = (x: number, y: number) => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: x * CELL_SIZE + Math.random() * CELL_SIZE,
      y: y * CELL_SIZE + Math.random() * CELL_SIZE,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      lifespan: 300 + Math.random() * 700,
    }));
    setParticles((prevParticles) => [...prevParticles, ...newParticles]);
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const newHead = {
        x: (prevSnake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (prevSnake[0].y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      if (isCollision(newHead, prevSnake.slice(1))) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setFood(getRandomFood());
        createParticles(food.x, food.y);
        setScore((prevScore) => {
          const newScore = prevScore + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, highScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection((prev) => (prev.y === 1 ? prev : { x: 0, y: -1 }));
          break;
        case "ArrowDown":
          setDirection((prev) => (prev.y === -1 ? prev : { x: 0, y: 1 }));
          break;
        case "ArrowLeft":
          setDirection((prev) => (prev.x === 1 ? prev : { x: -1, y: 0 }));
          break;
        case "ArrowRight":
          setDirection((prev) => (prev.x === -1 ? prev : { x: 1, y: 0 }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    const gameInterval = setInterval(moveSnake, 100);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearInterval(gameInterval);
    };
  }, [moveSnake]);

  const isCollision = (head: Point, body: Point[]) => {
    return body.some((segment) => segment.x === head.x && segment.y === head.y);
  };

  const getRandomFood = () => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (isCollision(newFood, snake));
    return newFood;
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
    setGameOver(false);
    setScore(0);
    setParticles([]);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Snake Game</h1>
      <div>
        Score: {score} | High Score: {highScore}
      </div>
      <div
        style={{
          display: "inline-block",
          backgroundColor: "#eee",
          border: "1px solid #999",
          position: "relative",
        }}
      >
        {Array.from({ length: GRID_SIZE }).map((_, row) => (
          <div key={row} style={{ display: "flex" }}>
            {Array.from({ length: GRID_SIZE }).map((_, col) => (
              <div
                key={`${row}-${col}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: snake.some(
                    (segment) => segment.x === col && segment.y === row
                  )
                    ? "green"
                    : food.x === col && food.y === row
                    ? "red"
                    : "transparent",
                }}
              />
            ))}
          </div>
        ))}
        {particles.map((particle) => (
          <Particle key={particle.id} {...particle} />
        ))}
      </div>
      {gameOver && (
        <div>
          <h2>Game Over!</h2>
          <button onClick={resetGame}>Restart</button>
        </div>
      )}
    </div>
  );
}
