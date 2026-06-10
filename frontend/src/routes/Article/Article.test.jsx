import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Article from './Article';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/getArticle', () => ({
  default: vi.fn(),
}));

describe('Article route component', () => {
  const mockAuthReturn = {
    headers: { Authorization: 'Token test-123' },
    isAuth: true,
    loggedUser: { username: 'test-user' },
  };

  it('renders cover image correctly when valid coverImage URL is provided', () => {
    useAuth.mockReturnValue(mockAuthReturn);
    const testArticle = {
      title: 'Test Article With Cover Image',
      body: 'Sample article markdown content',
      coverImage: 'https://example.com/article-cover.jpg',
      tagList: ['test', 'feature'],
      author: { username: 'demo-author', image: '' },
      createdAt: '2024-06-01T12:00:00.000Z',
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/article/test-cover-slug', state: testArticle }]}>
        <Article />
      </MemoryRouter>
    );

    const coverImage = screen.getByAltText(testArticle.title);
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute('src', testArticle.coverImage);
    expect(coverImage).toHaveClass('img-fluid');
    expect(coverImage).toHaveClass('mb-4');
  });

  it('does not render cover image element when coverImage is empty string, no layout corruption', () => {
    useAuth.mockReturnValue(mockAuthReturn);
    const testArticle = {
      title: 'Article Without Cover Image',
      body: 'Article content with no cover',
      coverImage: '',
      tagList: ['no-cover', 'normal'],
      author: { username: 'demo-author', image: '' },
      createdAt: '2024-06-02T12:00:00.000Z',
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/article/no-cover-slug', state: testArticle }]}>
        <Article />
      </MemoryRouter>
    );

    const coverImage = screen.queryByAltText(testArticle.title);
    expect(coverImage).not.toBeInTheDocument();
    // Verify existing content still renders normally
    expect(screen.getByRole('heading', { name: testArticle.title })).toBeInTheDocument();
  });

  it('does not render cover image element for legacy articles missing coverImage field entirely', () => {
    useAuth.mockReturnValue(mockAuthReturn);
    // Legacy article object created before coverImage feature existed
    const legacyArticle = {
      title: 'Legacy Old Article',
      body: 'Content from pre-cover feature release',
      tagList: ['legacy', 'old'],
      author: { username: 'legacy-author', image: '' },
      createdAt: '2023-01-01T12:00:00.000Z',
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/article/legacy-slug', state: legacyArticle }]}>
        <Article />
      </MemoryRouter>
    );

    const coverImage = screen.queryByAltText(legacyArticle.title);
    expect(coverImage).not.toBeInTheDocument();
    // No runtime error or broken layout, title renders correctly
    expect(screen.getByRole('heading', { name: legacyArticle.title })).toBeInTheDocument();
  });
});
