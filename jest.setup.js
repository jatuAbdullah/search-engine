import "@testing-library/jest-dom"

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock Fuse.js
jest.mock("fuse.js", () => {
  return jest.fn().mockImplementation((list, options) => ({
    search: jest.fn((query) => {
      if (!query) return []
      return list
        .filter(
          (item) =>
            item.TITLE?.toLowerCase().includes(query.toLowerCase()) ||
            item.TAGS?.toLowerCase().includes(query.toLowerCase()),
        )
        .map((item) => ({ item }))
    }),
    getIndex: jest.fn(() => ({ docs: list })),
  }))
})
