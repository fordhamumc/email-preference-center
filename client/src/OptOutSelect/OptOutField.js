import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import styles from "./OptOutSelect.module.css";

const ADD_OPT_OUT = gql`
  mutation AddOptOut($input: MemberInput!) {
    addOptOut(input: $input) @client
  }
`;

const OptOutField = ({ optOut, memberId: id, selected }) => {
  const [addOptOut] = useMutation(ADD_OPT_OUT);
  const dispatchOptOut = () =>
    addOptOut({ variables: { input: { id, name: optOut.name } } });

  const handleOptOutClick = () => {
    dispatchOptOut();
  };

  const handleOptOutDown = ({ key }) => {
    if (key === "Enter") dispatchOptOut();
  };

  return (
    <li
      role="option"
      aria-selected={selected}
      onClick={handleOptOutClick}
      onKeyDown={handleOptOutDown}
      className={styles.option}
    >
      {optOut.label}
      {optOut.description && (
        <small className={styles.description}>{optOut.description}</small>
      )}
    </li>
  );
};

export default OptOutField;
