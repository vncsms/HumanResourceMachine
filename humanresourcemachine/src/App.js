import { Routes, Route} from "react-router-dom";
import MainPage from './pages/mainPage';
import Game from "./pages/game";
import Challenges from "./pages/challenges";

function App() {
  return (
    <div className="main">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/game" element={<Game />} />
        <Route path="/challenges" element={<Challenges />} />
      </Routes>
    </div>
  );
}

export default App;
