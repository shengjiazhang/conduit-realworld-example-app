import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HashRouter } from "react-router-dom";
import ArticlesPreview from "./ArticlesPreview";
import { useAuth } from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("ArticlesPreview", () => {
  const mockUpdateArticles = vi.fn();
  const mockAuthReturn = {
    headers: { Authorization: 'Token test-123' },
    isAuth: true,
    loggedUser: { username: 'test-user' },
  };

  it("renders cover image element when article has non-empty valid coverImage URL", () => {
    useAuth.mockReturnValue(mockAuthReturn);
    const testArticle = {
      slug: "test-article-with-cover",
      title: "Test Article With Cover",
      description: "Sample article description",
      coverImage: "https://example.com/valid-cover-image.jpg",
      author: { username: "testauthor", image: "" },
      createdAt: "2024-01-01T00:00:00Z",
      favorited: false,
      favoritesCount: 0,
      tagList: [],
    };

    render(
      <HashRouter>
        <ArticlesPreview
          articles={[testArticle]}
          loading={false}
          updateArticles={mockUpdateArticles}
        />
      </HashRouter>
    );

    const coverImage = screen.getByAltText(testArticle.title);
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute("src", testArticle.coverImage);
    expect(coverImage).toHaveClass("article-preview-cover");
  });

  it("does NOT render cover image element when article coverImage is empty string", () => {
    useAuth.mockReturnValue(mockAuthReturn);
    const testArticle = {
      slug: "test-article-no-cover",
      title: "Test Article Without Cover",
      description: "Sample article description no cover",
      coverImage: "",
      author: { username: "testauthor", image: "" },
      createdAt: "2024-01-01T00:00:00Z",
      favorited: false,
      favoritesCount: 0,
      tagList: [],
    };

    render(
      <HashRouter>
        <ArticlesPreview
          articles={[testArticle]}
          loading={false}
          updateArticles={mockUpdateArticles}
        />
      </HashRouter>
    );

    const coverImage = screen.queryByAltText(testArticle.title);
    expect(coverImage).not.toBeInTheDocument();
  });

  it("does NOT render cover image element when article coverImage is all whitespace", () => {
    useAuth.mockReturnValue(mockAuthReturn);
    const testArticle = {
      slug: "test-article-whitespace-cover",
      title: "Test Article Whitespace Cover",
      description: "Sample article description whitespace",
      coverImage: "   \n\t  ",
      author: { username: "testauthor", image: "" },
      createdAt: "2024-01-01T00:00:00Z",
      favorited: false,
      favoritesCount: 0,
      tagList: [],
    };

    render(
      <HashRouter>
        <ArticlesPreview
          articles={[testArticle]}
          loading={false}
          updateArticles={mockUpdateArticles}
        />
      </HashRouter>
    );

    const coverImage = screen.queryByAltText(testArticle.title);
    expect(coverImage).not.toBeInTheDocument();
  });

  it("preserves all existing preview content when coverImage is empty", () => {
    useAuth.mockReturnValue(mockAuthReturn);
    const testArticle = {
      slug: "test-article-existing-content",
      title: "Existing Article Content",
      description: "Existing description content unchanged",
      coverImage: "",
      author: { username: "existinguser", image: "" },
      createdAt: "2024-01-01T00:00:00Z",
      favorited: false,
      favoritesCount: 0,
      tagList: ["existing-tag"],
    };

    render(
      <HashRouter>
        <ArticlesPreview
          articles={[testArticle]}
          loading={false}
          updateArticles={mockUpdateArticles}
        />
      </HashRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: testArticle.title })).toBeInTheDocument();
    expect(screen.getByText(testArticle.description)).toBeInTheDocument();
    expect(screen.getByText("Read more...")).toBeInTheDocument();
    expect(screen.getByText("existing-tag")).toBeInTheDocument();
  });
});
