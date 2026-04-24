import React, { useState, useEffect } from "react";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    title: "Your Skin Deserves Expert Care",
    desc: "Connect with certified dermatologists instantly",
  },
  {
    img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54",
    title: "Book Trusted Doctors Nearby",
    desc: "Find specialists based on your needs",
  },
  {
    img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7",
    title: "Modern Healthcare Experience",
    desc: "Fast, secure and personalized consultations",
  },
];

const DoctorSlider = () => {
  const [current, setCurrent] = useState(0);
  

  // auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-4 mt-4 overflow-hidden rounded-2xl h-[300px]">

      {/* SLIDES */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* BG IMAGE */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.img})` }}
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

          {/* CONTENT */}
          <div className="relative z-10 h-full flex items-center px-6 md:px-12 text-white">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-3">
                {slide.title}
              </h1>
              <p className="text-sm md:text-base mb-4">
                {slide.desc}
              </p>
              <button className="px-5 py-2 bg-emerald-600 rounded-lg">
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              i === current ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorSlider;