import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HashRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import ArticleEditorForm from './ArticleEditorForm';
import setArticle from '../../services/setArticle';

vi.mock('../../services/setArticle', () => ({
  default: vi.fn().mockResolvedValue('test-article-slug')
}));

vi.mock('../../services/getArticle', () => ({
  default: vi.fn()
}));

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    AuthProvider: actual.default,
    useAuth: vi.fn()
  };
});

const renderWithProviders = (ui) => {
  return render(
    <HashRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </HashRouter>
  );
};

describe('ArticleEditorForm', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      isAuth: true,
      headers: { Authorization: 'Bearer test-token' },
      loggedUser: {
        username: 'testuser',
        email: 'test@example.com',
        bio: null,
        image: null,
        token: 'test-token'
      },
      setAuthState: vi.fn()
    });
    vi.clearAllMocks();
  });

  it('renders coverImage input with empty initial value by default', () => {
    renderWithProviders(<ArticleEditorForm />);
    const coverInput = screen.getByPlaceholderText(/Cover Image URL \(optional\)/i);
    expect(coverInput).toBeInTheDocument();
    expect(coverInput).toHaveValue('');
  });

  it('updates coverImage input value correctly when user types a URL', () => {
    renderWithProviders(<ArticleEditorForm />);
    const testCoverUrl = 'https://example.com/my-cover-image.jpg';
    const coverInput = screen.getByPlaceholderText(/Cover Image URL \(optional\)/i);
    
    fireEvent.change(coverInput, { target: { value: testCoverUrl } });
    
    expect(coverInput).toHaveValue(testCoverUrl);
  });

  it('carries coverImage field correctly in submission payload when form is submitted', async () => {
    renderWithProviders(<ArticleEditorForm />);
    const testTitle = 'Test Article Title';
    const testDescription = 'Test article description';
    const testBody = 'Test article body content';
    const testCoverUrl = 'https://example.com/valid-cover.png';
    const testTags = 'test,demo,article';

    fireEvent.change(screen.getByPlaceholderText(/Article Title/i), { target: { value: testTitle } });
    fireEvent.change(screen.getByPlaceholderText(/Cover Image URL \(optional\)/i), { target: { value: testCoverUrl } });
    fireEvent.change(screen.getByPlaceholderText(/What's this article about\?/i), { target: { value: testDescription } });
    fireEvent.change(screen.getByPlaceholderText(/Write your article \(in markdown\)/i), { target: { value: testBody } });
    fireEvent.change(screen.getByPlaceholderText(/Enter tags/i), { target: { value: testTags } });

    fireEvent.click(screen.getByRole('button', { name: /Publish Article/i }));

    await waitFor(() => {
      expect(setArticle).toHaveBeenCalledWith(
        expect.objectContaining({
          title: testTitle,
          description: testDescription,
          body: testBody,
          coverImage: testCoverUrl,
        })
      );
    });
  });

  it('submits with empty string for coverImage when user does not fill the optional field', async () => {
    renderWithProviders(<ArticleEditorForm />);
    fireEvent.change(screen.getByPlaceholderText(/Article Title/i), { target: { value: 'Minimal Article' } });
    fireEvent.change(screen.getByPlaceholderText(/What's this article about\?/i), { target: { value: 'Minimal description' } });
    fireEvent.change(screen.getByPlaceholderText(/Write your article \(in markdown\)/i), { target: { value: 'Minimal body content' } });

    fireEvent.click(screen.getByRole('button', { name: /Publish Article/i }));

    await waitFor(() => {
      expect(setArticle).toHaveBeenCalledWith(
        expect.objectContaining({
          coverImage: '',
        })
      );
    });
  });
});
