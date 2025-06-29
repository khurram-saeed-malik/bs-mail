import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CreateMailboxModal from "@/components/mailbox/create-mailbox-modal";
import EditMailboxModal from "@/components/mailbox/edit-mailbox-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Mail, Search, Edit, Key, Trash2, User } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Mailboxes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<any>(null);
  const [resetPasswordMailbox, setResetPasswordMailbox] = useState<any>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: mailboxes = [], isLoading: mailboxesLoading } = useQuery({
    queryKey: ["/api/mailboxes"],
    retry: false,
  });

  const { data: domains = [] } = useQuery({
    queryKey: ["/api/domains"],
    retry: false,
  });

  const resetPasswordForm = useForm({
    defaultValues: { password: "" },
  });

  const deleteMailboxMutation = useMutation({
    mutationFn: async (mailboxId: string) => {
      await apiRequest("DELETE", `/api/mailboxes/${mailboxId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mailboxes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Mailbox deleted successfully",
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
        description: error.message || "Failed to delete mailbox",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ mailboxId, password }: { mailboxId: string; password: string }) => {
      await apiRequest("POST", `/api/mailboxes/${mailboxId}/reset-password`, { password });
    },
    onSuccess: () => {
      setResetPasswordMailbox(null);
      resetPasswordForm.reset();
      toast({
        title: "Success",
        description: "Password reset successfully",
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
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const filteredMailboxes = mailboxes.filter((mailbox: any) =>
    mailbox.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mailbox.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mailbox.domain?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onResetPassword = (data: { password: string }) => {
    if (resetPasswordMailbox) {
      resetPasswordMutation.mutate({
        mailboxId: resetPasswordMailbox.id,
        password: data.password,
      });
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mailboxes</h2>
                <p className="text-gray-600 mt-1">Manage your email accounts</p>
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Mailbox
              </Button>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search mailboxes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mailboxes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {mailboxesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredMailboxes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quota
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMailboxes.map((mailbox: any) => (
                        <tr key={mailbox.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{mailbox.email}</p>
                                {mailbox.fullName && (
                                  <p className="text-sm text-gray-500">{mailbox.fullName}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {mailbox.domain?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{mailbox.quota} MB</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: "24%" }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={mailbox.isActive ? "default" : "secondary"}>
                              {mailbox.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMailbox(mailbox)}
                                className="text-primary hover:text-primary/80"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setResetPasswordMailbox(mailbox)}
                                className="text-orange-600 hover:text-orange-800"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMailboxMutation.mutate(mailbox.id)}
                                disabled={deleteMailboxMutation.isPending}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "No mailboxes found" : "No mailboxes yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? "Try adjusting your search terms"
                      : "Create your first mailbox to get started with email management."
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Mailbox
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Mailbox Modal */}
          <CreateMailboxModal 
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            domains={domains}
          />

          {/* Edit Mailbox Modal */}
          {editingMailbox && (
            <EditMailboxModal
              mailbox={editingMailbox}
              onClose={() => setEditingMailbox(null)}
              domains={domains}
            />
          )}

          {/* Reset Password Modal */}
          <Dialog open={!!resetPasswordMailbox} onOpenChange={() => setResetPasswordMailbox(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter a new password for {resetPasswordMailbox?.email}
                </DialogDescription>
              </DialogHeader>
              <Form {...resetPasswordForm}>
                <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                  <FormField
                    control={resetPasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter new password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResetPasswordMailbox(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
