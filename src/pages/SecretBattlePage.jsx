import React from 'react';
import { useLocation } from 'react-router-dom';

export default function SecretBattlePage() {
  const location = useLocation();
  console.log(location);

  return <div></div>;
}
