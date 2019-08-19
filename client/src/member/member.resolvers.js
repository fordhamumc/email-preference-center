import gql from "graphql-tag";

const getOptOuts = (memberId, { cache, getCacheKey }) => {
  const fragment = gql`
    fragment optOuts on Member {
      optOuts
    }
  `;
  const id = getCacheKey({ __typename: "Member", id: memberId });
  return [cache.readFragment({ fragment, id }), id];
};

const updateOptOut = (_root, { input }, ctx) => {
  const [data, id] = getOptOuts(input.id, ctx);
  data.optOuts = [...data.optOuts, input.name];
  ctx.cache.writeData({ id, data });
  return null;
};

const deleteOptOut = (_root, { input }, ctx) => {
  const [data, id] = getOptOuts(input.id, ctx);
  data.optOuts = data.optOuts.filter(optOut => optOut !== input.name);
  ctx.cache.writeData({ id, data });
  return null;
};

const setEmail = (_root, { input }, { cache, getCacheKey }) => {
  const id = getCacheKey({
    __typename: "Member",
    id: input.id
  });
  cache.writeData({ id, data: { email: input.email } });
};

export default {
  Mutation: {
    updateOptOut,
    deleteOptOut,
    setEmail
  }
};
