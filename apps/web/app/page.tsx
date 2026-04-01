import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Ticket,
  Search,
  BookOpen,
  Clock,
  ArrowRight,
  Headphones,
  MessageSquare,
  Shield,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container max-w-5xl py-20 md:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            How can we help?
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Get fast, friendly support from our team. Submit a ticket, browse
            our knowledge base, or track an existing request.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Link href="/submit">
                Submit a Ticket
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-12 text-base font-medium"
            >
              <Link href="/track">Track Your Ticket</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container max-w-5xl py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Ticket,
              title: 'Submit Tickets',
              desc: 'Create a support request and get help quickly',
              href: '/submit',
            },
            {
              icon: Search,
              title: 'Track Progress',
              desc: 'Monitor your ticket status in real time',
              href: '/track',
            },
            {
              icon: BookOpen,
              title: 'Knowledge Base',
              desc: 'Find answers in our self-service library',
              href: '/kb',
            },
            {
              icon: Clock,
              title: '24/7 Support',
              desc: 'Round-the-clock assistance from our team',
              href: '/login',
            },
          ].map((item) => (
            <Link key={item.title} href={item.href}>
              <Card className="h-full border-0 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 rounded-2xl group cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50">
        <div className="container max-w-5xl py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Built for great support
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to deliver outstanding customer experiences
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Headphones,
                title: 'Smart Ticketing',
                desc: 'AI-powered analysis, priority routing, and SLA tracking keep your team focused.',
              },
              {
                icon: MessageSquare,
                title: 'Rich Communication',
                desc: 'Rich text editor, inline images, emoji reactions, and real-time updates.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                desc: 'Role-based access, JWT auth, rate limiting, audit logs, and XSS protection.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center px-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container max-w-5xl py-16">
        <h2 className="text-2xl font-bold mb-6">Quick links</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen,
              title: 'Knowledge Base',
              desc: 'Browse articles',
              href: '/kb',
            },
            {
              icon: Ticket,
              title: 'My Dashboard',
              desc: 'View your tickets',
              href: '/login',
            },
            {
              icon: Ticket,
              title: 'New Ticket',
              desc: 'Get help now',
              href: '/submit',
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-4 p-5 rounded-2xl border hover:bg-accent/50 transition-all duration-150 group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
