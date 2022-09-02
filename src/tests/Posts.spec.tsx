import { render, screen } from "@testing-library/react"
import Posts, { getStaticProps } from "../pages/posts"
import { mocked } from "ts-jest/utils"
import { getPrismicClient } from '../services/prismic'

const posts = [
  { slug: 'my-new-post', title: 'My New Post', excerpt: 'Post excerpt', updatedAt: '10 de Abril' }
]

jest.mock('../services/prismic')

describe("Home page", () => {
  test("active link renders correctly", () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText('My New Post')).toBeInTheDocument()
  })

  test('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByType: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [
                { type: 'heading', text: 'My New Post' }
              ],
              content: `Post's content`
            },
            last_publication_date: '04-01-2021'
          }
        ]
      })
    } as any)

    const response = await getStaticProps({})
    
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'my-new-post',
              title: 'My New Post',
              excerpt: `Post's content...`,
              updatedAt: 'April 01, 2021'
            }
          ]
        }
      })
    )
  })
})