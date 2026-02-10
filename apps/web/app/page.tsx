import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Search, BookOpen, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Support Portal
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Get help quickly and efficiently. Submit tickets, track progress, and access our knowledge base.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/submit">Submit a Ticket</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/track">Track Your Ticket</Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card>
          <CardHeader>
            <Ticket className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Submit Tickets</CardTitle>
            <CardDescription>
              Easily submit support tickets and get help from our team
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Search className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Track Progress</CardTitle>
            <CardDescription>
              Monitor your tickets in real-time with our tracking system
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>
              Find answers quickly in our comprehensive knowledge base
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>24/7 Support</CardTitle>
            <CardDescription>
              Get assistance whenever you need it with our round-the-clock support
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Access frequently used resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/kb"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Knowledge Base</p>
                <p className="text-sm text-muted-foreground">Browse articles</p>
              </div>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Ticket className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">My Dashboard</p>
                <p className="text-sm text-muted-foreground">View your tickets</p>
              </div>
            </Link>
            <Link
              href="/submit"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Ticket className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">New Ticket</p>
                <p className="text-sm text-muted-foreground">Get help now</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
