import NodeCache from "node-cache";
import MailchimpAPI from "./mailchimp";
import ImcAPI from "./imc";

const myCache = new NodeCache();
const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_LIST_ID,
  MAILCHIMP_OPT_OUT_CATEGORY,
  IMC_CLIENT_ID,
  IMC_CLIENT_SECRET,
  IMC_REFRESH_TOKEN,
  IMC_DATABASE_ID
} = process.env;

const dataSources = () => ({
  mailchimpAPI: new MailchimpAPI({
    key: MAILCHIMP_API_KEY,
    listId: MAILCHIMP_LIST_ID,
    optOutCategory: MAILCHIMP_OPT_OUT_CATEGORY
  }),
  imcAPI: new ImcAPI({
    id: IMC_CLIENT_ID,
    secret: IMC_CLIENT_SECRET,
    refreshToken: IMC_REFRESH_TOKEN,
    databaseId: IMC_DATABASE_ID,
    pod: 2,
    cache: myCache
  })
});

export default dataSources;
