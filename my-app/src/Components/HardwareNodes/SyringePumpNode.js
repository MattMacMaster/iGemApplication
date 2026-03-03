import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import './HardwareNode.css';

const SyringePumpNode = ({ data, isConnectable, selected }) => {
  const [steps, setSteps] = useState(
    data.settings?.steps || ''
  );

  const [boardVal, setBoard] = useState(
    data.settings?.boardVal || ''
  );

  const [message, setMessage] = useState("");

  const [axisVal, setAxis] = useState(
    data.settings?.axisVal || ''
  );

  const [directionVal, setDirection] = useState(
    data.settings?.directionVal || ''
  );

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

  const handleStepChange = (e) => {
    setSteps(e.target.value);

    if (data.onSettingsChange) {
      data.onSettingsChange({ steps: e.target.value });
    }
  };

    const handleBoardChange = (e) => {
    setBoard(e.target.value);

    if (data.onSettingsChange) {
      data.onSettingsChange({ steps: e.target.value });
    }
  };

  const handleAxisChange = (e) => {
    setAxis(e.target.value);

    if (data.onSettingsChange) {
      data.onSettingsChange({ axis: e.target.value });
    }
  };

  return (
    <div className={`hardware-node syringePump-node ${selected ? 'selected' : ''}`}>
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
          {data.label || 'Syringe Pump'}
        </div>

        <div className="hardware-node-settings">
          <div className="setting-item">
            <span className="setting-key">Steps (~6000 Max):</span>
            <input
              type="number"
              className="setting-input"
              value={steps}
              onChange={handleStepChange}
              placeholder="xx"
            />
          </div>
          <div className="setting-item">
            <span className="setting-key">Board (1-4):</span>
            <input
              type="number"
              className="setting-input"
              value={boardVal}
              onChange={handleBoardChange}
              placeholder="xx"
            />
          </div>
          <div className="setting-item">
            <span className="setting-key">Axis (X, Y, Z, A):</span>
            <input
              type="text"
              className="setting-input"
              value={axisVal}
              onChange={handleAxisChange}
              placeholder="-"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          CallBackend({
            type: "Motor",
            board: boardVal,
            axis: axisVal,
            compInstr: { steps: steps, Direction: "down" }
          })
        }
      >
        Test backend - Up
      </button>

      {message && <div>{message}</div>}
    </div>
  );
};

export default memo(SyringePumpNode);