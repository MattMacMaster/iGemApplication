import { useState } from 'react';

const Sidemenu = ({
    isOpen,
    toggleMenu,
    onResetCanvas,
    onToggleDarkMode,
    isDarkMode,
    onSaveCycle,
    onOpenLoadMenu,
    onSaveEdits,
    exitEditMode,
    editingCycleId,
    editingCycleName,
}) => {
    const [isPartsOpen, setIsPartsOpen] = useState(true);
    const [isOptionsOpen, setIsOptionsOpen] = useState(true);

    const parts = [
        { name: 'Peristaltic Pump', type: 'peristalticPump' },
        { name: 'Spectrometer', type: 'spectrometer' },
        { name: 'Syringe Pump', type: 'syringePump' },
        { name: 'Electroporator', type: 'electroporator' },
        { name: 'Thermometer', type: 'thermometer' }
    ];

    const onDragStart = (event, part) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/reactflow', JSON.stringify({
            type: part.type,
            label: part.name,
            settings: {}
        }));
    };

    return (
        <aside className={`Sidemenu ${isOpen ? 'open' : 'closed'}`}>
            <div className="Sidemenu__panel">
                <button
                    className="Sidemenu__panel-header"
                    onClick={() => setIsPartsOpen(!isPartsOpen)}
                    aria-expanded={isPartsOpen}
                >
                    <span>Parts Menu</span>
                    <span className="Sidemenu__chevron">{isPartsOpen ? '▼' : '▶'}</span>
                </button>
                {isPartsOpen && (
                    <div className="Sidemenu__panel-content">
                        <div className="Sidemenu__parts-list">
                            {parts.map((part, index) => (
                                <div
                                    key={index}
                                    className="Sidemenu__part-item"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, part)}
                                >
                                    {part.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="Sidemenu__panel">
                <button
                    className="Sidemenu__panel-header"
                    onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                    aria-expanded={isOptionsOpen}
                >
                    <span>Options</span>
                    <span className="Sidemenu__chevron">{isOptionsOpen ? '▼' : '▶'}</span>
                </button>
                {isOptionsOpen && (
                    <div className="Sidemenu__panel-content">
                        {editingCycleId != null ? (
                            <>
                                <div className="Sidemenu__editing-label">
                                    Editing: {editingCycleName || editingCycleId}
                                </div>
                                <button type="button" className="Sidemenu_save-btn" onClick={onSaveEdits}>
                                    Save Changes
                                </button>
                                <button type="button" className="Sidemenu__reset-btn" onClick={exitEditMode}>
                                    Exit Edit Mode
                                </button>
                            </>
                        ) : (
                            <button type="button" className="Sidemenu_save-btn" onClick={onSaveCycle}>
                                Save Cycle
                            </button>
                        )}
                        <button type="button" className="Sidemenu_load-btn" onClick={onOpenLoadMenu}>
                            Load Cycle
                        </button>
                        <button type="button" className="Sidemenu__reset-btn" onClick={onResetCanvas}>
                            Reset Canvas
                        </button>
                        <button type="button" className="Sidemenu__dark-mode-btn" onClick={onToggleDarkMode}>
                            {isDarkMode ? 'Light mode' : 'Dark Mode'}
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidemenu