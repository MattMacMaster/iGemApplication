import { useState } from 'react';

const Sidemenu = ({ isOpen, toggleMenu, onResetCanvas }) => {
    const [isPartsMenuOpen, setIsPartsMenuOpen] = useState(false);

    const parts = [
        'Peristaltic Pump',
        'Spectrometer',
        'Syringe Pump',
        'Electroporator',
        'Thermometer'
    ]

    const onDragStart = (event, part) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/reactflow', JSON.stringify({
            type: 'hardware',
            label: part
        }));
    };

    return (
        <div className={`Sidemenu ${isOpen ? 'open' : 'closed'}`}>
            <ul>
                    <div className="parts-menu">
                        <button
                            className="parts-menu-open"
                            onClick={() => setIsPartsMenuOpen(!isPartsMenuOpen)}
                        >
                            Parts Menu {isPartsMenuOpen ? '▼' : '▶'}
                        </button>
                        {isPartsMenuOpen && (
                            <div className="parts-list">
                                {parts.map((part, index) => (
                                    <div
                                        key={index}
                                        className="hardware-item"
                                        draggable
                                        onDragStart={(e) => onDragStart(e, part)}
                                    >
                                        {part}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={onResetCanvas}>Reset Canvas</button>
            </ul>
        </div>
    )
}

export default Sidemenu