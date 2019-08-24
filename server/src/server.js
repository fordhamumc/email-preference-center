if (process.env.NODE_ENV === "production") require("newrelic");
import { ApolloServer } from "apollo-server";
import gqlServerConfig from "./api";

const server = new ApolloServer(gqlServerConfig);

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
