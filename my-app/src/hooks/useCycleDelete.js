import { useCallback } from 'react';
import { deleteCycle as apiDeleteCycle, listCycles } from '../api/cyclesApi';

export function useCycleDelete({ setSavedCycles }) {
  const deleteCycle = useCallback(async (cycleId) => {
    if (!window.confirm('Are you sure you want to delete this cycle?')) {
      return;
    }

    try {
      const res = await apiDeleteCycle(cycleId);

      if (!res.ok) return;

      const listRes = await listCycles();

      if (listRes.ok) {
        setSavedCycles(listRes.data);
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Failed to delete cycle.');
    }
  }, [setSavedCycles]);

  return { deleteCycle };
}