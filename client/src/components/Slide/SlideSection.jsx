import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import api from "../../utils/api";

const SlideSection = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedImage]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const nextSlide = useCallback(() => {
    const len = slidesRef.current.length;
    if (len === 0) return;
    setCurrent((prev) => (prev + 1) % len);
  }, []);

  const prevSlide = useCallback(() => {
    const len = slidesRef.current.length;
    if (len === 0) return;
    setCurrent((prev) => (prev - 1 + len) % len);
  }, []);

  // Auto Slide
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.get("/api/features/get-features");
        const formattedSlides = res.data.data.map((item) => ({
          id: item._id,
          image: item.Addimage,
          title: item.Adname,
          desc: item.Adddescription,
        }));
        setSlides(formattedSlides);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFeatures();
  }, []);

  return (
    <section className="w-full py-10 sm:py-16 bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-emerald-700 mb-6 sm:mb-10 px-4">
        Featured Skincare Collections
      </h2>

      <div className="relative w-[95%] sm:w-[90%] mx-auto overflow-hidden rounded-xl sm:rounded-3xl shadow-xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full relative">
              <img
                src={slide.image}
                alt=""
                className="slide-img w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] object-cover cursor-pointer"
                onClick={() => setSelectedImage(slide.image)}
              />
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
              <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 lg:bottom-12 lg:left-12 text-white max-w-[80%] sm:max-w-lg">
                <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold">{slide.title}</h3>
                <p className="mt-1 sm:mt-3 text-sm sm:text-base lg:text-lg opacity-90 line-clamp-2">{slide.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-white/80 p-1.5 sm:p-2 rounded-full shadow hover:scale-110 transition"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-white/80 p-1.5 sm:p-2 rounded-full shadow hover:scale-110 transition"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="absolute bottom-3 sm:bottom-5 w-full flex justify-center gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition ${
                current === index ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default SlideSection;
