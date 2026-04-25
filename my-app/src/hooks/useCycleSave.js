import { useCallback } from 'react';
import { createCycle, updateCycle } from '../api/cyclesApi';

/**
 * Saves a cycle to the database
 *
 */
export function useCycleSave({
  nodes,
  edges,
  activeCycleId,
  activeCycleName,
}) {
  const saveAsNewCycle = useCallback(
    async (name) => {
      const trimmed = (name ?? '').trim();
      if (!trimmed) return;

      try {
        const res = await createCycle({ name: trimmed, nodes, edges });
        if (!res.ok) {
          console.error('Save failed:', res.data);
          alert('Failed to save cycle.');
          return;
        }

        console.log('Saved cycle with id:', res.data?.id);
        alert('Cycle saved');
      } catch (e) {
        console.error('Save error:', e);
        alert('Error saving cycle.');
      }
    },
    [nodes, edges]
  );

  const onSaveCycle = useCallback(async () => {
    // Currently set up for Ok = Overwrite, Cancel = Save as new but a custom popup would be much clearer
    if (activeCycleId != null) {
      const label = activeCycleName ? `“${activeCycleName}”` : `#${activeCycleId}`;
      const overwrite = window.confirm(
        `Overwrite ${label}?\n\nOK = Overwrite\nCancel = Save as new`
      );

      if (overwrite) {
        try {
          const res = await updateCycle(activeCycleId, { nodes, edges });
          if (!res.ok) {
            console.error('Overwrite failed:', res.data);
            alert('Failed to overwrite cycle.');
            return;
          }

          alert('Cycle overwritten');
          return;
        } catch (e) {
          console.error('Overwrite error:', e);
          alert('Error overwriting cycle.');
          return;
        }
      }

      const newName = window.prompt('Name the NEW cycle (save as new):');
      if (!newName) return;
      await saveAsNewCycle(newName);
      return;
    }

    // default to “save as new”
    const name = window.prompt('Name this cycle:');
    if (!name) return;
    await saveAsNewCycle(name);
  }, [activeCycleId, activeCycleName, nodes, edges, saveAsNewCycle]);

  return { onSaveCycle, saveAsNewCycle };
}

