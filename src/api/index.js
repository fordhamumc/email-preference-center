import md5 from "md5";
import member from "./member";
import dataSources from "./datasources";

export default {
  typeDefs: [member.typeDefs],
  resolvers: [member.resolvers],
  dataSources,
  context: async () => ({
    helpers: {
      md5
    }
  })
};
