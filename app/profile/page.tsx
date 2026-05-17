"use client";

// app/profile/page.tsx
// Shows the user's full profile fetched from the DB.
// If onboarding not complete (no profile row), redirects to /about-user.
// Edit button opens an inline edit panel that PATCHes /api/user/profile.

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  User, Phone, Mail, Edit3, Check, X, Loader2,
  Activity, Droplets, Moon, Ruler, Weight,
  Heart, Leaf, AlertCircle, StickyNote, Calendar,
  Shield, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PageLoader } from "@/components/ui/page-loader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id:          string;
  fullName:    string;
  email:       string;
  phoneNumber: string | null;
  role:        string;
  createdAt:   string;
  profile: {
    age:               number | null;
    gender:            string | null;
    heightCm:          number | null;
    weightKg:          number | null;
    activityLevel:     string | null;
    dietaryPreference: string | null;
    allergies:         string[];
    medicalConditions: string[];
    goals:             string[];
    sleepHours:        number | null;
    waterIntakeLitres: number | null;
    notes:             string | null;
  } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male", FEMALE: "Female", OTHER: "Other",
};

const DIETARY_LABELS: Record<string, string> = {
  VEG: "Vegetarian", VEGAN: "Vegan", NON_VEG: "Non-Vegetarian",
  EGGETARIAN: "Eggetarian", KETO: "Keto", OTHER: "Other",
};

const ACTIVITY_LABELS: Record<string, string> = {
  SEDENTARY: "Sedentary", LIGHT: "Light", MODERATE: "Moderate",
  ACTIVE: "Active", ATHLETE: "Athlete",
};

const ROLE_LABELS: Record<string, string> = {
  FREE_USER: "Free", CHAT_USER: "Chat Member",
  APPOINTMENT_USER: "Appointment Member", ADMIN: "Admin",
};

const HEALTH_GOALS = [
  "Weight Loss","Muscle Gain","Gut Health","Manage Diabetes",
  "Heart Health","Boost Immunity","Better Sleep","Reduce Stress","General Wellness",
];

const DIETARY_OPTIONS = [
  { label: "Vegetarian",     value: "VEG"       },
  { label: "Vegan",          value: "VEGAN"     },
  { label: "Non-Vegetarian", value: "NON_VEG"   },
  { label: "Eggetarian",     value: "EGGETARIAN"},
  { label: "Keto",           value: "KETO"      },
  { label: "Other",          value: "OTHER"     },
];

