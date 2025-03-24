import { Request, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

// Request with typed params
export interface RequestWithParams<P extends ParamsDictionary> extends Request<P> {
    params: P;
}

// Request with typed query params
export interface RequestWithQuery<Q extends Query> extends Request {
    query: Q;
}

// Request with both typed params and query
export interface RequestWithParamsAndQuery<P extends ParamsDictionary, Q extends Query> extends Request<P> {
    params: P;
    query: Q;
}

// Common parameters in routes
export interface SteamIdParam extends ParamsDictionary {
    steamId: string;
}

export interface AppIdParam extends ParamsDictionary {
    appId: string;
}

export interface FriendIdParam extends ParamsDictionary {
    friendId: string;
}

export interface FriendAndAppIdParams extends ParamsDictionary {
    friendId: string;
    appId: string;
}

// Query parameters
export interface SteamIdQuery extends Query {
    steamId?: string;
}

export interface CountQuery extends Query {
    count?: string;
} 