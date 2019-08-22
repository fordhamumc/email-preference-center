import React, { useEffect } from "react";
import styles from "./Header.module.scss";

const Header = ({ message }) => {
  useEffect(() => {
    document.title = message.title;
  }, [message]);
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <img
          src={`${process.env.REACT_APP_BASE_PATH || ""}/fordham.png`}
          alt="Fordham"
          className={styles.logo}
        />
      </div>
      {(message.title || message.content) && (
        <div className={styles.intro}>
          <div className={styles.container}>
            <h1 className={styles.title}>{message.title}</h1>
            {message.content && <p>{message.content}</p>}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
