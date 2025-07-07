// FILE: src/pages/Home.jsx
// Purpose: Defines the public-facing landing page for unauthenticated users.
// This component features a simple content carousel and allows users to
// switch between login and registration forms.

import React, { useState, useEffect } from 'react';
import LoginBox from '../components/auth/LoginBox';
import RegisterBox from '../components/auth/RegisterBox';
import '../styles/home.css';

/**
 * The Home page component.
 * It manages the state for a simple rotating content display (images and titles)
 * and toggles between the LoginBox and RegisterBox components.
 */
const Home = () => {
  // State to track the current index for the rotating images and titles.
  const [index, setIndex] = useState(0);
  // State to track the current mode, either 'login' or 'register'.
  const [mode, setMode] = useState('login');

  // Arrays containing the content for the rotating carousel.
  const images = ["/assets/homePic1.jpg", "/assets/homePic2.jpg"];
  const titles = ["Your New Team!", "Easy Team Creation!"];

  // A useEffect hook to handle the timed rotation of the content carousel.
  useEffect(() => {
    // Set up an interval that updates the index every 3 seconds.
    const interval = setInterval(() => {
      // Use the previous state to calculate the next index, looping back to 0.
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    // The cleanup function for the effect. This will be called when the
    // component unmounts, preventing memory leaks by clearing the interval.
    return () => clearInterval(interval);
  }, []); // The empty dependency array ensures this effect runs only once on component mount.

  return (
    <div className="home-container">
      {/* The left-hand section displaying marketing content. */}
      <div className="content-section">
        <h1>Tea Mi - Team AI</h1>
        {/* The title and image dynamically update based on the current 'index' state. */}
        <h2>{titles[index]}</h2>
        <img src={images[index]} alt="AI Worker" className="main-image" />
      </div>

      {/* The right-hand section conditionally renders either the login or register form. */}
      {mode === 'login' ? (
        <LoginBox onSwitch={() => setMode('register')} />
      ) : (
        <RegisterBox onSwitch={() => setMode('login')} />
      )}
    </div>
  );
};

export default Home;
