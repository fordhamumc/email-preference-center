import React, { useEffect, useState, useContext, Fragment } from "react";
import OptOutSelect, { optOutUpdateFormat } from "../OptOutSelect";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { GET_MEMBER, UPDATE_MEMBER } from "../member";
import { navigate } from "@reach/router";
import forms from "../Form/form.module.scss";
import EmailField from "../EmailField";
import UnsubscribeField from "../UnsubscribeField";
import Loader from "../Loader";
import { HeaderMessageContext } from "../Header";

const PreferenceForm = ({ email, recipientId, location }) => {
  const [, setMessage] = useContext(HeaderMessageContext);
  const input = { recipientId };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) input.email = email;

  const { loading, data } = useQuery(GET_MEMBER, {
    variables: { input },
    onCompleted() {
      if (!location.state) {
        setMessage({
          title: "Set Your Email Preferences",
          content:
            "Please use the options below to customize the types of emails you receive from Fordham."
        });
      }
    },
    onError() {
      setMessage({
        title: "We're having trouble finding your account.",
        content: (
          <Fragment>
            Please contact{" "}
            <a href="mailto:emailmarketing@fordham.edu">
              emailmarketing@fordham.edu
            </a>{" "}
            to update your email preferences.
          </Fragment>
        )
      });
    }
  });

  useEffect(() => {
    if (loading && !location.state) {
      setMessage({ title: "Loading preferences...", content: "" });
    }
  }, [setMessage, loading, location.state]);

  const [
    updateMember,
    { loading: mutationLoading, error: mutationError, data: mutationData }
  ] = useMutation(UPDATE_MEMBER, {
    onCompleted({ member }) {
      setMessage({
        title: "Set Your Email Preferences",
        content: "Your email preferences have been updated."
      });
      console.log(member.email, email);
      if (member.email !== email) {
        navigate(
          `${process.env.PUBLIC_URL}/${member.email}/${
            recipientId ? recipientId : ""
          }`
        );
      }
    }
  });

  const [editing, setEditing] = useState(true);

  const activeControl = useState();
  const [, setActiveControl] = activeControl;
  const handleSubmitFocus = ({ target }) => {
    setActiveControl(target);
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    setEditing(false);
    setActiveControl(e.target);
    const { id, email, status, optOuts, gdpr } = data.member;

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
    if (!gdpr) input.gdpr = true;

    updateMember({ variables: { input } });
  };
  const handleFormFocus = e => {
    setEditing(true);
  };

  const [submitButton, setSubmitButton] = useState({});
  useEffect(() => {
    const button = {
      className: forms.submitButton,
      children: "Update Your Preferences",
      title: null
    };
    if (mutationLoading) {
      button.className = forms.submitButtonLoading;
      button.children = <Loader className={forms.buttonLoadingIcon} />;
      button.title = "Updating Your Information";
    }
    if (mutationData && !editing) {
      button.className = forms.submitButtonSuccess;
      button.children = (
        <Fragment>
          <Loader className={forms.buttonLoadingIcon} done={true} />
          <span className={forms.buttonTextReveal}>Updated</span>
        </Fragment>
      );
      button.title = "Success";
    }
    setSubmitButton(button);
  }, [mutationLoading, mutationData, editing]);

  const [originalStatus, setOriginalStatus] = useState("");
  useEffect(() => {
    if (data && data.member && !originalStatus) {
      setOriginalStatus(data.member.status);
    }
    if (mutationData && mutationData.member) {
      setOriginalStatus(mutationData.member.status);
    }
  }, [data, mutationData, originalStatus]);

  if (loading) return <Loader stroke="#900028" />;
  if (data && data.member) {
    return (
      <div>
        <form
          onSubmit={handleFormSubmit}
          onClick={handleFormFocus}
          onFocus={handleFormFocus}
        >
          <EmailField
            member={data.member}
            disabled={mutationLoading}
            active={activeControl}
          />
          <OptOutSelect
            member={data.member}
            disabled={mutationLoading}
            active={activeControl}
          />
          <UnsubscribeField
            member={data.member}
            disabled={mutationLoading}
            originalStatus={originalStatus}
            active={activeControl}
          />
          <div className={forms.group}>
            <div className={forms.submitButtonContainer}>
              <button
                type="submit"
                onFocus={handleSubmitFocus}
                disabled={mutationLoading || (mutationData && !editing)}
                {...submitButton}
              />
              {mutationError && <p>Please try again.</p>}
            </div>
          </div>
        </form>
      </div>
    );
  }
  return null;
};

export default PreferenceForm;
