import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateMailboxSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

interface EditMailboxModalProps {
  mailbox: any;
  onClose: () => void;
  domains: any[];
}

export default function EditMailboxModal({ mailbox, onClose, domains }: EditMailboxModalProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(updateMailboxSchema),
    defaultValues: {
      fullName: mailbox.fullName || "",
      quota: mailbox.quota,
      isActive: mailbox.isActive,
      password: "",
    },
  });

  useEffect(() => {
    if (mailbox) {
      form.reset({
        fullName: mailbox.fullName || "",
        quota: mailbox.quota,
        isActive: mailbox.isActive,
        password: "",
      });
    }
  }, [mailbox, form]);

  const updateMailboxMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }
      await apiRequest("PATCH", `/api/mailboxes/${mailbox.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mailboxes"] });
      onClose();
      toast({
        title: "Success",
        description: "Mailbox updated successfully",
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
        description: error.message || "Failed to update mailbox",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateMailboxMutation.mutate(data);
  };

  return (
    <Dialog open={!!mailbox} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Mailbox</DialogTitle>
          <DialogDescription>
            Update settings for {mailbox?.email}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Email Address</p>
              <p className="text-sm text-gray-600">{mailbox?.email}</p>
            </div>
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Leave empty to keep current password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quota (MB)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quota" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1024">1024 (1 GB)</SelectItem>
                      <SelectItem value="2048">2048 (2 GB)</SelectItem>
                      <SelectItem value="5120">5120 (5 GB)</SelectItem>
                      <SelectItem value="10240">10240 (10 GB)</SelectItem>
                    </SelectContent>
                  </Select>
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
                      Enable or disable this mailbox
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
              <Button type="submit" disabled={updateMailboxMutation.isPending}>
                {updateMailboxMutation.isPending ? "Updating..." : "Update Mailbox"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
