import { createClient } from "./client";

export async function getViews() {

  const supabase = createClient();
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw new Error(error.message);
  return data;
}
