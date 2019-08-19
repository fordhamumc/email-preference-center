import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import optOutOptions from "./optOutOptions";

const UPDATE_OPT_OUT = gql`
  mutation UpdateOptOut($input: MemberInput!) {
    updateOptOut(input: $input) @client
  }
`;
const DELETE_OPT_OUT = gql`
  mutation DeleteOptOut($input: MemberInput!) {
    deleteOptOut(input: $input) @client
  }
`;

const OptOutField = ({ optOut, member }) => {
  const [updateOptOut] = useMutation(UPDATE_OPT_OUT);
  const [deleteOptOut] = useMutation(DELETE_OPT_OUT);
  const optOutsDetails = optOutOptions[optOut];

  const handleOptOutChange = e => {
    const variables = { input: { id: member.id, name: optOut } };
    if (e.target.checked) {
      updateOptOut({ variables });
    } else {
      deleteOptOut({ variables });
    }
  };

  return (
    <li>
      <label>
        <input
          name={optOut}
          type="checkbox"
          checked={member.optOuts.includes(optOut)}
          onChange={handleOptOutChange}
        />
        {optOutsDetails.name || optOut}
        {optOutsDetails.description && (
          <small>{optOutsDetails.description}</small>
        )}
      </label>
    </li>
  );
};

export default OptOutField;
