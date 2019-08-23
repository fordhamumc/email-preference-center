import React from "react";
import styles from "./TagButton.module.scss";

const TagButton = ({ onClick, label, ...props }) => {
  const handleCloseDown = e => {
    switch (e.key) {
      case "Backspace":
        break;
      case "ArrowLeft":
        const previousSibling = e.target.parentNode.previousSibling;
        if (previousSibling && previousSibling.lastChild) {
          e.target.parentNode.previousSibling.lastChild.focus();
        }
        break;
      case "ArrowRight":
        const nextSibling = e.target.parentNode.nextSibling;
        if (nextSibling && nextSibling.lastChild) {
          nextSibling.lastChild.focus();
        } else if (nextSibling) {
          nextSibling.focus();
        }
        break;
      default:
        break;
    }
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
        type="button"
      >
        &times;
      </button>
    </div>
  );
};

export default TagButton;
