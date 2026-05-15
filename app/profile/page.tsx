'use client';

// app/about-user/page.tsx
// Post-signup onboarding — 4 steps.
// Matches your Prisma schema exactly:
//   User.fullName, User.phoneNumber
//   Profile.age (Int, derived from DOB), Profile.gender (Gender enum),
//   Profile.dietaryPreference (DietaryPreference enum), Profile.goals (String[])

import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

// ─── Constants (mapped to your enums) ────────────────────────────────────────

const HEALTH_GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Gut Health',
  'Manage Diabetes',
  'Heart Health',
  'Boost Immunity',
  'Better Sleep',
  'Reduce Stress',
  'General Wellness',
];

// Values match DietaryPreference enum
const DIETARY_OPTIONS: { label: string; value: string }[] = [
  { label: 'Vegetarian',     value: 'VEG' },
  { label: 'Vegan',          value: 'VEGAN' },
  { label: 'Non-Vegetarian', value: 'NON_VEG' },
  { label: 'Eggetarian',     value: 'EGGETARIAN' },
  { label: 'Keto',           value: 'KETO' },
  { label: 'Other',          value: 'OTHER' },
];

// Values match Gender enum
const GENDER_OPTIONS: { label: string; value: string }[] = [
  { label: 'Male',              value: 'MALE' },
  { label: 'Female',            value: 'FEMALE' },
  { label: 'Other / Prefer not to say', value: 'OTHER' },
];

const TOTAL_STEPS = 4;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  fullName: string;
  dob: string;            // ISO date string — converted to age on server
  gender: string;         // Gender enum value
  phoneNumber: string;    // raw 10 digits, prefixed to +91 on submit
  healthGoals: string[];  // stored in Profile.goals
  dietaryPref: string;    // DietaryPreference enum value
  avatarFile: File | null;
  avatarPreview: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutUserPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStepp] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setStep = (n: number) => { setStepp(n); setError(''); };

  const [form, setForm] = useState<FormState>({
    fullName:     user?.fullName ?? '',
    dob:          '',
    gender:       '',
    phoneNumber:  user?.primaryPhoneNumber?.phoneNumber?.replace('+91', '') ?? '',
    healthGoals:  [],
    dietaryPref:  '',
    avatarFile:   null,
    avatarPreview: user?.imageUrl ?? null,
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const toggle = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({
      ...f,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
  };

  const canProceed = (): boolean => {
    if (step === 1) return !!form.fullName.trim() && !!form.dob && !!form.gender;
    if (step === 2) return true;   // phone is optional
    if (step === 3) return form.healthGoals.length > 0;
    if (step === 4) return !!form.dietaryPref;
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      // 1. Upload avatar to Clerk
      if (form.avatarFile) {
        await user?.setProfileImage({ file: form.avatarFile });
      }

      // 2. Update Clerk display name
      const nameParts = form.fullName.trim().split(' ');
      await user?.update({
        firstName: nameParts[0] ?? '',
        lastName:  nameParts.slice(1).join(' ') ?? '',
        unsafeMetadata: { onboardingComplete: true },
      });

      // 3. Save to your Prisma/Neon DB
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:    form.fullName,
          email:       user?.primaryEmailAddress?.emailAddress,
          phoneNumber: form.phoneNumber ? `+91${form.phoneNumber}` : undefined,
          dob:         form.dob,
          gender:      form.gender,       // "MALE" | "FEMALE" | "OTHER"
          healthGoals: form.healthGoals,
          dietaryPref: form.dietaryPref,  // "VEG" | "VEGAN" | etc.
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to save profile');
      }

      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Step content ──────────────────────────────────────────────────────────────

  const Step1 = (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-serif font-bold text-foreground">Set up your profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Tell us a bit about yourself</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors group"
        >
          {form.avatarPreview ? (
            <Image src={form.avatarPreview} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Camera size={24} className="text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </div>
        </button>
        <p className="text-xs text-muted-foreground">Tap to upload photo</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
      </div>

      {/* Full name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Your full name"
        />
      </div>

      {/* DOB */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Date of Birth *</label>
        <input
          type="date"
          value={form.dob}
          onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
          max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Gender *</label>
        <div className="grid grid-cols-3 gap-2">
          {GENDER_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, gender: value }))}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                form.gender === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-foreground hover:border-primary/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Step2 = (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-serif font-bold text-foreground">Contact number</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Used for appointment reminders &amp; WhatsApp consultations
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          <span className="flex items-center px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground">
            +91
          </span>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value.replace(/\D/g, '') }))}
            maxLength={10}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="98765 43210"
          />
        </div>
      </div>

      <div className="rounded-xl bg-muted p-4 text-sm flex gap-3">
        <span className="text-2xl">💬</span>
        <div>
          <p className="font-medium text-foreground">WhatsApp consultations</p>
          <p className="mt-0.5 text-muted-foreground">
            Paid users can message their nutritionist directly on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );

  const Step3 = (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-serif font-bold text-foreground">What are your goals?</h1>
        <p className="text-muted-foreground text-sm mt-1">Select all that apply</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {HEALTH_GOALS.map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => setForm((f) => ({ ...f, healthGoals: toggle(f.healthGoals, goal) }))}
            className={`py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all ${
              form.healthGoals.includes(goal)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-foreground hover:border-primary/50'
            }`}
          >
            {form.healthGoals.includes(goal) && <Check size={12} className="inline mr-1.5" />}
            {goal}
          </button>
        ))}
      </div>
    </div>
  );

  const Step4 = (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-serif font-bold text-foreground">Dietary preference</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose one that best describes you</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DIETARY_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setForm((f) => ({ ...f, dietaryPref: value }))}
            className={`py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all ${
              form.dietaryPref === value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-foreground hover:border-primary/50'
            }`}
          >
            {form.dietaryPref === value && <Check size={12} className="inline mr-1.5" />}
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  const steps = [Step1, Step2, Step3, Step4];

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <React.Fragment key={i}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i + 1 < step
                    ? 'bg-primary text-primary-foreground'
                    : i + 1 === step
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1 < step ? <Check size={14} /> : i + 1}
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className={`h-0.5 w-8 transition-all ${i + 1 < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
          {steps[step - 1]}

          {error && (
            <p className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            <button
              type="button"
              disabled={!canProceed() || saving}
              onClick={() => {
                if (step < TOTAL_STEPS) setStep(step + 1);
                else handleSubmit();
              }}
              className="flex-1 flex items-center justify-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving…</>
              ) : step < TOTAL_STEPS ? (
                <>Continue <ChevronRight size={16} /></>
              ) : (
                <><Check size={16} /> Complete Setup</>
              )}
            </button>
          </div>

          {/* Skip for optional steps */}
          {(step === 2) && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="w-full mt-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You can update this anytime from your profile settings.
        </p>
      </div>
    </div>
  );
}