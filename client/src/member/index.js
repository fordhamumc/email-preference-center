import memberResolvers from "./member.resolvers";
import gql from "graphql-tag";

const MEMBER_FRAGMENT = gql`
  fragment memberFields on Member {
    id
    firstName
    lastName
    status
    email
    optOuts
    gdpr
    current
    recipientId
  }
`;

export const GET_MEMBER = gql`
  query getMember($input: MemberInput!) {
    member(input: $input) {
      ...memberFields
    }
  }
  ${MEMBER_FRAGMENT}
`;

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($input: MemberUpdateInput!) {
    member: updateMember(input: $input) {
      ...memberFields
    }
  }
  ${MEMBER_FRAGMENT}
`;

export default {
  resolvers: memberResolvers
};
