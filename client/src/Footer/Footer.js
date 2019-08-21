import React from "react";
import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={`container ${styles.footer}`}>
      <div className={styles.container}>
        <p>
          You can change your mind at any time by using the unsubscribe link in
          the footer of all the emails you receive from us, or by sending an
          email to{" "}
          <a href="mailto:emailmarketing@fordham.edu">
            emailmarketing@fordham.edu
          </a>
          . You can also review our{" "}
          <a href="https://www.fordham.edu/info/21366/policies/8331/privacy_policy">
            privacy policy
          </a>
          . By submitting this form, you agree that we may process your
          information in accordance with these terms.
        </p>
        <p>
          We use MailChimp and Acoustic as our marketing automation platforms.
          By submitting this form, you acknowledge that the information you
          provide will be transferred to MailChimp for processing in accordance
          with their{" "}
          <a href="https://mailchimp.com/legal/privacy/">privacy policy</a> and{" "}
          <a href="https://mailchimp.com/legal/terms/">terms</a> and also to
          Acoustic in accordance with their{" "}
          <a href="https://acoustic.co/privacy-policy/">privacy policy</a> and{" "}
          <a href="https://acoustic.co/terms-conditions/">terms</a>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
