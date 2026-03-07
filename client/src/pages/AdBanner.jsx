import { useNavigate } from "react-router-dom";

export default function AdBanner() {
  const navigate = useNavigate();
  return (
    <section
      className="relative h-full flex items-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1600&auto=format&fit=crop')",
      }}
    >
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <span className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700 shadow">
          🌿 Smart Skincare Powered by AI
        </span>

        <h1 className="mt-6 text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
          Your Skin.
          <span className="block text-emerald-600">
            Analysed. Matched. Perfected.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-slate-700">
          SkinCare AI analyzes your skin concerns and recommends
          dermatologist-approved products tailored specifically for you. No
          guessing. Just results.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate("/assessment")}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-emerald-700 transition"
          >
            Start Skin Analysis
          </button>

          <button 
          onClick={() => navigate("/products")}
          className="rounded-xl border border-slate-300 bg-white/70 backdrop-blur px-6 py-3 font-semibold hover:bg-white transition">
            Browse Products
          </button>
        </div>
      </div>
    </section>
  );
}
