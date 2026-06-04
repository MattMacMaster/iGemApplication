import { useState } from 'react';

const AgentMenu = ({ isOpen }) => {
    return (
        <aside className={`AgentMenu ${isOpen ? 'open' : 'closed'}`}>
            <div className="AgentMenu__panel">
                <div className="AgentMenu__panel-header">
                    <span>Agent Assistant</span>
                </div>
                <div className="AgentMenu__panel-content">
                    <p className="AgentMenu__chat">hello</p>
                </div>
            </div>
        </aside>
    );
};

export default AgentMenu