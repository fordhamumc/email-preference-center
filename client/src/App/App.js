import React, { useState } from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import { Router } from "@reach/router";
import "normalize.css";
import "./app.scss";
import PreferenceForm from "../PreferenceForm";
import member from "../member";
import Header from "../Header";
import Footer from "../Footer";

const client = new ApolloClient({
  uri: "/",
  resolvers: [member.resolvers]
});

const App = () => {
  const [message, setMessage] = useState({
    title: "Fordham Email Preferences",
    content:
      "To set your email preferences, please click the manage preferences link in the footer of a Fordham email."
  });
  return (
    <ApolloProvider client={client}>
      <div className="wrapper">
        <Header message={message} />
        <div className="container">
          <Router>
            <PreferenceForm path="/:email" setMessage={setMessage} />
            <PreferenceForm
              path="/:email/:recipientId"
              setMessage={setMessage}
            />
          </Router>
        </div>
        <Footer />
      </div>
    </ApolloProvider>
  );
};

export default App;
