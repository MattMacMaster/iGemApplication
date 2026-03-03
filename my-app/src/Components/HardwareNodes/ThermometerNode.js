import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import './HardwareNode.css';

const ThermometerNode = ({ data, isConnectable, selected }) => {
  const [temperature, setTemperature] = useState(
    data.settings?.temperature || ''
  );

  const [message, setMessage] = useState("");

  const CallBackend = async (payload) => {
    try {
      const res = await fetch("http://localhost:5001/api/instr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error("Backend error:", err);
    }
  };

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

      <button
        onClick={() =>
          CallBackend({
            type: "Motor",
            board: 2,
            axis: "Z",
            compInstr: { steps: 2000, Direction: "up" }
          })
        }
      >
        Test backend - Up
      </button>

      {message && <div>{message}</div>}
    </div>
  );
};

export default memo(ThermometerNode);