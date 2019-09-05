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
  tmp.textContent =
    elem.value.length >= elem.placeholder.length
      ? [...elem.value].map(l => l + "\u200B").join("")
      : elem.placeholder;
  tmp.className = elem.className;
  tmp.style.flex = "unset";
  elem.parentNode.append(tmp);
  const tmpWidth = tmp.offsetWidth + 8;
  tmp.remove();
  return tmpWidth;
};

const OptOutSelect = ({ member, active, disabled }) => {
  const selected = member.optOuts.map(getOptOutDetails).filter(Boolean);
  const inputEl = useRef();
  const searchListEl = useRef();
  const [activeControl, setActiveControl] = active;
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
  useEffect(() => {
    if (inputEl.current)
      inputEl.current.style.flexBasis = `${calcInputWidth(inputEl.current)}px`;
  }, [searchInput, inputEl]);

  const toggleList = () => {
    setIsListVisibible(!isListVisible);
  };
  const setFocus = () => {
    inputEl.current.focus();
  };

  const handleListToggleClick = ({ type, key }) => {
    if (type !== "keypress") {
      setFocus();
      toggleList();
    }
    if (type === "keypress" && key === "Enter") toggleList();
  };

  const handleSearchChange = ({ target }) => {
    searchChange(target.value);
  };

  const handleSearchFocus = ({ target }) => {
    target.placeholder = "Search...";
    target.style.flexBasis = `${calcInputWidth(target)}px`;
    setIsListVisibible(true);
    setActiveControl(target);
  };
  useEffect(() => {
    if (activeControl !== inputEl.current) {
      setIsListVisibible(false);
      inputEl.current.placeholder = "";
    }
  }, [activeControl]);

  const handleOptOutOptionClick = () => {
    searchChange("");
    setFocus();
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
        if (activeIndex >= 0 && activeIndex < searchList.length) {
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
          className={isListVisible ? styles.selectActive : styles.select}
          aria-expanded={isListVisible}
          aria-haspopup="listbox"
          aria-controls="optOutList"
          role="combobox"
          aria-disabled={disabled || isUnsubscribed(member.status)}
        >
          <div className={styles.selectContainer} onClick={setFocus}>
            {selected.map(optOut => (
              <TagButton
                key={optOut.name}
                label={optOut.label}
                onClick={getRemoveClickHandler(optOut)}
                disabled={disabled || isUnsubscribed(member.status)}
              />
            ))}
            <input
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              className={styles.search}
              name="optOutSearch"
              id="optOutSearch"
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={handleSearchDown}
              onFocus={handleSearchFocus}
              disabled={disabled || isUnsubscribed(member.status)}
              aria-label="Search unsubscribe options"
              aria-autocomplete="list"
              aria-activedescendant={
                searchListActive
                  ? camelCase(`optOut${searchListActive.name}`)
                  : ""
              }
              ref={inputEl}
            />
          </div>
          <button
            className={styles.dropdownIndicator}
            onMouseUp={handleListToggleClick}
            onKeyPress={handleListToggleClick}
            aria-expanded={isListVisible}
            aria-haspopup="listbox"
            type="button"
            title="toggle unsubscribe list"
          >
            <svg
              viewBox="0 0 20 20"
              role="presentation"
              alt=""
              className={styles.dropdownIcon}
            >
              <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" />
            </svg>
          </button>
        </div>
        {isListVisible && (
          <OptOutList
            id="optOutList"
            list={searchList}
            memberId={member.id}
            activeState={[searchListActive, setSearchListActive]}
            aria-labelledby="unsubscribeLabel"
            onTouchEnd={handleOptOutOptionClick}
            onClick={handleOptOutOptionClick}
            ref={searchListEl}
          />
        )}
      </div>
    </div>
  );
};

export default OptOutSelect;
