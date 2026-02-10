'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function KnowledgeBaseArticlePage() {
  const params = useParams();
  const articleId = params.id as string;

  // Mock data
  const article = {
    id: articleId,
    title: 'How to Submit a Support Ticket',
    content: `
# How to Submit a Support Ticket

Submitting a support ticket is easy! Follow these steps:

## Step 1: Navigate to the Submit Page

Click on the "Submit Ticket" button in the navigation menu or go to the submit page directly.

## Step 2: Fill Out the Form

Provide the following information:
- **Title**: A brief description of your issue
- **Description**: Detailed information about your problem
- **Priority**: Select the urgency level (Low, Medium, High, Urgent)
- **Category**: Optional categorization of your issue

## Step 3: Submit

Click the "Submit Ticket" button to create your ticket. You'll receive a tracking token that you can use to monitor the status of your ticket.

## Tips for Better Support

- Be specific and provide as much detail as possible
- Include error messages if applicable
- Attach screenshots if they help explain the issue
- Choose the appropriate priority level

Need more help? Contact our support team directly.
    `,
    updatedAt: '2024-01-15',
    helpful: 245,
    notHelpful: 12,
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/kb">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Knowledge Base
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{article.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(article.updatedAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
          </div>

          <Separator className="my-8" />

          <div>
            <p className="font-medium mb-4">Was this article helpful?</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Yes ({article.helpful})
              </Button>
              <Button variant="outline" size="sm">
                <ThumbsDown className="mr-2 h-4 w-4" />
                No ({article.notHelpful})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
