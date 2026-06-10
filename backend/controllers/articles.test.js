import { describe, it, expect, beforeEach } from 'vitest';
import * as articleController from './articles.js';
import { Article, User, Tag } from '../models/index.js';
import { slugify } from '../helper/helpers.js';

describe('Articles Controller - coverImage field', () => {
  let testUser1;
  let testUser2;
  let legacyArticle;
  let testArticleWithCover;

  beforeEach(async () => {
    // Clean up existing test data
    await Article.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Tag.destroy({ where: {} });

    // Seed test users
    testUser1 = await User.create({
      username: 'test-author-1',
      email: 'author1@example.com',
      password: 'password123'
    });
    testUser2 = await User.create({
      username: 'test-author-2',
      email: 'author2@example.com',
      password: 'password123'
    });

    // Seed legacy article without explicit coverImage (defaults to empty string)
    legacyArticle = await Article.create({
      slug: 'legacy-article',
      title: 'Legacy Article',
      description: 'Old article before coverImage feature',
      body: 'Legacy article body content',
      userId: testUser1.id
    });

    // Seed existing article with coverImage
    testArticleWithCover = await Article.create({
      slug: 'article-with-cover',
      title: 'Article With Cover',
      description: 'Article that already has a cover image',
      body: 'Article body content',
      coverImage: 'https://example.com/old-cover.jpg',
      userId: testUser1.id
    });
  });

  describe('createArticle', () => {
    it('persists valid coverImage URL when creating new article', async () => {
      const validCoverUrl = 'https://example.com/valid-cover-image.jpg';
      const req = {
        loggedUser: testUser1,
        body: {
          article: {
            title: 'New Article With Cover',
            description: 'Test description',
            body: 'Test body content',
            tagList: ['test', 'cover'],
            coverImage: validCoverUrl
          }
        }
      };
      const res = {
        status: (code) => ({
          json: (payload) => {
            res.statusCode = code;
            res.payload = payload;
          }
        })
      };

      await articleController.createArticle(req, res, (err) => {
        expect(err).toBeFalsy();
      });

      const savedArticle = await Article.findOne({ where: { slug: slugify('New Article With Cover') } });
      expect(savedArticle.coverImage).toBe(validCoverUrl);
      expect(res.statusCode).toBe(201);
    });

    it('defaults coverImage to empty string when field is not provided', async () => {
      const req = {
        loggedUser: testUser1,
        body: {
          article: {
            title: 'Article Without Cover',
            description: 'Test description',
            body: 'Test body content',
            tagList: ['no-cover']
          }
        }
      };
      const res = {
        status: (code) => ({
          json: (payload) => {
            res.statusCode = code;
            res.payload = payload;
          }
        })
      };

      await articleController.createArticle(req, res, (err) => {
        expect(err).toBeFalsy();
      });

      const savedArticle = await Article.findOne({ where: { slug: slugify('Article Without Cover') } });
      expect(savedArticle.coverImage).toBe('');
    });

    it('rejects invalid non-URL coverImage and does not persist the value', async () => {
      const invalidUrl = 'not-a-valid-url';
      const req = {
        loggedUser: testUser1,
        body: {
          article: {
            title: 'Bad Cover Article',
            description: 'Test description',
            body: 'Test body content',
            tagList: ['invalid'],
            coverImage: invalidUrl
          }
        }
      };
      let capturedError;

      await articleController.createArticle(req, {}, (err) => {
        capturedError = err;
      });

      expect(capturedError.name).toBe('FieldRequiredError');
      expect(capturedError.message).toContain('valid URL');
      const articleCount = await Article.count({ where: { title: 'Bad Cover Article' } });
      expect(articleCount).toBe(0);
    });

    it('rejects coverImage URL longer than 2048 characters', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2040);
      expect(longUrl.length).toBeGreaterThan(2048);
      const req = {
        loggedUser: testUser1,
        body: {
          article: {
            title: 'Long Cover Article',
            description: 'Test description',
            body: 'Test body content',
            tagList: ['long'],
            coverImage: longUrl
          }
        }
      };
      let capturedError;

      await articleController.createArticle(req, {}, (err) => {
        capturedError = err;
      });

      expect(capturedError.name).toBe('FieldRequiredError');
      expect(capturedError.message).toContain('2048');
      const articleCount = await Article.count({ where: { title: 'Long Cover Article' } });
      expect(articleCount).toBe(0);
    });

    it('preserves all existing article fields when coverImage is provided', async () => {
      const testTitle = 'Full Field Article';
      const testDesc = 'Full description test';
      const testBody = 'Full body markdown content';
      const testTags = ['full', 'fields', 'test'];
      const testCover = 'https://example.com/full-cover.png';

      const req = {
        loggedUser: testUser1,
        body: {
          article: {
            title: testTitle,
            description: testDesc,
            body: testBody,
            tagList: testTags,
            coverImage: testCover
          }
        }
      };
      const res = {
        status: (code) => ({
          json: (payload) => {
            res.statusCode = code;
            res.payload = payload;
          }
        })
      };

      await articleController.createArticle(req, res, (err) => {
        expect(err).toBeFalsy();
      });

      const savedArticle = await Article.findOne({ where: { slug: slugify(testTitle) } });
      expect(savedArticle.title).toBe(testTitle);
      expect(savedArticle.description).toBe(testDesc);
      expect(savedArticle.body).toBe(testBody);
      expect(savedArticle.coverImage).toBe(testCover);
    });
  });

  describe('updateArticle', () => {
    it('allows article author to update existing coverImage to new valid URL', async () => {
      const newCoverUrl = 'https://example.com/new-cover-image.png';
      const req = {
        loggedUser: testUser1,
        params: { slug: testArticleWithCover.slug },
        body: {
          article: {
            coverImage: newCoverUrl
          }
        }
      };
      const res = {
        json: (payload) => {
          res.payload = payload;
        }
      };

      await articleController.updateArticle(req, res, (err) => {
        expect(err).toBeFalsy();
      });

      const updatedArticle = await Article.findByPk(testArticleWithCover.id);
      expect(updatedArticle.coverImage).toBe(newCoverUrl);
    });

    it('allows article author to clear coverImage to empty string', async () => {
      const req = {
        loggedUser: testUser1,
        params: { slug: testArticleWithCover.slug },
        body: {
          article: {
            coverImage: ''
          }
        }
      };
      const res = {
        json: (payload) => {
          res.payload = payload;
        }
      };

      await articleController.updateArticle(req, res, (err) => {
        expect(err).toBeFalsy();
      });

      const updatedArticle = await Article.findByPk(testArticleWithCover.id);
      expect(updatedArticle.coverImage).toBe('');
    });

    it('rejects non-author user from modifying article coverImage and leaves value unchanged', async () => {
      const originalCover = testArticleWithCover.coverImage;
      const req = {
        loggedUser: testUser2,
        params: { slug: testArticleWithCover.slug },
        body: {
          article: {
            coverImage: 'https://example.com/hacker-cover.jpg'
          }
        }
      };
      let capturedError;

      await articleController.updateArticle(req, {}, (err) => {
        capturedError = err;
      });

      expect(capturedError.name).toBe('ForbiddenError');
      const unchangedArticle = await Article.findByPk(testArticleWithCover.id);
      expect(unchangedArticle.coverImage).toBe(originalCover);
    });

    it('preserves existing title/description/body updates when coverImage is also updated', async () => {
      const newTitle = 'Updated Article Title';
      const newDesc = 'Updated description';
      const newCover = 'https://example.com/updated-cover.webp';
      const req = {
        loggedUser: testUser1,
        params: { slug: testArticleWithCover.slug },
        body: {
          article: {
            title: newTitle,
            description: newDesc,
            coverImage: newCover
          }
        }
      };
      const res = {
        json: (payload) => {
          res.payload = payload;
        }
      };

      await articleController.updateArticle(req, res, (err) => {
        expect(err).toBeFalsy();
      });

      const updatedArticle = await Article.findByPk(testArticleWithCover.id);
      expect(updatedArticle.title).toBe(newTitle);
      expect(updatedArticle.description).toBe(newDesc);
      expect(updatedArticle.coverImage).toBe(newCover);
    });
  });

  describe('legacy article compatibility', () => {
    it('loads legacy article with empty coverImage without errors in singleArticle endpoint', async () => {
      const req = {
        params: { slug: legacyArticle.slug }
      };
      const res = {
        json: (payload) => {
          res.payload = payload;
        }
      };

      await articleController.singleArticle(req, res, (err) => {
        expect(err).toBeFalsy();
      });

      expect(res.payload.article.coverImage).toBe('');
    });

    it('returns all articles including legacy articles with empty coverImage in allArticles endpoint', async () => {
      const req = { query: {} };
      const res = {
        json: (payload) => {
          res.payload = payload;
        }
      };

      await articleController.allArticles(req, res, (err) => {
        expect(err).toBeFalsy();
      });

      const allArticles = res.payload.articles;
      expect(allArticles.length).toBeGreaterThanOrEqual(2);
      const foundLegacy = allArticles.find(a => a.slug === legacyArticle.slug);
      expect(foundLegacy).toBeDefined();
      expect(foundLegacy.coverImage).toBe('');
    });
  });
});
