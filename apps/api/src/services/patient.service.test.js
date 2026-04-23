import { describe, expect, it } from "@jest/globals";
import { __private__ } from "./patient.service.js";

describe("patient service normalization", () => {
  it("accepts PAT payload aliases", () => {
    const payload = __private__.normalizePatientPayload({
      name: "Ramesh Kumar Singh",
      phone: "9876543210",
      gender: "M",
      dob: "1985-03-15",
      address: {
        city: "Patna",
        district: "Patna",
        state: "Bihar",
        pin: "800001"
      }
    });

    expect(payload.gender).toBe("male");
    expect(payload.dateOfBirth).toBe("1985-03-15");
    expect(payload.address).toEqual({
      city: "Patna",
      district: "Patna",
      state: "Bihar",
      pin: "800001",
      pincode: "800001"
    });
  });

  it("rejects unsupported gender values", () => {
    expect(() =>
      __private__.normalizePatientPayload({
        name: "Ramesh Kumar Singh",
        phone: "9876543210",
        gender: "x"
      })
    ).toThrow(/Gender must be one of/);
  });
});
