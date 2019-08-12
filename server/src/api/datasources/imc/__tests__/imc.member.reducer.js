import memberReducer, { memberFieldsReducer } from "../imc.member.reducer";
import cloneDeep from "lodash/cloneDeep";
import md5 from "md5";

describe("[ImcAPI.memberReducer]", () => {
  it("transforms member", () => {
    expect(memberReducer(mockMemberResponse)).toEqual(mockMember);
  });
  it("returns null for empty gdpr", () => {
    const member = cloneDeep(mockMember);
    const response = cloneDeep(mockMemberResponse);
    member.gdpr = null;
    response.customFields = response.customFields.map(field => {
      if (field.name === "GDPR Email Consent") field.value = "";
      return field;
    });
    expect(memberReducer(response)).toEqual(member);
  });
  it("transforms unsubscribed member", () => {
    const unsubResponse = cloneDeep(mockMemberResponse);
    const unsubMember = cloneDeep(mockMember);
    unsubResponse.customFields = unsubResponse.customFields.map(field =>
      field.name === "Fordham Opt Out"
        ? { name: field.name, value: "Yes" }
        : field
    );
    unsubMember.status = "unsubscribed";
    expect(memberReducer(unsubResponse)).toEqual(unsubMember);
  });
});

describe("[ImcAPI.memberFieldsReducer]", () => {
  it("transforms custom fields", () => {
    expect(memberFieldsReducer(mockMemberResponse)).toEqual(mockFields);
  });
});

// Transformed member data
const mockMember = {
  id: md5("test@test.com"),
  email: "test@test.com",
  emailType: "html",
  status: "subscribed",
  firstName: "Ftest",
  lastName: "Ltest",
  fidn: "A000000",
  roles: ["ROLE1", "ROLE2"],
  exclusions: [],
  optOuts: ["Cat 1", "Cat 3"],
  recipientId: "12345",
  gdpr: "475995600000",
  __emailUpdatable: false
};

const mockFields = {
  "First Name": "Ftest",
  "Fordham ID": "A000000",
  "Fordham Opt Out": "None",
  "GDPR Email Consent": "01/31/1985 00:00:00",
  "Last Clicked": "09/28/2016",
  "Last Name": "Ltest",
  "Last Opened": "09/28/2016",
  "Last Sent": "09/28/2016",
  optOuts: {
    "Cat 1": "Yes",
    "Cat 2": "",
    "Cat 3": "Yes",
    "Cat 4": "No"
  },
  Role: "ROLE1, ROLE2"
};

// Raw response from API
const mockMemberResponse = {
  id: "12345",
  syncId: "ABCD-123",
  crmContactType: "CONTACT",
  crmAccountId: null,
  crmSyncEnabled: true,
  lastModifiedDate: "2019-08-05T14:18:33.000+00:00",
  email: "test@test.com",
  emailType: "HTML",
  createdFrom: "API",
  optedOutDate: null,
  optInDetails:
    "Added via CRM sync InsertUpdateRecipients API. IP Address: 54.214.32.235",
  optOutDetails: "",
  leadSource: null,
  customFields: [
    { name: "First Name", value: "Ftest" },
    { name: "Fordham ID", value: "A000000" },
    { name: "Fordham Opt Out", value: "None" },
    { name: "Last Clicked", value: "09/28/2016" },
    { name: "Last Name", value: "Ltest" },
    { name: "Last Opened", value: "09/28/2016" },
    { name: "Last Sent", value: "09/28/2016" },
    { name: "Opt Out Cat 1", value: "Yes" },
    { name: "Opt Out Cat 2", value: "" },
    { name: "Opt Out Cat 3", value: "Yes" },
    { name: "Opt Out Cat 4", value: "No" },
    { name: "Role", value: "ROLE1, ROLE2" },
    { name: "GDPR Email Consent", value: "01/31/1985 00:00:00" }
  ],
  optInDate: "2016-06-10T14:06:15.000+00:00"
};
