import { memo, useEffect, useState } from 'react';
import { Handle, NodeToolbar, Position } from '@xyflow/react';

function HardwareNode({ id, data, selected }) {
  const [labelDraft, setLabelDraft] = useState(data?.label ?? 'Hardware');

  useEffect(() => {
    setLabelDraft(data?.label ?? 'Hardware');
  }, [data?.label]);

  return (
    <div style={{ padding: 10, border: '1px solid #222', borderRadius: 8, background: '#fff', minWidth: 180 }}>
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <div style={{ display: 'grid', gap: 8, padding: 8, background: 'white', border: '1px solid #ddd', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Settings</div>

          <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
            Name
            <input
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={() => data?.onChangeLabel?.(labelDraft)}
              style={{ fontSize: 12, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 6 }}
            />
          </label>

          <button
            type="button"
            onClick={() => data?.onDelete?.(id)}
            style={{ fontSize: 12, padding: '6px 8px', border: '1px solid #c33', color: '#c33', borderRadius: 6, background: '#fff' }}
          >
            Delete node
          </button>
        </div>
      </NodeToolbar>

      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontWeight: 700 }}>{data?.label ?? 'Hardware'}</div>
        <div style={{ fontSize: 12, color: '#555' }}>{data?.hardwareType ?? 'Hardware'}</div>
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(HardwareNode);

