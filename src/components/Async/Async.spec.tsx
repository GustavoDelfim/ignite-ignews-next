import { render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react"
import { Async } from "."

describe("Async Component", () => {
  test("it renders correcly", async () => {
    render(<Async />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()

    await waitForElementToBeRemoved(screen.queryByText('Button'), {
      timeout: 2000
    })
    
    await waitFor(() => {
      return expect(screen.queryByText('Button')).not.toBeInTheDocument()
    }, {
      timeout: 2000
    })
  })
})