import { getSession } from "@/lib/auth";
import { HeaderNav } from "./header-nav";

export async function SiteHeader() {
  const user = await getSession();
  return <HeaderNav user={user} />;
}
