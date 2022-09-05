import { render, screen } from "@testing-library/react"
import Preview, { getStaticProps } from "../../pages/posts/preview/[slug]"
import { mocked } from "ts-jest/utils"
import { useSession } from "next-auth/react"
import { getPrismicClient } from "../../services/prismic"
import { useRouter } from "next/router"

const post = { slug: 'my-new-post', title: 'My New Post', content: '<p>Post excerpt</p>', updatedAt: '10 de Abril' }

jest.mock('next-auth/react')
jest.mock('next/router')
jest.mock('../../services/prismic')

describe("PostPreview page", () => {
  test("active link renders correctly", () => {
    const useSessionMocked = mocked(useSession)
    useSessionMocked.mockReturnValueOnce({ data: null, status: "unauthenticated" })

    render(<Preview post={post} />)

    expect(screen.getByText('My New Post')).toBeInTheDocument()
    expect(screen.getByText('Post excerpt')).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reagin?')).toBeInTheDocument()
  })

  test('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = mocked(useSession)
    useSessionMocked.mockReturnValueOnce({
      data: { activeSubscription: 'fake-subscription' }
    } as any)
    
    const useRouterMocked = mocked(useRouter)
    const pushMocked = jest.fn()

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked
    } as any)
    
    render(<Preview post={post} />)
    
    expect(pushMocked).toHaveBeenCalledWith('/posts/my-new-post')
  })

  test('load initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My New Post' },
          ],
          content: `Post's content`
        },
        last_publication_date: '04-01-2021'
      })
    } as any)
    
    const response = await getStaticProps({
      params: {
        slug: 'my-new-post'
      }
    } as any)
    
    expect(response).toEqual({
      props: {
        post: expect.objectContaining({
          slug: 'my-new-post',
          title: 'My New Post',
          content: `Post's content...`,
          updatedAt: 'April 01, 2021'
        })
      },
      revalidate: 60 * 30 // 30 minutos
    })
  })
})