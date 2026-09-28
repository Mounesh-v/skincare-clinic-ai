import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Sparkles,
  X,
} from "lucide-react";
import api from "../../utils/api";

const AUTOPLAY_MS = 3500;
const CAROUSEL_MS = 5000;

const getImages = (ad) =>
  ad?.images && ad.images.length
    ? ad.images
    : ad?.image
      ? [ad.image]
      : [];

/* ─── Lightbox modal with auto scrolling slideshow ─── */
const AdModal = ({ ad, onClose }) => {
  const images = getImages(ad);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (dir) =>
      setIndex((prev) => (prev + dir + images.length) % images.length),
    [images.length],
  );

  // Auto scroll images
  useEffect(() => {
    if (images.length < 2 || paused) return;
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % images.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [images.length, paused, index]);

  // ESC to close + lock body scroll
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
            <Megaphone className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white truncate max-w-[60vw] sm:max-w-md">
              {ad.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slides */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${ad.title} ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out ${
                i === index
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 z-0"
              }`}
            />
          ))}

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => goTo(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-slate-800" />
              </button>
              <button
                onClick={() => goTo(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-slate-800" />
              </button>

              {/* Counter */}
              <span className="absolute top-3 right-3 z-20 px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full">
                {index + 1} / {images.length}
              </span>

              {/* Auto scroll progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 z-20 bg-white/20">
                <div
                  key={index}
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 ad-progress"
                />
              </div>
            </>
          )}
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === index
                    ? "w-8 h-3 bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "w-3 h-3 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Ad card (click opens lightbox) ─── */
const AdCard = ({ ad, onOpen }) => {
  const images = getImages(ad);
  const [index, setIndex] = useState(0);

  // Auto scrolling animation for multiple images
  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % images.length),
      AUTOPLAY_MS + 1000,
    );
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  const goTo = (e, dir) => {
    e.stopPropagation();
    setIndex((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <div
      onClick={() => onOpen(ad)}
      className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-slate-100 cursor-pointer hover:-translate-y-1"
    >
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={ad.title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
              i === index
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0"
            }`}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full mb-2">
            <Megaphone className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] font-bold text-white tracking-widest uppercase">
              Sponsored
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug drop-shadow">
            {ad.title}
          </h3>
        </div>

        {/* Multiple images controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => goTo(e, -1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={(e) => goTo(e, 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-300"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>

            <div className="absolute bottom-4 right-4 z-30 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Go to image ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-6 h-2 bg-emerald-400"
                      : "w-2 h-2 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Click hint */}
        <div className="absolute top-3 left-3 z-30 px-3 py-1 bg-white/80 backdrop-blur-sm text-xs font-bold text-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Click to view
        </div>
      </div>
    </div>
  );
};

/* ─── Ads section ─── */
const AdsSection = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get("/api/ads/public");
        setAds(res.data.data || []);
      } catch (error) {
        console.error("Error fetching ads:", error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Auto sliding carousel
  useEffect(() => {
    if (ads.length < 2 || paused) return;
    const timer = setInterval(
      () => setSlide((prev) => (prev + 1) % ads.length),
      CAROUSEL_MS,
    );
    return () => clearInterval(timer);
  }, [ads.length, paused, slide]);

  const goTo = (dir) =>
    setSlide((prev) => (prev + dir + ads.length) % ads.length);

  if (loading || ads.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <section className="animate-fade-in space-y-10">
        {/* Heading */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span className="text-sm font-bold text-amber-700 tracking-widest uppercase">
              Exclusive Offers
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Grab Our
            <span className="block mt-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Hottest Deals
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Handpicked promotions and limited time offers, curated just for
            you.
          </p>
        </div>

        {/* Auto sliding carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-3xl shadow-xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {ads.map((ad) => (
                <div key={ad._id} className="w-full shrink-0">
                  <AdCard ad={ad} onOpen={setSelectedAd} />
                </div>
              ))}
            </div>

            {/* Auto slide progress bar */}
            {ads.length > 1 && !paused && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 z-30 bg-black/20">
                <div
                  key={slide}
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 ad-carousel-progress"
                />
              </div>
            )}
          </div>

          {/* Arrows */}
          {ads.length > 1 && (
            <>
              <button
                onClick={() => goTo(-1)}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 bg-white/85 backdrop-blur-sm rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all duration-200 border border-white/50"
                aria-label="Previous ad"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              </button>
              <button
                onClick={() => goTo(1)}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 bg-white/85 backdrop-blur-sm rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all duration-200 border border-white/50"
                aria-label="Next ad"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              </button>

              {/* Dots */}
              <div className="flex justify-center items-center gap-2.5 mt-6">
                {ads.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Go to ad ${i + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      i === slide
                        ? "w-10 h-3 bg-gradient-to-r from-amber-500 to-rose-500 shadow-md shadow-amber-200"
                        : "w-3 h-3 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedAd && (
        <AdModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}

      {/* Auto scroll progress animation */}
      <style>{`
        @keyframes ad-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .ad-progress {
          animation: ad-progress ${AUTOPLAY_MS}ms linear forwards;
        }
        @keyframes ad-carousel-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .ad-carousel-progress {
          animation: ad-carousel-progress ${CAROUSEL_MS}ms linear forwards;
        }
      `}</style>
    </div>
  );
};

export default AdsSection;
