import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

interface EditAliasModalProps {
  alias: any;
  onClose: () => void;
  domains: any[];
}

export default function EditAliasModal({ alias, onClose, domains }: EditAliasModalProps) {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      destination: alias?.destination || "",
      isActive: alias?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (alias) {
      form.reset({
        destination: alias.destination || "",
        isActive: alias.isActive ?? true,
      });
    }
  }, [alias, form]);

  const updateAliasMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", `/api/aliases/${alias.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aliases"] });
      onClose();
      toast({
        title: "Success",
        description: "Alias updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update alias",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateAliasMutation.mutate(data);
  };

  return (
    <Dialog open={!!alias} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Alias</DialogTitle>
          <DialogDescription>
            Update settings for {alias?.address}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Alias Address</p>
              <p className="text-sm text-gray-600">{alias?.address}</p>
            </div>
            
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="destination@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <p className="text-sm text-gray-600">
                      Enable or disable this alias
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateAliasMutation.isPending}>
                {updateAliasMutation.isPending ? "Updating..." : "Update Alias"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
