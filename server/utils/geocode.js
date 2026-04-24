import axios from "axios";

export const getCoordinates = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${process.env.OPENCAGE_KEY}`;

    const response = await axios.get(url);
    const data = response.data;

    // 🔴 Check if results exist
    if (!data.results || data.results.length === 0) {
      throw new Error("Invalid address - no location found");
    }

    // ✅ OpenCage format
    const { lat, lng } = data.results[0].geometry;

    return { lat, lng };
  } catch (error) {
    console.error("Geocoding Error:", error.message);
    throw new Error("Failed to fetch coordinates");
  }
};