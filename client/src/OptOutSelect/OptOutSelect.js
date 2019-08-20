import React, { useState, useEffect, useRef } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import styles from "./OptOutSelect.module.css";
import forms from "../defaults/forms.module.css";
import optOutOptions from "./optOutOptions";
import TagButton from "../TagButton/TagButton";
import OptOutField from "./OptOutField";
import { WSAEWOULDBLOCK } from "constants";

const ADD_OPT_OUT = gql`
  mutation AddOptOut($input: MemberInput!) {
    addOptOut(input: $input) @client
  }
`;
const DELETE_OPT_OUT = gql`
  mutation DeleteOptOut($input: MemberInput!) {
    deleteOptOut(input: $input) @client
  }
`;

const getOptOutDetails = name => {
  const optOut = optOutOptions[name];
  if (!optOut) return null;
  return { ...optOut, name, label: optOut.label || name };
};
const optOutArray = Object.keys(optOutOptions).map(getOptOutDetails);
const getUnselected = optOuts =>
  optOutArray.filter(optOut => !optOuts.includes(optOut.name));

const calcInputWidth = elem => {
  const tmp = document.createElement("div");
  tmp.textContent = [...elem.value].map(l => l + "\u200B").join("");
  console.log(tmp.textContent);
  tmp.className = elem.className;
  tmp.style.width = "auto";
  tmp.style.whiteSpace = "pre-wrap";
  elem.parentNode.append(tmp);
  const tmpWidth = tmp.offsetWidth;
  tmp.remove();
  return tmpWidth;
};

const OptOutSelect = ({ member }) => {
  const selected = member.optOuts.map(getOptOutDetails).filter(Boolean);
  const inputEl = useRef();
  const [searchInput, setSearchInput] = useState("");
  const [searchList, setSearchList] = useState([]);
  useEffect(() => {
    setSearchList(getUnselected(member.optOuts));
  }, [member.optOuts]);

  const [addOptOut] = useMutation(ADD_OPT_OUT);
  const [deleteOptOut] = useMutation(DELETE_OPT_OUT);
  const searchChange = value => {
    setSearchInput(value);
    setSearchList(
      getUnselected(member.optOuts).filter(item =>
        item.label.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleSearchChange = ({ target }) => {
    target.style.width = `${calcInputWidth(target)}px`;
    searchChange(target.value);
  };
  const handleSearchDown = e => {
    const {
      key,
      target: { value }
    } = e;
    if (key === "Tab" || key === "Enter") {
      e.preventDefault();
      addOptOut({
        variables: { input: { id: member.id, name: searchList[0].name } }
      });
      searchChange("");
    }
    if (key === "Backspace" && value.length === 0) {
      deleteOptOut({
        variables: {
          input: { id: member.id, name: selected[selected.length - 1].name }
        }
      });
    }
  };
  const setFocus = () => {
    inputEl.current.focus();
  };
  const getRemoveClickHandler = optOut => {
    return e => {
      e.preventDefault();
      deleteOptOut({
        variables: { input: { id: member.id, name: optOut.name } }
      });
    };
  };

  return (
    <div className={forms.group}>
      <label
        htmlFor="optOutSearch"
        id="unsubscribeLabel"
        className={forms.label}
      >
        Unsubscribes
      </label>
      <div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions*/}
        <div className={`${styles.input}`} onClick={setFocus}>
          {selected.map(optOut => (
            <TagButton
              key={optOut.name}
              label={optOut.label}
              onClick={getRemoveClickHandler(optOut)}
            />
          ))}
          <input
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            className={styles.inputText}
            name="optOutSearch"
            id="optOutSearch"
            value={searchInput}
            disabled={["unsubscribed", "cleaned"].includes(member.status)}
            onChange={handleSearchChange}
            onKeyDown={handleSearchDown}
            aria-label="Search unsubscribe options"
            ref={inputEl}
          />
        </div>
        <ul tabIndex="-1" role="listbox" aria-labelledby="unsubscribeLabel">
          {searchList.map(optOut => (
            <OptOutField key={optOut.name} optOut={optOut} member={member} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OptOutSelect;
