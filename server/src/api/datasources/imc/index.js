import { RESTDataSource } from "apollo-datasource-rest";
import querystring from "querystring";
import to from "../../../utils/to";
import memberReducer from "./imc.member.reducer";
import NodeCache from "node-cache";
import { parseStringPromise } from "xml2js";

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
    if (request.path.startsWith("XMLAPI")) {
      request.headers.set("Content-Type", "text/xml;charset=utf-8");
    }
    return request;
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
    const [, res] = await to(
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

  getRecipientId(id) {
    return isNaN(id)
      ? String(parseInt(Buffer.from(id, "base64").toString("ascii")))
      : id;
  }

  async getMember({ recipientId }, databaseId = this.DATABASE_ID) {
    if (!recipientId) return null;
    const id = this.getRecipientId(recipientId);
    const member = await this.get(
      `rest/databases/${databaseId}/contacts/${id}`
    );
    return memberReducer({ id: recipientId, ...member.data });
  }

  async patchMember(
    { recipientId, status, optOuts, gdpr },
    databaseId = this.DATABASE_ID
  ) {
    if (!recipientId) return null;
    const id = this.getRecipientId(recipientId);
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
        await this.transformOutOutsToCustomFields(optOuts)
      ];
    }
    payload.customFields = [
      ...payload.customFields,
      {
        name: "Preference Form Modified",
        value: new Date().toISOString()
      }
    ];
    if (typeof gdpr === "boolean")
      payload.customFields = [
        ...payload.customFields,
        {
          name: "GDPR Email Consent",
          value: gdpr ? new Date().toISOString() : ""
        }
      ];
    const member = this.patch(
      `rest/databases/${databaseId}/contacts/${id}`,
      payload
    ).then(async () => await this.getMember({ recipientId }, databaseId));
    return member;
  }

  async unsubscribeMember({ recipientId }, databaseId = this.DATABASE_ID) {
    return await this.patchMember(
      { recipientId, status: "unsubscribed" },
      databaseId
    );
  }

  async getOptOutCategories(databaseId = this.DATABASE_ID) {
    const meta = await this.post(
      "XMLAPI",
      `<?xml version="1.0" encoding="UTF-8"?><Envelope><Body><GetListMetaData><LIST_ID>${databaseId}</LIST_ID></GetListMetaData></Body></Envelope>`
    );
    const result = await parseStringPromise(meta, {
      normalizeTags: true,
      explicitArray: false
    });
    return result.envelope.body.result.columns.column.filter(
      column => column.name === "Opt Out Areas"
    )[0].selection_values.value;
  }

  async transformOutOutsToCustomFields(optOuts) {
    if (!Array.isArray(optOuts)) return [];
    const optOutCategories = await this.getOptOutCategories();
    return {
      name: "Opt Out Areas",
      value: optOuts
        .filter(({ optOut }) => optOut)
        .map(optOut => optOut.name)
        .filter(optOut => optOutCategories.includes(optOut))
        .join(";")
    };
  }
}
