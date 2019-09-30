// Transformed member data
const mockMember = {
  id: "b642b4217b34b1e8d3bd915fc65c4452",
  email: "test@test.com",
  emailType: "html",
  status: "subscribed",
  firstName: "Lucy",
  lastName: "Foley",
  fidn: "P001234",
  current: false,
  optOuts: ["Test Category", "Test Category 3", "Test Category 4"],
  exclusions: ["NON", "EER"],
  recipientId: "ajs94330fs",
  gdpr: "475995600000"
};

// Raw response from API
const mockMemberResponse = {
  id: "b642b4217b34b1e8d3bd915fc65c4452",
  email_address: "test@test.com",
  email_type: "html",
  status: "subscribed",
  merge_fields: {
    FNAME: "Lucy",
    LNAME: "Foley",
    FIDN: "P001234",
    IMCID: "ajs94330fs",
    SCHOOL: "AB",
    YEAR: "2019",
    ROLE: "^DOG^,^PET^,^ANIMAL^",
    EXCLUSION: "^NON^,^EER^",
    GDPR: "Thu Jan 31 1985 00:00:00 GMT-0500"
  },
  interests: {
    "854dk03": false,
    fjkd453: true,
    e392hk: true,
    skd9h: true
  }
};

const mockOptOutCategoriesResponse = {
  interests: [
    {
      id: "fjkd453",
      categoryId: "44rr43",
      name: "Test Category"
    },
    {
      id: "854dk03",
      categoryId: "44rr43",
      name: "Test Category 2"
    },
    {
      id: "e392hk",
      categoryId: "44rr43",
      name: "Test Category 3"
    },
    {
      id: "skd9h",
      categoryId: "44rr43",
      name: "Test Category 4"
    }
  ]
};

export { mockMember, mockMemberResponse, mockOptOutCategoriesResponse };
