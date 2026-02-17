import React from 'react';
import { Leaf, Droplets, Sparkles, Shield, Search } from 'lucide-react';

const Ingredients = () => {
  const keyIngredients = [
    {
      name: 'Hyaluronic Acid',
      category: 'Hydration',
      benefits: ['Deep moisturization', 'Plumps skin', 'Reduces fine lines'],
      description: 'A powerful humectant that can hold up to 1000x its weight in water, providing intense hydration and improving skin elasticity.',
    },
    {
      name: 'Niacinamide (Vitamin B3)',
      category: 'Brightening',
      benefits: ['Reduces hyperpigmentation', 'Minimizes pores', 'Improves skin texture'],
      description: 'A versatile ingredient that brightens skin tone, reduces inflammation, and strengthens the skin barrier.',
    },
    {
      name: 'Retinol (Vitamin A)',
      category: 'Anti-Aging',
      benefits: ['Boosts collagen production', 'Reduces wrinkles', 'Improves cell turnover'],
      description: 'A gold-standard anti-aging ingredient that promotes skin renewal and reduces signs of aging.',
    },
    {
      name: 'Vitamin C',
      category: 'Antioxidant',
      benefits: ['Brightens complexion', 'Protects from free radicals', 'Evens skin tone'],
      description: 'A powerful antioxidant that protects skin from environmental damage and promotes collagen synthesis.',
    },
    {
      name: 'Salicylic Acid',
      category: 'Exfoliation',
      benefits: ['Unclogs pores', 'Reduces acne', 'Smooths skin texture'],
      description: 'A beta hydroxy acid (BHA) that penetrates deep into pores to remove excess oil and dead skin cells.',
    },
    {
      name: 'Peptides',
      category: 'Anti-Aging',
      benefits: ['Firms skin', 'Reduces wrinkles', 'Supports collagen'],
      description: 'Short chains of amino acids that signal skin cells to produce more collagen and elastin.',
    },
  ];

  const principles = [
    {
      icon: Leaf,
      title: 'Natural & Pure',
      description: 'Sourced from trusted suppliers worldwide',
    },
    {
      icon: Shield,
      title: 'Dermatologist Tested',
      description: 'Safe for all skin types',
    },
    {
      icon: Sparkles,
      title: 'High Concentration',
      description: 'Optimal potency for visible results',
    },
    {
      icon: Droplets,
      title: 'No Harmful Chemicals',
      description: 'Free from parabens, sulfates, and phthalates',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Ingredients</h1>
          <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
            Premium, scientifically-proven ingredients that deliver real results for your skin
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Quality You Can Trust
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            We carefully select each ingredient for its proven effectiveness and safety. Our formulations 
            combine the best of nature and science to create products that truly transform your skin.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {principle.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Key Ingredients Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Key Active Ingredients
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyIngredients.map((ingredient, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {ingredient.name}
                  </h3>
                  <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {ingredient.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  {ingredient.description}
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Key Benefits:
                  </p>
                  <ul className="space-y-1">
                    {ingredient.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What We Avoid Section */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            What We Avoid
          </h2>
          <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
            We are committed to clean beauty. Our products are free from harmful chemicals and irritants.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="font-semibold text-slate-900">Parabens</p>
              <p className="text-sm text-slate-600 mt-1">Potential hormone disruptors</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="font-semibold text-slate-900">Sulfates</p>
              <p className="text-sm text-slate-600 mt-1">Can strip natural oils</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="font-semibold text-slate-900">Phthalates</p>
              <p className="text-sm text-slate-600 mt-1">Linked to health concerns</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="font-semibold text-slate-900">Synthetic Fragrances</p>
              <p className="text-sm text-slate-600 mt-1">Can cause irritation</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="font-semibold text-slate-900">Artificial Colors</p>
              <p className="text-sm text-slate-600 mt-1">Unnecessary additives</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="font-semibold text-slate-900">Mineral Oil</p>
              <p className="text-sm text-slate-600 mt-1">Can clog pores</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Want to Learn More?
          </h3>
          <p className="text-slate-600 mb-6">
            Explore our full ingredient glossary or consult with our dermatologists
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg">
              View Full Glossary
            </button>
            <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all">
              Talk to a Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;