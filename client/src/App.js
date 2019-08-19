import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import { Router } from "@reach/router";
import PreferenceForm from "./PreferenceForm";
import member from "./member";

const client = new ApolloClient({
  uri: "/",
  resolvers: [member.resolvers]
});

const App = () => (
  <ApolloProvider client={client}>
    <div>
      <Router>
        <PreferenceForm path="/:email" />
        <PreferenceForm path="/:email/:recipientId" />
      </Router>
    </div>
  </ApolloProvider>
);

export default App;
