import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { User } from './types';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Store from './components/Store';
import Orders from './components/Orders';
import AdminPanel from './components/AdminPanel';
import useKeyboardShortcut from './hooks/useKeyboardShortcut';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  useKeyboardShortcut('lachlanadmin', () => {
    setShowAdmin(true);
    toast.success('Admin panel unlocked!');
  });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUser({ ...snapshot.val(), uid: firebaseUser.uid });
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Navbar user={user} showAdmin={showAdmin} />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={user ? <Store user={user} /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/orders" element={user ? <Orders user={user} /> : <Navigate to="/login" />} />
            {showAdmin && (
              <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/login" />} />
            )}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
