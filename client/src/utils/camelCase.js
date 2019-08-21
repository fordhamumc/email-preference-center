const camelCase = str => str.replace(/\W+(.)/g, (_, chr) => chr.toUpperCase());

export default camelCase;
