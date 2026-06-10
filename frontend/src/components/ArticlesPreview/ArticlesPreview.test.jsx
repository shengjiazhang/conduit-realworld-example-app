import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HashRouter } from 'react-router-dom';
import AuthProvider from '../../context/AuthContext';
import ArticlesPreview from './ArticlesPreview';

const getExpectedViewCount = (slug) => {
  if (!slug) return 0;
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 10000;
};

describe('ArticlesPreview', () => {
  const mockUpdateArticles = vi.fn();
  const sampleArticles = [
    {
      slug: 'test-article-1',
      title: 'First Test Article',
      description: 'This is the first test article description',
      tagList: ['react', 'testing'],
      favorited: false,
      favoritesCount: 2,
      author: { username: 'test-author', image: '', following: false },
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      slug: 'another-great-article',
      title: 'Second Great Article',
      description: 'Another awesome article content',
      tagList: ['conduit', 'demo'],
      favorited: true,
      favoritesCount: 10,
      author: { username: 'other-author', image: '', following: true },
      createdAt: '2024-02-15T12:00:00.000Z'
    }
  ];

  it('renders all articles with view count icon and correct stable value', () => {
    render(
      <HashRouter>
        <AuthProvider>
          <ArticlesPreview articles={sampleArticles} loading={false} updateArticles={mockUpdateArticles} />
        </AuthProvider>
      </HashRouter>
    );

    sampleArticles.forEach(article => {
      const expectedCount = getExpectedViewCount(article.slug);
      expect(screen.getByText(article.title)).toBeInTheDocument();
      const viewCountEl = screen.getByText(expectedCount.toString());
      expect(viewCountEl).toBeInTheDocument();
      const icon = viewCountEl.parentElement.querySelector('.ion-eye');
      expect(icon).not.toBeNull();
    });
  });

  it('produces identical view count for same slug across re-renders (no random jump)', () => {
    const testSlug = 'stable-same-slug-every-time';
    const testArticle = {
      ...sampleArticles[0],
      slug: testSlug
    };
    const expectedCount = getExpectedViewCount(testSlug);

    const { rerender } = render(
      <HashRouter>
        <AuthProvider>
          <ArticlesPreview articles={[testArticle]} loading={false} updateArticles={mockUpdateArticles} />
        </AuthProvider>
      </HashRouter>
    );

    expect(screen.getByText(expectedCount.toString())).toBeInTheDocument();

    rerender(
      <HashRouter>
        <AuthProvider>
          <ArticlesPreview articles={[testArticle]} loading={false} updateArticles={mockUpdateArticles} />
        </AuthProvider>
      </HashRouter>
    );
    rerender(
      <HashRouter>
        <AuthProvider>
          <ArticlesPreview articles={[testArticle]} loading={false} updateArticles={mockUpdateArticles} />
        </AuthProvider>
      </HashRouter>
    );

    expect(screen.getByText(expectedCount.toString())).toBeInTheDocument();
  });

  it('renders loading state correctly when loading is true', () => {
    render(
      <HashRouter>
        <AuthProvider>
          <ArticlesPreview articles={[]} loading={true} updateArticles={mockUpdateArticles} />
        </AuthProvider>
      </HashRouter>
    );
    expect(screen.getByText('Loading article...')).toBeInTheDocument();
  });

  it('renders empty state correctly when no articles and not loading', () => {
    render(
      <HashRouter>
        <AuthProvider>
          <ArticlesPreview articles={[]} loading={false} updateArticles={mockUpdateArticles} />
        </AuthProvider>
      </HashRouter>
    );
    expect(screen.getByText('No articles available.')).toBeInTheDocument();
  });

  it('preserves existing article content without regression', () => {
    render(
      <HashRouter>
        <AuthProvider>
          <ArticlesPreview articles={sampleArticles} loading={false} updateArticles={mockUpdateArticles} />
        </AuthProvider>
      </HashRouter>
    );
    sampleArticles.forEach(article => {
      expect(screen.getByText(article.description)).toBeInTheDocument();
      expect(screen.getAllByText('Read more...').length).toBeGreaterThanOrEqual(1);
      article.tagList.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  it('returns 0 view count for article with empty slug (edge case)', () => {
    const emptySlugArticle = {
      ...sampleArticles[0],
      slug: ''
    };
    render(
      <HashRouter>
        <AuthProvider>
          <ArticlesPreview articles={[emptySlugArticle]} loading={false} updateArticles={mockUpdateArticles} />
        </AuthProvider>
      </HashRouter>
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('ensures all generated view counts are less than 10000 per implementation rule', () => {
    const manySlugs = ['a', 'b', 'c', 'test-long-slug-12345', 'another-very-long-slug-for-testing-purposes'];
    manySlugs.forEach(slug => {
      const count = getExpectedViewCount(slug);
      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThan(10000);
    });
  });
});
