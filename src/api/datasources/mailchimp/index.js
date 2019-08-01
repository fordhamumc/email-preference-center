import PQueue from "p-queue";
import keyBy from "lodash/keyBy";
import { RESTDataSource } from "apollo-datasource-rest";
import memberReducer from "./mailchimp.member.reducer";

const Queue = new PQueue({ concurrency: 10 });

export default class MailchimpAPI extends RESTDataSource {
  constructor({ key, listId, optOutCategory }) {
    super();

    if (!/.+\-.+/.test(key)) {
      throw new Error(`missing or invalid api key: ${key}`);
    }

    this.API_KEY = key;
    this.LIST_ID = listId;
    this.OPT_OUT_CATEGORY = optOutCategory;
    this.baseURL = `https://${key.split("-")[1]}.api.mailchimp.com/3.0/`;
  }

  async willSendRequest(request) {
    request.headers.set(
      "User-Agent",
      "mailchimp-graphql : https://github.com/michaeldfoley/mailchimp-graphql"
    );
    request.headers.set(
      "Authorization",
      `Basic ${Buffer.from("any:" + this.API_KEY).toString("base64")}`
    );
    if (!request.params.has("fields")) {
      request.params.set("exclude_fields", "_links");
    }
  }

  async queuedFetch(method, path, body, init) {
    return Queue.add(() => super[method](path, body, init));
  }

  async get(path, params, init) {
    return this.queuedFetch("get", path, params, init);
  }

  async patch(path, body, init) {
    return this.queuedFetch("patch", path, body, init);
  }

  async getMember({ id }, listId = this.LIST_ID) {
    let member = await this.get(`lists/${listId}/members/${id}`, {
      fields: [
        "id",
        "email_address",
        "email_type",
        "status",
        "merge_fields",
        "interests"
      ]
    });
    return memberReducer(member, this);
  }

  async patchMember(
    { id, status, email, optOuts = [] },
    optOutCategory = this.OPT_OUT_CATEGORY,
    listId = this.LIST_ID
  ) {
    const payload = {};
    if (status) payload.status = status;
    if (email) payload.email_address = email;

    payload.interests = {};
    return Promise.all(
      optOuts.map(async optOut => {
        const optOutId = await this.transformOptOut(
          optOut.name,
          "name",
          "id",
          optOutCategory,
          listId
        );
        if (optOutId) {
          payload.interests[optOutId] = optOut.optOut;
        }
        return optOutId;
      })
    ).then(async _ => {
      const member = await this.patch(`lists/${listId}/members/${id}`, payload);
      return memberReducer(member, this);
    });
  }

  async unsubscribeMember({ id }, listId = this.LIST_ID) {
    return await this.patchMember(
      { id, status: "unsubscribed" },
      this.OPT_OUT_CATEGORY,
      listId
    );
  }

  async getOptOutById(
    id,
    optOutCategory = this.OPT_OUT_CATEGORY,
    listId = this.LIST_ID
  ) {
    return this.transformOptOut(id, "id", "name", optOutCategory, listId);
  }

  async getOptOutCategories(
    optOutCategory = this.OPT_OUT_CATEGORY,
    listId = this.LIST_ID,
    limit = 60
  ) {
    return (await this.get(
      `lists/${listId}/interest-categories/${optOutCategory}/interests`,
      {
        fields: ["interests.id", "interests.category_id", "interests.name"],
        count: limit
      },
      {
        cacheOptions: { ttl: 3600 }
      }
    ))["interests"];
  }

  async transformOptOut(
    optOut,
    from,
    to,
    optOutCategory = this.OPT_OUT_CATEGORY,
    listId = this.LIST_ID
  ) {
    const optOutsKeyed = keyBy(
      await this.getOptOutCategories(optOutCategory, listId),
      from
    );
    if (!optOutsKeyed.hasOwnProperty(optOut)) return null;
    return optOutsKeyed[optOut][to];
  }
}
