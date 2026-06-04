import { useState } from 'react';

const AgentMenu = ({ isOpen }) => {
    const [input, setInput] = useState('');

    const handleClear = () => {
        setInput('');
    };

    const handleSend = (event) => {
        event.preventDefault();
        // ollama wiring here i think
        setInput('');
    };

    return (
        <aside className={`AgentMenu ${isOpen ? 'open' : 'closed'}`}>
            <div className="AgentMenu__panel-header">
                <span>Agent Assistant</span>
            </div>

            <div className="AgentMenu__messages" />

            <form className="AgentMenu__composer" onSubmit={handleSend}>
                <textarea
                    className="AgentMenu__input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter message here..."
                    rows={3}
                />
                <div className="AgentMenu__composer-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleClear}
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        className="btn-secondary AgentMenu__send-btn"
                        aria-label="Send message"
                    >
                        ↑
                    </button>
                </div>
            </form>
        </aside>
    );
};

export default AgentMenu;
