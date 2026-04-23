import { COLLECTION_NAMES, USER_ROLES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const userSchema = createTenantScopedSchema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: { type: String, enum: USER_ROLES, required: true },
    passwordHash: { type: String, required: true, select: false },
    loginAttempts: { type: Number, default: 0, min: 0 },
    lockUntil: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    permissions: [{ type: String, trim: true }],
    refreshTokens: [
      {
        tokenId: { type: String, required: true, trim: true },
        tokenHash: { type: String, required: true },
        deviceInfo: { type: String, trim: true, maxlength: 200 },
        createdAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true }
      }
    ],
    profile: {
      registrationNumber: { type: String, trim: true },
      specialization: { type: String, trim: true }
    },
    lastLoginAt: { type: Date, default: null }
  },
  { collection: COLLECTION_NAMES.users }
);

userSchema.index({ tenantId: 1, phone: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ "refreshTokens.tokenId": 1 }, { sparse: true });

export const User = registerModel("User", userSchema);
