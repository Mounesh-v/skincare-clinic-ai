import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1600",
    title: "Vitamin C Brightening Serum",
    desc: "Boost radiance and reduce dark spots with dermatologist recommended Vitamin C serums",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1600",
    title: "SPF Sunscreen Protection",
    desc: "Broad spectrum SPF protection to prevent sun damage and premature aging",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1600",
    title: "Acne Control Solutions",
    desc: "Salicylic acid and niacinamide based treatments for clear and healthy skin",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1600",
    title: "Anti-Aging Skincare",
    desc: "Retinol and peptide formulas designed to smooth fine lines and wrinkles",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?q=80&w=1600",
    title: "Gentle Face Cleansers",
    desc: "pH balanced cleansers that remove impurities without stripping natural oils",
  },
];
const SlideSection=()=> {
  const [current, setCurrent] = useState(0);

  // Auto Slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [current]);

  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % slides.length);

  const prevSlide = () =>
    setCurrent(
      (prev) => (prev - 1 + slides.length) % slides.length
    );

  return (
    <section className="w-full py-16 bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50">

      {/* Heading */}
      <h2 className="text-4xl font-bold text-center text-emerald-700 mb-10">
        Featured Skincare Collections
      </h2>

      <div className="relative w-[90%] mx-auto overflow-hidden rounded-3xl shadow-xl">

        {/* Slides */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full relative">
              <img
                src={slide.image}
                alt=""
                className="w-full h-[420px] object-cover"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Text Content */}
              <div className="absolute bottom-12 left-12 text-white max-w-lg">
                <h3 className="text-3xl font-bold">
                  {slide.title}
                </h3>
                <p className="mt-3 text-lg opacity-90">
                  {slide.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-110 transition"
        >
          <ChevronLeft />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-110 transition"
        >
          <ChevronRight />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 w-full flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 w-3 rounded-full transition ${
                current === index
                  ? "bg-white scale-125"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SlideSection;