import React, { useState } from 'react';
import AuthNavigator from './AuthNavigator';
import PrivateNavigator from './PrivateNavigator';
import PublicNavigator from './PublicNavigator';

export default function AppNavigator() {
  const [userLogged, setUserLogged] = useState(false); // temporário

  if (userLogged) {
    return <PrivateNavigator />;
  } else {
    return <PublicNavigator />; 
  }
}
