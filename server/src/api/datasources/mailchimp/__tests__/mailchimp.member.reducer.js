import MailchimpAPI from "..";
import memberReducer from "../mailchimp.member.reducer";
import cloneDeep from "lodash/cloneDeep";
import {
  mockMember,
  mockMemberResponse,
  mockOptOutCategoriesResponse
} from "./__mockdata";

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
  it("returns null for empty gdpr", async () => {
    ds.get.mockReturnValue(mockOptOutCategoriesResponse);
    const member = cloneDeep(mockMember);
    const response = cloneDeep(mockMemberResponse);
    member.gdpr = null;
    response.merge_fields.GDPR = "";
    expect(await memberReducer(response, ds)).toEqual(member);
  });
});
