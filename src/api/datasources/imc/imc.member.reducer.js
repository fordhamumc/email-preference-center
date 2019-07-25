import md5 from "md5";
export default function memberReducer(id, member) {
  const { email, emailType, customFields } = member;
  const fields = customFields.reduce(
    (acc, i) => {
      if (i.name.startsWith("Opt Out")) {
        acc.interests[i.name.substr(8)] = i.value;
        return acc;
      } else {
        return { ...acc, [i.name]: i.value };
      }
    },
    { interests: {} }
  );

  return {
    id: md5(email),
    email,
    emailType,
    status: fields["Fordham Opt Out"] === "Yes" ? "Unsubscribed" : "Subscribed",
    firstName: fields["First Name"],
    lastName: fields["Last Name"],
    fidn: fields["Fordham ID"],
    roles: fields["Role"].split(", "),
    interests: Object.keys(fields.interests).filter(
      key => fields.interests[key]
    ),
    recipientId: id
  };
}
