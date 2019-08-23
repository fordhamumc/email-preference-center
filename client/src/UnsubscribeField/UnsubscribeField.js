import React, { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import forms from "../Form/form.module.scss";

const SET_STATUS = gql`
  mutation SetStatus($input: MemberInput!) {
    setStatus(input: $input) @client
  }
`;

export const isUnsubscribed = status => {
  return ["unsubscribed", "cleaned"].includes(status);
};

const UnsubscribeField = ({
  member: { id, current, status },
  originalStatus,
  active,
  ...props
}) => {
  const [setStatus] = useMutation(SET_STATUS);
  const [isFocused, setIsFocused] = useState(false);

  const toggleFocus = ({ type }) => {
    let newState = !isFocused;
    if (type === "focus") newState = true;
    if (type === "blur") newState = false;
    setIsFocused(newState);
  };

  const [, setActiveControl] = active;
  const handleUnsubscribeFocus = e => {
    toggleFocus(e);
    setActiveControl(e.target);
  };

  const handleUnsubscribeChange = e => {
    const variables = {
      input: {
        id,
        status: e.target.checked
          ? "unsubscribed"
          : originalStatus === "subscribed"
          ? "subscribed"
          : "pending"
      }
    };
    setStatus({ variables });
  };
  return (
    <div className={forms.group}>
      {isUnsubscribed(status) && (
        <div className={forms.toggleLabel}>Unsubscribe</div>
      )}
      <label
        className={`${
          isUnsubscribed(status) ? forms.checkboxActive : forms.checkbox
        } ${isFocused ? forms.checkboxFocused : forms.checkbox}`}
      >
        <input
          {...props}
          type="checkbox"
          name="unsubscribe"
          className={forms.checkboxInput}
          onChange={handleUnsubscribeChange}
          onFocus={handleUnsubscribeFocus}
          onBlur={toggleFocus}
          checked={isUnsubscribed(status)}
        />
        Unsubscribe from all {current && "non-mandatory"} Fordham emails.
      </label>
    </div>
  );
};

export default UnsubscribeField;
