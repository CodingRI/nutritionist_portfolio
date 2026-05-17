"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { RoleGuard } from "@/components/role-guard";
import { useRouter } from "next/navigation";

type IngredientRow = { item: string; amount: string; unit: string };

const DIETARY_TAG_OPTIONS = [
  "Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free",
  "High-Protein", "Low-Carb", "Keto", "Paleo", "Quick", "Kid-Friendly",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export default function CreateRecipePage() {
  const router = useRouter();

  // Basic fields
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [prepTime,    setPrepTime]    = useState("15");
  const [cookTime,    setCookTime]    = useState("20");
  const [calories,    setCalories]    = useState("");
  const [difficulty,  setDifficulty]  = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);

  // Cover image
  const [coverUrl,     setCoverUrl]     = useState("");
  const [coverFile,    setCoverFile]    = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [imageMode,    setImageMode]    = useState<"url" | "upload">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  // Dynamic lists
  const [ingredients,  setIngredients]  = useState<IngredientRow[]>([{ item: "", amount: "", unit: "" }]);
  const [instructions, setInstructions] = useState<string[]>([""]); 

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState("");

  // ── Cover image helpers ───────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setCoverFile(null); setCoverPreview(""); setCoverUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const previewSrc = imageMode === "upload" ? coverPreview : coverUrl;

  // ── Ingredient helpers ───────────────────────────────────────────────────

  const addIngredient = () => setIngredients((prev) => [...prev, { item: "", amount: "", unit: "" }]);

  const removeIngredient = (i: number) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));

  const updateIngredient = (i: number, field: keyof IngredientRow, value: string) =>
    setIngredients((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  // ── Instruction helpers ───────────────────────────────────────────────────

  const addInstruction    = () => setInstructions((prev) => [...prev, ""]);
  const removeInstruction = (i: number) => setInstructions((prev) => prev.filter((_, idx) => idx !== i));
  const updateInstruction = (i: number, v: string) =>
    setInstructions((prev) => prev.map((s, idx) => idx === i ? v : s));

  // ── Dietary tag helpers ───────────────────────────────────────────────────

  const toggleTag = (tag: string) =>
    setDietaryTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  // ── Publish ───────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    setError("");

    if (!title.trim()) { setError("Recipe title is required."); return; }
    if (ingredients.some((i) => !i.item.trim())) { setError("All ingredient rows need a name."); return; }
    if (instructions.some((s) => !s.trim())) { setError("All instruction steps need content."); return; }

    setIsSubmitting(true);

    try {
      // Resolve cover image
      let finalCoverImage: string | null = null;
      if (imageMode === "upload" && coverFile) {
        finalCoverImage = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(coverFile);
        });
      } else if (imageMode === "url" && coverUrl.trim()) {
        finalCoverImage = coverUrl.trim();
      }

      // Difficulty is stored as the first element of dietaryTags
      const allTags = [difficulty, ...dietaryTags];

      const res = await fetch("/api/recipes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title,
          description,
          ingredients,          // { item, amount, unit }[] — serialised on the server
          instructions:         instructions.filter((s) => s.trim()),
          dietaryTags:          allTags,
          preparationTime:      prepTime  ? Number(prepTime)  : null,
          cookingTime:          cookTime  ? Number(cookTime)  : null,
          calories:             calories  ? Number(calories)  : null,
          coverImage:           finalCoverImage,
          isPublished,
        }),
      });

      const data = await res.json();

      if (!res.ok) { setError(data.message || "Failed to publish recipe."); return; }

      router.push(`/recipes/${data.recipe.id}`);
      router.refresh();

    } catch (err) {
      console.error("CREATE_RECIPE_ERROR:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPublish =
    title.trim() &&
    ingredients.every((i) => i.item.trim()) &&
    instructions.every((s) => s.trim()) &&
    !isSubmitting;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <RoleGuard
      allowedRoles={["ADMIN"]}
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-red-500">You are not authorised to access this page.</p>
        </div>
      }
    >
      <div className="min-h-screen py-20">
        <div className="section-container max-w-4xl">

          <Link href="/recipes" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8">
            <ArrowLeft size={20} /> Back to Recipes
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-12">Share a Recipe</h1>

            <div className="space-y-8 bg-card rounded-xl p-8 border border-border">

              {/* Title */}
              <div>
                <label className="block text-lg font-medium text-foreground mb-3">Recipe Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Turmeric Golden Milk Smoothie Bowl"
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg font-serif"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-lg font-medium text-foreground mb-3">
                  Description <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description shown on the recipe card…"
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                />
              </div>

              {/* Cover image */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                  <ImageIcon size={20} /> Cover Image
                </label>
                <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4 w-fit">
                  {(["url", "upload"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setImageMode(m); clearImage(); }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                        imageMode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "url" ? "Paste URL" : "Upload File"}
                    </button>
                  ))}
                </div>

                {imageMode === "url" ? (
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-colors text-sm"
                    >
                      <Upload size={16} /> Choose image file
                    </button>
                  </div>
                )}

                {previewSrc && (
                  <div className="relative mt-3 rounded-xl overflow-hidden aspect-[16/9] max-w-sm">
                    <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" onError={() => setCoverUrl("")} />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Meta: times, calories, difficulty */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Prep (min)</label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cook (min)</label>
                  <input
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    min="0"
                    placeholder="e.g. 320"
                    className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                    className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Dietary tags */}
              <div>
                <label className="block text-lg font-medium text-foreground mb-3">Dietary Tags</label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        dietaryTags.includes(tag)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Ingredients *</h3>
                <div className="space-y-3">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={ing.amount}
                        onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                        placeholder="Amount"
                        className="w-20 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <input
                        type="text"
                        value={ing.unit}
                        onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                        placeholder="Unit"
                        className="w-24 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <input
                        type="text"
                        value={ing.item}
                        onChange={(e) => updateIngredient(i, "item", e.target.value)}
                        placeholder="Ingredient name *"
                        className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(i)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-3 inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  <Plus size={16} /> Add Ingredient
                </button>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Instructions *</h3>
                <ol className="space-y-3">
                  {instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                        {i + 1}
                      </span>
                      <div className="flex-1 flex gap-2">
                        <textarea
                          value={step}
                          onChange={(e) => updateInstruction(i, e.target.value)}
                          placeholder="Describe this step…"
                          className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                          rows={2}
                        />
                        {instructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstruction(i)}
                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="mt-3 inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  <Plus size={16} /> Add Step
                </button>
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPublished}
                  onClick={() => setIsPublished((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isPublished ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isPublished ? "Publish immediately" : "Save as draft"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPublished ? "Recipe will be visible right away" : "Only you can see this until published"}
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!canPublish}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? <><Loader2 size={16} className="animate-spin" /> Publishing…</>
                    : isPublished ? "Publish Recipe" : "Save Draft"}
                </button>
                <Link href="/recipes" className="btn-secondary flex-1 text-center">Cancel</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </RoleGuard>
  );
}