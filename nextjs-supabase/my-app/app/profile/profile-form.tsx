"use client"

import { z } from "zod"
import { useForm, ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

import { updateProfile } from "./actions"
import { createClient } from "@/lib/supabase/client"

// Zod schema
const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 chars").max(20),
})

type FormValues = z.infer<typeof formSchema>

export default function ProfileForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
    },
  })

  // Optional: prefill current profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!user || authError) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("email, username")
          .eq("id", user.id)
          .single()

        if (profile) {
          form.reset({
            email: profile.email || "",
            username: profile.username || "",
          })
        }
      } catch {
        // ignore for now
      }
    }
    loadProfile()
  }, [form])

  // Submit handler
  async function onSubmit(values: FormValues) {
    setError(null)
    setLoading(true)
    try {
      await updateProfile(values)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: ControllerRenderProps<FormValues> }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }: { field: ControllerRenderProps<FormValues> }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="janmaravilla" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error display */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  )
}
