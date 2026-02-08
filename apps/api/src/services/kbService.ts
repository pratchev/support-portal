import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

interface CreateArticleInput {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  authorId: string;
  isPublished?: boolean;
}

interface UpdateArticleInput {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
}

class KBService {
  async createArticle(input: CreateArticleInput) {
    try {
      const article = await prisma.kBArticle.create({
        data: {
          title: input.title,
          content: input.content,
          category: input.category,
          tags: input.tags || [],
          authorId: input.authorId,
          isPublished: input.isPublished || false,
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });
      
      logger.info(`KB article created: ${article.title}`);
      return article;
    } catch (error) {
      logger.error('Failed to create KB article:', error);
      throw error;
    }
  }

  async getArticles(options: {
    category?: string;
    search?: string;
    published?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const {
      category,
      search,
      published = true,
      page = 1,
      limit = 20,
    } = options;
    
    const where: any = { isPublished: published };
    
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }
    
    const [articles, total] = await Promise.all([
      prisma.kBArticle.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.kBArticle.count({ where }),
    ]);
    
    return {
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getArticleById(id: string) {
    const article = await prisma.kBArticle.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
    
    if (article) {
      // Increment view count
      await prisma.kBArticle.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }
    
    return article;
  }

  async updateArticle(id: string, input: UpdateArticleInput) {
    try {
      const article = await prisma.kBArticle.update({
        where: { id },
        data: input,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });
      
      logger.info(`KB article updated: ${article.title}`);
      return article;
    } catch (error) {
      logger.error('Failed to update KB article:', error);
      throw error;
    }
  }

  async deleteArticle(id: string) {
    try {
      await prisma.kBArticle.delete({
        where: { id },
      });
      
      logger.info(`KB article deleted: ${id}`);
    } catch (error) {
      logger.error('Failed to delete KB article:', error);
      throw error;
    }
  }

  async searchArticles(query: string) {
    return prisma.kBArticle.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
      take: 10,
      orderBy: { viewCount: 'desc' },
    });
  }

  async getPopularArticles(limit: number = 10) {
    return prisma.kBArticle.findMany({
      where: { isPublished: true },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
      orderBy: { viewCount: 'desc' },
      take: limit,
    });
  }
}

export const kbService = new KBService();
