import React from 'react';
import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import guitar from './img/guitar.jpg';
import { Header, Player, About, Footer } from './components';

const App = () => { 

  return (
    <div className='App' style={{background:`linear-gradient(45deg, rgba(2,0,36,1) 0%, rgba(3,1,48,0.9) 32%, rgba(5,3,67,0.8) 55%, rgba(9,9,121,0.06206232492997199) 79%, rgba(208,211,224,0) 100%), url(${guitar})`, backgroundSize: "cover", backgroundRepeat: "no-repeat"}}>
      <Header />
        <Router>
          <Routes>
            <Route exact path="/" element={<About />}/>
            <Route path="/about" element={<About />}/>
            <Route path="/player" element={<Player />}/>
            <Route path="*" element={() => { <div><h2>Sorry, We couldnt find the page you're looking for. Click 'Home' to redirect to the homepage.</h2></div>}} />
          </Routes>
        </Router>
      <Footer />
    </div>
    
    
  );
}

export default App;
