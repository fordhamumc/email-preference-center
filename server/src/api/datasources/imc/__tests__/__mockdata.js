import md5 from "md5";

// Transformed member data
const mockMember = {
  id: md5("test@test.com"),
  email: "test@test.com",
  emailType: "html",
  status: "subscribed",
  firstName: "Ftest",
  lastName: "Ltest",
  fidn: "A000000",
  current: false,
  exclusions: [],
  optOuts: ["Cat 1", "Cat 3"],
  recipientId: "12345",
  gdpr: "475995600000",
  __emailUpdatable: false
};

const mockCategories = ["Cat 1", "Cat 2", "Cat 3", "Cat 4", "Cat 5"];

const mockFields = {
  firstName: "Ftest",
  lastName: "Ltest",
  fidn: "A000000",
  unsubscribed: "None",
  roles: "ROLE1, ROLE2",
  optOuts: "Cat 1;Cat 3",
  gdpr: "01/31/1985 00:00:00"
};

// Input
const mockInput = {
  recipientId: "12345",
  optOuts: [
    { name: "Cat 1", optOut: true },
    { name: "Cat 2", optOut: false },
    { name: "Cat 4", optOut: true }
  ]
};

// Raw response from API
const mockMemberResponse = {
  data: {
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
      { name: "Opt Out Areas", value: "Cat 1;Cat 3" },
      { name: "Role", value: "ROLE1, ROLE2" },
      { name: "GDPR Email Consent", value: "01/31/1985 00:00:00" }
    ],
    optInDate: "2016-06-10T14:06:15.000+00:00"
  }
};

const mockCategoriesResponse = `<Envelope>
<Body>
<RESULT>
<SUCCESS>TRUE</SUCCESS>
<ID>2222</ID>
<COLUMNS>
<COLUMN>
<NAME>First Name</NAME>
<VALUE>Test</VALUE>
</COLUMN>
<COLUMN>
<NAME>Opt Out Areas</NAME>
<DEFAULT_VALUE/>
<TYPE>20</TYPE>
<SELECTION_VALUES>
<VALUE>Cat 1</VALUE>
<VALUE>Cat 2</VALUE>
<VALUE>Cat 3</VALUE>
<VALUE>Cat 4</VALUE>
<VALUE>Cat 5</VALUE>
</SELECTION_VALUES>
</COLUMN>
</COLUMNS>
</RESULT>
</Body>
</Envelope>`;

export {
  mockMember,
  mockCategories,
  mockFields,
  mockInput,
  mockMemberResponse,
  mockCategoriesResponse
};
