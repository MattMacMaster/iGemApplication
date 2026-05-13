import React from "react";

const SystemPanel = ({ nodes, edges }) => {
  return (
    <div className="system-panel">
      <h3 className="system-panel__title">
        System Panel
      </h3>

      <div className="system-panel__section">
        <div className="system-panel__section-title">
          Components ({nodes.length})
        </div>

        <ul>
          {nodes.map((item) => (
            <li key={item.id}>
              {item.data.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="system-panel__section">
        <div className="system-panel__section-title">
          Connections ({edges.length})
        </div>

        <ul>
          {edges.map((item) => (
            <li key={item.id}>
              {item.source} → {item.target}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SystemPanel;