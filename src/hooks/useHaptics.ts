import { useWebHaptics } from 'web-haptics/react';
import { useCallback } from 'react';

export function useHaptics() {
  const { trigger, isSupported } = useWebHaptics();

  const hapticSelect = useCallback(() => {
    if (isSupported) trigger('nudge');
  }, [trigger, isSupported]);

  const hapticDeselect = useCallback(() => {
    if (isSupported) trigger(30);
  }, [trigger, isSupported]);

  const hapticMove = useCallback(() => {
    if (isSupported) trigger('success');
  }, [trigger, isSupported]);

  const hapticAiMove = useCallback(() => {
    if (isSupported) trigger(40);
  }, [trigger, isSupported]);

  const hapticWin = useCallback(() => {
    if (isSupported) trigger([
      { duration: 80, intensity: 1 },
      { delay: 80, duration: 80, intensity: 1 },
      { delay: 80, duration: 150, intensity: 1 },
    ]);
  }, [trigger, isSupported]);

  const hapticLoss = useCallback(() => {
    if (isSupported) trigger('error');
  }, [trigger, isSupported]);

  const hapticRestart = useCallback(() => {
    if (isSupported) trigger(50);
  }, [trigger, isSupported]);

  return {
    isSupported,
    hapticSelect,
    hapticDeselect,
    hapticMove,
    hapticAiMove,
    hapticWin,
    hapticLoss,
    hapticRestart,
  };
}
