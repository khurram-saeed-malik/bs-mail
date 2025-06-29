import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CreateAliasModal from "@/components/alias/create-alias-modal";
import EditAliasModal from "@/components/alias/edit-alias-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Plus, AtSign, Search, Edit, Trash2, ArrowRight } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Aliases() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAlias, setEditingAlias] = useState<any>(null);

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

  const { data: aliases = [], isLoading: aliasesLoading } = useQuery({
    queryKey: ["/api/aliases"],
    retry: false,
  });

  const { data: domains = [] } = useQuery({
    queryKey: ["/api/domains"],
    retry: false,
  });

  const deleteAliasMutation = useMutation({
    mutationFn: async (aliasId: string) => {
      await apiRequest("DELETE", `/api/aliases/${aliasId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aliases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Alias deleted successfully",
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
        description: error.message || "Failed to delete alias",
        variant: "destructive",
      });
    },
  });

  const filteredAliases = aliases.filter((alias: any) =>
    alias.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alias.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alias.domain?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h2 className="text-2xl font-bold text-gray-900">Email Aliases</h2>
                <p className="text-gray-600 mt-1">Manage email forwarding and aliases</p>
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alias
              </Button>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search aliases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Aliases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email Aliases</CardTitle>
            </CardHeader>
            <CardContent>
              {aliasesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAliases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alias Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destination
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain
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
                      {filteredAliases.map((alias: any) => (
                        <tr key={alias.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <AtSign className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{alias.address}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900">{alias.destination}</span>
                              <ArrowRight className="h-3 w-3 text-gray-400" />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {alias.domain?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={alias.isActive ? "default" : "secondary"}>
                              {alias.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingAlias(alias)}
                                className="text-primary hover:text-primary/80"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAliasMutation.mutate(alias.id)}
                                disabled={deleteAliasMutation.isPending}
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
                  <AtSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "No aliases found" : "No aliases yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? "Try adjusting your search terms"
                      : "Create your first alias to start forwarding emails."
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Alias
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Alias Modal */}
          <CreateAliasModal 
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            domains={domains}
          />

          {/* Edit Alias Modal */}
          {editingAlias && (
            <EditAliasModal
              alias={editingAlias}
              onClose={() => setEditingAlias(null)}
              domains={domains}
            />
          )}
        </main>
      </div>
    </div>
  );
}
