import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Globe, Shield, Zap, ExternalLink } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">ByteShifted Mail</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://webmail.byteshifted.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Webmail
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <Button onClick={() => window.location.href = "/api/login"}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Email Management Made Simple
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your email domains, mailboxes, and aliases with our powerful control panel. 
            Built on reliable mailcow infrastructure for businesses of all sizes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Domain Management</CardTitle>
              <CardDescription>
                Easily manage multiple email domains from a single dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Add custom domains</li>
                <li>• DNS configuration assistance</li>
                <li>• Domain health monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Mailbox Control</CardTitle>
              <CardDescription>
                Create and manage email accounts with flexible quotas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Unlimited mailboxes</li>
                <li>• Customizable storage quotas</li>
                <li>• Password management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Security & Reliability</CardTitle>
              <CardDescription>
                Enterprise-grade security with 99.9% uptime guarantee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• SSL/TLS encryption</li>
                <li>• Spam & virus protection</li>
                <li>• Regular backups</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-white rounded-lg p-8 shadow-sm">
          <Zap className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of businesses already using ByteShifted Mail for their email infrastructure.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => window.location.href = "/api/login"}
          >
            Start Managing Your Email
          </Button>
        </div>
      </main>

      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 ByteShifted Mail. Professional email hosting solutions.</p>
            <p className="mt-2">
              <a 
                href="https://www.byteshifted.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Visit ByteShifted.com for support and services
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
