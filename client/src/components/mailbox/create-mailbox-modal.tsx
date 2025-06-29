import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMailboxSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CreateMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  domains: any[];
}

export default function CreateMailboxModal({ isOpen, onClose, domains }: CreateMailboxModalProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertMailboxSchema.omit({ userId: true })),
    defaultValues: {
      email: "",
      domainId: "",
      fullName: "",
      password: "",
      quota: 1024,
      isActive: true,
    },
  });

  const createMailboxMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/mailboxes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mailboxes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
      form.reset();
      toast({
        title: "Success",
        description: "Mailbox created successfully",
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
        description: error.message || "Failed to create mailbox",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Find the selected domain to construct the full email
    const selectedDomain = domains.find(d => d.id === data.domainId);
    if (!selectedDomain) {
      toast({
        title: "Error", 
        description: "Please select a domain",
        variant: "destructive",
      });
      return;
    }

    const [localPart] = data.email.split('@');
    const fullEmail = `${localPart}@${selectedDomain.name}`;

    createMailboxMutation.mutate({
      ...data,
      email: fullEmail,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Mailbox</DialogTitle>
          <DialogDescription>
            Create a new email account for your domain.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="username" 
                        {...field} 
                        onChange={(e) => {
                          // Only allow the local part before @
                          const value = e.target.value.split('@')[0];
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="domainId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {domains.map((domain) => (
                          <SelectItem key={domain.id} value={domain.id}>
                            @{domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMailboxMutation.isPending}>
                {createMailboxMutation.isPending ? "Creating..." : "Create Mailbox"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
