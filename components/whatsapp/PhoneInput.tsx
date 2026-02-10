
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

interface PhoneInputProps {
    value?: string | null;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
}

export function PhoneInput({
    value = "",
    onChange,
    label = "WhatsApp Number",
    placeholder = "+61 412 345 678",
    error
}: PhoneInputProps) {
    const [internalValue, setInternalValue] = useState(value || "");
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        setInternalValue(value || "");
    }, [value]);

    useEffect(() => {
        // Basic E.164 validation regex: + followed by 10-15 digits
        const valid = /^\+[1-9]\d{10,14}$/.test(internalValue.replace(/\s/g, ''));
        setIsValid(valid);
    }, [internalValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        // Allow only numbers, +, and spaces
        if (/^[0-9+\s]*$/.test(newVal)) {
            setInternalValue(newVal);
            onChange(newVal.replace(/\s/g, ''));
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="relative">
                <Input
                    type="tel"
                    value={internalValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`pr-10 ${isValid ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {internalValue && (
                        isValid ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <X className="h-4 w-4 text-red-500" />
                        )
                    )}
                </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!error && internalValue && !isValid && (
                <p className="text-xs text-muted-foreground">
                    Format required: E.164 (e.g. +61412345678)
                </p>
            )}
        </div>
    );
}
