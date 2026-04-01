'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, FileText, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  author?: { id: string; name: string };
}

interface PaginatedArticles {
  data: KBArticle[];
  pagination: { total: number };
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [categories, setCategories] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [searchResults, setSearchResults] = useState<KBArticle[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await apiClient.get<PaginatedArticles>('/api/kb');
        setArticles(result.data);

        // Build categories from articles
        const catMap = new Map<string, number>();
        result.data.forEach((a) => {
          catMap.set(a.category, (catMap.get(a.category) || 0) + 1);
        });
        setCategories(
          Array.from(catMap.entries()).map(([name, count]) => ({ name, count }))
        );
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await apiClient.get<KBArticle[]>('/api/kb/search', {
        params: { q: searchQuery },
      });
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  };

  const displayArticles = searchResults !== null ? searchResults : articles;

  return (
    <div className="container py-12">
      {/* Hero search section */}
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-6">
          <BookOpen className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight mb-3">
          Knowledge Base
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Find answers to common questions and learn how to use our platform
        </p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            className="pl-12 h-12 text-base rounded-full border-border/60 bg-muted/30 focus:bg-background shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading articles...</p>
      ) : (
        <>
          {/* Category cards */}
          {searchResults === null && categories.length > 0 && (
            <div className="mb-14">
              <h2 className="text-xl font-semibold tracking-tight mb-6">
                Browse by Category
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card
                    key={category.name}
                    className="group border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {category.name}
                          </CardTitle>
                          <CardDescription className="mt-0.5 text-xs">
                            {category.count} article
                            {category.count !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search results header */}
          {searchResults !== null && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {searchResults.length} result
                {searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}
                &quot;
              </p>
            </div>
          )}

          {/* Article list */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-6">
              {searchResults !== null ? 'Search Results' : 'All Articles'}
            </h2>
            <div className="space-y-2">
              {displayArticles.length > 0 ? (
                displayArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/kb/${article.id}`}
                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-accent/50 transition-colors duration-150"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-150">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors duration-150">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {article.category}
                        {article.author ? ` · ${article.author.name}` : ''}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-150 -translate-x-1 group-hover:translate-x-0" />
                  </Link>
                ))
              ) : (
                <p className="text-center py-12 text-muted-foreground text-sm">
                  No articles found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
