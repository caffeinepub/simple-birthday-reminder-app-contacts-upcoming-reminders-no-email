import { useState, useEffect } from 'react';
import { useCreateContact, useUpdateContact } from '../hooks/useContacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { Contact } from '../backend';

interface ContactFormProps {
  contact?: Contact | null;
  onSuccess: () => void;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const getDaysInMonth = (month: number): number => {
  const daysMap: Record<number, number> = {
    1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
    7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
  };
  return daysMap[month] || 31;
};

export default function ContactForm({ contact, onSuccess }: ContactFormProps) {
  const [name, setName] = useState('');
  const [birthMonth, setBirthMonth] = useState<number | null>(null);
  const [birthDay, setBirthDay] = useState<number | null>(null);
  const [birthYear, setBirthYear] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setBirthMonth(contact.birthMonth);
      setBirthDay(contact.birthDay);
      setBirthYear(contact.birthYear ? String(contact.birthYear) : '');
      setNotes(contact.notes || '');
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (birthMonth === null || birthMonth < 1 || birthMonth > 12) {
      setError('Please select a valid birth month');
      return;
    }

    if (birthDay === null || birthDay < 1 || birthDay > getDaysInMonth(birthMonth)) {
      setError('Please select a valid birth day');
      return;
    }

    // Validate birth year if provided
    const yearValue = birthYear.trim();
    if (yearValue) {
      const yearNum = parseInt(yearValue);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
        setError(`Please enter a valid birth year between 1900 and ${currentYear}`);
        return;
      }
    }

    try {
      const birthYearValue = yearValue ? BigInt(yearValue) : null;
      const notesValue = notes.trim() || null;

      if (contact) {
        await updateContact.mutateAsync({
          id: contact.id,
          name: name.trim(),
          birthMonth,
          birthDay,
          birthYear: birthYearValue,
          notes: notesValue,
        });
      } else {
        const id = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await createContact.mutateAsync({
          id,
          name: name.trim(),
          birthMonth,
          birthDay,
          birthYear: birthYearValue,
          notes: notesValue,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save contact');
    }
  };

  const isPending = createContact.isPending || updateContact.isPending;
  const maxDay = birthMonth ? getDaysInMonth(birthMonth) : 31;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Birth Month *</Label>
          <Select
            value={birthMonth?.toString() || ''}
            onValueChange={(value) => {
              const month = parseInt(value);
              setBirthMonth(month);
              if (birthDay && birthDay > getDaysInMonth(month)) {
                setBirthDay(getDaysInMonth(month));
              }
            }}
            disabled={isPending}
          >
            <SelectTrigger id="month">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="day">Birth Day *</Label>
          <Select
            value={birthDay?.toString() || ''}
            onValueChange={(value) => setBirthDay(parseInt(value))}
            disabled={isPending || !birthMonth}
          >
            <SelectTrigger id="day">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthYear">Birth Year (optional)</Label>
        <Input
          id="birthYear"
          type="number"
          placeholder="e.g., 1990"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          disabled={isPending}
          min="1900"
          max={new Date().getFullYear()}
        />
        <p className="text-xs text-muted-foreground">
          Add the birth year to see age on birthdays
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Gift ideas, preferences, or other notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isPending}
          rows={3}
          className="resize-none"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : contact ? (
            'Update Contact'
          ) : (
            'Add Contact'
          )}
        </Button>
      </div>
    </form>
  );
}
