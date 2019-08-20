import React from "react";
import styles from "./OptOutSelect.module.css";
import OptOutField from "./OptOutField";

const OptOutList = ({ list, memberId, className, ...props }) => {
  return (
    <ul
      tabIndex="-1"
      role="listbox"
      className={[styles.list, className].join(" ")}
      {...props}
    >
      {list.map(optOut => (
        <OptOutField key={optOut.name} optOut={optOut} memberId={memberId} />
      ))}
    </ul>
  );
};

export default OptOutList;
