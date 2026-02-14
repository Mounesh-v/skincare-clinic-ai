/**
 * Doctor Database
 * Sample doctors categorized by skin type specialization
 */

export const DOCTORS = [
    // OILY SKIN SPECIALISTS
    {
        id: 'doc-001',
        name: 'Dr. Priya Sharma',
        specialty: 'Acne & Oily Skin Specialist',
        skinTypes: ['oily', 'combination'],
        rating: 4.8,
        reviewCount: 342,
        experience: '12 years',
        location: 'Mumbai, Maharashtra',
        availability: 'Mon-Sat, 10 AM - 6 PM',
        bookingLink: '/doctors/doc-001/book',
        languages: ['English', 'Hindi', 'Marathi'],
        about: 'Specializes in acne treatment, oil control, and pore minimization',
    },
    {
        id: 'doc-002',
        name: 'Dr. Rajesh Kumar',
        specialty: 'Dermatologist - Oil Control',
        skinTypes: ['oily'],
        rating: 4.7,
        reviewCount: 258,
        experience: '10 years',
        location: 'Delhi, NCR',
        availability: 'Tue-Sun, 9 AM - 5 PM',
        bookingLink: '/doctors/doc-002/book',
        languages: ['English', 'Hindi'],
        about: 'Expert in managing sebum production and treating oily skin conditions',
    },

    // DRY SKIN SPECIALISTS
    {
        id: 'doc-003',
        name: 'Dr. Anjali Mehta',
        specialty: 'Dry Skin & Anti-Aging Expert',
        skinTypes: ['dry', 'combination'],
        rating: 4.9,
        reviewCount: 412,
        experience: '15 years',
        location: 'Bangalore, Karnataka',
        availability: 'Mon-Fri, 11 AM - 7 PM',
        bookingLink: '/doctors/doc-003/book',
        languages: ['English', 'Hindi', 'Kannada'],
        about: 'Focuses on barrier repair, hydration therapy, and anti-aging treatments',
    },
    {
        id: 'doc-004',
        name: 'Dr. Suresh Patel',
        specialty: 'Clinical Dermatologist',
        skinTypes: ['dry', 'normal'],
        rating: 4.6,
        reviewCount: 198,
        experience: '9 years',
        location: 'Ahmedabad, Gujarat',
        availability: 'Mon-Sat, 10 AM - 6 PM',
        bookingLink: '/doctors/doc-004/book',
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Specializes in sensitive and dry skin management',
    },

    // NORMAL SKIN SPECIALISTS
    {
        id: 'doc-005',
        name: 'Dr. Kavita Reddy',
        specialty: 'Preventive Dermatology',
        skinTypes: ['normal', 'combination'],
        rating: 4.8,
        reviewCount: 287,
        experience: '11 years',
        location: 'Hyderabad, Telangana',
        availability: 'Tue-Sat, 9 AM - 5 PM',
        bookingLink: '/doctors/doc-005/book',
        languages: ['English', 'Hindi', 'Telugu'],
        about: 'Preventive care, skin maintenance, and brightening treatments',
    },
    {
        id: 'doc-006',
        name: 'Dr. Arjun Singh',
        specialty: 'Cosmetic Dermatologist',
        skinTypes: ['normal', 'oily'],
        rating: 4.7,
        reviewCount: 324,
        experience: '13 years',
        location: 'Pune, Maharashtra',
        availability: 'Mon-Fri, 10 AM - 6 PM',
        bookingLink: '/doctors/doc-006/book',
        languages: ['English', 'Hindi', 'Marathi'],
        about: 'Cosmetic procedures and skin health optimization',
    },

    // COMBINATION SKIN SPECIALISTS
    {
        id: 'doc-007',
        name: 'Dr. Neha Gupta',
        specialty: 'Combination Skin Expert',
        skinTypes: ['combination'],
        rating: 4.9,
        reviewCount: 456,
        experience: '14 years',
        location: 'Chennai, Tamil Nadu',
        availability: 'Mon-Sat, 11 AM - 7 PM',
        bookingLink: '/doctors/doc-007/book',
        languages: ['English', 'Hindi', 'Tamil'],
        about: 'Balancing mixed skin types and customized treatment plans',
    },
    {
        id: 'doc-008',
        name: 'Dr. Vikram Joshi',
        specialty: 'Advanced Dermatology',
        skinTypes: ['combination', 'oily'],
        rating: 4.8,
        reviewCount: 378,
        experience: '16 years',
        location: 'Kolkata, West Bengal',
        availability: 'Tue-Sun, 10 AM - 6 PM',
        bookingLink: '/doctors/doc-008/book',
        languages: ['English', 'Hindi', 'Bengali'],
        about: 'Advanced treatments for complex skin conditions',
    },
];

/**
 * Get doctors by skin type
 * @param {string} skinType - Detected skin type (oily, dry, normal, combination)
 * @returns {Array} Filtered list of doctors specializing in that skin type
 */
export const getDoctorsBySkinType = (skinType) => {
    if (!skinType) return DOCTORS;

    const normalizedType = skinType.toLowerCase().trim();

    // Filter doctors who specialize in this skin type
    const filtered = DOCTORS.filter((doctor) =>
        doctor.skinTypes.includes(normalizedType)
    );

    // Sort by rating (highest first)
    return filtered.sort((a, b) => b.rating - a.rating);
};

/**
 * Get top N doctors for a skin type
 * @param {string} skinType - Detected skin type
 * @param {number} limit - Maximum number of doctors to return
 * @returns {Array} Top doctors for that skin type
 */
export const getTopDoctors = (skinType, limit = 3) => {
    const doctors = getDoctorsBySkinType(skinType);
    return doctors.slice(0, limit);
};
