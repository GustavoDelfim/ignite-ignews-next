import { render, screen, fireEvent,  } from "@testing-library/react"
import { mocked } from "ts-jest/utils"
import { signIn, useSession } from "next-auth/react"
import { SubscribeButton } from "."
import { useRouter } from "next/router"

jest.mock("next-auth/react")
jest.mock("next/router")

function mockedSession(params) {
  const useSessionMocked = mocked(useSession)
  useSessionMocked.mockReturnValueOnce(params)
}

describe("Subscribe component", () => {
  test("renders corretly", () => {
    mockedSession({ data: null, status: "unauthenticated" })
    
    render(<SubscribeButton />)
    expect(screen.getByText("Subscribe now")).toBeInTheDocument()
  })

  test("redirects user to sign in when not authenticated", () => {
    mockedSession({ data: null, status: "unauthenticated" })

    const signInMoked = mocked(signIn)

    render(<SubscribeButton />)
    const subscribeButton = screen.getByText("Subscribe now")
    fireEvent.click(subscribeButton)

    expect(signInMoked).toHaveBeenCalled()
  })

  test("redirects to posts when user already has a subscription", () => {
    mockedSession({
      data: {
        user: {
          name: "john Doe",
          email: "johndoe@gmail.com",
          image: "http://john.com.br"
        },
        expires: 'fake-expires',
        activeSubscription: true
      },
      status: "authenticated"
    })
    
    const useRouterMoked = mocked(useRouter)
    const pushMocked = jest.fn()
    
    useRouterMoked.mockReturnValueOnce({
      push: pushMocked
    } as any)
    
    
    render(<SubscribeButton />)
    const subscribeButton = screen.getByText("Subscribe now")
    fireEvent.click(subscribeButton)

    expect(pushMocked).toHaveBeenCalledWith('/posts')
  })
})