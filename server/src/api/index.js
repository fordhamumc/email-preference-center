import md5 from "md5";
import member from "./member";
import dataSources from "./datasources";

// resolve something for uptime monitor that doesn't touch the apis
const ping = `
extend type Query {
  nr: String
}
`;

const pingResolver = {
  Query: {
    nr: () => "success"
  }
};

export default {
  typeDefs: [member.typeDefs, ping],
  resolvers: [member.resolvers, pingResolver],
  dataSources,
  context: async () => ({
    helpers: {
      md5
    }
  })
};
