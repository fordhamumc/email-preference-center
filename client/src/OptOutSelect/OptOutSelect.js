import React, { useState, useEffect, useRef } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import "shim-keyboard-event-key";
import styles from "./OptOutSelect.module.scss";
import forms from "../Form/form.module.scss";
import optOutOptions from "./optOutOptions";
import TagButton from "../TagButton/TagButton";
import OptOutList from "./OptOutList";
import { isUnsubscribed } from "../UnsubscribeField";
import { camelCase } from "../utils";

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

const OptOutSelect = ({ member, disabled }) => {
  const selected = member.optOuts.map(getOptOutDetails).filter(Boolean);
  const inputEl = useRef();
  const [searchInput, setSearchInput] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [searchListActive, setSearchListActive] = useState("");
  const [isListVisible, setIsListVisibible] = useState(false);
  useEffect(() => {
    setSearchList(getUnselected(member.optOuts));
  }, [member.optOuts]);

  const [addOptOut] = useMutation(ADD_OPT_OUT);
  const [deleteOptOut] = useMutation(DELETE_OPT_OUT);
  const searchChange = value => {
    setSearchInput(value);
    if (value.length) setIsListVisibible(true);
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
      target,
      target: { value }
    } = e;

    switch (key) {
      case "Enter":
        e.preventDefault();
        addOptOut({
          variables: { input: { id: member.id, name: searchListActive.name } }
        });
        searchChange("");
        break;
      case "ArrowDown":
      case "ArrowUp":
        let activeIndex = searchList.indexOf(searchListActive);
        key === "ArrowDown" ? ++activeIndex : --activeIndex;
        setIsListVisibible(activeIndex < 0 ? false : true);
        if (activeIndex >= 0 || activeIndex < searchList.length) {
          setSearchListActive(searchList[activeIndex]);
        }
        break;
      case "Home":
        setSearchListActive(searchList[0]);
        break;
      case "End":
        setSearchListActive(searchList[searchList.length - 1]);
        break;
      case "Escape":
        searchChange("");
        setIsListVisibible(false);
        setSearchListActive(null);
        break;
      case "Backspace":
        if (value.length === 0 && target.previousSibling) {
          e.preventDefault();
          target.previousSibling.lastChild.focus();
        }
        break;
      default:
        break;
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
  if (isUnsubscribed(member.status)) return null;
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
          className={`${styles.input} ${
            isListVisible ? styles.inputActive : ""
          }`}
          onClick={setFocus}
          aria-expanded={isListVisible}
          aria-haspopup="listbox"
          aria-owns="optOutList"
          aria-disabled={disabled || isUnsubscribed(member.status)}
        >
          {selected.map(optOut => (
            <TagButton
              key={optOut.name}
              label={optOut.label}
              onClick={getRemoveClickHandler(optOut)}
              onFocus={toggleList}
              onBlur={toggleList}
              disabled={disabled || isUnsubscribed(member.status)}
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
            onChange={handleSearchChange}
            onKeyDown={handleSearchDown}
            onFocus={toggleList}
            onBlur={toggleList}
            disabled={disabled || isUnsubscribed(member.status)}
            aria-label="Search unsubscribe options"
            aria-activedescendant={
              searchListActive
                ? camelCase(`optOut ${searchListActive.name}`)
                : ""
            }
            ref={inputEl}
          />
        </div>
        {isListVisible && (
          <OptOutList
            id="optOutList"
            list={searchList}
            memberId={member.id}
            activeState={[searchListActive, setSearchListActive]}
            aria-labelledby="unsubscribeLabel"
          />
        )}
      </div>
    </div>
  );
};

export default OptOutSelect;
