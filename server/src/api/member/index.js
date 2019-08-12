import memberResolver from "./member.resolvers";
import memberTypeDefs from "./member.graphql";

export default {
  resolvers: memberResolver,
  typeDefs: memberTypeDefs
};
