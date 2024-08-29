// This one used for get session data in server component as reusable Function
import { auth } from "@/auth";

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user.role;
};
