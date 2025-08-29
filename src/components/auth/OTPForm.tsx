// src/components/security/OTPForm.tsx
import React, { useState, useRef } from "react";
import { Button } from "../ui/Button";

interface OTPFormProps {
  onVerify: (otp: string) => void; // pass entered otp to parent
}

export const OTPForm: React.FC<OTPFormProps> = ({ onVerify }) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; 
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length === 6) {
      onVerify(code);  // send the OTP to parent
    } else {
      setError("⚠️ Please enter 6 digits.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
        <p className="text-sm text-gray-600 mt-1">Enter the 6-digit code we sent to your email/phone</p>
      </div>

      <div className="flex justify-center gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            ref={(el) => (inputsRef.current[i] = el)}
            className="w-12 h-12 text-center text-xl font-bold border rounded-lg shadow-sm 
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
                       transition-all"
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <Button type="submit" fullWidth>
        Verify OTP
      </Button>
    </form>
  );
};
