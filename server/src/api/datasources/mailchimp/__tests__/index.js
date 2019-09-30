import MailchimpAPI from "..";
import { Headers } from "apollo-server-env";
import {
  mockMember,
  mockMemberResponse,
  mockOptOutCategoriesResponse
} from "./__mockdata";

const MOCK_API_KEY = "ABC123-us1";
const MOCK_LIST_ID = "1a23";
const MOCK_OPTOUT_CATEGORY = "1234";

const mocks = {
  get: jest.fn(),
  patch: jest.fn(),
  getOptOutCategories: jest.fn()
};

const ds = new MailchimpAPI({
  key: MOCK_API_KEY,
  listId: MOCK_LIST_ID,
  optOutCategory: MOCK_OPTOUT_CATEGORY
});

const tmpGetOptOutCategories = ds.getOptOutCategories;
ds.get = mocks.get;
ds.patch = mocks.patch;
ds.getOptOutCategories = mocks.getOptOutCategories;

describe("[MailchimpAPI.constructor]", () => {
  it("throws error when empty or invalid api is passed", () => {
    expect(() => new MailchimpAPI("ABC")).toThrow(Error);
    expect(() => new MailchimpAPI()).toThrow(Error);
  });
});

describe("[MailchimpAPI.willSendRequest]", () => {
  const request = {
    method: "GET",
    path: "lists/",
    params: new URLSearchParams(),
    cacheOptions: { ttl: 3600 },
    headers: new Headers()
  };
  it("adds exclude_fields when fields is not in params", async () => {
    const res = await ds.willSendRequest(request);
    expect(res.params.get("exclude_fields")).toEqual("_links");
  });
  it("does not add exclude_fields if fields param exists", async () => {
    request["params"] = new URLSearchParams("fields=interests.id");
    const res = await ds.willSendRequest(request);
    expect(res.params.get("exclude_fields")).toEqual(null);
  });
});

describe("[MailchimpAPI.getMember]", () => {
  it("gets member by id", async () => {
    mocks.get.mockReturnValueOnce(mockMemberResponse);
    mocks.getOptOutCategories.mockReturnValue(
      mockOptOutCategoriesResponse.interests
    );

    const res = await ds.getMember({ id: "b642b4217b34b1e8d3bd915fc65c4452" });
    expect(res).toEqual(mockMember);
    expect(mocks.get).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        fields: [
          "id",
          "email_address",
          "email_type",
          "status",
          "merge_fields",
          "interests"
        ]
      }
    );
  });
});

describe("[MailchimpAPI.patchMember]", () => {
  it("sends update and returns member", async () => {
    mocks.patch.mockReturnValueOnce(mockMemberResponse);

    const res = await ds.patchMember({
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      email: "test2@test.com",
      status: "unsubscribed"
    });
    expect(res).toEqual(mockMember);
    expect(mocks.patch).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        email_address: "test2@test.com",
        status: "unsubscribed",
        interests: {},
        merge_fields: { MODIFIED: expect.any(String) }
      }
    );
  });

  it("formats optouts properly", async () => {
    mocks.getOptOutCategories.mockReturnValue(
      mockOptOutCategoriesResponse.interests
    );
    mocks.patch.mockReturnValueOnce(mockMemberResponse);
    await ds.patchMember({
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      optOuts: [
        { name: "Test Category", optOut: true },
        { name: "Test Category 2", optOut: false }
      ]
    });
    expect(mocks.patch).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        interests: {
          fjkd453: true,
          "854dk03": false
        },
        merge_fields: { MODIFIED: expect.any(String) }
      }
    );
  });

  it("adds GDPR field to payload", async () => {
    mocks.getOptOutCategories.mockReturnValue(
      mockOptOutCategoriesResponse.interests
    );
    mocks.patch
      .mockReturnValueOnce(mockMemberResponse)
      .mockReturnValueOnce(mockMemberResponse);
    const input = {
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      gdpr: true
    };
    await ds.patchMember(input);
    expect(mocks.patch).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        interests: {},
        merge_fields: { MODIFIED: expect.any(String), GDPR: expect.any(String) }
      }
    );

    input.gdpr = false;
    await ds.patchMember(input);
    expect(mocks.patch).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        interests: {},
        merge_fields: { MODIFIED: expect.any(String), GDPR: "" }
      }
    );
  });

  it("removes optouts that don't exist", async () => {
    mocks.getOptOutCategories.mockReturnValue(
      mockOptOutCategoriesResponse.interests
    );
    mocks.patch.mockReturnValueOnce(mockMemberResponse);
    await ds.patchMember({
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      optOuts: [
        { name: "Test Category", optOut: true },
        { name: "Test Category 10", optOut: false }
      ]
    });
    expect(mocks.patch).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        interests: {
          fjkd453: true
        },
        merge_fields: { MODIFIED: expect.any(String) }
      }
    );
  });
});

describe("[MailchimpAPI.unsubscribeMember]", () => {
  it("calls patchMember to set status to unsubscribed", async () => {
    mocks.patch.mockReturnValueOnce(mockMemberResponse);
    await ds.unsubscribeMember({ id: "b642b4217b34b1e8d3bd915fc65c4452" });
    expect(mocks.patch).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        status: "unsubscribed",
        interests: {},
        merge_fields: { MODIFIED: expect.any(String) }
      }
    );
  });
});

describe("[MailchimpAPI.getOptOutById]", () => {
  it("returns a category name from its id", async () => {
    mocks.get.mockReturnValueOnce(mockOptOutCategoriesResponse);
    const res = await ds.getOptOutById("fjkd453");
    expect(res).toEqual("Test Category");
  });
});

describe("[MailchimpAPI.getOptOutIdByName]", () => {
  it("returns a category id from its name", async () => {
    mocks.get.mockReturnValueOnce(mockOptOutCategoriesResponse);
    const res = await ds.getOptOutIdByName("Test Category");
    expect(res).toEqual("fjkd453");
  });
});

describe("[MailchimpAPI.getOptOutCategories]", () => {
  it("is called with list id and optOutCategory id", async () => {
    ds.getOptOutCategories = tmpGetOptOutCategories;
    mocks.get.mockReturnValueOnce(mockOptOutCategoriesResponse);
    const res = await ds.getOptOutCategories("1234", "abcd", 20);
    expect(res).toEqual(mockOptOutCategoriesResponse.interests);
    expect(mocks.get).toBeCalledWith(
      `lists/abcd/interest-categories/1234/interests`,
      expect.any(Object),
      expect.any(Object)
    );
    ds.getOptOutCategories = mocks.getOptOutCategories;
  });

  it("is called with defaults", async () => {
    ds.getOptOutCategories = tmpGetOptOutCategories;
    mocks.get.mockReturnValueOnce(mockOptOutCategoriesResponse);
    await ds.getOptOutCategories();
    expect(mocks.get).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/interest-categories/${MOCK_OPTOUT_CATEGORY}/interests`,
      expect.any(Object),
      expect.any(Object)
    );
    ds.getOptOutCategories = mocks.getOptOutCategories;
  });
});

describe("[MailchimpAPI.transformOptOut]", () => {
  it("returns null if search value does not exist", async () => {
    mocks.get.mockReturnValueOnce(mockOptOutCategoriesResponse);
    const res = await ds.transformOptOut("1234");
    expect(res).toEqual(null);
  });
});

/**
 * MOCK MEMBER DATA
 */
