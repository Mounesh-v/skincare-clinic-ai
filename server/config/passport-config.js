import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import Register from '../models/Register.js';
import dotenv from 'dotenv';

dotenv.config();

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Register.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await Register.findOne({ provider: 'google', providerId: profile.id });

                    if (!user) {
                        // Check if user exists with same email but different provider
                        user = await Register.findOne({ email: profile.emails[0].value });

                        if (user) {
                            // Update existing user with google info
                            user.provider = 'google';
                            user.providerId = profile.id;
                            user.picture = profile.photos[0]?.value;
                            await user.save();
                        } else {
                            // Create new user
                            user = await Register.create({
                                name: profile.displayName,
                                email: profile.emails[0].value,
                                provider: 'google',
                                providerId: profile.id,
                                picture: profile.photos[0]?.value,
                                agreeToTerms: true // Social login implies agreement in this flow
                            });
                        }
                    }
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
} else {
    console.warn('⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL,
                profileFields: ['id', 'displayName', 'photos', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await Register.findOne({ provider: 'facebook', providerId: profile.id });

                    if (!user) {
                        const email = profile.emails?.[0]?.value;
                        if (email) {
                            user = await Register.findOne({ email });
                        }

                        if (user) {
                            user.provider = 'facebook';
                            user.providerId = profile.id;
                            user.picture = profile.photos?.[0]?.value;
                            await user.save();
                        } else {
                            user = await Register.create({
                                name: profile.displayName,
                                email: email || `${profile.id}@facebook.user`,
                                provider: 'facebook',
                                providerId: profile.id,
                                picture: profile.photos?.[0]?.value,
                                agreeToTerms: true
                            });
                        }
                    }
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
} else {
    console.warn('⚠️  Facebook OAuth not configured - missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET');
}

export default passport;
