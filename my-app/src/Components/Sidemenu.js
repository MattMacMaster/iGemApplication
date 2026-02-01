
const Sidemenu = ({ isOpen, toggleMenu }) => {
    const parts = [
        'Steppermotor',
        'Peristaltic Pump',
        'Spectrometer',
        'Syringe Pump',
        'Electroporator',
        'Thermometer'
    ]

    return (
        <div className={`Sidemenu ${isOpen ? 'open' : 'closed'}`}>
            <ul>
                    <button>Parts Menu</button>
                    <button>Reset Canvas</button>
            </ul>
        </div>
    )
}

export default Sidemenu
