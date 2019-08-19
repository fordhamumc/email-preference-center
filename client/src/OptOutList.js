import React from "react";
import OptOutField from "./OptOutField";
import optOutOptions from "./optOutOptions";

const OptOutList = ({ member }) => {
  return (
    <fieldset className="form-group">
      <legend>Unsubscribes</legend>
      <ul>
        {Object.keys(optOutOptions).map(optOut => (
          <OptOutField key={optOut} optOut={optOut} member={member} />
        ))}
      </ul>
    </fieldset>
  );
};
export default OptOutList;
