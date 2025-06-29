import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StatsCards from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, ExternalLink, Globe, Mail, AtSign, ChevronRight } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: domains = [] } = useQuery({
    queryKey: ["/api/domains"],
    retry: false,
  });

  const { data: mailboxes = [] } = useQuery({
    queryKey: ["/api/mailboxes"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const recentDomains = domains.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600 mt-1">Manage your email domains and mailboxes</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                  onClick={() => window.open("http://webmail.byteshifted.io", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Webmail Access
                </Button>
                <Link href="/mailboxes">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Mailbox
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Domains Overview & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-900">Your Domains</CardTitle>
                  <Link href="/domains">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentDomains.length > 0 ? (
                  <div className="space-y-4">
                    {recentDomains.map((domain: any) => (
                      <div key={domain.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">{domain.name}</p>
                            <p className="text-sm text-gray-500">
                              {domain.mailboxCount} mailboxes
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {domain.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No domains configured yet</p>
                    <Link href="/domains">
                      <Button variant="outline" size="sm" className="mt-2">
                        Add Your First Domain
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href="/mailboxes">
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto border border-gray-200 hover:border-primary/30 hover:bg-primary/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Plus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Create Mailbox</p>
                          <p className="text-sm text-gray-500">Add a new email account</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Button>
                  </Link>

                  <Link href="/aliases">
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto border border-gray-200 hover:border-primary/30 hover:bg-primary/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <AtSign className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Add Email Alias</p>
                          <p className="text-sm text-gray-500">Create forwarding addresses</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto border border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    onClick={() => window.open("http://webmail.byteshifted.io", "_blank")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Open Webmail</p>
                        <p className="text-sm text-gray-500">Access your email interface</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Mailboxes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-900">Recent Mailboxes</CardTitle>
                <Link href="/mailboxes">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {mailboxes.length > 0 ? (
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mailboxes.slice(0, 5).map((mailbox: any) => (
                        <tr key={mailbox.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Mail className="h-4 w-4 text-primary" />
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {mailbox.quota} MB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={mailbox.isActive ? "default" : "secondary"}>
                              {mailbox.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No mailboxes created yet</p>
                  <Link href="/mailboxes">
                    <Button variant="outline" size="sm" className="mt-2">
                      Create Your First Mailbox
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
