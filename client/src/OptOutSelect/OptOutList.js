import React, { useEffect, useRef } from "react";
import styles from "./OptOutSelect.module.scss";
import OptOutField from "./OptOutField";
import { camelCase } from "../utils";

const OptOutList = ({ list, activeState, memberId, className, ...props }) => {
  const [active, setActive] = activeState;
  const activeEl = useRef();
  useEffect(() => {
    if (list.length && !list.includes(active)) setActive(list[0]);
  }, [list, active, setActive]);

  useEffect(() => {
    if (active) {
      activeEl.current.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  const getOptionHoverHandler = item => {
    return () => setActive(item);
  };

  return (
    <ul
      {...props}
      tabIndex="1"
      role="listbox"
      className={[styles.list, className].join(" ")}
    >
      {list.length === 0 && (
        <li className={styles.optionEmpty}>Nothing matches your search.</li>
      )}
      {list.map(item => (
        <OptOutField
          id={camelCase(`optOut ${item.name}`)}
          key={item.name}
          item={item}
          memberId={memberId}
          className={active === item ? styles.optionActive : ""}
          onMouseEnter={getOptionHoverHandler(item)}
          ref={active === item ? activeEl : null}
        />
      ))}
    </ul>
  );
};

export default OptOutList;
