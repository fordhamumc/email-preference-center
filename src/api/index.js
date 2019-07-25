import md5 from "md5";
<<<<<<< HEAD
import dotenv from "dotenv";
import NodeCache from "node-cache";
import member from "./member";
import interest from "./interest";
import MailchimpAPI from "./mailchimp";
import ImcAPI from "./imc";
dotenv.config();

const myCache = new NodeCache();
const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_LIST_ID,
  IMC_CLIENT_ID,
  IMC_CLIENT_SECRET,
  IMC_REFRESH_TOKEN
} = process.env;

const dataSources = () => ({
  mailchimpAPI: new MailchimpAPI(MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID),
  imcAPI: new ImcAPI(
    IMC_CLIENT_ID,
    IMC_CLIENT_SECRET,
    IMC_REFRESH_TOKEN,
    2,
    myCache
  )
});
=======
import member from "./member";
import interest from "./interest";
import dataSources from "./datasources";
>>>>>>> upstream/master

export default {
  typeDefs: [member.typeDefs, interest.typeDefs],
  resolvers: [member.resolvers, interest.resolvers],
  dataSources,
  context: async () => ({
    helpers: {
      md5
    }
  })
};
