
const Sidemenu = ({ isOpen, toggleMenu }) => {
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
