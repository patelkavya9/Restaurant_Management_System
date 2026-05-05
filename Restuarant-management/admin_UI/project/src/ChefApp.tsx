import React, { useState } from 'react';
import ChefSignIn from './components/ChefSignIn';
import ChefDashboard from './components/ChefDashboard';

const ChefApp: React.FC = () => {
  const [signedInChef, setSignedInChef] = useState<string | null>(null);

  if (!signedInChef) {
    return <ChefSignIn onSignIn={setSignedInChef} />;
  }

  return <ChefDashboard chefId={signedInChef} />;
};

export default ChefApp;
