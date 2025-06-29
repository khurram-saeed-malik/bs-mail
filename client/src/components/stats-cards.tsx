import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Mail, AtSign, HardDrive } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const cards = [
    {
      title: "Active Domains",
      value: stats?.domainCount || 0,
      icon: Globe,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Mailboxes", 
      value: stats?.mailboxCount || 0,
      icon: Mail,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Email Aliases",
      value: stats?.aliasCount || 0,
      icon: AtSign,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Storage Used",
      value: stats ? `${(stats.totalStorageUsed / 1024).toFixed(1)} GB` : "0 GB",
      icon: HardDrive,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
