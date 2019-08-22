import React, { useEffect, useState } from "react";
import OptOutSelect, { optOutUpdateFormat } from "../OptOutSelect";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { navigate } from "@reach/router";
import forms from "../Form/form.module.scss";
import EmailField from "../EmailField";
import UnsubscribeField from "../UnsubscribeField";

const MEMBER_FRAGMENT = gql`
  fragment memberFields on Member {
    id
    firstName
    lastName
    status
    email
    optOuts
    gdpr
    current
    recipientId
  }
`;

const GET_MEMBER = gql`
  query getMember($input: MemberInput!) {
    member(input: $input) {
      ...memberFields
    }
  }
  ${MEMBER_FRAGMENT}
`;

const UPDATE_MEMBER = gql`
  mutation UpdateMember($input: MemberUpdateInput!) {
    updateMember(input: $input) {
      ...memberFields
    }
  }
  ${MEMBER_FRAGMENT}
`;

const PreferenceForm = ({ email, recipientId, setMessage }) => {
  const input = { recipientId };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) input.email = email;

  const { loading, error, data } = useQuery(GET_MEMBER, {
    variables: { input }
  });

  const [
    updateMember,
    { loading: mutationLoading, error: mutationError, data: mutationData }
  ] = useMutation(UPDATE_MEMBER, {
    onCompleted({ updateMember }) {
      navigate(
        `${process.env.REACT_APP_BASE_PATH || ""}/${updateMember.email}/${
          recipientId ? recipientId : ""
        }`
      );
    }
  });

  const [editing, setEditing] = useState(true);

  const handleFormSubmit = e => {
    e.preventDefault();
    setEditing(false);
    const { id, email, status, optOuts } = data.member;

    // if recipient id is not provided get it from the data object
    recipientId = recipientId || data.member.recipientId;

    const input = {
      id,
      recipientId,
      email,
      status,
      optOuts: optOutUpdateFormat(optOuts)
    };

    // if gdpr already exists don't update it
    if (!data.member.gdpr) input.gdpr = true;

    updateMember({ variables: { input } });
  };
  const handleFormFocus = e => {
    setEditing(true);
  };

  useEffect(() => {
    const message = { title: "", content: "" };
    if (error) {
      message.title = "We're having trouble finding your account.";
      message.content = (
        <p>
          Please contact{" "}
          <a href="mailto:emailmarketing@fordham.edu">
            emailmarketing@fordham.edu
          </a>{" "}
          to update your email preferences.
        </p>
      );
    } else if (loading) {
      message.title = "Loading preferences...";
      message.content = "";
    } else {
      message.title = "Set Your Email Preferences";
      message.content =
        "Fordham University will use the information you provide on this form to stay in touch with you. Please use the options below to customize the types of emails you receive from Fordham.";
    }
    setMessage(message);
  }, [setMessage, error, loading]);

  const [submitButton, setSubmitButton] = useState({});
  useEffect(() => {
    const button = {
      className: forms.submitButton,
      text: "Update Your Preferences"
    };
    if (mutationLoading) {
      button.className = forms.submitButtonLoading;
      button.text = "Updating...";
    }
    if (mutationData && !editing) {
      button.className = forms.submitButtonSuccess;
      button.text = "Success!";
    }
    setSubmitButton(button);
  }, [mutationLoading, mutationData, editing]);

  const [originalStatus, setOriginalStatus] = useState("");
  useEffect(() => {
    if (data && data.member && !originalStatus) {
      setOriginalStatus(data.member.status);
    }
    if (mutationData && mutationData.updateMember) {
      setOriginalStatus(mutationData.updateMember.status);
    }
  }, [data, mutationData, originalStatus]);

  if (error || loading) return null;
  return (
    <form
      onSubmit={handleFormSubmit}
      onClick={handleFormFocus}
      onFocus={handleFormFocus}
    >
      <EmailField member={data.member} disabled={mutationLoading} />
      <OptOutSelect member={data.member} disabled={mutationLoading} />
      <UnsubscribeField
        member={data.member}
        disabled={mutationLoading}
        originalStatus={originalStatus}
      />
      <div className={forms.group}>
        <div className={forms.submitButtonContainer}>
          <input
            type="submit"
            value={submitButton.text}
            disabled={mutationLoading || (mutationData && !editing)}
            className={submitButton.className}
          />
          {mutationError && <p>Please try again.</p>}
        </div>
      </div>
    </form>
  );
};

export default PreferenceForm;
