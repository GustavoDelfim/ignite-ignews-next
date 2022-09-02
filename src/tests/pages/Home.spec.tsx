import { render, screen } from "@testing-library/react"
import { stripe } from '../../services/stripe'
import Home, { getStaticProps } from "../../pages"
import { mocked } from "ts-jest/utils"

jest.mock('next/router')
jest.mock('next-auth/react', () => {
  return {
    useSession: () => ({ data: null, status: "unauthenticated" })
  }
})
jest.mock('../../services/stripe')

describe("Home page", () => {
  test("active link renders correctly", () => {
    render(<Home product={{ priceId: 'fake', amount: 'R$10,00' }} />)
    expect(screen.getByText("for R$10,00 month")).toBeInTheDocument()
  })

  test('loads initial data', async () => {
    const pricesMocked = mocked(stripe.prices.retrieve)

    pricesMocked.mockResolvedValueOnce({
      id: 'fake',
      unit_amount: 1000
    } as any)

    const response = await getStaticProps({})
    
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake',
            amount: '$10.00'
          }
        }
      })
    )
  })
})