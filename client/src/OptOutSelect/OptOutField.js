import React, { forwardRef } from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import styles from "./OptOutSelect.module.scss";

const ADD_OPT_OUT = gql`
  mutation AddOptOut($input: MemberInput!) {
    addOptOut(input: $input) @client
  }
`;

const OptOutField = forwardRef(
  ({ item, memberId: id, selected, className, setFocus, ...props }, ref) => {
    const [addOptOut] = useMutation(ADD_OPT_OUT);
    const dispatchOptOut = () =>
      addOptOut({ variables: { input: { id, name: item.name } } });

    const handleOptOutClick = () => {
      setFocus();
      dispatchOptOut();
    };

    const handleOptOutDown = ({ key }) => {
      if (key === "Enter") dispatchOptOut();
    };

    return (
      <li
        {...props}
        role="option"
        aria-selected={selected}
        onClick={handleOptOutClick}
        onTouchEnd={handleOptOutClick}
        onKeyDown={handleOptOutDown}
        className={`${className} ${styles.option}`}
        ref={ref}
      >
        {item.label}
        {item.description && (
          <small className={styles.description}>{item.description}</small>
        )}
      </li>
    );
  }
);

export default OptOutField;
