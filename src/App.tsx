import { useGame } from './hooks/useGame';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import styles from './App.module.css';

function App() {
  const { state, selectPiece, movePiece, endTurn, setDifficulty, setSide, restart } =
    useGame();

  return (
    <div className={styles.app}>
      <Board state={state} onSelectPiece={selectPiece} onMovePiece={movePiece} />
      <GameInfo
        state={state}
        onEndTurn={endTurn}
        onSetDifficulty={setDifficulty}
        onSetSide={setSide}
        onRestart={restart}
      />
    </div>
  );
}

export default App;
