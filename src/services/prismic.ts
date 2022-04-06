import { getRepositoryEndpoint, createClient } from '@prismicio/client';

export const repositoryName = process.env.PRISMIC_REPOSITORY
const endpoint = getRepositoryEndpoint(repositoryName)

export function getPrismicClient() {
  return createClient(
    endpoint,
    {
      accessToken: process.env.PRISMIC_ACCESS_TOKEN
    }
  )
}