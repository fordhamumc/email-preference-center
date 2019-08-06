import ImcAPI from "..";
import { Headers } from "apollo-server-env";
import md5 from "md5";

const MOCK_OPTIONS = {
  id: "ABC123",
  secret: "1a23",
  refreshToken: "a12b",
  databaseId: "2222",
  pod: 1
};

const ds = new ImcAPI(MOCK_OPTIONS);

const mocks = {
  get: jest.fn(),
  patch: jest.fn(),
  post: jest.fn(),
  getOAuthAccessToken: jest.fn()
};

ds.get = mocks.get;
ds.patch = mocks.patch;
ds.post = mocks.post;
const tmpGetOAuthAccessToken = ds.getOAuthAccessToken;
ds.getOAuthAccessToken = mocks.getOAuthAccessToken;

mocks.getOAuthAccessToken.mockReturnValue("abcd1234");

describe("[ImcAPI.constructor]", () => {
  it("throws error if missing id, secret, or refresh token", () => {
    const optionsWithoutId = Object.assign({}, MOCK_OPTIONS);
    delete optionsWithoutId.id;
    expect(() => new ImcAPI(optionsWithoutId)).toThrow(Error);

    const optionsWithoutSecret = Object.assign({}, MOCK_OPTIONS);
    delete optionsWithoutSecret.secret;
    expect(() => new ImcAPI(optionsWithoutSecret)).toThrow(Error);

    const optionsWithoutRefresh = Object.assign({}, MOCK_OPTIONS);
    delete optionsWithoutRefresh.refreshToken;
    expect(() => new ImcAPI(optionsWithoutRefresh)).toThrow(Error);
  });

  it("throws error if id is not between 1 and 8", () => {
    const options = Object.assign({}, MOCK_OPTIONS);
    options.pod = 0;
    expect(() => new ImcAPI(options)).toThrow(Error);

    options.pod = 10;
    expect(() => new ImcAPI(options)).toThrow(Error);
  });
});

describe("[ImcAPI.willSendRequest]", () => {
  const request = {
    method: "GET",
    path: "rest/",
    params: new URLSearchParams(),
    headers: new Headers()
  };

  it("adds access token to request", async () => {
    const res = await ds.willSendRequest(request);
    expect(res.headers.get("Authorization")).toEqual("Bearer abcd1234");
  });
});

describe("[ImcAPI.getOAuthAccessToken]", () => {
  it("gets access token from cache if it exists", async () => {
    ds.getOAuthAccessToken = tmpGetOAuthAccessToken;
    mocks.post.mockReturnValueOnce({
      access_token: "abc123",
      expires_in: 100
    });
    const res = await ds.getOAuthAccessToken();
    expect(res).toEqual("abc123");
    const res2 = await ds.getOAuthAccessToken();
    expect(res2).toEqual("abc123");
    ds.getOAuthAccessToken = mocks.getOAuthAccessToken;
  });
});

describe("[ImcAPI.getMember]", () => {
  it("returns null if recipientId is empty", async () => {
    const res = await ds.getMember({ id: "abc1234" });
    expect(res).toEqual(null);
  });

  it("gets member by recipientId", async () => {
    mocks.get.mockReturnValueOnce(mockMemberResponse);
    const res = await ds.getMember(
      { id: "abc1234", recipientId: "12345" },
      "3333"
    );
    expect(mocks.get).toBeCalledWith("rest/databases/3333/contacts/12345");
    expect(res).toEqual(mockMember);
  });
});

