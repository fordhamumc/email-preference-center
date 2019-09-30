import ImcAPI from "..";
import { Headers } from "apollo-server-env";
import {
  mockMember,
  mockFields,
  mockInput,
  mockMemberResponse,
  mockCategoriesResponse,
  mockCategories
} from "./__mockdata";

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
    const optionsWithoutId = { ...MOCK_OPTIONS };
    delete optionsWithoutId.id;
    expect(() => new ImcAPI(optionsWithoutId)).toThrow(Error);

    const optionsWithoutSecret = { ...MOCK_OPTIONS };
    delete optionsWithoutSecret.secret;
    expect(() => new ImcAPI(optionsWithoutSecret)).toThrow(Error);

    const optionsWithoutRefresh = { ...MOCK_OPTIONS };
    delete optionsWithoutRefresh.refreshToken;
    expect(() => new ImcAPI(optionsWithoutRefresh)).toThrow(Error);
  });

  it("throws error if id is not between 1 and 8", () => {
    const options = { ...MOCK_OPTIONS };
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

  const xmlRequest = {
    method: "POST",
    path: "XMLAPI",
    params: new URLSearchParams(),
    headers: new Headers()
  };

  it("adds access token to request", async () => {
    const res = await ds.willSendRequest(request);
    expect(res.headers.get("Authorization")).toEqual("Bearer abcd1234");
  });

  it("does not add content type to non-XML request", async () => {
    const res = await ds.willSendRequest(xmlRequest);
    expect(res.headers.get("Content-Type")).toEqual("text/xml;charset=utf-8");
  });

  it("adds content type to XML request", async () => {
    const res = await ds.willSendRequest(request);
    expect(res.headers.get("Content-Type")).toEqual(null);
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

describe("[ImcAPI.getRecipientId]", () => {
  it("returns unencoded id when encoded id is given", () => {
    expect(ds.getRecipientId("MTIzNDU2Nzg5")).toEqual("123456789");
  });
  it("strips trailing K", () => {
    expect(ds.getRecipientId("MTIzNDU2Nzg5S0")).toEqual("123456789");
  });
  it("returns id when not encoded", () => {
    expect(ds.getRecipientId("123456789")).toEqual("123456789");
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
          { name: "Preference Form Modified", value: expect.any(String) }
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
          { name: "Preference Form Modified", value: expect.any(String) }
        ]
      }
    );
  });

  it("transforms opt outs", async () => {
    mocks.patch.mockReturnValueOnce(Promise.resolve({}));
    mocks.post.mockReturnValueOnce(mockCategoriesResponse);
    mocks.get.mockReturnValueOnce(mockMemberResponse);

    const res = await ds.patchMember(mockInput);
    expect(mocks.patch).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`,
      {
        customFields: [
          { name: "Opt Out Areas", value: "Cat 1;Cat 4" },
          { name: "Preference Form Modified", value: expect.any(String) }
        ]
      }
    );
  });

  it("adds GDPR field to payload", async () => {
    mocks.patch
      .mockReturnValueOnce(Promise.resolve({}))
      .mockReturnValueOnce(Promise.resolve({}));
    mocks.get
      .mockReturnValueOnce(mockMemberResponse)
      .mockReturnValueOnce(mockMemberResponse);
    mocks.post
      .mockReturnValueOnce(mockCategoriesResponse)
      .mockReturnValueOnce(mockCategoriesResponse);

    const input = { ...mockInput };
    input.gdpr = true;
    await ds.patchMember(input);
    expect(mocks.patch).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`,
      {
        customFields: [
          { name: "Opt Out Areas", value: "Cat 1;Cat 4" },
          { name: "Preference Form Modified", value: expect.any(String) },
          { name: "GDPR Email Consent", value: expect.any(String) }
        ]
      }
    );

    input.gdpr = false;
    await ds.patchMember(input);
    expect(mocks.patch).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`,
      {
        customFields: [
          { name: "Opt Out Areas", value: "Cat 1;Cat 4" },
          { name: "Preference Form Modified", value: expect.any(String) },
          { name: "GDPR Email Consent", value: "" }
        ]
      }
    );
  });
});

describe("[ImcAPI.unsubscribeMember]", () => {
  it("calls patch with status unsubscribed", async () => {
    mocks.patch.mockReturnValueOnce(Promise.resolve({}));
    mocks.get.mockReturnValueOnce(mockMemberResponse);
    const res = await ds.unsubscribeMember({ recipientId: "12345" });
    expect(mocks.patch).toBeCalledWith(
      `rest/databases/${MOCK_OPTIONS.databaseId}/contacts/12345`,
      {
        customFields: [
          { name: "Fordham Opt Out", value: "Yes" },
          { name: "Preference Form Modified", value: expect.any(String) }
        ]
      }
    );
  });
});

describe("[ImcAPI.getOptOutCategories]", () => {
  it("formats opt out categories", async () => {
    mocks.post.mockReturnValueOnce(mockCategoriesResponse);
    const res = await ds.getOptOutCategories();
    expect(mocks.post).toBeCalledWith(
      "XMLAPI",
      `<?xml version="1.0" encoding="UTF-8"?><Envelope><Body><GetListMetaData><LIST_ID>${MOCK_OPTIONS.databaseId}</LIST_ID></GetListMetaData></Body></Envelope>`
    );
    expect(res).toEqual(mockCategories);
  });
});

describe("[ImcAPI.transformOutOutsToCustomFields]", () => {
  it("transforms optOuts input to imc custom fields", async () => {
    mocks.post.mockReturnValueOnce(mockCategoriesResponse);
    const res = await ds.transformOutOutsToCustomFields(mockInput.optOuts);
    expect(res).toEqual({ name: "Opt Out Areas", value: "Cat 1;Cat 4" });
  });

  it("returns empty array when optOuts is null", async () => {
    const res = await ds.transformOutOutsToCustomFields();
    expect(res).toEqual([]);
  });

  it("returns empty value when optOuts is empty array", async () => {
    mocks.post.mockReturnValueOnce(mockCategoriesResponse);
    const res = await ds.transformOutOutsToCustomFields([]);
    expect(res).toEqual({ name: "Opt Out Areas", value: "" });
  });
});
