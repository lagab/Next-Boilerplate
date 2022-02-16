import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from '@apollo/client';
import getConfig from 'next/config';
import { useMemo } from 'react';

let apolloClient: ApolloClient<NormalizedCacheObject>;

const httpLink = new HttpLink({
  uri: process.env.GRAPHQL_URL ?? `${process.env.BASE_PATH}/graphql`, // Server URL (must be absolute)
});

function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

export const initializeApollo = (
  initialState: NormalizedCacheObject = {}
): ApolloClient<NormalizedCacheObject> => {
  const apolloClientInstance = apolloClient ?? createApolloClient();
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = apolloClientInstance.extract();

    // Merge the initialState from getStaticProps/getServerSideProps in the existing cache and restore the cache with the merged data
    apolloClientInstance.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return apolloClientInstance;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = apolloClientInstance;

  return apolloClientInstance;
};

export function useApollo(
  initialState: NormalizedCacheObject
): ApolloClient<NormalizedCacheObject> {
  return useMemo(() => initializeApollo(initialState), [initialState]);
}
