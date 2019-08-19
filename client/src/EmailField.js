import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_EMAIL = gql`
  mutation SetEmail($input: MemberInput!) {
    setEmail(input: $input) @client
  }
`;

const EmailField = ({ member }) => {
  const [setEmail] = useMutation(SET_EMAIL);
  const handleEmailChange = e =>
    setEmail({
      variables: {
        input: { id: member.id, email: e.target.value }
      }
    });
  return (
    <div className="form-group">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        name="email"
        value={member.email}
        onChange={handleEmailChange}
      />
    </div>
  );
};

export default EmailField;
