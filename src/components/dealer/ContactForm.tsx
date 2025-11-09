'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { ConsentCheckbox } from './ConsentCheckbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface ContactFormProps {
  vehicleIds: string[];
  estimateId?: string;
  zipCode: string;
}

export function ContactForm({
  vehicleIds,
  estimateId,
  zipCode,
}: ContactFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: 'email' as 'email' | 'phone' | 'either',
    message: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitLead = api.dealer.submitLead.useMutation({
    onSuccess: (data) => {
      // Redirect to confirmation page
      router.push(`/dealer/confirmation?leadId=${data.leadId}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must consent to be contacted';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    submitLead.mutate({
      vehicleIds,
      estimateId,
      contactInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        preferredContact: formData.preferredContact,
      },
      consent: true,
      zipCode,
      message: formData.message || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            disabled={submitLead.isPending}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={submitLead.isPending}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive mt-1">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 555-5555"
            value={formData.phone}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
              const formatted =
                cleaned.length > 6
                  ? `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
                  : cleaned.length > 3
                    ? `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
                    : cleaned;
              setFormData({ ...formData, phone: formatted });
            }}
            disabled={submitLead.isPending}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-sm text-destructive mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="preferredContact">Preferred Contact Method *</Label>
          <Select
            value={formData.preferredContact}
            onValueChange={(value: 'email' | 'phone' | 'either') =>
              setFormData({ ...formData, preferredContact: value })
            }
            disabled={submitLead.isPending}
          >
            <SelectTrigger id="preferredContact">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="either">Either</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Let the dealer know what you're looking for..."
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            maxLength={500}
            disabled={submitLead.isPending}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {formData.message.length}/500 characters
          </p>
        </div>

        <ConsentCheckbox
          checked={formData.consent}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, consent: Boolean(checked) })
          }
          disabled={submitLead.isPending}
        />
        {errors.consent && (
          <p className="text-sm text-destructive">{errors.consent}</p>
        )}
      </div>

      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      <Button type="submit" disabled={submitLead.isPending} className="w-full">
        {submitLead.isPending ? 'Submitting...' : 'Submit Contact Request'}
      </Button>
    </form>
  );
}
