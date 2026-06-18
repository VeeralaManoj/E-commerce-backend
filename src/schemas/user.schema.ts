import { z } from "zod";
import { USER_ROLES } from "../constants/roles.js";

export const updateUserRoleSchema = z.object({
  body: z.object({ role: z.enum(USER_ROLES) })
});
