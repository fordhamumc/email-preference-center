import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import { Router } from "@reach/router";
import "normalize.css";
import "./defaults/main.css";
import PreferenceForm from "./PreferenceForm";
import member from "./member";

const client = new ApolloClient({
  uri: "/",
  resolvers: [member.resolvers]
});

const App = () => (
  <ApolloProvider client={client}>
    <div className="container">
      <Router>
        <PreferenceForm path="/:email" />
        <PreferenceForm path="/:email/:recipientId" />
      </Router>
    </div>
  </ApolloProvider>
);

export default App;
