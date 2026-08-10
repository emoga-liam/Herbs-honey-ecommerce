import { useState, useEffect } from "react";
import { useListDeliveryFees, useUpsertDeliveryFees, getListDeliveryFeesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { NIGERIAN_STATES } from "@/lib/constants";

export default function AdminDeliveryFeesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: fees = [], isLoading } = useListDeliveryFees();
  const upsertFees = useUpsertDeliveryFees();

  const [feeMap, setFeeMap] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (fees.length > 0) {
      const map: Record<string, string> = {};
      for (const state of NIGERIAN_STATES) {
        const entry = fees.find((f) => f.state === state);
        map[state] = entry ? String(entry.feeKobo / 100) : "0";
      }
      setFeeMap(map);
      setDirty(false);
    }
  }, [fees]);

  const handleChange = (state: string, val: string) => {
    setFeeMap((m) => ({ ...m, [state]: val }));
    setDirty(true);
  };

  const handleSave = () => {
    const entries = NIGERIAN_STATES.map((state) => ({
      state,
      feeKobo: Math.round((parseFloat(feeMap[state] ?? "0") || 0) * 100),
    }));
    upsertFees.mutate(
      { data: entries },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDeliveryFeesQueryKey() });
          setDirty(false);
          toast({ title: "Delivery fees saved" });
        },
        onError: () => toast({ title: "Error saving fees", variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout title="Delivery Fees">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-muted-foreground text-sm">
            Set the delivery fee (in Naira) for each Nigerian state. Customers will see the fee at checkout based on their location.
          </p>
          <p className="text-muted-foreground text-xs mt-1">Set to 0 for free delivery to that state.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!dirty || upsertFees.isPending}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shrink-0"
        >
          <Save className="h-4 w-4" />
          {upsertFees.isPending ? "Saving..." : dirty ? "Save All Fees" : "Saved"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(12)].map((_, i) => <div key={i} className="h-14 bg-card border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NIGERIAN_STATES.map((state) => (
            <div key={state} className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 hover:border-primary/20 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{state}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-muted-foreground text-sm">₦</span>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={feeMap[state] ?? "0"}
                  onChange={(e) => handleChange(state, e.target.value)}
                  className="w-24 h-8 text-sm text-right"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {dirty && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={upsertFees.isPending}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <Save className="h-4 w-4" />
            {upsertFees.isPending ? "Saving..." : "Save All Fees"}
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
