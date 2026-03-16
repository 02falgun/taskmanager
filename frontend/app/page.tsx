import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function RootPage() {
  const cookieStore = cookies();
  // We rely on tokens stored in localStorage on the client side.
  // The dashboard layout handles the auth guard redirect to /login.
  redirect("/dashboard");
}
