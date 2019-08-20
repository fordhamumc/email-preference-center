import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

const ADD_OPT_OUT = gql`
  mutation AddOptOut($input: MemberInput!) {
    addOptOut(input: $input) @client
  }
`;

const OptOutField = ({ optOut, member: { id, optOuts }, selected }) => {
  const [addOptOut] = useMutation(ADD_OPT_OUT);

  const handleOptOutClick = () => {
    addOptOut({ variables: { input: { id, name: optOut.name } } });
  };

  const handleOptOutDown = ({ key }) => {
    if (key === "Enter") {
      addOptOut({ variables: { input: { id, name: optOut.name } } });
    }
  };

  return (
    <li
      role="option"
      aria-selected={selected}
      onClick={handleOptOutClick}
      onKeyDown={handleOptOutDown}
    >
      {optOut.label}
      {optOut.description && <small>{optOut.description}</small>}
    </li>
  );
};

export default OptOutField;
