import memberReducer, {
  ___DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_GHOSTS_MEMBER_FIELDS_REDUCER___
} from "../imc.member.reducer";
import cloneDeep from "lodash/cloneDeep";
import { mockMember, mockFields, mockMemberResponse } from "./__mockdata";

describe("[ImcAPI.memberReducer]", () => {
  it("transforms member", () => {
    expect(memberReducer(mockMemberResponse.data)).toEqual(mockMember);
  });

  it("returns null for empty gdpr", () => {
    const member = cloneDeep(mockMember);
    const response = cloneDeep(mockMemberResponse.data);
    member.gdpr = null;
    response.customFields = response.customFields.map(field => {
      if (field.name === "GDPR Email Consent") field.value = "";
      return field;
    });
    expect(memberReducer(response)).toEqual(member);
  });

  it("transforms unsubscribed member", () => {
    const unsubResponse = cloneDeep(mockMemberResponse.data);
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
    expect(
      ___DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_GHOSTS_MEMBER_FIELDS_REDUCER___(
        mockMemberResponse.data
      )
    ).toEqual(mockFields);
  });
});
