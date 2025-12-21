"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
})

export async function updateProfile(values: z.infer<typeof schema>) {
  const supabase = await createClient() // use your server.ts client

  // // Get the logged-in user
  // const {
  //   data: { user },
  //   error: authError,
  // } = await supabase.auth.getUser()

  // if (!user || authError) {
  //   throw new Error("Unauthorized")
  // }

  // Upsert the profile
  const { error } = await supabase
    .from("users")
    .upsert({
      email: values.email,
      username: values.username,
    })

  if (error) {
    throw new Error(error.message)
  }
}
