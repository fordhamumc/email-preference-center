import resolvers from "../member.resolvers";
import md5 from "md5";

const mockContext = {
  dataSources: {
    mailchimpAPI: {
      getMember: jest.fn(),
      patchMember: jest.fn(),
      unsubscribeMember: jest.fn()
    }
  },
  helpers: {
    md5
  }
};

describe("[Query.member]", () => {
  const { getMember } = mockContext.dataSources.mailchimpAPI;

  it("converts email to id", async () => {
    getMember.mockReturnValueOnce({
      id: "b642b4217b34b1e8d3bd915fc65c4452"
    });

    await resolvers.Query.member(
      null,
      { input: { email: "test@test.com" } },
      mockContext
    );
    expect(getMember).toBeCalledWith({
      email: "test@test.com",
      id: "b642b4217b34b1e8d3bd915fc65c4452"
    });
  });

  it("calls lookup from mailchimp api", async () => {
    getMember.mockReturnValueOnce({
      id: "b642b4217b34b1e8d3bd915fc65c4452"
    });

    const res = await resolvers.Query.member(
      null,
      { input: { id: "b642b4217b34b1e8d3bd915fc65c4452" } },
      mockContext
    );
    expect(res).toEqual({
      id: "b642b4217b34b1e8d3bd915fc65c4452"
    });
  });

  it("throws error when input is empty", async () => {
    const res = async () =>
      await resolvers.Query.member(null, { input: {} }, mockContext);
    expect(res()).rejects.toThrow(Error);
  });

  it("throws error when member is not found", async () => {
    getMember.mockReturnValueOnce(null);
    const res = async () =>
      await resolvers.Query.member(
        null,
        { input: { id: "1234" } },
        mockContext
      );
    expect(res()).rejects.toThrow(Error);
  });
});

describe("[Mutation.updateMember]", () => {
  const { patchMember } = mockContext.dataSources.mailchimpAPI;

  it("returns an updated member", async () => {
    patchMember.mockReturnValueOnce({
      id: "f2c97b1f2d2898cd2d6466ce95d4ba33",
      email: "test2@test.com",
      interests: ["9ab9"],
      status: "unsubscribed"
    });

    const input = {
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      email: "test2@test.com",
      interests: [
        { id: "9ab9", subscribed: true },
        { id: "abcd", subscribed: false }
      ],
      status: "unsubscribed"
    };

    const res = await resolvers.Mutation.updateMember(
      null,
      { input },
      mockContext
    );
    expect(patchMember).toBeCalledWith(input);
  });
});

describe("[Mutation.unsubscribeMember]", () => {
  const { unsubscribeMember } = mockContext.dataSources.mailchimpAPI;

  const input = {
    id: "b642b4217b34b1e8d3bd915fc65c4452",
    status: "unsubscribed"
  };
  it("converts email to id", async () => {
    unsubscribeMember.mockReturnValueOnce({
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      status: "unsubscribed"
    });

    await resolvers.Mutation.unsubscribeMember(
      null,
      { input: { email: "test@test.com" } },
      mockContext
    );
    expect(unsubscribeMember).toBeCalledWith({
      email: "test@test.com",
      id: md5("test@test.com")
    });
  });
});
