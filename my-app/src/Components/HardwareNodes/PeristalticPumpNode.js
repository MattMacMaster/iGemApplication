import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import './HardwareNode.css';

const PeristalticPumpNode = ({ data, isConnectable, selected }) => {
    // add any useStates here

    return (
        <div className={`hardware-node peristalticPump-node ${selected ? 'selected' : ''}`}>
            <Handle
                id="target"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ left: '25%' }}
            />

            <Handle
                id="source"
                type="source"
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ left: '75%' }}
            />

            <div className="hardware-node-content">
                <div className="hardware-node-header">
                    {data.label || 'Peristaltic Pump'}
                </div>
            </div>

        </div>
    );
}

export default memo(PeristalticPumpNode);
