import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import type { GameState, Move, Difficulty, CellState, Player, PlayerCount } from '../model/types';
import {
  createInitialBoard,
  serializeBoard,
  getGoalZone,
  getPlayers,
  getAiPlayers,
  nextPlayer,
} from '../model/board';
import {
  getValidMoves,
  getContinuingJumps,
  applyMove,
  checkWin,
} from '../model/gameLogic';

// --- Highscore ---

interface HighscoreEntry {
  time: number;
  date: string;
  name: string;
  result: 'win' | 'loss';
  remaining: number;
}

type Highscores = Record<Difficulty, HighscoreEntry[]>;

const HIGHSCORE_KEY = 'halma-highscores';

function loadHighscores(): Highscores {
  try {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { easy: [], medium: [], hard: [] };
}

function saveHighscore(
  difficulty: Difficulty,
  time: number,
  name: string,
  result: 'win' | 'loss',
  remaining: number,
): Highscores {
  const scores = loadHighscores();
  scores[difficulty].push({
    time,
    date: new Date().toISOString().slice(0, 10),
    name,
    result,
    remaining,
  });
  scores[difficulty].sort((a, b) => a.time - b.time);
  scores[difficulty] = scores[difficulty].slice(0, 10);
  localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(scores));
  return scores;
}

// --- Reducer ---

type GameAction =
  | { type: 'SELECT_PIECE'; pos: string }
  | { type: 'MOVE_PIECE'; to: string }
  | { type: 'END_TURN' }
  | { type: 'AI_MOVE'; move: Move }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_SIDE'; humanPlayer: Player }
  | { type: 'SET_PLAYER_COUNT'; playerCount: PlayerCount }
  | { type: 'RESTART' };

function createInitialState(
  difficulty: Difficulty = 'medium',
  humanPlayer: Player = 2,
  fastMode: boolean = true,
  started: boolean = false,
  playerCount: PlayerCount = 2,
): GameState {
  const players = getPlayers(playerCount);
  const aiPlayers = getAiPlayers(playerCount, humanPlayer);

  // Easy + Medium: human starts, Hard: first AI starts
  const firstPlayer = difficulty === 'hard' ? aiPlayers[0] : humanPlayer;

  return {
    board: createInitialBoard(playerCount),
    currentPlayer: firstPlayer,
    humanPlayer,
    playerCount,
    players,
    aiPlayers,
    selectedPiece: null,
    validMoves: [],
    jumpPath: [],
    winner: null,
    difficulty,
    isAiThinking: started && aiPlayers.includes(firstPlayer),
    fastMode,
    started,
    startTime: started ? Date.now() : null,
    endTime: null,
    lastMoveJumps: 0,
  };
}

function computeValidMovesList(
  pos: string,
  board: Map<string, CellState>,
  player: Player
): string[] {
  const { simpleMoves, jumpMoves } = getValidMoves(pos, board, player);
  return [...simpleMoves, ...Array.from(jumpMoves.keys())];
}

