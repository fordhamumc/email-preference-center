import React from "react";
import styles from "./TagButton.module.css";

const TagButton = ({ onClick, label, ...props }) => {
  const handleCloseDown = e => {
    if (e.key === "Backspace") {
      onClick(e);
    }
  };
  return (
    <div className={styles.button}>
      <div className={styles.text}>{label}</div>
      <button
        {...props}
        className={styles.close}
        aria-label={`Resubscribe to ${label}`}
        onClick={onClick}
        onKeyDown={handleCloseDown}
      >
        &times;
      </button>
    </div>
  );
};

export default TagButton;
