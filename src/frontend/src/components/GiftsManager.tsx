import { useState } from 'react';
import { useListGiftPlans, useDeleteGiftPlan, useUpdateGiftPlan } from '../hooks/useGiftPlans';
import { useListContacts } from '../hooks/useContacts';
import GiftPlanForm from './GiftPlanForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Plus, Gift, Pencil, Trash2, AlertCircle, Package, CheckCircle, Clock, StickyNote, Send, RefreshCw } from 'lucide-react';
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
  const [sendingGift, setSendingGift] = useState<BirthdayGiftPlan | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleSendGift = async () => {
    if (!sendingGift) return;
    setProcessingId(sendingGift.contactId);
    try {
      await updateGiftPlan.mutateAsync({
        id: sendingGift.contactId,
        giftIdea: sendingGift.giftIdea,
        plannedDate: sendingGift.plannedDate,
        budget: sendingGift.budget || null,
        notes: sendingGift.notes || null,
        status: 'Sent',
        isYearlyRecurring: sendingGift.isYearlyRecurring,
      });
      setSendingGift(null);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAsOrdered = async (plan: BirthdayGiftPlan) => {
    if (plan.status === 'Ordered' || plan.status === 'Sent') return;
    setProcessingId(plan.contactId);
    try {
      await updateGiftPlan.mutateAsync({
        id: plan.contactId,
        giftIdea: plan.giftIdea,
        plannedDate: plan.plannedDate,
        budget: plan.budget || null,
        notes: plan.notes || null,
        status: 'Ordered',
        isYearlyRecurring: plan.isYearlyRecurring,
      });
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const getErrorMessage = (error: Error | null): string => {
    if (!error) return 'Failed to load gift plans';
    
    const message = error.message || '';
    
    // Handle authorization errors gracefully
    if (message.includes('Unauthorized')) {
      return 'You need to be logged in to view gift plans. Please log in and try again.';
    }
    
    return `Failed to load gift plans: ${message}`;
  };

  // Show loading state only for gift plans (don't block on contacts)
  if (plansLoading) {
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
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{getErrorMessage(plansError as Error)}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchPlans()}
              className="flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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
            Plan, order, and send gifts for your contacts' birthdays
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
            const isProcessing = processingId === plan.contactId;

            return (
              <Card key={plan.contactId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle className="text-xl">{getContactName(plan.contactId)}</CardTitle>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {plan.status}
                        </Badge>
                        {plan.isYearlyRecurring && (
                          <Badge variant="outline" className="gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Yearly
                          </Badge>
                        )}
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      {plan.status === 'Planned' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMarkAsOrdered(plan)}
                          disabled={isProcessing}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white flex-shrink-0"
                        >
                          {isProcessing ? (
                            <>
                              <Clock className="w-4 h-4 mr-1 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Package className="w-4 h-4 mr-1" />
                              Mark Ordered
                            </>
                          )}
                        </Button>
                      )}
                      {plan.status === 'Ordered' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setSendingGift(plan)}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send a gift
                        </Button>
                      )}
                      {plan.status === 'Sent' && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium flex-shrink-0">
                          <CheckCircle className="w-4 h-4" />
                          Gift Sent
                        </div>
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

      <AlertDialog open={!!sendingGift} onOpenChange={() => setSendingGift(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Gift?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You're about to mark the gift for{' '}
                <strong>{sendingGift ? getContactName(sendingGift.contactId) : ''}</strong> as sent.
              </p>
              {sendingGift && (
                <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{sendingGift.giftIdea}</span>
                  </div>
                  {sendingGift.budget && (
                    <div className="text-muted-foreground">
                      Budget: ${sendingGift.budget.toString()}
                    </div>
                  )}
                  {sendingGift.isYearlyRecurring && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <RefreshCw className="w-4 h-4" />
                      <span className="font-medium">This plan will automatically repeat next year</span>
                    </div>
                  )}
                </div>
              )}
              <p className="text-sm">
                This will update the status to "Sent" and record the current time.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendGift}
              disabled={updateGiftPlan.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updateGiftPlan.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send a gift
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
