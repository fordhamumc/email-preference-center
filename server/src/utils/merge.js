import mergeWith from "lodash/mergeWith";

function customizer(objValue, srcValue, key, obj, src) {
  // combine and dedupe array
  if (Array.isArray(objValue)) {
    return [...new Set([...objValue, ...srcValue])];
  }

  // if email is not updatable on this datasource don't override email or id
  if (
    ["email", "id"].includes(key) &&
    obj.hasOwnProperty(key) &&
    src.__emailUpdatable === false
  ) {
    return obj[key];
  }
}

export default function merge(...objs) {
  return mergeWith({}, ...objs, customizer);
}
