import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import getTags from '../../services/getTags';
import PopularTags from './PopularTags';

vi.mock('../../services/getTags');
vi.mock('../../context/FeedContext', () => ({
  useFeedContext: vi.fn(() => ({
    changeTab: vi.fn()
  }))
}));

describe('PopularTags', () => {
  it('renders first 5 tags with bold style when total tags count is greater than 5', async () => {
    const mockTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'];
    vi.mocked(getTags).mockResolvedValue(mockTags);

    render(<PopularTags />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tags...')).not.toBeInTheDocument();
    });

    const tagButtons = screen.getAllByRole('button');
    expect(tagButtons.length).toBe(mockTags.length);

    for (let i = 0; i < 5; i++) {
      expect(tagButtons[i]).toHaveStyle({ fontWeight: 'bold' });
    }

    for (let i = 5; i < mockTags.length; i++) {
      expect(tagButtons[i]).not.toHaveStyle({ fontWeight: 'bold' });
    }
  });

  it('renders all tags with bold style when total tags count is less than 5', async () => {
    const mockTags = ['react', 'vue', 'angular'];
    vi.mocked(getTags).mockResolvedValue(mockTags);

    render(<PopularTags />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tags...')).not.toBeInTheDocument();
    });

    const tagButtons = screen.getAllByRole('button');
    expect(tagButtons.length).toBe(mockTags.length);

    tagButtons.forEach(button => {
      expect(button).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  it('shows empty state without any bold tags when tags list is empty', async () => {
    vi.mocked(getTags).mockResolvedValue([]);

    render(<PopularTags />);

    await waitFor(() => {
      expect(screen.getByText('Tags list not available')).toBeInTheDocument();
    });

    expect(screen.queryAllByRole('button').length).toBe(0);
  });
});
