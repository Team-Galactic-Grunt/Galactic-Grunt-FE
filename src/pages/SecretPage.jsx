import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SecretPage() {
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyX') {
        navigate('/map');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return <div>SecretPage</div>;
}
