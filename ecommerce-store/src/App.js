import './App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import Header from './containters/Header';
import ProductListing from './containters/PoductListing';
import ProductDetails from './containters/ProductDetails';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Switch>
        <Route path="/" exact component={ProductListing} />
        <Route path="/product/:productID" exact component={ProductDetails} />
        <Route>404 Not Found</Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
