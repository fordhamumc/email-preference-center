import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_STATUS = gql`
  mutation SetStatus($input: MemberInput!) {
    setStatus(input: $input) @client
  }
`;

const UnsubscribeField = ({ member: { id, current, status } }) => {
  const [setStatus] = useMutation(SET_STATUS);

  const handleUnsubscribeChange = e => {
    const variables = {
      input: { id, status: e.target.checked ? "unsubscribed" : "subscribed" }
    };
    setStatus({ variables });
  };
  return (
    <label>
      <input
        type="checkbox"
        name="unsubscribe"
        onChange={handleUnsubscribeChange}
        checked={["unsubscribed", "cleaned"].includes(status)}
      />
      Unsubscribe from all {current && "non-mandatory"} Fordham emails.
    </label>
  );
};

export default UnsubscribeField;
