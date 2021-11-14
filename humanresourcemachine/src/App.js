import { Switch as Routes, Route} from "react-router-dom";
import MainPage from './pages/mainPage';
import Game from "./pages/game";
import Challenges from "./pages/challenges";

function App() {
  return (
    <div className="main">
      <Routes>
        <Route exact path={"/"} component={MainPage} />
        <Route exact path={"/challenges"} component={Challenges} />
        <Route exact path={"/game"} component={Game} />
      </Routes>
    </div>
  );
}

export default App;
