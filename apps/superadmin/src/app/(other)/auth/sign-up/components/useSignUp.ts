"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { supabase } from '@/lib/supabase';
import { useNotificationContext } from "@/context/useNotificationContext";

const signUpFormSchema = yup.object({
  name: yup.string().required("Please enter Name"),
  email: yup.string().email("Please enter a valid email").required("Please enter Email"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Please enter password"),
});

type SignUpFormData = yup.InferType<typeof signUpFormSchema>;

const useSignUp = () => {
  const [loading, setLoading] = useState(false);
  const [inviteMode, setInviteMode] = useState(false);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const { push } = useRouter();
  const { showNotification } = useNotificationContext();
  const isInviteOnly = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_DISABLED === "true";

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queryParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const type = queryParams.get("type") || hashParams.get("type");
    const hasInvite =
      type === "invite" ||
      queryParams.get("invite") === "true" ||
      hashParams.get("invite") === "true" ||
      hashParams.has("access_token");

    if (hasInvite) {
      setInviteMode(true);
    }
  }, []);

  useEffect(() => {
    if (!inviteMode) return;
    let active = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setInviteEmail(data.session?.user?.email ?? null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user?.email) {
        setInviteEmail(session.user.email);
      }
    });

    loadSession();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [inviteMode]);

  const setInvitePassword = async (password: string) => {
    setInviteLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        throw new Error("Invite session expired. Please use the invite link again.");
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw new Error(error.message);
      }

      await supabase.auth.signOut();
      showNotification({
        message: "Password set successfully. Please sign in with your new password.",
        variant: "success",
      });
      push("/auth/sign-in?message=password-set");
    } catch (error) {
      console.error("Invite password error:", error);
      showNotification({
        message: error instanceof Error ? error.message : "Failed to set password",
        variant: "danger",
      });
      throw error;
    } finally {
      setInviteLoading(false);
    }
  };

  const signUp = handleSubmit(async (values: SignUpFormData) => {
    if (isInviteOnly) {
      showNotification({
        message: "Sign up is invite-only. Please request an invite from your administrator.",
        variant: "warning",
      });
      return;
    }
    setLoading(true);
    try {
      // Split name into first and last name
      const nameParts = values.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Check if email already exists in profiles table
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', values.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Error checking existing accounts: ' + checkError.message);
      }

      if (existingProfile) {
        throw new Error('An account with this email address already exists. Please try signing in instead.');
      }

      // Create auth user (passwords are managed by Supabase Auth)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: values.name,
          },
        },
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create account');
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          full_name: values.name,
          email: values.email,
          role: 'user',
          is_active: true,
        });

      if (profileError) {
        throw new Error(profileError.message);
      }

      showNotification({
        message: "Account created successfully! You can now sign in with your credentials.",
        variant: "success",
      });

      // Redirect to sign-in page
      push("/auth/sign-in?message=account-created");
      
    } catch (error) {
      console.error("Signup error:", error);
      showNotification({
        message: error instanceof Error ? error.message : "Failed to create account",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  });

  return {
    control,
    loading,
    signUp,
    errors,
    inviteMode,
    inviteEmail,
    inviteLoading,
    setInvitePassword,
  };
};

export default useSignUp;
