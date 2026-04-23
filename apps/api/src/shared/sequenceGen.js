import { Sequence } from "../models/sequence.model.js";

const UHID_PREFIX = "P";
const UHID_MAX = 99999;

export const generateUHID = async (tenantId, session) => {
  const seq = await Sequence.findOneAndUpdate(
    { tenantId, type: "UHID", prefix: UHID_PREFIX },
    [
      {
        $set: {
          value: {
            $cond: [
              { $gte: ["$value", UHID_MAX] },
              1,
              { $add: [{ $ifNull: ["$value", 0] }, 1] }
            ]
          },
          prefix: UHID_PREFIX,
          type: "UHID"
        }
      }
    ],
    { upsert: true, new: true, session }
  );

  return `${UHID_PREFIX}-${String(seq.value).padStart(5, "0")}`;
};
