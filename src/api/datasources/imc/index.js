import { RESTDataSource } from "apollo-datasource-rest";
import querystring from "querystring";
import to from "../../../utils/to";
import memberReducer from "./imc.member.reducer";

export default class ImcAPI extends RESTDataSource {
  constructor(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, pod, cache) {
    super();
    this._cache = cache;

    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
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
    this.CLIENT_ID = CLIENT_ID;
    this.CLIENT_SECRET = CLIENT_SECRET;
    this.REFRESH_TOKEN = REFRESH_TOKEN;
    this.DATABASE_ID = 5200369;
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
    if (this._cache !== null) {
      cachedToken = this._cache.get(`${this.CLIENT_ID}::token`);
    }
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
    return res.accessToken;
  }

  async getMemberById(id, databaseId = this.DATABASE_ID) {
    const member = await this.get(
      `rest/databases/${databaseId}/contacts/${id}`
    );
    return memberReducer(id, member.data);
  }
}
