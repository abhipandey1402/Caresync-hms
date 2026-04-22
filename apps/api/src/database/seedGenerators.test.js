import { generateDiagnosisRecords, generateMedicineMasterRecords } from "./seedGenerators.js";

describe("seed generators", () => {
  it("creates at least the required medicine master volume", () => {
    const records = generateMedicineMasterRecords(6000);

    expect(records).toHaveLength(6000);
    expect(new Set(records.map((record) => record.code)).size).toBe(6000);
  });

  it("creates at least the required diagnosis volume", () => {
    const records = generateDiagnosisRecords(3500);

    expect(records).toHaveLength(3500);
    expect(new Set(records.map((record) => record.code)).size).toBe(3500);
  });
});
