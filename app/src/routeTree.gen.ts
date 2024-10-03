/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IdImport } from './routes/$id'
import { Route as IdIndexImport } from './routes/$id.index'
import { Route as RefusjonOmsorgspengerArbeidsgiverImport } from './routes/refusjon-omsorgspenger.arbeidsgiver'
import { Route as RefusjonOmsorgspengerArbeidsgiver6KvitteringImport } from './routes/refusjon-omsorgspenger-arbeidsgiver.6-kvittering'
import { Route as RefusjonOmsorgspengerArbeidsgiver5OppsummeringImport } from './routes/refusjon-omsorgspenger-arbeidsgiver.5-oppsummering'
import { Route as RefusjonOmsorgspengerArbeidsgiver4RefusjonImport } from './routes/refusjon-omsorgspenger-arbeidsgiver.4-refusjon'
import { Route as RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerImport } from './routes/refusjon-omsorgspenger-arbeidsgiver.3-omsorgsdager'
import { Route as RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverImport } from './routes/refusjon-omsorgspenger-arbeidsgiver.2-ansatt-og-arbeidsgiver'
import { Route as RefusjonOmsorgspengerArbeidsgiver1IntroImport } from './routes/refusjon-omsorgspenger-arbeidsgiver.1-intro'
import { Route as IdVisImport } from './routes/$id.vis'
import { Route as IdOppsummeringImport } from './routes/$id.oppsummering'
import { Route as IdKvitteringImport } from './routes/$id.kvittering'
import { Route as IdInntektOgRefusjonImport } from './routes/$id.inntekt-og-refusjon'
import { Route as IdDineOpplysningerImport } from './routes/$id.dine-opplysninger'

// Create/Update Routes

const IdRoute = IdImport.update({
  path: '/$id',
  getParentRoute: () => rootRoute,
} as any)

const IdIndexRoute = IdIndexImport.update({
  path: '/',
  getParentRoute: () => IdRoute,
} as any)

const RefusjonOmsorgspengerArbeidsgiverRoute =
  RefusjonOmsorgspengerArbeidsgiverImport.update({
    path: '/refusjon-omsorgspenger/arbeidsgiver',
    getParentRoute: () => rootRoute,
  } as any)

const RefusjonOmsorgspengerArbeidsgiver6KvitteringRoute =
  RefusjonOmsorgspengerArbeidsgiver6KvitteringImport.update({
    path: '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering',
    getParentRoute: () => rootRoute,
  } as any)

const RefusjonOmsorgspengerArbeidsgiver5OppsummeringRoute =
  RefusjonOmsorgspengerArbeidsgiver5OppsummeringImport.update({
    path: '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering',
    getParentRoute: () => rootRoute,
  } as any)

const RefusjonOmsorgspengerArbeidsgiver4RefusjonRoute =
  RefusjonOmsorgspengerArbeidsgiver4RefusjonImport.update({
    path: '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon',
    getParentRoute: () => rootRoute,
  } as any)

const RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerRoute =
  RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerImport.update({
    path: '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager',
    getParentRoute: () => rootRoute,
  } as any)

const RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverRoute =
  RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverImport.update({
    path: '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver',
    getParentRoute: () => rootRoute,
  } as any)

const RefusjonOmsorgspengerArbeidsgiver1IntroRoute =
  RefusjonOmsorgspengerArbeidsgiver1IntroImport.update({
    path: '/refusjon-omsorgspenger-arbeidsgiver/1-intro',
    getParentRoute: () => rootRoute,
  } as any)

