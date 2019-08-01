import merge from "../merge";

describe("[utils.merge]", () => {
  it("concatenates arrays", () => {
    const res = merge({ a: 1, b: [1, 2, 3] }, { b: ["a", "b"], c: ["f", "g"] });
    expect(res).toEqual({ a: 1, b: [1, 2, 3, "a", "b"], c: ["f", "g"] });
  });

  it("dedups arrays", () => {
    const res = merge({ b: [1, 2, 3] }, { b: ["a", 2] });
    expect(res).toEqual({ b: [1, 2, 3, "a"] });
  });
});
