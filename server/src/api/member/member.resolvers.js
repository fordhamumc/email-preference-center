import to from "../../utils/to";
import merge from "../../utils/merge";

async function member(_, { input }, ctx) {
  return loopDataSources("getMember", input, ctx);
}

async function updateMember(_, { input }, ctx) {
  return loopDataSources("patchMember", input, ctx);
}

async function unsubscribeMember(_, { input }, ctx) {
  return loopDataSources("unsubscribeMember", input, ctx);
}

async function loopDataSources(
  fnName,
  input,
  { dataSources, helpers: { md5 } }
) {
  input.id = getId(input, md5);
  const sources = Promise.all(
    Object.keys(dataSources).map(async source => {
      return (await to(dataSources[source][fnName](input)))[1];
    })
  );
  const member = merge(...(await sources));
  if (Object.keys(member).length === 0) {
    throw new Error("Member does not exist");
  }
  return member;
}

function getId(input, hash) {
  let id = input.id;
  if (!Object.keys(input).length) {
    throw new Error("Input field required.");
  }
  if (!input.id && input.email) {
    id = hash(input.email.toLowerCase());
  }
  return id;
}

export default {
  Query: {
    member
  },
  Mutation: {
    updateMember,
    unsubscribeMember
  }
};
