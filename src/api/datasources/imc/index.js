import { RESTDataSource } from "apollo-datasource-rest";
import querystring from "querystring";
import to from "../../../utils/to";
import memberReducer, { memberFieldsReducer } from "./imc.member.reducer";
import NodeCache from "node-cache";

export default class ImcAPI extends RESTDataSource {
  constructor({
    id,
    secret,
    refreshToken,
    databaseId,
    pod,
    cache = new NodeCache()
  }) {
    super();
    this._cache = cache;

    if (!id || !secret || !refreshToken) {
      throw new Error("missing credentials");
    }

    if (
      !Array(8)
        .fill()
        .map((_, i) => i + 1)
        .includes(+pod)
    ) {
      throw new Error("invalid pod");
    }

    this.baseURL = `https://api${pod}.ibmmarketingcloud.com/`;
    this.CLIENT_ID = id;
    this.CLIENT_SECRET = secret;
    this.REFRESH_TOKEN = refreshToken;
    this.DATABASE_ID = databaseId;
    this.getOAuthAccessToken();
  }

  async willSendRequest(request) {
    if (request.path !== "oauth/token") {
      const accessToken = await this.getOAuthAccessToken();
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  async getOAuthAccessToken() {
    let cachedToken;
    cachedToken = this._cache.get(`${this.CLIENT_ID}::token`);
    return cachedToken || (await this.refreshOAuthAccessToken());
  }

  async refreshOAuthAccessToken() {
    const body = querystring.stringify({
      grant_type: "refresh_token",
      client_id: this.CLIENT_ID,
      client_secret: this.CLIENT_SECRET,
      refresh_token: this.REFRESH_TOKEN
    });
    const [err, res] = await to(
      this.post("oauth/token", body, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
    );
    this._cache.set(
      `${this.CLIENT_ID}::token`,
      res.access_token,
      res.expires_in
    );
    return res.access_token;
  }

  async getMember({ recipientId: id }, databaseId = this.DATABASE_ID) {
    if (!id) return null;
    const member = await this.get(
      `rest/databases/${databaseId}/contacts/${id}`
    );
    return memberReducer({ id, ...member.data });
  }

  async patchMember(
    { recipientId: id, status, optOuts },
    databaseId = this.DATABASE_ID
  ) {
    if (!id) return null;
    const payload = { customFields: [] };
    if (status) {
      payload.customFields.push({
        name: "Fordham Opt Out",
        value: ["unsubscribed", "cleaned"].includes(status) ? "Yes" : "None"
      });
    }
    if (optOuts) {
      payload.customFields = [
        ...payload.customFields,
        ...(await this.transformOutOuts({ id, optOuts, databaseId }))
      ];
    }
    const member = this.patch(
      `rest/databases/${databaseId}/contacts/${id}`,
      payload
    ).then(async _ => await this.getMember({ recipientId: id }, databaseId));
    return member;
  }

  async unsubscribeMember({ recipientId }, databaseId = this.DATABASE_ID) {
    return await this.patchMember(
      { recipientId, status: "unsubscribed" },
      databaseId
    );
  }

  async getOptOutCategories(id, databaseId = this.DATABASE_ID) {
    const member = await this.get(
      `rest/databases/${databaseId}/contacts/${id}`
    );
    return Object.keys(memberFieldsReducer(member.data).optOuts);
  }

  async transformOutOuts({ id, optOuts = [], databaseId }) {
    const optOutCategories = await this.getOptOutCategories(id, databaseId);
    return optOuts
      .filter(({ name }) => optOutCategories.includes(name))
      .map(optOut => ({
        name: `Opt Out ${optOut.name}`,
        value: optOut.optOut ? "Yes" : "No"
      }));
  }
}
