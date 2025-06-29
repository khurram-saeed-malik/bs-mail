import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Globe, 
  Mail, 
  AtSign, 
  Plus, 
  Link as LinkIcon 
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location === "/",
    },
    {
      name: "Domains",
      href: "/domains", 
      icon: Globe,
      current: location === "/domains",
      count: stats?.domainCount,
    },
    {
      name: "Mailboxes",
      href: "/mailboxes",
      icon: Mail,
      current: location === "/mailboxes",
      count: stats?.mailboxCount,
    },
    {
      name: "Aliases",
      href: "/aliases",
      icon: AtSign,
      current: location === "/aliases",
      count: stats?.aliasCount,
    },
  ];

  const quickActions = [
    {
      name: "Create Mailbox",
      href: "/mailboxes",
      icon: Plus,
    },
    {
      name: "Add Alias",
      href: "/aliases",
      icon: LinkIcon,
    },
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white border-r min-h-screen">
      <div className="p-6">
        <div className="space-y-2">
          {/* Account Plan */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Account Plan</span>
              <Badge variant="secondary" className="bg-primary text-white">
                {user?.planType === "pro" ? "Pro" : "Basic"}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-primary/80">
              {stats?.domainCount || 0}/{user?.maxDomains || 1} domains used
            </div>
          </div>
          
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Navigation
          </h3>
          
          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      item.current 
                        ? "bg-primary/10 text-primary hover:bg-primary/15" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                    {item.count !== undefined && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto bg-gray-200 text-gray-700 text-xs"
                      >
                        {item.count}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.name} href={action.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-50"
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {action.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
