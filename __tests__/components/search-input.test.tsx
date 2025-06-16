"use client"

import { describe, it, expect, jest } from "@jest/globals"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SearchInput } from "@/components/search-input"

describe("SearchInput", () => {
  it("should render with placeholder text", () => {
    const mockOnChange = jest.fn()
    render(<SearchInput value="" onChange={mockOnChange} placeholder="Search..." />)

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
  })

  it("should call onChange with debounced value", async () => {
    const mockOnChange = jest.fn()
    render(<SearchInput value="" onChange={mockOnChange} debounceMs={100} />)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "test query" } })

    await waitFor(
      () => {
        expect(mockOnChange).toHaveBeenCalledWith("test query")
      },
      { timeout: 200 },
    )
  })

  it("should show clear button when value is present", () => {
    const mockOnChange = jest.fn()
    render(<SearchInput value="test" onChange={mockOnChange} />)

    expect(screen.getByLabelText("Clear search")).toBeInTheDocument()
  })

  it("should clear input when clear button is clicked", () => {
    const mockOnChange = jest.fn()
    render(<SearchInput value="test" onChange={mockOnChange} />)

    const clearButton = screen.getByLabelText("Clear search")
    fireEvent.click(clearButton)

    expect(mockOnChange).toHaveBeenCalledWith("")
  })
})
