import md5 from "md5";

function memberFieldsReducer({ customFields }) {
  const customFieldsObj = customFields.reduce(
    (acc, i) => ({ ...acc, [i.name]: i.value }),
    {}
  );
  const {
    "First Name": firstName,
    "Last Name": lastName,
    "Fordham ID": fidn,
    "Fordham Opt Out": unsubscribed,
    Role: roles,
    "Opt Out Areas": optOuts,
    "GDPR Email Consent": gdpr
  } = customFieldsObj;
  return { firstName, lastName, fidn, unsubscribed, roles, optOuts, gdpr };
}

export default function memberReducer(member) {
  const { id, email, emailType } = member;
  const fields = memberFieldsReducer(member);
  const roles = fields.roles.split(", ");
  return {
    id: md5(email),
    email,
    emailType: emailType.toLowerCase(),
    status: fields.unsubscribed === "Yes" ? "unsubscribed" : "subscribed",
    firstName: fields.firstName,
    lastName: fields.lastName,
    fidn: fields.fidn,
    current:
      roles.includes("STUDENT_ACTIVE") ||
      roles.includes("EMPLOYEE") ||
      roles.includes("NB_EMPLOYEE"),
    exclusions: [],
    optOuts: fields.optOuts.split(";"),
    recipientId: id,
    gdpr: fields.gdpr ? String(new Date(fields.gdpr).getTime()) : null,
    __emailUpdatable: false
  };
}

export {
  memberFieldsReducer as ___DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_GHOSTS_MEMBER_FIELDS_REDUCER___
};
