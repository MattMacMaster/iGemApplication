import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import './HardwareNode.css';

const ElectroporatorNode = ({ data, isConnectable, selected }) => {
    return (
        <div className={`hardware-node electroporator-node ${selected ? 'selected' : ''}`}>
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
                    {data.label || 'Electroporator'}
                </div>

                <div className="hardware-node-settings">
                    {/*placeholder*/}
                </div>
            </div>
        </div>
    );
};

export default memo(ElectroporatorNode);
