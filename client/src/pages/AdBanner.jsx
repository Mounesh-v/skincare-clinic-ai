import { useNavigate } from "react-router-dom";

export default function AdBanner() {
  const navigate = useNavigate();

  // Featured Products for Ad Banner
  const featuredProducts = [
    {
      id: 1,
      name: "Vitamin C Serum",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Hyaluronic Moisturizer",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Niacinamide Toner",
      image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Retinol Night Cream",
      image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&auto=format&fit=crop",
    }
  ];

  return (
    <section className="w-full bg-white">
      {/* Single Contained Section - All Cards Together */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Tight Grid Container - All in One Box */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-slate-200 p-1 rounded-2xl overflow-hidden shadow-2xl">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="group relative aspect-square overflow-hidden cursor-pointer bg-white"
            >
              {/* Product Image - Full Coverage */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300"></div>

              {/* Product Name */}
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                <h3 className="text-white font-bold text-sm md:text-base lg:text-lg leading-tight drop-shadow-lg">
                  {product.name}
                </h3>
              </div>

              {/* Hover Brightness */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}