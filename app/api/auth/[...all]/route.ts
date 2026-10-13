import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Alle verzoeken naar /api/auth/... (inloggen, uitloggen, sessie ophalen)
// worden door Better Auth afgehandeld.
export const { GET, POST } = toNextJsHandler(auth);
