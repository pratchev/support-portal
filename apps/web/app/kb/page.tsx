'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, FileText } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const categories = [
    {
      id: 1,
      name: 'Getting Started',
      description: 'Learn the basics of using the support portal',
      articleCount: 8,
    },
    {
      id: 2,
      name: 'Account Management',
      description: 'Manage your account settings and preferences',
      articleCount: 12,
    },
    {
      id: 3,
      name: 'Troubleshooting',
      description: 'Common issues and their solutions',
      articleCount: 15,
    },
    {
      id: 4,
      name: 'FAQ',
      description: 'Frequently asked questions',
      articleCount: 20,
    },
  ];

  const popularArticles = [
    { id: 1, title: 'How to submit a ticket', views: 1250 },
    { id: 2, title: 'Tracking your ticket status', views: 980 },
    { id: 3, title: 'Resetting your password', views: 875 },
    { id: 4, title: 'Updating your profile', views: 720 },
  ];

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Knowledge Base</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find answers to common questions and learn how to use our platform
        </p>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/kb/${category.id}`}>
              <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription className="mt-2">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.articleCount} articles
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Articles</CardTitle>
          <CardDescription>Most viewed articles this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularArticles.map((article) => (
              <Link
                key={article.id}
                href={`/kb/${article.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{article.title}</p>
                  <p className="text-sm text-muted-foreground">{article.views} views</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
