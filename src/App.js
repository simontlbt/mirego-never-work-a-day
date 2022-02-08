import "./App.css";
import { Router } from "./Router";
import { Moments } from "./pages/moments";
import { Moment } from "./pages/moment";

function App() {
  return (
    <div className="app">
      <div className="container">
        <Router
          classname="router"
          routes={[
            [/^\/$/, Moments],
            [/^\/moment\/(.*)$/, Moment],
          ]}
        />
      </div>
    </div>
  );
}

export default App;
