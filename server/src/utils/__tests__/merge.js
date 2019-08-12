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

  it("skips merging email when __emailUpdatable is false", () => {
    const expected = { a: 1, b: 3 };
    const res = merge(
      { a: 1, b: 2, email: "test@test.com" },
      { b: 3, email: "test2@test.com", __emailUpdatable: false }
    );
    const res2 = merge(
      { a: 1, b: 2, email: "test@test.com" },
      { b: 3, email: "test2@test.com", __emailUpdatable: true }
    );
    const res3 = merge(
      { a: 1, b: 2, email: "test@test.com" },
      { b: 3, email: "test2@test.com" }
    );
    expect(res).toEqual({
      ...expected,
      email: "test@test.com",
      __emailUpdatable: false
    });

    expect(res2).toEqual({
      ...expected,
      email: "test2@test.com",
      __emailUpdatable: true
    });

    expect(res3).toEqual({ ...expected, email: "test2@test.com" });
  });

  it("skips merging id when __emailUpdatable is false", () => {
    const expected = { a: 1, b: 3 };
    const res = merge(
      { a: 1, b: 2, id: "abcd" },
      { b: 3, id: "efgh", __emailUpdatable: false }
    );
    const res2 = merge(
      { a: 1, b: 2, id: "abcd" },
      { b: 3, id: "efgh", __emailUpdatable: true }
    );
    const res3 = merge({ a: 1, b: 2, id: "abcd" }, { b: 3, id: "efgh" });

    expect(res).toEqual({ ...expected, id: "abcd", __emailUpdatable: false });
    expect(res2).toEqual({ ...expected, id: "efgh", __emailUpdatable: true });
    expect(res3).toEqual({ ...expected, id: "efgh" });
  });
});
