function fieldToArray(field) {
  return field
    .split(",")
    .map(str => str.replace(/^\^|\^$/g, ""))
    .filter(Boolean);
}

async function optOutsReducer(interests, api) {
  let optOuts = Object.keys(interests).filter(key => interests[key]);
  optOuts = await Promise.all(optOuts.map(id => api.getOptOutById(id)));
  return optOuts.filter(Boolean);
}

export default async function memberReducer(member, api) {
  const {
    id,
    email_address: email,
    email_type: emailType,
    status,
    interests,
    merge_fields: { FNAME, LNAME, FIDN, ROLE, EXCLUSION, IMCID, GDPR }
  } = member;
  return {
    id,
    email,
    emailType,
    status,
    firstName: FNAME,
    lastName: LNAME,
    fidn: FIDN,
    roles: fieldToArray(ROLE),
    optOuts: await optOutsReducer(interests, api),
    exclusions: fieldToArray(EXCLUSION),
    recipientId: IMCID,
    gdpr: GDPR ? String(new Date(GDPR).getTime()) : null
  };
}
