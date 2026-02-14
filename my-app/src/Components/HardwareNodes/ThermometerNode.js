import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import './HardwareNode.css';

const ThermometerNode = ({ data, isConnectable, selected }) => {
    const [temperature, setTemperature] = useState(data.settings?.temperature || '');

    const handleTempChange = (e) => {
        setTemperature(e.target.value);

        if (data.onSettingsChange) {
            data.onSettingsChange({ temperature: e.target.value });
        }
    };

    return (
        <div className={`hardware-node thermometer-node ${selected ? 'selected' : ''}`}>
            <Handle
                id="target"
                type="target" // target is for INCOMING
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ left: '25%' }}
            />

            <Handle
                id="source"
                type="source" // source is for OUTGOING
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ left: '75%' }}
            />

            <div className="hardware-node-content">
                <div className="hardware-node-header">
                    {data.label || 'Thermometer'}
                </div>

                <div className="hardware-node-settings">
                    <div className="setting-item">
                        <span className="setting-key">Temp (°C):</span>
                        <input
                            type="number"
                            className="setting-input"
                            value={temperature}
                            onChange={handleTempChange}
                            placeholder="xx"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ThermometerNode);