const IdVisRoute = IdVisImport.update({
  path: '/vis',
  getParentRoute: () => IdRoute,
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
      id: '/$id'
      path: '/$id'
      fullPath: '/$id'
      preLoaderRoute: typeof IdImport
      parentRoute: typeof rootRoute
    }
    '/$id/dine-opplysninger': {
      id: '/$id/dine-opplysninger'
      path: '/dine-opplysninger'
      fullPath: '/$id/dine-opplysninger'
      preLoaderRoute: typeof IdDineOpplysningerImport
      parentRoute: typeof IdImport
    }
    '/$id/inntekt-og-refusjon': {
      id: '/$id/inntekt-og-refusjon'
      path: '/inntekt-og-refusjon'
      fullPath: '/$id/inntekt-og-refusjon'
      preLoaderRoute: typeof IdInntektOgRefusjonImport
      parentRoute: typeof IdImport
    }
    '/$id/kvittering': {
      id: '/$id/kvittering'
      path: '/kvittering'
      fullPath: '/$id/kvittering'
      preLoaderRoute: typeof IdKvitteringImport
      parentRoute: typeof IdImport
    }
    '/$id/oppsummering': {
      id: '/$id/oppsummering'
      path: '/oppsummering'
      fullPath: '/$id/oppsummering'
      preLoaderRoute: typeof IdOppsummeringImport
      parentRoute: typeof IdImport
    }
    '/$id/vis': {
      id: '/$id/vis'
      path: '/vis'
      fullPath: '/$id/vis'
      preLoaderRoute: typeof IdVisImport
      parentRoute: typeof IdImport
    }
    '/refusjon-omsorgspenger-arbeidsgiver/1-intro': {
      id: '/refusjon-omsorgspenger-arbeidsgiver/1-intro'
      path: '/refusjon-omsorgspenger-arbeidsgiver/1-intro'
      fullPath: '/refusjon-omsorgspenger-arbeidsgiver/1-intro'
      preLoaderRoute: typeof RefusjonOmsorgspengerArbeidsgiver1IntroImport
      parentRoute: typeof rootRoute
    }
    '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver': {
      id: '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver'
      path: '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver'
      fullPath: '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver'
      preLoaderRoute: typeof RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverImport
      parentRoute: typeof rootRoute
    }
    '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager': {
      id: '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager'
      path: '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager'
      fullPath: '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager'
      preLoaderRoute: typeof RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerImport
      parentRoute: typeof rootRoute
    }
    '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon': {
      id: '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon'
      path: '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon'
      fullPath: '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon'
      preLoaderRoute: typeof RefusjonOmsorgspengerArbeidsgiver4RefusjonImport
      parentRoute: typeof rootRoute
    }
    '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering': {
      id: '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering'
      path: '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering'
      fullPath: '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering'
      preLoaderRoute: typeof RefusjonOmsorgspengerArbeidsgiver5OppsummeringImport
      parentRoute: typeof rootRoute
    }
    '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering': {
      id: '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering'
      path: '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering'
      fullPath: '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering'
      preLoaderRoute: typeof RefusjonOmsorgspengerArbeidsgiver6KvitteringImport
      parentRoute: typeof rootRoute
    }
    '/refusjon-omsorgspenger/arbeidsgiver': {
      id: '/refusjon-omsorgspenger/arbeidsgiver'
      path: '/refusjon-omsorgspenger/arbeidsgiver'
      fullPath: '/refusjon-omsorgspenger/arbeidsgiver'
      preLoaderRoute: typeof RefusjonOmsorgspengerArbeidsgiverImport
      parentRoute: typeof rootRoute
    }
    '/$id/': {
      id: '/$id/'
      path: '/'
      fullPath: '/$id/'
      preLoaderRoute: typeof IdIndexImport
      parentRoute: typeof IdImport
    }
  }
}

// Create and export the route tree

interface IdRouteChildren {
  IdDineOpplysningerRoute: typeof IdDineOpplysningerRoute
  IdInntektOgRefusjonRoute: typeof IdInntektOgRefusjonRoute
  IdKvitteringRoute: typeof IdKvitteringRoute
  IdOppsummeringRoute: typeof IdOppsummeringRoute
  IdVisRoute: typeof IdVisRoute
  IdIndexRoute: typeof IdIndexRoute
}

const IdRouteChildren: IdRouteChildren = {
  IdDineOpplysningerRoute: IdDineOpplysningerRoute,
  IdInntektOgRefusjonRoute: IdInntektOgRefusjonRoute,
  IdKvitteringRoute: IdKvitteringRoute,
  IdOppsummeringRoute: IdOppsummeringRoute,
  IdVisRoute: IdVisRoute,
  IdIndexRoute: IdIndexRoute,
}

const IdRouteWithChildren = IdRoute._addFileChildren(IdRouteChildren)

export interface FileRoutesByFullPath {
  '/$id': typeof IdRouteWithChildren
  '/$id/dine-opplysninger': typeof IdDineOpplysningerRoute
  '/$id/inntekt-og-refusjon': typeof IdInntektOgRefusjonRoute
  '/$id/kvittering': typeof IdKvitteringRoute
  '/$id/oppsummering': typeof IdOppsummeringRoute
  '/$id/vis': typeof IdVisRoute
  '/refusjon-omsorgspenger-arbeidsgiver/1-intro': typeof RefusjonOmsorgspengerArbeidsgiver1IntroRoute
  '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver': typeof RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverRoute
  '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager': typeof RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerRoute
  '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon': typeof RefusjonOmsorgspengerArbeidsgiver4RefusjonRoute
  '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering': typeof RefusjonOmsorgspengerArbeidsgiver5OppsummeringRoute
  '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering': typeof RefusjonOmsorgspengerArbeidsgiver6KvitteringRoute
  '/refusjon-omsorgspenger/arbeidsgiver': typeof RefusjonOmsorgspengerArbeidsgiverRoute
  '/$id/': typeof IdIndexRoute
}

