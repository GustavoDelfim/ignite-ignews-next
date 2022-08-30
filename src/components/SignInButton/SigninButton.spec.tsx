import { render, screen } from "@testing-library/react"
import { mocked } from "ts-jest/utils"
import { useSession } from "next-auth/react"
import { SignInButton } from "."

jest.mock("next-auth/react")

describe("SigninButton component", () => {
  test("renders corretly when user is not authenticated", () => {
    const useSessionMoked = mocked(useSession)
    useSessionMoked.mockReturnValueOnce({ data: null, status: "unauthenticated" })
    
    render(<SignInButton />)
  
    expect(screen.getByText("Sign in with Github")).toBeInTheDocument()
  })

  test("renders corretly when user is authenticated", () => {
    const useSessionMoked = mocked(useSession)
    useSessionMoked.mockReturnValueOnce({
      data: {
        user: {
          name: "john Doe",
          email: "johndoe@gmail.com",
          image: "http://john.com.br"
        },
        expires: (new Date()).toString()
      },
      status: "authenticated"
    })
    
    render(<SignInButton />)
  
    expect(screen.getByText("john Doe")).toBeInTheDocument()
  })
})