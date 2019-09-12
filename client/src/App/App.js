import React, { useState } from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import { Router } from "@reach/router";
import "normalize.css";
import "./app.scss";
import PreferenceForm from "../PreferenceForm";
import member from "../member";
import Header, { HeaderMessageContext } from "../Header";
import Footer from "../Footer";
import Unsubscribe from "../Unsubscribe";

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_GRAPHQL_URI
      : "/",
  resolvers: [member.resolvers]
});

const App = () => {
  const [message, setMessage] = useState({
    title: "",
    content: ""
  });
  return (
    <ApolloProvider client={client}>
      <HeaderMessageContext.Provider value={[message, setMessage]}>
        <div className="wrapper">
          <Header />
          <div className="container">
            <Router basepath={process.env.PUBLIC_URL}>
              <PreferenceForm path="/:email" />
              <PreferenceForm path="/:email/:recipientId" />
              <Unsubscribe path="/unsubscribe/:optOut/:email/:recipientId" />
              <Unsubscribe path="/unsubscribe/:optOut/:email" />
            </Router>
          </div>
          <Footer />
        </div>
      </HeaderMessageContext.Provider>
    </ApolloProvider>
  );
};

export default App;
