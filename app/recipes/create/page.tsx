'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { RoleGuard } from '@/components/role-guard';

export default function CreateRecipePage() {
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState('2');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('20');
  const [difficulty, setDifficulty] = useState('Easy');
  const [ingredients, setIngredients] = useState<
    Array<{ item: string; amount: string; unit: string }>
  >([{ item: '', amount: '', unit: '' }]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tips, setTips] = useState<string[]>(['']);

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addTip = () => {
    setTips([...tips, '']);
  };

  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  const updateTip = (index: number, value: string) => {
    const updated = [...tips];
    updated[index] = value;
    setTips(updated);
  };

  const handlePublish = () => {
    console.log('[v0] Publishing recipe:', {
      title,
      servings,
      prepTime,
      cookTime,
      difficulty,
      ingredients,
      instructions,
      tips: tips.filter(Boolean),
    });
  };

  return (
    <RoleGuard 
    allowedRoles={["ADMIN"]}
    fallback = {
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">
          You are not authorized to access this page.
        </p>
      </div>
    }>
    <div className="min-h-screen py-20">
      <div className="section-container max-w-4xl">
        {/* Back Button */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Recipes
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-serif font-bold text-foreground mb-12">
            Share Your Recipe
          </h1>

          <div className="space-y-8 bg-card rounded-xl p-8 border border-border">
            {/* Title */}
            <div>
              <label className="block text-lg font-medium text-foreground mb-3">
                Recipe Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter recipe name..."
                className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg font-serif"
              />
            </div>

            {/* Meta */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Ingredients</h3>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="w-20 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      placeholder="Unit (cup, tbsp, etc.)"
                      className="w-24 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="text"
                      value={ingredient.item}
                      onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                      placeholder="Ingredient name"
                      className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    {ingredients.length > 1 && (
                      <button
                        onClick={() => removeIngredient(index)}
                        className="p-2 text-muted-foreground hover:text-error transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addIngredient}
                className="mt-3 inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
              >
                <Plus size={18} />
                Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Instructions</h3>
              <ol className="space-y-3">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 flex gap-2">
                      <textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder="Write step..."
                        className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                        rows={2}
                      />
                      {instructions.length > 1 && (
                        <button
                          onClick={() => removeInstruction(index)}
                          className="p-2 text-muted-foreground hover:text-error transition-colors flex-shrink-0"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <button
                onClick={addInstruction}
                className="mt-3 inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
              >
                <Plus size={18} />
                Add Step
              </button>
            </div>

            {/* Chef Tips */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Chef&apos;s Tips <span className="text-sm text-muted-foreground font-normal">(optional)</span></h3>
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => updateTip(index, e.target.value)}
                      placeholder="Share a helpful tip..."
                      className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    {tips.length > 1 && (
                      <button
                        onClick={() => removeTip(index)}
                        className="p-2 text-muted-foreground hover:text-error transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addTip}
                className="mt-3 inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
              >
                <Plus size={18} />
                Add Tip
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                onClick={handlePublish}
                disabled={!title || ingredients.some((i) => !i.item) || instructions.some((i) => !i)}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                Publish Recipe
              </button>
              <Link href="/recipes" className="btn-secondary flex-1 text-center">
                Cancel
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

    </RoleGuard>
  );
}
