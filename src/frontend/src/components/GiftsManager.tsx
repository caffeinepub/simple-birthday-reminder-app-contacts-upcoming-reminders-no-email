import { useState } from 'react';
import { useListGiftPlans, useDeleteGiftPlan, useUpdateGiftPlan } from '../hooks/useGiftPlans';
import { useListContacts } from '../hooks/useContacts';
import GiftPlanForm from './GiftPlanForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Plus, Gift, Pencil, Trash2, AlertCircle, Package, CheckCircle, Clock, StickyNote } from 'lucide-react';
import type { BirthdayGiftPlan } from '../backend';
import { formatTimestamp } from '../lib/time';

const STATUS_CONFIG = {
  Planned: { icon: Clock, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  Ordered: { icon: Package, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  Sent: { icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
};

export default function GiftsManager() {
  const { data: giftPlans, isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useListGiftPlans();
  const { data: contacts, isLoading: contactsLoading } = useListContacts();
  const deleteGiftPlan = useDeleteGiftPlan();
  const updateGiftPlan = useUpdateGiftPlan();

  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BirthdayGiftPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<BirthdayGiftPlan | null>(null);
  const [markingSent, setMarkingSent] = useState<string | null>(null);

  const getContactName = (contactId: string) => {
    const contact = contacts?.find((c) => c.id === contactId);
    return contact?.name || 'Unknown Contact';
  };

  const handleEdit = (plan: BirthdayGiftPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    try {
      await deleteGiftPlan.mutateAsync(deletingPlan.contactId);
      setDeletingPlan(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleMarkAsSent = async (plan: BirthdayGiftPlan) => {
    if (plan.status === 'Sent') return;
    setMarkingSent(plan.contactId);
    try {
      await updateGiftPlan.mutateAsync({
        id: plan.contactId,
        giftIdea: plan.giftIdea,
        plannedDate: plan.plannedDate,
        budget: plan.budget || null,
        notes: plan.notes || null,
        status: 'Sent',
      });
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setMarkingSent(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const isLoading = plansLoading || contactsLoading;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load gift plans: {plansError.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetchPlans()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gift Planning</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track gift ideas and manually manage your gift sending
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Gift Plan
        </Button>
      </div>

      {!giftPlans || giftPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No gift plans yet</h3>
            <p className="text-muted-foreground mb-4">
              Start planning gifts for your contacts' birthdays
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Gift Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {giftPlans.map((plan) => {
            const statusConfig = STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Planned;
            const StatusIcon = statusConfig.icon;
            const isSending = markingSent === plan.contactId;

            return (
              <Card key={plan.contactId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{getContactName(plan.contactId)}</CardTitle>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {plan.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Gift className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{plan.giftIdea}</span>
                      </CardDescription>
                      {(plan.notes || plan.budget) && (
                        <>
                          <Separator className="my-3" />
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {plan.budget && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Budget:</span>
                                <span>${plan.budget.toString()}</span>
                              </div>
                            )}
                            {plan.notes && (
                              <div className="flex items-start gap-2">
                                <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p className="line-clamp-2">{plan.notes}</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      <div className="mt-3 text-xs text-muted-foreground">
                        Last updated: {formatTimestamp(plan.updatedAt)}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {plan.status !== 'Sent' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsSent(plan)}
                          disabled={isSending}
                          className="hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600 flex-shrink-0"
                        >
                          {isSending ? (
                            <>
                              <Clock className="w-4 h-4 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Sent
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(plan)}
                        className="hover:bg-orange-100 dark:hover:bg-orange-900/20 flex-shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingPlan(plan)}
                        className="hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Gift Plan' : 'Add New Gift Plan'}</DialogTitle>
          </DialogHeader>
          <GiftPlanForm giftPlan={editingPlan} onSuccess={handleFormClose} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gift Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the gift plan for{' '}
              <strong>{deletingPlan ? getContactName(deletingPlan.contactId) : ''}</strong>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteGiftPlan.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGiftPlan.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
