import React, { Fragment, useContext, useEffect } from "react";
import { useMutation } from "@apollo/react-hooks";
import { navigate } from "@reach/router";
import md5 from "md5";
import { UPDATE_MEMBER } from "../member";
import Loader from "../Loader";
import optOutOptions from "../OptOutSelect/optOutOptions";
import { HeaderMessageContext } from "../Header";

const Unsubscribe = ({ optOut, email, recipientId }) => {
  const [updateMember, { loading, error, data }] = useMutation(UPDATE_MEMBER);
  const [, setMessage] = useContext(HeaderMessageContext);
  const path = `${process.env.PUBLIC_URL}/${email}/${
    recipientId ? recipientId : ""
  }`;

  useEffect(() => {
    if (error) {
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
    } else if (loading) {
      setMessage({ title: "Processing your request...", content: "" });
    } else if (data) {
      setMessage({
        title: `Unsubscribed from ${optOut}`,
        content: (
          <Fragment>
            You have been successfully removed from {optOut} emails. If you
            would like to further customize the emails you receive from Fordham,
            please use the form below.
          </Fragment>
        )
      });
    }
  }, [setMessage, error, loading, data, optOut]);

  useEffect(() => {
    if (optOutOptions.hasOwnProperty(optOut)) {
      const input = { recipientId, optOuts: [{ name: optOut, optOut: true }] };
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) input.id = md5(email);
      updateMember({ variables: { input } });
    } else {
      navigate(path, { state: { success: false }, replace: true });
    }
  }, [optOut, email, path, recipientId, updateMember]);

  useEffect(() => {
    if (data) navigate(path, { state: { success: true }, replace: true });
  }, [path, data]);

  if (loading) return <Loader />;
  return null;
};

export default Unsubscribe;
