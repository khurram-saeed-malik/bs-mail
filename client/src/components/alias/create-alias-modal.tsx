import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAliasSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CreateAliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  domains: any[];
}

export default function CreateAliasModal({ isOpen, onClose, domains }: CreateAliasModalProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertAliasSchema.omit({ userId: true })),
    defaultValues: {
      address: "",
      destination: "",
      domainId: "",
      isActive: true,
    },
  });

  const createAliasMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/aliases", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aliases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
      form.reset();
      toast({
        title: "Success",
        description: "Alias created successfully",
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
        description: error.message || "Failed to create alias",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Find the selected domain to construct the full alias address
    const selectedDomain = domains.find(d => d.id === data.domainId);
    if (!selectedDomain) {
      toast({
        title: "Error", 
        description: "Please select a domain",
        variant: "destructive",
      });
      return;
    }

    const [localPart] = data.address.split('@');
    const fullAddress = `${localPart}@${selectedDomain.name}`;

    createAliasMutation.mutate({
      ...data,
      address: fullAddress,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Alias</DialogTitle>
          <DialogDescription>
            Create a new email alias that forwards to an existing email address.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alias Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="alias" 
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
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAliasMutation.isPending}>
                {createAliasMutation.isPending ? "Creating..." : "Create Alias"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
