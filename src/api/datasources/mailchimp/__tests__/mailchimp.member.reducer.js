import MailchimpAPI from "..";
import memberReducer from "../mailchimp.member.reducer";

const MOCK_API_KEY = "ABC123-us1";
const MOCK_LIST_ID = "1a23";
const MOCK_OPTOUT_CATEGORY = "1234";

const ds = new MailchimpAPI({
  key: MOCK_API_KEY,
  listId: MOCK_LIST_ID,
  optOutCategory: MOCK_OPTOUT_CATEGORY
});

ds.get = jest.fn();

describe("[MailchimpAPI.memberReducer]", () => {
  it("transforms member", async () => {
    ds.get.mockReturnValue(mockOptOutCategoriesResponse);
    expect(await memberReducer(mockMemberResponse, ds)).toEqual(mockMember);
  });
});

// Transformed member data
const mockMember = {
  id: "b642b4217b34b1e8d3bd915fc65c4452",
  email: "test@test.com",
  emailType: "html",
  status: "subscribed",
  firstName: "Lucy",
  lastName: "Foley",
  fidn: "P001234",
  roles: ["DOG", "PET", "ANIMAL"],
  optOuts: ["Test Category", "Test Category 3", "Test Category 4"],
  exclusions: ["NON", "EER"],
  recipientId: "ajs94330fs"
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
    EXCLUSION: "^NON^,^EER^"
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
