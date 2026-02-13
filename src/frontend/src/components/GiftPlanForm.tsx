import { useState, useEffect } from 'react';
import { useCreateGiftPlan, useUpdateGiftPlan } from '../hooks/useGiftPlans';
import { useListContacts } from '../hooks/useContacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { BirthdayGiftPlan } from '../backend';

interface GiftPlanFormProps {
  giftPlan?: BirthdayGiftPlan | null;
  onSuccess: () => void;
}

const STATUS_OPTIONS = ['Planned', 'Ordered', 'Sent'];

export default function GiftPlanForm({ giftPlan, onSuccess }: GiftPlanFormProps) {
  const { data: contacts } = useListContacts();
  const [contactId, setContactId] = useState('');
  const [giftIdea, setGiftIdea] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Planned');
  const [error, setError] = useState('');

  const createGiftPlan = useCreateGiftPlan();
  const updateGiftPlan = useUpdateGiftPlan();

  useEffect(() => {
    if (giftPlan) {
      setContactId(giftPlan.contactId);
      setGiftIdea(giftPlan.giftIdea);
      setBudget(giftPlan.budget ? String(giftPlan.budget) : '');
      setNotes(giftPlan.notes || '');
      setStatus(giftPlan.status);
    }
  }, [giftPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!contactId) {
      setError('Please select a contact');
      return;
    }

    if (!giftIdea.trim()) {
      setError('Please enter a gift idea');
      return;
    }

    // Validate budget if provided
    const budgetValue = budget.trim();
    if (budgetValue) {
      const budgetNum = parseInt(budgetValue);
      if (isNaN(budgetNum) || budgetNum < 0) {
        setError('Please enter a valid budget amount');
        return;
      }
    }

    try {
      const budgetBigInt = budgetValue ? BigInt(budgetValue) : null;
      const notesValue = notes.trim() || null;
      const plannedDate = BigInt(Date.now() * 1000000); // Convert to nanoseconds

      if (giftPlan) {
        await updateGiftPlan.mutateAsync({
          id: contactId,
          giftIdea: giftIdea.trim(),
          plannedDate,
          budget: budgetBigInt,
          notes: notesValue,
          status,
        });
      } else {
        await createGiftPlan.mutateAsync({
          contactId,
          giftIdea: giftIdea.trim(),
          plannedDate,
          budget: budgetBigInt,
          notes: notesValue,
          status,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save gift plan');
    }
  };

  const isPending = createGiftPlan.isPending || updateGiftPlan.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact">Contact *</Label>
        <Select
          value={contactId}
          onValueChange={setContactId}
          disabled={isPending || !!giftPlan}
        >
          <SelectTrigger id="contact">
            <SelectValue placeholder="Select a contact" />
          </SelectTrigger>
          <SelectContent>
            {contacts?.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {giftPlan && (
          <p className="text-xs text-muted-foreground">
            Contact cannot be changed when editing
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="giftIdea">Gift Idea *</Label>
        <Input
          id="giftIdea"
          placeholder="e.g., Book, Watch, Gift Card"
          value={giftIdea}
          onChange={(e) => setGiftIdea(e.target.value)}
          disabled={isPending}
          autoFocus={!giftPlan}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budget (optional)</Label>
        <Input
          id="budget"
          type="number"
          placeholder="e.g., 50"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          disabled={isPending}
          min="0"
        />
        <p className="text-xs text-muted-foreground">
          Enter amount in dollars
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={setStatus} disabled={isPending}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Track your gift planning progress manually
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional details, vendor info, or reminders..."
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
          ) : giftPlan ? (
            'Update Gift Plan'
          ) : (
            'Add Gift Plan'
          )}
        </Button>
      </div>
    </form>
  );
}
