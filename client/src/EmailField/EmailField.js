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

const EmailField = ({ member, active, disabled, ...props }) => {
  const [setEmail] = useMutation(SET_EMAIL);
  const handleEmailChange = e =>
    setEmail({
      variables: {
        input: { id: member.id, email: e.target.value }
      }
    });

  const [, setActiveControl] = active;
  const handleEmailFocus = ({ target }) => {
    setActiveControl(target);
  };

  return (
    <div className={forms.group}>
      <label htmlFor="email" className={forms.label}>
        Email
      </label>
      <input
        {...props}
        id="email"
        type="email"
        name="email"
        className={forms.control}
        value={member.email}
        onFocus={handleEmailFocus}
        onChange={handleEmailChange}
        disabled={disabled || isUnsubscribed(member.status)}
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
