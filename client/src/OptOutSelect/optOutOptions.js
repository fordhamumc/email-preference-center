// "preference name": {
//   label: "optional display name that appears on the form. if not present the name defaults to the preference name",
//   description: "an optional description that can appear below the name"
// }

const optOutOptions = {
  "Alumni Relations": {},
  "Development and University Relations": {},
  Diversity: {},
  "Fordham College at Lincoln Center": {},
  "Fordham College at Rose Hill": {},
  "Fordham Magazine": {
    label: "FORDHAM Magazine",
    description:
      "A monthly email including stories from the print edition plus timely news and features found only online."
  },
  "Fordham News": {
    description:
      "A weekly email for students, faculty, and staff, bringing timely campus updates and features to the University community "
  },
  Giving: {},
  "Graduate School of Arts and Sciences": {},
  "Graduate School of Education": {},
  "Graduate School of Social Service": {},
  "Human Resources": {},
  "Fordham IT": {},
  Orthodoxy: {},
  Parents: {},
  President: {},
  "Professional and Continuing Studies": {},
  "Public Safety": {},
  "Rams in the News": {},
  "Special Events": {},
  "Strategic Planning": {},
  "University Marketing": {},
  "University News": {},
  Wellbeing: {}
};

export function optOutUpdateFormat(optOuts) {
  return Object.keys(optOutOptions).map(option => ({
    name: option,
    optOut: optOuts.includes(option)
  }));
}

export default optOutOptions;
