import React from 'react';
import type { Difficulty } from '../model/types';

interface DifficultySelectProps {
  difficulty: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled: boolean;
}

const OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Leicht' },
  { value: 'medium', label: 'Mittel' },
  { value: 'hard', label: 'Schwer' },
];

const DifficultySelect: React.FC<DifficultySelectProps> = ({
  difficulty,
  onChange,
  disabled,
}) => {
  return (
    <div className="difficulty-select">
      <label>Schwierigkeit:</label>
      <div className="difficulty-buttons">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`diff-btn ${difficulty === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            aria-pressed={difficulty === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelect;
