import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Mail, ExternalLink, ChevronDown, LogOut, User } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (email) {
      return email.split('@')[0];
    }
    return "User";
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Mail className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-medium text-gray-900">ByteShifted Mail</h1>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-6 ml-8">
            <Link href="/">
              <a className="text-primary border-b-2 border-primary pb-4 px-2 font-medium">
                Dashboard
              </a>
            </Link>
            <Link href="/domains">
              <a className="text-gray-600 hover:text-primary pb-4 px-2">
                Domains
              </a>
            </Link>
            <Link href="/mailboxes">
              <a className="text-gray-600 hover:text-primary pb-4 px-2">
                Mailboxes
              </a>
            </Link>
            <Link href="/aliases">
              <a className="text-gray-600 hover:text-primary pb-4 px-2">
                Aliases
              </a>
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
            onClick={() => window.open("http://webmail.byteshifted.io", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Webmail
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700 font-medium">
                  {getDisplayName(user?.firstName, user?.lastName, user?.email)}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
