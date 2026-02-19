import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { GameState, Move, Difficulty, CellState, Player } from '../model/types';
import { createInitialBoard, serializeBoard } from '../model/board';
import {
  getValidMoves,
  getContinuingJumps,
  applyMove,
  checkWin,
  opponent,
} from '../model/gameLogic';

type GameAction =
  | { type: 'SELECT_PIECE'; pos: string }
  | { type: 'MOVE_PIECE'; to: string }
  | { type: 'END_TURN' }
  | { type: 'AI_MOVE'; move: Move }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_SIDE'; humanPlayer: Player }
  | { type: 'RESTART' };

function createInitialState(
  difficulty: Difficulty = 'medium',
  humanPlayer: Player = 2
): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 1, // player 1 (top) always moves first
    humanPlayer,
    selectedPiece: null,
    validMoves: [],
    jumpPath: [],
    winner: null,
    difficulty,
    isAiThinking: humanPlayer !== 1, // if human is not player 1, AI goes first
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

function gameReducer(state: GameState, action: GameAction): GameState {
  const hp = state.humanPlayer;
  const ai = opponent(hp);

  switch (action.type) {
    case 'SELECT_PIECE': {
      if (state.winner || state.isAiThinking) return state;
      if (state.currentPlayer !== hp) return state;

      const { pos } = action;
      if (state.board.get(pos) !== hp) return state;

      // If in a jump chain, can't select a different piece
      if (state.jumpPath.length > 0) return state;

      const valid = computeValidMovesList(pos, state.board, hp);
      return {
        ...state,
        selectedPiece: pos,
        validMoves: valid,
      };
    }

    case 'MOVE_PIECE': {
      if (state.winner || state.isAiThinking) return state;
      if (!state.selectedPiece) return state;
      if (!state.validMoves.includes(action.to)) return state;

      const from = state.selectedPiece;
      const to = action.to;
      const newBoard = applyMove(state.board, from, to);

      // Check if this was a simple (non-jump) move
      const { simpleMoves } = getValidMoves(from, state.board, hp);
      const wasSimpleMove = simpleMoves.includes(to);

      if (wasSimpleMove) {
        const winner = checkWin(newBoard, hp) ? hp : null;
        return {
          ...state,
          board: newBoard,
          selectedPiece: null,
          validMoves: [],
          jumpPath: [],
          currentPlayer: winner ? hp : ai,
          winner,
          isAiThinking: !winner,
        };
      }

      // Was a jump - check for continuing jumps
      const visitedInChain = new Set([...state.jumpPath, from, to]);
      const continuingJumps = getContinuingJumps(to, newBoard, hp, visitedInChain);

      if (continuingJumps.length === 0) {
        const winner = checkWin(newBoard, hp) ? hp : null;
        return {
          ...state,
          board: newBoard,
          selectedPiece: null,
          validMoves: [],
          jumpPath: [],
          currentPlayer: winner ? hp : ai,
          winner,
          isAiThinking: !winner,
        };
      }

      // More jumps available
      return {
        ...state,
        board: newBoard,
        selectedPiece: to,
        validMoves: continuingJumps,
        jumpPath: [...state.jumpPath, from],
      };
    }

    case 'END_TURN': {
      if (state.jumpPath.length === 0) return state;
      const winner = checkWin(state.board, hp) ? hp : null;
      return {
        ...state,
        selectedPiece: null,
        validMoves: [],
        jumpPath: [],
        currentPlayer: winner ? hp : ai,
        winner,
        isAiThinking: !winner,
      };
    }

    case 'AI_MOVE': {
      const { move } = action;
      const newBoard = applyMove(state.board, move.from, move.to);
      const winner = checkWin(newBoard, ai) ? ai : null;
      return {
        ...state,
        board: newBoard,
        currentPlayer: winner ? ai : hp,
        winner,
        isAiThinking: false,
      };
    }

    case 'SET_DIFFICULTY': {
      return createInitialState(action.difficulty, state.humanPlayer);
    }

    case 'SET_SIDE': {
      return createInitialState(state.difficulty, action.humanPlayer);
    }

    case 'RESTART': {
      return createInitialState(state.difficulty, state.humanPlayer);
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(
    gameReducer,
    createInitialState('medium', 2)
  );
  const workerRef = useRef<Worker | null>(null);

  const aiPlayer = opponent(state.humanPlayer);

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

  // Trigger AI when it's the AI's turn
  useEffect(() => {
    if (state.currentPlayer === aiPlayer && !state.winner && state.isAiThinking) {
      const timer = setTimeout(() => {
        workerRef.current?.postMessage({
          board: serializeBoard(state.board),
          currentPlayer: aiPlayer,
          difficulty: state.difficulty,
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.winner, state.isAiThinking, state.board, state.difficulty, aiPlayer]);

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

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  return { state, selectPiece, movePiece, endTurn, setDifficulty, setSide, restart };
}
