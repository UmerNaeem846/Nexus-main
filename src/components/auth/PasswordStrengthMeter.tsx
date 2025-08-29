// src/components/security/PasswordStrengthMeter.tsx
import React from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

const getStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const strength = getStrength(password);

  const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong"][strength] || "Very Weak";
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-gray-200 rounded">
        <div
          className={`h-2 rounded transition-all duration-300 ${colors[strength]}`}
          style={{ width: `${(strength / 4) * 100}%` }}
        />
      </div>
      <p className="text-xs mt-1 text-gray-600">{strengthLabel}</p>
    </div>
  );
};
