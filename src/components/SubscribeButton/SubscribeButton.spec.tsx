import { render, screen, fireEvent } from "@testing-library/react"
import { mocked } from "ts-jest/utils"
import { signIn } from "next-auth/react"
import { SubscribeButton } from "."

jest.mock("next-auth/react", () => {
  return {
    useSession () {
      return { data: null, status: "unauthenticated" }
    },
    signIn: jest.fn()
  }
})

describe("Subscribe component", () => {
  test("renders corretly", () => {
    render(<SubscribeButton />)
    expect(screen.getByText("Subscribe now")).toBeInTheDocument()
  })

  test("redirects user to sign in when not authenticated", () => {
    const signInMoked = mocked(signIn)

    render(<SubscribeButton />)
    const subscribeButton = screen.getByText("Subscribe now")
    fireEvent.click(subscribeButton)

    expect(signInMoked).toHaveBeenCalled()
  })
})