function finishTurn(state: GameState, newBoard: Map<string, CellState>, player: Player, jumpCount = 0): GameState {
  const isPlayerWin = checkWin(newBoard, player);
  const winner = isPlayerWin ? player : null;
  const next = winner ? player : nextPlayer(player, state.players);
  const nextIsAi = !winner && state.aiPlayers.includes(next);

  return {
    ...state,
    board: newBoard,
    selectedPiece: null,
    validMoves: [],
    jumpPath: [],
    currentPlayer: winner ? player : next,
    winner,
    isAiThinking: nextIsAi,
    endTime: winner ? Date.now() : null,
    lastMoveJumps: player === state.humanPlayer ? jumpCount : 0,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  const hp = state.humanPlayer;

  switch (action.type) {
    case 'SELECT_PIECE': {
      if (!state.started) return state;
      if (state.winner || state.isAiThinking) return state;
      if (state.currentPlayer !== hp) return state;

      const { pos } = action;
      if (state.board.get(pos) !== hp) return state;

      // If in a jump chain, can't select a different piece
      if (state.jumpPath.length > 0) return state;

      // Deselect: clicking the same piece again clears selection
      if (pos === state.selectedPiece) {
        return { ...state, selectedPiece: null, validMoves: [] };
      }

      const valid = computeValidMovesList(pos, state.board, hp);
      return {
        ...state,
        selectedPiece: pos,
        validMoves: valid,
      };
    }

    case 'MOVE_PIECE': {
      if (!state.started) return state;
      if (state.winner || state.isAiThinking) return state;
      if (!state.selectedPiece) return state;
      if (!state.validMoves.includes(action.to)) return state;

      const from = state.selectedPiece;
      const to = action.to;
      const newBoard = applyMove(state.board, from, to);

      // Check if this was a simple (non-jump) move
      const { simpleMoves, jumpMoves } = getValidMoves(from, state.board, hp);
      const wasSimpleMove = simpleMoves.includes(to);

      if (wasSimpleMove) {
        return finishTurn(state, newBoard, hp, 0);
      }

      // Was a jump — in fast mode, end turn immediately
      if (state.fastMode) {
        // Count jumps from the BFS path
        const path = jumpMoves.get(to);
        const jumpCount = path ? path.length - 1 : 1;
        return finishTurn(state, newBoard, hp, jumpCount);
      }

      // Normal mode: check for continuing jumps
      const visitedInChain = new Set([...state.jumpPath, from, to]);
      const continuingJumps = getContinuingJumps(to, newBoard, hp, visitedInChain);

      if (continuingJumps.length === 0) {
        // Total jumps = previous chain + this jump
        return finishTurn(state, newBoard, hp, state.jumpPath.length + 1);
      }

      // More jumps available
      return {
        ...state,
        board: newBoard,
        selectedPiece: to,
        validMoves: continuingJumps,
        jumpPath: [...state.jumpPath, from],
        lastMoveJumps: 0,
      };
    }

    case 'END_TURN': {
      if (state.jumpPath.length === 0) return state;
      return finishTurn(state, state.board, hp, state.jumpPath.length);
    }

    case 'AI_MOVE': {
      const { move } = action;
      const currentAi = state.currentPlayer;
      const newBoard = applyMove(state.board, move.from, move.to);
      const isAiWin = checkWin(newBoard, currentAi);
      const winner = isAiWin ? currentAi : null;
      const next = winner ? currentAi : nextPlayer(currentAi, state.players);
      const nextIsAi = !winner && state.aiPlayers.includes(next);

      return {
        ...state,
        board: newBoard,
        currentPlayer: winner ? currentAi : next,
        winner,
        isAiThinking: nextIsAi,
        endTime: winner ? Date.now() : null,
        lastMoveJumps: 0,
      };
    }

    case 'SET_DIFFICULTY': {
      return createInitialState(action.difficulty, state.humanPlayer, state.fastMode, false, state.playerCount);
    }

    case 'SET_SIDE': {
      return createInitialState(state.difficulty, action.humanPlayer, state.fastMode, false, state.playerCount);
    }

    case 'SET_PLAYER_COUNT': {
      // For 3-4 players, human is always player 2 (bottom)
      const hp = action.playerCount > 2 ? 2 : state.humanPlayer;
      return createInitialState(state.difficulty, hp as Player, state.fastMode, false, action.playerCount);
    }

    case 'RESTART': {
      return createInitialState(state.difficulty, state.humanPlayer, state.fastMode, true, state.playerCount);
    }

    default:
      return state;
  }
}

// --- Hook ---

export function useGame(playerName: string) {
  const [state, dispatch] = useReducer(
    gameReducer,
    createInitialState('medium', 2, true)
  );
  const workerRef = useRef<Worker | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [highscores, setHighscores] = useState<Highscores>(loadHighscores);

  // Timer interval
  useEffect(() => {
    if (state.startTime && !state.endTime) {
      const id = setInterval(() => {
        setElapsedMs(Date.now() - state.startTime!);
      }, 100);
      return () => clearInterval(id);
    }
    if (state.endTime && state.startTime) {
      setElapsedMs(state.endTime - state.startTime);
    }
  }, [state.startTime, state.endTime]);

  // Save highscore on game end (win or loss)
  useEffect(() => {
    if (state.winner && state.startTime && state.endTime) {
      const time = state.endTime - state.startTime;
      const humanWon = state.winner === state.humanPlayer;
      let remaining = 0;
      if (!humanWon) {
        const goalZone = getGoalZone(state.humanPlayer);
        for (const [pos, cell] of state.board) {
          if (cell === state.humanPlayer && !goalZone.has(pos)) remaining++;
        }
      }
      const updated = saveHighscore(
        state.difficulty,
        time,
        playerName || 'Anonym',
        humanWon ? 'win' : 'loss',
        remaining,
      );
      setHighscores(updated);
    }
  }, [state.winner, state.humanPlayer, state.startTime, state.endTime, state.difficulty, playerName, state.board]);

  // Initialize worker
  useEffect(() => {
    const worker = new Worker(
      new URL('../ai/ai.worker.ts', import.meta.url),
      { type: 'module' }
    );
    worker.onmessage = (e: MessageEvent<{ move: Move }>) => {
      dispatch({ type: 'AI_MOVE', move: e.data.move });
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // Trigger AI when it's an AI player's turn
  useEffect(() => {
    if (state.aiPlayers.includes(state.currentPlayer) && !state.winner && state.isAiThinking) {
      const timer = setTimeout(() => {
        workerRef.current?.postMessage({
          board: serializeBoard(state.board),
          currentPlayer: state.currentPlayer,
          difficulty: state.difficulty,
          playerCount: state.playerCount,
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.winner, state.isAiThinking, state.board, state.difficulty, state.aiPlayers, state.playerCount]);

  const selectPiece = useCallback((pos: string) => {
    dispatch({ type: 'SELECT_PIECE', pos });
  }, []);

  const movePiece = useCallback((to: string) => {
    dispatch({ type: 'MOVE_PIECE', to });
  }, []);

  const endTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, []);

  const setSide = useCallback((humanPlayer: Player) => {
    dispatch({ type: 'SET_SIDE', humanPlayer });
  }, []);

  const setPlayerCount = useCallback((playerCount: PlayerCount) => {
    dispatch({ type: 'SET_PLAYER_COUNT', playerCount });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  return {
    state,
    selectPiece,
    movePiece,
    endTurn,
    setDifficulty,
    setSide,
    setPlayerCount,
    restart,
    elapsedMs,
    highscores,
  };
}
