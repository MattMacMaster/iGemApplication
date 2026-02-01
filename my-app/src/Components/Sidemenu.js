
const Sidemenu = ({ isOpen, toggleMenu }) => {
    return (
        <div className={`Sidemenu ${isOpen ? 'open' : 'closed'}`}>
            <ul>
                <li>
                    <a href='/'>Parts Menu</a>
                </li>
            </ul>
        </div>
    )
}

export default Sidemenu
