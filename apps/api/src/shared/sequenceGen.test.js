import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { generateUHID } from "./sequenceGen.js";
import { Sequence } from "../models/sequence.model.js";

describe("generateUHID", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns unique values for concurrent registrations", async () => {
    let currentValue = 0;

    jest.spyOn(Sequence, "findOneAndUpdate").mockImplementation(async () => {
      currentValue += 1;
      return { value: currentValue };
    });

    const [first, second] = await Promise.all([
      generateUHID("tenant-1"),
      generateUHID("tenant-1")
    ]);

    expect(first).toBe("P-00001");
    expect(second).toBe("P-00002");
    expect(first).not.toBe(second);
  });

  it("resets to the first value after 99999", async () => {
    jest.spyOn(Sequence, "findOneAndUpdate").mockResolvedValue({ value: 1 });

    await expect(generateUHID("tenant-1")).resolves.toBe("P-00001");
  });
});