export interface FileRoutesByTo {
  '/$id/dine-opplysninger': typeof IdDineOpplysningerRoute
  '/$id/inntekt-og-refusjon': typeof IdInntektOgRefusjonRoute
  '/$id/kvittering': typeof IdKvitteringRoute
  '/$id/oppsummering': typeof IdOppsummeringRoute
  '/$id/vis': typeof IdVisRoute
  '/refusjon-omsorgspenger-arbeidsgiver/1-intro': typeof RefusjonOmsorgspengerArbeidsgiver1IntroRoute
  '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver': typeof RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverRoute
  '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager': typeof RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerRoute
  '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon': typeof RefusjonOmsorgspengerArbeidsgiver4RefusjonRoute
  '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering': typeof RefusjonOmsorgspengerArbeidsgiver5OppsummeringRoute
  '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering': typeof RefusjonOmsorgspengerArbeidsgiver6KvitteringRoute
  '/refusjon-omsorgspenger/arbeidsgiver': typeof RefusjonOmsorgspengerArbeidsgiverRoute
  '/$id': typeof IdIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/$id': typeof IdRouteWithChildren
  '/$id/dine-opplysninger': typeof IdDineOpplysningerRoute
  '/$id/inntekt-og-refusjon': typeof IdInntektOgRefusjonRoute
  '/$id/kvittering': typeof IdKvitteringRoute
  '/$id/oppsummering': typeof IdOppsummeringRoute
  '/$id/vis': typeof IdVisRoute
  '/refusjon-omsorgspenger-arbeidsgiver/1-intro': typeof RefusjonOmsorgspengerArbeidsgiver1IntroRoute
  '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver': typeof RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverRoute
  '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager': typeof RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerRoute
  '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon': typeof RefusjonOmsorgspengerArbeidsgiver4RefusjonRoute
  '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering': typeof RefusjonOmsorgspengerArbeidsgiver5OppsummeringRoute
  '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering': typeof RefusjonOmsorgspengerArbeidsgiver6KvitteringRoute
  '/refusjon-omsorgspenger/arbeidsgiver': typeof RefusjonOmsorgspengerArbeidsgiverRoute
  '/$id/': typeof IdIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/$id'
    | '/$id/dine-opplysninger'
    | '/$id/inntekt-og-refusjon'
    | '/$id/kvittering'
    | '/$id/oppsummering'
    | '/$id/vis'
    | '/refusjon-omsorgspenger-arbeidsgiver/1-intro'
    | '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver'
    | '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager'
    | '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon'
    | '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering'
    | '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering'
    | '/refusjon-omsorgspenger/arbeidsgiver'
    | '/$id/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/$id/dine-opplysninger'
    | '/$id/inntekt-og-refusjon'
    | '/$id/kvittering'
    | '/$id/oppsummering'
    | '/$id/vis'
    | '/refusjon-omsorgspenger-arbeidsgiver/1-intro'
    | '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver'
    | '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager'
    | '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon'
    | '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering'
    | '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering'
    | '/refusjon-omsorgspenger/arbeidsgiver'
    | '/$id'
  id:
    | '__root__'
    | '/$id'
    | '/$id/dine-opplysninger'
    | '/$id/inntekt-og-refusjon'
    | '/$id/kvittering'
    | '/$id/oppsummering'
    | '/$id/vis'
    | '/refusjon-omsorgspenger-arbeidsgiver/1-intro'
    | '/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver'
    | '/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager'
    | '/refusjon-omsorgspenger-arbeidsgiver/4-refusjon'
    | '/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering'
    | '/refusjon-omsorgspenger-arbeidsgiver/6-kvittering'
    | '/refusjon-omsorgspenger/arbeidsgiver'
    | '/$id/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IdRoute: typeof IdRouteWithChildren
  RefusjonOmsorgspengerArbeidsgiver1IntroRoute: typeof RefusjonOmsorgspengerArbeidsgiver1IntroRoute
  RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverRoute: typeof RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverRoute
  RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerRoute: typeof RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerRoute
  RefusjonOmsorgspengerArbeidsgiver4RefusjonRoute: typeof RefusjonOmsorgspengerArbeidsgiver4RefusjonRoute
  RefusjonOmsorgspengerArbeidsgiver5OppsummeringRoute: typeof RefusjonOmsorgspengerArbeidsgiver5OppsummeringRoute
  RefusjonOmsorgspengerArbeidsgiver6KvitteringRoute: typeof RefusjonOmsorgspengerArbeidsgiver6KvitteringRoute
  RefusjonOmsorgspengerArbeidsgiverRoute: typeof RefusjonOmsorgspengerArbeidsgiverRoute
}

