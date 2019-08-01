import MailchimpAPI from "..";
import keyBy from "lodash/keyBy";

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
ds.get = mocks.get;
ds.patch = mocks.patch;
ds.getOptOutCategories = mocks.getOptOutCategories;

async function tempMockFunction(mockFunctions = [], fn = () => {}) {
  if (typeof mockFunctions == "string") mockFunctions = [mockFunctions];
  const temp = {};

  mockFunctions.forEach(mock => {
    temp[mock] = ds[mock];
    ds[mock] = jest.fn();
  });

  await fn();

  // restore temporarily mocked function
  mockFunctions.forEach(mock => {
    ds[mock] = temp[mock];
  });
}

describe("[MailchimpAPI.constructor]", () => {
  it("throws error when empty or invalid api is passed", () => {
    expect(() => new MailchimpAPI("ABC")).toThrow(Error);
    expect(() => new MailchimpAPI()).toThrow(Error);
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
        interests: {}
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
        }
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
      { status: "unsubscribed", interests: {} }
    );
  });
});

// describe("[MailchimpAPI.getInterestById]", () => {
//   it("should get an interest by id", async () => {
//     tempMockFunction("getAllInterestsObject", async () => {
//       ds.getAllInterestsObject.mockReturnValueOnce(
//         keyBy([...mockInterestsByCategory1, ...mockInterestsByCategory2], "id")
//       );
//       const res = await ds.getInterestById("fjkd453");
//       expect(res).toEqual(mockInterest);
//     });
//   });
// });

// describe("[MailchimpAPI.getAllInterests]", () => {
//   it("should return an array of interests", async () => {
//     tempMockFunction("getAllInterestsObject", async () => {
//       ds.getAllInterestsObject.mockReturnValueOnce(
//         keyBy([...mockInterestsByCategory1, ...mockInterestsByCategory2], "id")
//       );
//       const res = await ds.getAllInterests();
//       expect(res).toEqual([
//         ...mockInterestsByCategory1,
//         ...mockInterestsByCategory2
//       ]);
//     });
//   });
// });

// describe("[MailchimpAPI.getAllInterestsObject]", () => {
//   it("should return an object of interests keyed by id", async () => {
//     tempMockFunction(
//       ["getInterestCategories", "getInterestsByCategory"],
//       async () => {
//         ds.getInterestCategories.mockReturnValueOnce(
//           mockInterestCategoriesResponse["categories"]
//         );
//         ds.getInterestsByCategory
//           .mockReturnValueOnce(mockInterestsByCategory1)
//           .mockReturnValueOnce(mockInterestsByCategory2);

//         const res = await ds.getAllInterestsObject();
//         expect(res).toEqual(
//           keyBy(
//             [...mockInterestsByCategory1, ...mockInterestsByCategory2],
//             "id"
//           )
//         );
//       }
//     );
//   });

//   it("should return cached interests if they exist", async () => {
//     const tempInterests = ds.allInterests;
//     ds.allInterests = mockInterestsByCategory1;
//     const res = await ds.getAllInterests();
//     expect(res).toEqual(mockInterestsByCategory1);
//     ds.allInterests = tempInterests;
//   });
// });

// describe("[MailchimpAPI.getInterestCategories]", () => {
//   it("should get an array of interest categories", async () => {
//     mocks.get.mockReturnValueOnce(mockInterestCategoriesResponse);

//     const res = await ds.getInterestCategories();
//     expect(res).toEqual(mockInterestCategoriesResponse["categories"]);
//   });
// });

// describe("[MailchimpAPI.getInterestsByCategory]", () => {
//   it("should get an array interests by category id", async () => {
//     mocks.get.mockReturnValueOnce(mockInterestsByCategoryResponse1);

//     const res = await ds.getInterestsByCategory("44rr43");
//     expect(res).toEqual(mockInterestsByCategory1);
//     expect(mocks.get).toBeCalledWith(
//       `lists/${MOCK_LIST_ID}/interest-categories/44rr43/interests`,
//       {
//         fields: [
//           "interests.id",
//           "interests.category_id",
//           "interests.name",
//           "interests.subscriber_count"
//         ],
//         count: 60
//       },
//       {
//         cacheOptions: { ttl: 3600 }
//       }
//     );
//   });
// });

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

/**
 * MOCK MEMBER DATA
 */

// Transformed member data
const mockInterest = {
  id: "fjkd453",
  categoryId: "44rr43",
  name: "Test Category",
  count: "10"
};

const mockInterestsByCategory1 = [
  {
    id: "fjkd453",
    categoryId: "44rr43",
    name: "Test Category",
    count: "10"
  },
  {
    id: "854dk03",
    categoryId: "44rr43",
    name: "Test Category 2",
    count: "45"
  },
  {
    id: "cjijfkd",
    categoryId: "44rr43",
    name: "Test Category 3",
    count: "1"
  },
  {
    id: "77ccs7s",
    categoryId: "44rr43",
    name: "Test Category 4",
    count: "1203"
  }
];

const mockInterestsByCategory2 = [
  {
    id: "e392hk",
    categoryId: "r5ewui",
    name: "Test Category 5",
    count: "1033"
  },
  {
    id: "8ksjhd",
    categoryId: "r5ewui",
    name: "Test Category 6",
    count: "4544"
  },
  {
    id: "skd9h",
    categoryId: "r5ewui",
    name: "Test Category 7",
    count: "4954"
  }
];

// Raw response from API

const mockInterestCategoriesResponse = {
  categories: [{ id: "44rr43" }, { id: "dsjka5" }]
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
