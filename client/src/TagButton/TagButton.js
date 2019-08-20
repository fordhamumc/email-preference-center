import React from "react";
import styles from "./TagButton.module.css";

const TagButton = ({ onClick, label }) => (
  <div className={styles.button}>
    <div className={styles.text}>{label}</div>
    <button
      className={styles.close}
      aria-label={`Resubscribe to ${label}`}
      onClick={onClick}
    >
      &times;
    </button>
  </div>
);

export default TagButton;
