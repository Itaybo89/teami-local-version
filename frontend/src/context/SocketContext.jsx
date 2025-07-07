// FILE: src/context/SocketContext.jsx
// Purpose: Provides a shared WebSocket connection instance to all components
//          wrapped within it, using React's Context API.

import React, { createContext, useContext, useEffect, useState } from 'react';

// Load the WebSocket URL from environment variables, with a fallback for local development.
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:5000';

// Create a new context to hold the WebSocket instance. Initial value is null.
const SocketContext = createContext(null);

/**
 * A custom hook that provides easy access to the WebSocket instance from any component
 * within the SocketProvider.
 * @returns {WebSocket | null} The WebSocket instance, or null if not yet connected.
 */
export const useSocket = () => useContext(SocketContext);

/**
 * A provider component that establishes and manages the WebSocket connection lifecycle.
 * It makes the active WebSocket instance available to all of its children components
 * via the `useSocket` hook.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components to be rendered within this provider.
 */
export const SocketProvider = ({ children }) => {
  // State to hold the active WebSocket instance.
  const [socket, setSocket] = useState(null);

  // The main effect for managing the WebSocket connection lifecycle.
  // The empty dependency array [] ensures this effect runs only once when the
  // component mounts and the cleanup function runs when it unmounts.
  useEffect(() => {
    console.log('🌐 Attempting to connect to WebSocket...');
    const ws = new WebSocket(WEBSOCKET_URL);

    // Event handler for when the connection is successfully established.
    ws.onopen = () => {
      console.log('✅ WebSocket connection established.');
      // Store the active WebSocket instance in state, making it available to consumers.
      setSocket(ws);
    };

    // Event handler for when the connection is closed.
    ws.onclose = () => {
      console.log('🔌 WebSocket connection closed.');
      // Clear the socket from state.
      setSocket(null);
    };

    // Event handler for any connection errors.
    ws.onerror = (error) => {
      console.error('❗ WebSocket error:', error);
    };

    // The cleanup function for this effect. It will be called when the
    // SocketProvider component is unmounted from the DOM.
    return () => {
      // Check if the WebSocket is still open before attempting to close it.
      if (ws.readyState === WebSocket.OPEN) {
        console.log('🔌 Closing WebSocket connection...');
        ws.close();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount.

  return (
    // Provide the socket instance (or null) to all children components.
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
