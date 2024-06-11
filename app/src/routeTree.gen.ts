/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IdImport } from './routes/$id'
import { Route as EndreIdImport } from './routes/endre.$id'
import { Route as IdOppsummeringImport } from './routes/$id.oppsummering'
import { Route as IdKvitteringImport } from './routes/$id.kvittering'
import { Route as IdInntektOgRefusjonImport } from './routes/$id.inntekt-og-refusjon'
import { Route as IdDineOpplysningerImport } from './routes/$id.dine-opplysninger'

// Create/Update Routes

const IdRoute = IdImport.update({
  path: '/$id',
  getParentRoute: () => rootRoute,
} as any)

const EndreIdRoute = EndreIdImport.update({
  path: '/endre/$id',
  getParentRoute: () => rootRoute,
} as any)

const IdOppsummeringRoute = IdOppsummeringImport.update({
  path: '/oppsummering',
  getParentRoute: () => IdRoute,
} as any)

const IdKvitteringRoute = IdKvitteringImport.update({
  path: '/kvittering',
  getParentRoute: () => IdRoute,
} as any)

const IdInntektOgRefusjonRoute = IdInntektOgRefusjonImport.update({
  path: '/inntekt-og-refusjon',
  getParentRoute: () => IdRoute,
} as any)

const IdDineOpplysningerRoute = IdDineOpplysningerImport.update({
  path: '/dine-opplysninger',
  getParentRoute: () => IdRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/$id': {
      preLoaderRoute: typeof IdImport
      parentRoute: typeof rootRoute
    }
    '/$id/dine-opplysninger': {
      preLoaderRoute: typeof IdDineOpplysningerImport
      parentRoute: typeof IdImport
    }
    '/$id/inntekt-og-refusjon': {
      preLoaderRoute: typeof IdInntektOgRefusjonImport
      parentRoute: typeof IdImport
    }
    '/$id/kvittering': {
      preLoaderRoute: typeof IdKvitteringImport
      parentRoute: typeof IdImport
    }
    '/$id/oppsummering': {
      preLoaderRoute: typeof IdOppsummeringImport
      parentRoute: typeof IdImport
    }
    '/endre/$id': {
      preLoaderRoute: typeof EndreIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IdRoute.addChildren([
    IdDineOpplysningerRoute,
    IdInntektOgRefusjonRoute,
    IdKvitteringRoute,
    IdOppsummeringRoute,
  ]),
  EndreIdRoute,
])

/* prettier-ignore-end */