describe("[ImcAPI.patchMember]", () => {
  it("returns null if recipientId is empty", async () => {
    const res = await ds.patchMember({ id: "abc1234" });
    expect(res).toEqual(null);
  });

  it("transforms status", async () => {
    mocks.patch
      .mockReturnValueOnce(Promise.resolve({}))
      .mockReturnValueOnce(Promise.resolve({}));
    mocks.get
      .mockReturnValueOnce(mockMemberResponse)
      .mockReturnValueOnce(mockMemberResponse);

    await ds.patchMember({
      id: "abc1234",
      recipientId: "12345",
      status: "cleaned"
    });
    expect(mocks.patch).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`,
      {
        customFields: [
          { name: "Fordham Opt Out", value: "Yes" },
          { name: "Preference Form Modified", value: expect.anything() }
        ]
      }
    );

    await ds.patchMember({
      id: "abc1234",
      recipientId: "12345",
      status: "subscribed"
    });
    expect(mocks.patch).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`,
      {
        customFields: [
          { name: "Fordham Opt Out", value: "None" },
          { name: "Preference Form Modified", value: expect.anything() }
        ]
      }
    );
  });

  it("transforms opt outs", async () => {
    mocks.patch.mockReturnValueOnce(Promise.resolve({}));
    mocks.get
      .mockReturnValueOnce(mockMemberResponse)
      .mockReturnValueOnce(mockMemberResponse);
    const res = await ds.patchMember(mockInput);
    expect(mocks.patch).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`,
      {
        customFields: [
          { name: "Opt Out Cat 1", value: "Yes" },
          { name: "Opt Out Cat 2", value: "No" },
          { name: "Preference Form Modified", value: expect.anything() }
        ]
      }
    );
  });

  it("transforms member", async () => {
    mocks.patch.mockReturnValueOnce(Promise.resolve({}));
    mocks.get
      .mockReturnValueOnce(mockMemberResponse)
      .mockReturnValueOnce(mockMemberResponse);
    const res = await ds.patchMember(mockInput);
    expect(res).toEqual(mockMember);
  });
});

describe("[ImcAPI.unsubscribeMember]", () => {
  it("calls patch with status unsubscribed", async () => {
    mocks.patch.mockReturnValueOnce(Promise.resolve({}));
    mocks.get
      .mockReturnValueOnce(mockMemberResponse)
      .mockReturnValueOnce(mockMemberResponse);
    const res = await ds.unsubscribeMember({ recipientId: "12345" });
    expect(mocks.patch).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`,
      {
        customFields: [
          { name: "Fordham Opt Out", value: "Yes" },
          { name: "Preference Form Modified", value: expect.anything() }
        ]
      }
    );
  });
});

describe("[ImcAPI.getOptOutCategories]", () => {
  it("formats opt out categories", async () => {
    mocks.get.mockReturnValueOnce(mockMemberResponse);
    const res = await ds.getOptOutCategories("12345");
    expect(mocks.get).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`
    );
    expect(res).toEqual(Object.keys(mockFields.optOuts));
  });
});

describe("[ImcAPI.transformOutOutsToCustomFields]", () => {
  it("transforms optOuts input to imc custom fields", async () => {
    mocks.get.mockReturnValueOnce(mockMemberResponse);
    const res = await ds.transformOutOutsToCustomFields(mockInput);
    expect(res).toEqual([
      { name: "Opt Out Cat 1", value: "Yes" },
      { name: "Opt Out Cat 2", value: "No" }
    ]);
  });

  it("returns empty array when optOuts is null", async () => {
    mocks.get.mockReturnValueOnce(mockMemberResponse);
    const res = await ds.transformOutOutsToCustomFields({
      recipientId: "12345"
    });
    expect(res).toEqual([]);
  });
});

/**
 * MOCK MEMBER DATA
 */

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
  recipientId: "12345"
};

const mockFields = {
  "First Name": "Ftest",
  "Fordham ID": "A000000",
  "Fordham Opt Out": "None",
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

// Input
const mockInput = {
  recipientId: "12345",
  optOuts: [{ name: "Cat 1", optOut: true }, { name: "Cat 2", optOut: false }]
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
      { name: "Opt Out Cat 1", value: "Yes" },
      { name: "Opt Out Cat 2", value: "" },
      { name: "Opt Out Cat 3", value: "Yes" },
      { name: "Opt Out Cat 4", value: "No" },
      { name: "Role", value: "ROLE1, ROLE2" }
    ],
    optInDate: "2016-06-10T14:06:15.000+00:00"
  }
};
