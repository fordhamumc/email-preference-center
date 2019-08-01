import mergeWith from "lodash/mergeWith";

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return [...new Set([...objValue, ...srcValue])];
  }
}

export default function merge(...objs) {
  return mergeWith({}, ...objs, customizer);
}
