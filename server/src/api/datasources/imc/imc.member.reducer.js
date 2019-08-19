import md5 from "md5";

export function memberFieldsReducer({ customFields }) {
  return customFields.reduce(
    (acc, i) => {
      if (i.name.startsWith("Opt Out")) {
        acc.optOuts[i.name.substr(8)] = i.value;
        return acc;
      } else {
        return { ...acc, [i.name]: i.value };
      }
    },
    { optOuts: {} }
  );
}

export default function memberReducer(member) {
  const { id, email, emailType } = member;
  const fields = memberFieldsReducer(member);
  const roles = fields["Role"].split(", ");
  return {
    id: md5(email),
    email,
    emailType: emailType.toLowerCase(),
    status: fields["Fordham Opt Out"] === "Yes" ? "unsubscribed" : "subscribed",
    firstName: fields["First Name"],
    lastName: fields["Last Name"],
    fidn: fields["Fordham ID"],
    current:
      roles.includes("STUDENT_ACTIVE") ||
      roles.includes("EMPLOYEE") ||
      roles.includes("NB_EMPLOYEE"),
    exclusions: [],
    optOuts: Object.keys(fields.optOuts).filter(
      key => fields.optOuts[key] === "Yes"
    ),
    recipientId: id,
    gdpr: fields["GDPR Email Consent"]
      ? String(new Date(fields["GDPR Email Consent"]).getTime())
      : null,
    __emailUpdatable: false
  };
}
