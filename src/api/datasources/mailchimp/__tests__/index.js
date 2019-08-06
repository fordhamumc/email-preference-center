import MailchimpAPI from "..";
import { Headers } from "apollo-server-env";

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
  it("should get member by id", async () => {
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
  it("should send update and return member", async () => {
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
        merge_fields: { MODIFIED: expect.anything() }
      }
    );
  });

  it("should format optouts properly", async () => {
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
        merge_fields: { MODIFIED: expect.anything() }
      }
    );
  });

  it("should remove optouts that don't exist", async () => {
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
        merge_fields: { MODIFIED: expect.anything() }
      }
    );
  });
});

describe("[MailchimpAPI.unsubscribeMember]", () => {
  it("should call patchMember to set status to unsubscribed", async () => {
    mocks.patch.mockReturnValueOnce(mockMemberResponse);
    await ds.unsubscribeMember({ id: "b642b4217b34b1e8d3bd915fc65c4452" });
    expect(mocks.patch).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        status: "unsubscribed",
        interests: {},
        merge_fields: { MODIFIED: expect.anything() }
      }
    );
  });
});

describe("[MailchimpAPI.getOptOutById]", () => {
  it("should return a category name from its id", async () => {
    mocks.get.mockReturnValueOnce(mockOptOutCategoriesResponse);
    const res = await ds.getOptOutById("fjkd453");
    expect(res).toEqual("Test Category");
  });
});

describe("[MailchimpAPI.getOptOutIdByName]", () => {
  it("should return a category id from its name", async () => {
    mocks.get.mockReturnValueOnce(mockOptOutCategoriesResponse);
    const res = await ds.getOptOutIdByName("Test Category");
    expect(res).toEqual("fjkd453");
  });
});

describe("[MailchimpAPI.getOptOutCategories]", () => {
  it("should be called with list id and optOutCategory id", async () => {
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

  it("should be called with defaults", async () => {
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
  it("should return null if search value does not exist", async () => {
    mocks.get.mockReturnValueOnce(mockOptOutCategoriesResponse);
    const res = await ds.transformOptOut("1234");
    expect(res).toEqual(null);
  });
});

/**
 * MOCK MEMBER DATA
 */

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
