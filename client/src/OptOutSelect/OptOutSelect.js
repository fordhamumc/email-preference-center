import React, { useState, useEffect, useRef } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import "shim-keyboard-event-key";
import styles from "./OptOutSelect.module.css";
import forms from "../defaults/forms.module.css";
import optOutOptions from "./optOutOptions";
import TagButton from "../TagButton/TagButton";
import OptOutList from "./OptOutList";

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
  const [isListVisible, setIsListVisibible] = useState(false);
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

  const toggleList = ({ type }) => {
    let newState = !isListVisible;
    if (type === "focus") newState = true;
    if (type === "blur") newState = false;
    setIsListVisibible(newState);
  };
  const setFocus = () => {
    inputEl.current.focus();
  };
  const handleSearchChange = ({ target }) => {
    target.style.width = `${calcInputWidth(target)}px`;
    searchChange(target.value);
  };
  const handleSearchDown = e => {
    const {
      key,
      shiftKey,
      target,
      target: { value }
    } = e;

    if (key === "Enter" || (key === "Tab" && !shiftKey)) {
      e.preventDefault();
      addOptOut({
        variables: { input: { id: member.id, name: searchList[0].name } }
      });
      searchChange("");
    }
    if (key === "Backspace" && value.length === 0 && target.previousSibling) {
      e.preventDefault();
      target.previousSibling.lastChild.focus();
    }
  };
  const getRemoveClickHandler = optOut => {
    return e => {
      e.preventDefault();
      deleteOptOut({
        variables: { input: { id: member.id, name: optOut.name } }
      });
      setFocus();
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
        <div
          className={`${styles.input}`}
          onClick={setFocus}
          aria-expanded={isListVisible}
          aria-haspopup="listbox"
          aria-owns="optOutList"
        >
          {selected.map(optOut => (
            <TagButton
              key={optOut.name}
              label={optOut.label}
              onClick={getRemoveClickHandler(optOut)}
              onFocus={toggleList}
              onBlur={toggleList}
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
            onFocus={toggleList}
            onBlur={toggleList}
            aria-label="Search unsubscribe options"
            ref={inputEl}
          />
        </div>
        <OptOutList
          id="optOutList"
          list={searchList}
          memberId={member.id}
          aria-labelledby="unsubscribeLabel"
          aria-hidden={!isListVisible}
          className={isListVisible ? "" : styles.hidden}
        />
      </div>
    </div>
  );
};

export default OptOutSelect;
