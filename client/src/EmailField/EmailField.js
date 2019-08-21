import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import forms from "../Form/form.module.scss";
import { isUnsubscribed } from "../UnsubscribeField";

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
    <div className={forms.group}>
      <label htmlFor="email" className={forms.label}>
        Email
      </label>
      <input
        id="email"
        type="email"
        name="email"
        className={forms.control}
        value={member.email}
        onChange={handleEmailChange}
        disabled={isUnsubscribed(member.status)}
        title={
          isUnsubscribed(member.status)
            ? "Please resubscribe before updating your email address."
            : ""
        }
      />
    </div>
  );
};

export default EmailField;