const ACTIVITY_OPTIONS = [
  { label: "Sedentary (little/no exercise)", value: "SEDENTARY" },
  { label: "Light (1-3 days/week)",          value: "LIGHT"     },
  { label: "Moderate (3-5 days/week)",       value: "MODERATE"  },
  { label: "Active (6-7 days/week)",         value: "ACTIVE"    },
  { label: "Athlete (2x/day)",               value: "ATHLETE"   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();

  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  // Avatar upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);

  // Edit form state — mirrors profile fields
  const [form, setForm] = useState({
    fullName:          "",
    phoneNumber:       "",
    dob:               "",           // we store age, but let user pick DOB to update it
    gender:            "",
    dietaryPref:       "",
    activityLevel:     "",
    healthGoals:       [] as string[],
    heightCm:          "",
    weightKg:          "",
    allergies:         "",           // comma-separated string in UI
    medicalConditions: "",
    sleepHours:        "",
    waterIntakeLitres: "",
    notes:             "",
  });

  // ── Fetch profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUser) { router.push("/"); return; }

    async function load() {
      const res  = await fetch("/api/user/profile");
      const data = await res.json();

      if (!data.success || !data.user) {
        // No profile yet → send to onboarding
        router.push("/about-user");
        return;
      }

      setProfile(data.user);
      setAvatarPreview(clerkUser?.imageUrl ?? null);

      // Seed edit form with current values
      const p = data.user.profile;
      setForm({
        fullName:          data.user.fullName ?? "",
        phoneNumber:       (data.user.phoneNumber ?? "").replace("+91", ""),
        dob:               "",
        gender:            p?.gender            ?? "",
        dietaryPref:       p?.dietaryPreference ?? "",
        activityLevel:     p?.activityLevel     ?? "",
        healthGoals:       p?.goals             ?? [],
        heightCm:          p?.heightCm          ? String(p.heightCm) : "",
        weightKg:          p?.weightKg          ? String(p.weightKg) : "",
        allergies:         (p?.allergies         ?? []).join(", "),
        medicalConditions: (p?.medicalConditions ?? []).join(", "),
        sleepHours:        p?.sleepHours        ? String(p.sleepHours)        : "",
        waterIntakeLitres: p?.waterIntakeLitres ? String(p.waterIntakeLitres) : "",
        notes:             p?.notes             ?? "",
      });

      setLoading(false);
    }

    load();
  }, [isLoaded, clerkUser, router]);

  // ── Avatar handler ─────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Toggle goal ────────────────────────────────────────────────────────────
  const toggleGoal = (goal: string) =>
    setForm((f) => ({
      ...f,
      healthGoals: f.healthGoals.includes(goal)
        ? f.healthGoals.filter((g) => g !== goal)
        : [...f.healthGoals, goal],
    }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // 1. Update avatar in Clerk if changed
      if (avatarFile) {
        await clerkUser?.setProfileImage({ file: avatarFile });
      }

      // 2. Update display name in Clerk
      const nameParts = form.fullName.trim().split(" ");
      await clerkUser?.update({
        firstName: nameParts[0] ?? "",
        lastName:  nameParts.slice(1).join(" ") ?? "",
      });

      // 3. PATCH the DB
      const res = await fetch("/api/user/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:          form.fullName,
          phoneNumber:       form.phoneNumber ? `+91${form.phoneNumber.replace(/\D/g,"")}` : "",
          dob:               form.dob         || undefined,
          gender:            form.gender       || undefined,
          dietaryPref:       form.dietaryPref  || undefined,
          activityLevel:     form.activityLevel || undefined,
          healthGoals:       form.healthGoals,
          heightCm:          form.heightCm     || undefined,
          weightKg:          form.weightKg     || undefined,
          allergies:         form.allergies
                               ? form.allergies.split(",").map((s) => s.trim()).filter(Boolean)
                               : [],
          medicalConditions: form.medicalConditions
                               ? form.medicalConditions.split(",").map((s) => s.trim()).filter(Boolean)
                               : [],
          sleepHours:        form.sleepHours        || undefined,
          waterIntakeLitres: form.waterIntakeLitres || undefined,
          notes:             form.notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      // 4. Refetch profile to show updated values
      const updated = await fetch("/api/user/profile");
      const data    = await updated.json();
      if (data.success) setProfile(data.user);

      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setAvatarFile(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (!isLoaded || loading) return <PageLoader inline label="Loading profile…" />;
  if (!profile)             return null;

  const p = profile.profile;

  // ─── View mode ─────────────────────────────────────────────────────────────

  if (!editing) {
    return (
      <div className="min-h-screen py-20 bg-background">
        <div className="section-container max-w-3xl">

          {success && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm">
              <Check size={16} /> Profile updated successfully
            </div>
          )}

          {/* Header card */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt={profile.fullName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User size={28} className="text-primary" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                {ROLE_LABELS[profile.role] ?? profile.role}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-serif font-bold text-foreground">{profile.fullName}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {profile.email}
                </span>
                {profile.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} /> {profile.phoneNumber}
                  </span>
                )}
              </div>
              {p?.gender && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {GENDER_LABELS[p.gender] ?? p.gender}
                  {p.age ? `, ${p.age} yrs` : ""}
                </p>
              )}
            </div>

            <button
              onClick={() => setEditing(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Edit3 size={14} /> Edit
            </button>
          </div>

          {/* Stats row */}
          {(p?.heightCm || p?.weightKg || p?.activityLevel) && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {p?.heightCm && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Ruler size={18} className="text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{p.heightCm}<span className="text-xs text-muted-foreground ml-0.5">cm</span></p>
                  <p className="text-xs text-muted-foreground">Height</p>
                </div>
              )}
              {p?.weightKg && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Weight size={18} className="text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{p.weightKg}<span className="text-xs text-muted-foreground ml-0.5">kg</span></p>
                  <p className="text-xs text-muted-foreground">Weight</p>
                </div>
              )}
              {p?.activityLevel && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Activity size={18} className="text-primary mx-auto mb-1" />
                  <p className="text-base font-bold text-foreground">{ACTIVITY_LABELS[p.activityLevel] ?? p.activityLevel}</p>
                  <p className="text-xs text-muted-foreground">Activity</p>
                </div>
              )}
            </div>
          )}

          {/* Info cards */}
          <div className="space-y-4">

            {/* Goals */}
            {p?.goals && p.goals.length > 0 && (
              <Section icon={<Heart size={16} />} title="Health Goals">
                <div className="flex flex-wrap gap-2">
                  {p.goals.map((g) => (
                    <span key={g} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Dietary preference */}
            {p?.dietaryPreference && (
              <Section icon={<Leaf size={16} />} title="Dietary Preference">
                <span className="px-3 py-1 rounded-full bg-muted text-foreground text-sm font-medium">
                  {DIETARY_LABELS[p.dietaryPreference] ?? p.dietaryPreference}
                </span>
              </Section>
            )}

            {/* Sleep + hydration */}
            {(p?.sleepHours || p?.waterIntakeLitres) && (
              <Section icon={<Moon size={16} />} title="Daily Habits">
                <div className="flex gap-6 text-sm">
                  {p?.sleepHours && (
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Moon size={14} className="text-primary" />
                      {p.sleepHours}h sleep
                    </span>
                  )}
                  {p?.waterIntakeLitres && (
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Droplets size={14} className="text-primary" />
                      {p.waterIntakeLitres}L water
                    </span>
                  )}
                </div>
              </Section>
            )}

            {/* Allergies */}
            {p?.allergies && p.allergies.length > 0 && (
              <Section icon={<AlertCircle size={16} />} title="Allergies">
                <div className="flex flex-wrap gap-2">
                  {p.allergies.map((a) => (
                    <span key={a} className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                      {a}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Notes */}
            {p?.notes && (
              <Section icon={<StickyNote size={16} />} title="Notes">
                <p className="text-sm text-muted-foreground leading-relaxed">{p.notes}</p>
              </Section>
            )}

            {/* Quick links */}
            <Section icon={<Calendar size={16} />} title="Quick Actions">
              <div className="space-y-1">
                <Link href="/appointments" className="flex items-center justify-between py-2 text-sm text-foreground hover:text-primary transition-colors">
                  View my appointments <ChevronRight size={14} />
                </Link>
                <Link href="/#contact" className="flex items-center justify-between py-2 text-sm text-foreground hover:text-primary transition-colors">
                  Contact the nutritionist <ChevronRight size={14} />
                </Link>
              </div>
            </Section>

            {/* Member since */}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Edit mode ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="section-container max-w-3xl">

        {/* Edit header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif font-bold text-foreground">Edit Profile</h1>
          <button
            onClick={() => { setEditing(false); setError(""); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} /> Cancel
          </button>
        </div>

        <div className="space-y-6 bg-card rounded-2xl border border-border p-6">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors group flex-shrink-0"
            >
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User size={24} className="text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 size={16} className="text-white" />
              </div>
            </button>
            <div>
              <p className="text-sm font-medium text-foreground">Profile Photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click to change</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>

          <hr className="border-border" />

          {/* Basic info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className={inputCls}
                placeholder="Your full name"
              />
            </Field>

            <Field label="Phone Number">
              <div className="flex gap-2">
                <span className="flex items-center px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground select-none">+91</span>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value.replace(/\D/g, "") }))}
                  maxLength={10}
                  className={inputCls}
                  placeholder="98765 43210"
                />
              </div>
            </Field>

            <Field label="Date of Birth (to update age)">
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                className={inputCls}
              />
            </Field>

            <Field label="Gender">
              <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className={inputCls}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other / Prefer not to say</option>
              </select>
            </Field>

            <Field label="Height (cm)">
              <input type="number" value={form.heightCm} onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))} className={inputCls} placeholder="e.g. 165" min="100" max="250" />
            </Field>

            <Field label="Weight (kg)">
              <input type="number" value={form.weightKg} onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))} className={inputCls} placeholder="e.g. 65" min="30" max="300" />
            </Field>

            <Field label="Activity Level">
              <select value={form.activityLevel} onChange={(e) => setForm((f) => ({ ...f, activityLevel: e.target.value }))} className={inputCls}>
                <option value="">Select activity level</option>
                {ACTIVITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            <Field label="Dietary Preference">
              <select value={form.dietaryPref} onChange={(e) => setForm((f) => ({ ...f, dietaryPref: e.target.value }))} className={inputCls}>
                <option value="">Select preference</option>
                {DIETARY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Health goals */}
          <Field label="Health Goals">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {HEALTH_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium text-left transition-all ${
                    form.healthGoals.includes(goal)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {form.healthGoals.includes(goal) && <Check size={11} className="inline mr-1" />}
                  {goal}
                </button>
              ))}
            </div>
          </Field>

          {/* Daily habits */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Sleep (hours/night)">
              <input type="number" value={form.sleepHours} onChange={(e) => setForm((f) => ({ ...f, sleepHours: e.target.value }))} className={inputCls} placeholder="e.g. 7.5" min="0" max="24" step="0.5" />
            </Field>
            <Field label="Water intake (litres/day)">
              <input type="number" value={form.waterIntakeLitres} onChange={(e) => setForm((f) => ({ ...f, waterIntakeLitres: e.target.value }))} className={inputCls} placeholder="e.g. 2.5" min="0" max="10" step="0.25" />
            </Field>
          </div>

          {/* Allergies / conditions */}
          <Field label="Allergies" hint="Comma-separated, e.g. Peanuts, Lactose">
            <input type="text" value={form.allergies} onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))} className={inputCls} placeholder="Peanuts, Lactose, Gluten…" />
          </Field>

          <Field label="Medical Conditions" hint="Comma-separated">
            <input type="text" value={form.medicalConditions} onChange={(e) => setForm((f) => ({ ...f, medicalConditions: e.target.value }))} className={inputCls} placeholder="Diabetes, Hypertension…" />
          </Field>

          <Field label="Notes for your nutritionist">
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Anything else you'd like your nutritionist to know…"
            />
          </Field>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.fullName.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Check size={16} /> Save Changes</>}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(""); }}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm";

function Section({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}