import React from "react";
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

const PreferenceForm = ({ email, recipientId }) => {
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
      navigate(`/${updateMember.email}/${recipientId}`);
    }
  });

  const handleFormSubmit = e => {
    e.preventDefault();
    const { id, email, optOuts } = data.member;

    // still need to add recipientId and status
    const input = {
      id,
      recipientId,
      email,
      optOuts: optOutUpdateFormat(optOuts)
    };

    // if gdpr already exists don't update it
    if (!data.member.gdpr) input.gdpr = true;

    updateMember({ variables: { input } });
  };

  if (loading) return <p>Loading preferences...</p>;
  if (error)
    return (
      <p>
        We're having trouble finding your account. Please contact{" "}
        <a href="mailto:emailmarketing@fordham.edu">
          emailmarketing@fordham.edu
        </a>{" "}
        to update your email preferences.
      </p>
    );
  return (
    <form onSubmit={handleFormSubmit}>
      <EmailField member={data.member} />
      <OptOutSelect member={data.member} />
      <UnsubscribeField member={data.member} />
      <div className={forms.group}>
        <input
          type="submit"
          value="Update Your Preferences"
          className={forms.submitButton}
        />
      </div>
      {mutationLoading && <p>Updating...</p>}
      {mutationError && <p>Please try again.</p>}
      {mutationData && <p>Success</p>}
    </form>
  );
};

export default PreferenceForm;
