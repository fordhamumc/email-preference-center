import React from "react";
import styles from "./Loader.module.scss";

const Loader = ({ done = false, stroke = "#fff", className, ...props }) => (
  <svg
    className={`${className} ${!done ? styles.spinner : ""}`}
    viewBox="0 0 66 66"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="loaderTitle"
    {...props}
  >
    <title id="loaderTitle">{done ? "checkmark" : "loading spinner"}</title>
    {!done && (
      <circle
        className={styles.spinnerCircle}
        fill="none"
        stroke={stroke}
        strokeWidth={6}
        strokeLinecap="round"
        cx="33"
        cy="33"
        r="30"
      ></circle>
    )}
    {done && (
      <path
        className={styles.check}
        fill="none"
        stroke={stroke}
        strokeWidth={5}
        d="M10.6,35.3l13.4,13.6l31.5-31.7"
      />
    )}
  </svg>
);

export default Loader;
