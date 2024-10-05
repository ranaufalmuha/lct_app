import React, { useEffect, useState } from 'react';
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as myCanisterIdl, canisterId as myCanisterId } from './declarations/myCanister';

function App() {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const callCanister = async () => {
      const agent = new HttpAgent();
      const myCanister = Actor.createActor(myCanisterIdl, { agent, canisterId: myCanisterId });

      const response = await myCanister.myFunction();
      setResponse(response);
    };

    callCanister();
  }, []);

  return (
    <div>
      <h1>Response from canister:</h1>
      {response && <p>{response}</p>}
    </div>
  );
}

export default App;