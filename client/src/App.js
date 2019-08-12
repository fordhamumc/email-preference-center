import React, { Component } from "react";
// import './App.css';

import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import ApolloClient, { gql } from "apollo-boost";

const client = new ApolloClient({
  uri: "/"
});

const GET_MEMBER = gql`
  query getMember($input: MemberInput!) {
    member(input: $input) {
      firstName
      lastName
      optOuts
    }
  }
`;

const Member = () => {
  const { loading, error, data } = useQuery(GET_MEMBER, {
    variables: {
      input: { email: "mifoley@fordham.edu", recipientId: "141123581359" }
    }
  });
  console.log(data);
  if (loading) return <p>Loading ...</p>;
  if (error) return <p>Error :(</p>;
  return (
    <div>
      <h1>
        Unsubscribes for {data.member.firstName} {data.member.lastName}
      </h1>
      <ul>
        {data.member.optOuts.map(optOut => (
          <li key="optOut">{optOut}</li>
        ))}
      </ul>
    </div>
  );
};

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <Member />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
