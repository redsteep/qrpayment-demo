import 'bootstrap/dist/css/bootstrap.min.css'

import './App.css'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap' 
import { Link, Outlet } from 'react-router-dom';

function App() {
  const renderMainPage = () => {
    return (
      <div className='app'>
        <div className='d-flex flex-row'>
          <div className='leftmenu d-flex flex-grow-2 '>
            <ToggleButtonGroup className='d-flex flex-column flex-grow-2' name='sd' type='radio' defaultValue={0}>
              <Link to="/">
                <ToggleButton value={0} className="menubutton">
                  Home  
                </ToggleButton>
              </Link>
              <Link to="/payment">
                <ToggleButton value={1} className="menubutton">
                  Create payment link
                </ToggleButton>
              </Link>
              <Link to="/history">
                <ToggleButton value={2} className="menubutton">
                  Transactions
                </ToggleButton>
              </Link>              
            </ToggleButtonGroup>
          </div>
          <div className='page d-flex flex-column flex-grow-1'>
            <div className='header'>
            </div>
            <div className='body'>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return renderMainPage()
}

export default App
