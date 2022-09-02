import { render, screen } from "@testing-library/react"
import Post, { getServerSideProps } from "../../pages/posts/[slug]"
import { mocked } from "ts-jest/utils"
import { getSession } from "next-auth/react"
import { getPrismicClient } from "../../services/prismic"

const post = { slug: 'my-new-post', title: 'My New Post', content: '<p>Post excerpt</p>', updatedAt: '10 de Abril' }

jest.mock('next-auth/react')
jest.mock('../../services/prismic')

describe("Post page", () => {
  test("active link renders correctly", () => {
    render(<Post post={post} />)

    expect(screen.getByText('My New Post')).toBeInTheDocument()
    expect(screen.getByText('Post excerpt')).toBeInTheDocument()
  })

  test('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession)
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null
    } as any)
    
    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post'
      }
    } as any)
    
    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/'
        })
      })
    )
  })

  test('load initial data', async () => {
    const getSessionMocked = mocked(getSession)
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription'
    } as any)
    
    const getPrismicClientMocked = mocked(getPrismicClient)
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My New Post' },
          ],
          content: `<p>Post's content</p>`
        },
        last_publication_date: '04-01-2021'
      })
    } as any)
    
    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post'
      }
    } as any)
    
    expect(response).toEqual({
      props: {
        post: expect.objectContaining({
          slug: 'my-new-post',
          title: 'My New Post',
          content: `<p>Post's content</p>`,
          updatedAt: 'April 01, 2021'
        })
      }
    })
  })
})