const rootRouteChildren: RootRouteChildren = {
  IdRoute: IdRouteWithChildren,
  RefusjonOmsorgspengerArbeidsgiver1IntroRoute:
    RefusjonOmsorgspengerArbeidsgiver1IntroRoute,
  RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverRoute:
    RefusjonOmsorgspengerArbeidsgiver2AnsattOgArbeidsgiverRoute,
  RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerRoute:
    RefusjonOmsorgspengerArbeidsgiver3OmsorgsdagerRoute,
  RefusjonOmsorgspengerArbeidsgiver4RefusjonRoute:
    RefusjonOmsorgspengerArbeidsgiver4RefusjonRoute,
  RefusjonOmsorgspengerArbeidsgiver5OppsummeringRoute:
    RefusjonOmsorgspengerArbeidsgiver5OppsummeringRoute,
  RefusjonOmsorgspengerArbeidsgiver6KvitteringRoute:
    RefusjonOmsorgspengerArbeidsgiver6KvitteringRoute,
  RefusjonOmsorgspengerArbeidsgiverRoute:
    RefusjonOmsorgspengerArbeidsgiverRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/$id",
        "/refusjon-omsorgspenger-arbeidsgiver/1-intro",
        "/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver",
        "/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager",
        "/refusjon-omsorgspenger-arbeidsgiver/4-refusjon",
        "/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering",
        "/refusjon-omsorgspenger-arbeidsgiver/6-kvittering",
        "/refusjon-omsorgspenger/arbeidsgiver"
      ]
    },
    "/$id": {
      "filePath": "$id.tsx",
      "children": [
        "/$id/dine-opplysninger",
        "/$id/inntekt-og-refusjon",
        "/$id/kvittering",
        "/$id/oppsummering",
        "/$id/vis",
        "/$id/"
      ]
    },
    "/$id/dine-opplysninger": {
      "filePath": "$id.dine-opplysninger.tsx",
      "parent": "/$id"
    },
    "/$id/inntekt-og-refusjon": {
      "filePath": "$id.inntekt-og-refusjon.tsx",
      "parent": "/$id"
    },
    "/$id/kvittering": {
      "filePath": "$id.kvittering.tsx",
      "parent": "/$id"
    },
    "/$id/oppsummering": {
      "filePath": "$id.oppsummering.tsx",
      "parent": "/$id"
    },
    "/$id/vis": {
      "filePath": "$id.vis.tsx",
      "parent": "/$id"
    },
    "/refusjon-omsorgspenger-arbeidsgiver/1-intro": {
      "filePath": "refusjon-omsorgspenger-arbeidsgiver.1-intro.tsx"
    },
    "/refusjon-omsorgspenger-arbeidsgiver/2-ansatt-og-arbeidsgiver": {
      "filePath": "refusjon-omsorgspenger-arbeidsgiver.2-ansatt-og-arbeidsgiver.tsx"
    },
    "/refusjon-omsorgspenger-arbeidsgiver/3-omsorgsdager": {
      "filePath": "refusjon-omsorgspenger-arbeidsgiver.3-omsorgsdager.tsx"
    },
    "/refusjon-omsorgspenger-arbeidsgiver/4-refusjon": {
      "filePath": "refusjon-omsorgspenger-arbeidsgiver.4-refusjon.tsx"
    },
    "/refusjon-omsorgspenger-arbeidsgiver/5-oppsummering": {
      "filePath": "refusjon-omsorgspenger-arbeidsgiver.5-oppsummering.tsx"
    },
    "/refusjon-omsorgspenger-arbeidsgiver/6-kvittering": {
      "filePath": "refusjon-omsorgspenger-arbeidsgiver.6-kvittering.tsx"
    },
    "/refusjon-omsorgspenger/arbeidsgiver": {
      "filePath": "refusjon-omsorgspenger.arbeidsgiver.tsx"
    },
    "/$id/": {
      "filePath": "$id.index.tsx",
      "parent": "/$id"
    }
  }
}
ROUTE_MANIFEST_END */
