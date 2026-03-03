import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import './HardwareNode.css';

const PeristalticPumpNode = ({ data, isConnectable, selected }) => {
    return (
        <div className={`hardware-node peristaltic-pump-node ${selected ? 'selected' : ''}`}>
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

                <div className="hardware-node-settings">
                    {/*placeholder*/}
                </div>
            </div>
        </div>
    );
};

export default memo(PeristalticPumpNode);
