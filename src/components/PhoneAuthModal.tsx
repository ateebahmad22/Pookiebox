import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase.ts';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types.ts';
import { BowIcon } from './BowIcon.tsx';
import { Phone, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const initRecaptcha = () => {
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
        });
      }
      return recaptchaVerifierRef.current;
    } catch (err) {
      console.warn('reCAPTCHA init error:', err);
      return null;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanPhone}`;
    setLoading(true);

    try {
      const appVerifier = initRecaptcha();
      if (!appVerifier) throw new Error('reCAPTCHA could not be initialized.');

      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      setResendTimer(30);
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'Phone provider is disabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method > Phone to enable it. You can also use Quick Test Login below.'
        );
      } else if (err.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format. Please check the digits.');
      } else {
        setErrorMessage(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.length < 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error('No OTP session found. Please re-send OTP.');
      }

      const userCredential = await confirmationResult.confirm(otpCode);
      const fbUser = userCredential.user;

      await handleUserSuccess(fbUser);
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setErrorMessage('Incorrect OTP code. Please check your SMS and re-enter.');
      } else {
        setErrorMessage(err.message || 'OTP verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo / Test Login fallback
  const handleTestLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const demoUser: User = {
        id: 'user-demo-1',
        name: 'Ateeb Ahmad',
        email: 'ateebahmad298@gmail.com',
        phone: '+91 98765 43210',
        role: 'user',
        addresses: [
          {
            address: 'Flat 402, Rose Petal Court, Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pinCode: '400050',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFC0CB', '#F8BBD0', '#C45A7A', '#E6D6FF'],
      });

      onAuthSuccess(demoUser);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSuccess = async (fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userRef);

      let appUser: User;
      if (userDoc.exists()) {
        const data = userDoc.data();
        appUser = {
          id: fbUser.uid,
          name: data.displayName || 'Pookie Lover',
          email: data.email || `${fbUser.phoneNumber}@pookiebox.love`,
          phone: fbUser.phoneNumber || '',
          role: data.role || 'user',
          addresses: data.addresses || [],
          createdAt: data.createdAt || new Date().toISOString(),
        };
      } else {
        appUser = {
          id: fbUser.uid,
          name: 'Pookie Lover',
          email: `${fbUser.phoneNumber}@pookiebox.love`,
          phone: fbUser.phoneNumber || '',
          role: 'user',
          addresses: [],
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, {
          uid: fbUser.uid,
          phoneNumber: fbUser.phoneNumber || '',
          displayName: 'Pookie Lover',
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      }

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC0CB', '#F8BBD0', '#C45A7A', '#E6D6FF'],
      });

      onAuthSuccess(appUser);
      onClose();
    } catch (err) {
      console.error('Error syncing user profile:', err);
      // Fallback app user
      const appUser: User = {
        id: fbUser.uid,
        name: 'Pookie Lover',
        email: `${fbUser.phoneNumber}@pookiebox.love`,
        phone: fbUser.phoneNumber || '',
        role: 'user',
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      onAuthSuccess(appUser);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      {/* Hidden reCAPTCHA container required by Firebase */}
      <div id="recaptcha-container" />

      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#F8BBD0] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif font-bold text-[#C45A7A] flex items-center gap-1.5">
              PookieBox <BowIcon className="w-5 h-5 text-[#C45A7A]" />
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Logged in state */}
        {currentUser ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center mx-auto text-[#C45A7A]">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#59434D]">Logged In as {currentUser.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{currentUser.phone || currentUser.email}</p>
            </div>

            <div className="p-3 bg-pink-50/50 rounded-2xl border border-[#F8BBD0]/40 text-xs text-[#59434D] text-left">
              <span className="font-semibold block text-[#C45A7A]">Account Status</span>
              <span>Firebase Phone Authenticated • Pookie VIP</span>
            </div>

            <button
              onClick={() => {
                signOut(auth);
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[#C45A7A] uppercase tracking-wider block">
                Firebase Authentication
              </span>
              <h3 className="text-xl font-serif font-bold text-[#59434D] mt-0.5">
                {step === 'phone' ? 'Login with Phone OTP' : 'Verify SMS Code'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {step === 'phone'
                  ? 'We will send a 6-digit verification code to your mobile phone.'
                  : `Enter the code sent to ${countryCode} ${phoneNumber}`}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Phone Input Form */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white font-medium focus:outline-hidden focus:border-[#C45A7A]"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                    </select>

                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A] font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send 6-Digit OTP <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP Verification Form */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1.5">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 text-center text-lg tracking-widest font-mono font-bold rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change Phone
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleSendOtp}
                    className={`font-semibold cursor-pointer ${
                      resendTimer > 0 ? 'text-gray-400' : 'text-[#C45A7A] hover:underline'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign In <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Fast Demo / Instant Test Option */}
            <div className="pt-2 border-t border-gray-100 text-center space-y-2">
              <span className="text-[11px] text-gray-400 block">or test with demo profile</span>
              <button
                type="button"
                onClick={handleTestLogin}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#59434D] bg-[#FFF0F5] hover:bg-[#F8BBD0]/30 border border-[#F8BBD0] transition-colors cursor-pointer"
              >
                Instant 1-Click Demo Login (+91 98765 43210)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
