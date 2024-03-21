import Home from './views/home'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom"

function App() {
  return (
    <Router>
      <div>
        {/* <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>

          </ul>
        </nav> */}

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Routes>
          <Route path="/" element={<Home/>}>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
