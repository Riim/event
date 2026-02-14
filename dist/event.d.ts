export declare const LISTENERS: unique symbol;
export declare const CONTEXT: unique symbol;
export type TDisposer = () => void;
export interface IUnparametrizedEvent<Context = any> {
    [LISTENERS]: Set<(this: Context) => void> | null;
    [CONTEXT]: Context;
    (listener: (this: Context) => void): TDisposer;
}
export interface IParametrizedEvent<Data, Context = any> {
    [LISTENERS]: Set<(this: Context, data: Data) => void> | null;
    [CONTEXT]: Context;
    (listener: (this: Context, data: Data) => void): TDisposer;
}
export type TEvent<Data = void, Context = any> = Data extends void ? IUnparametrizedEvent<Context> : IParametrizedEvent<Data, Context>;
export declare function subscribe<Context>(evt: IUnparametrizedEvent<Context>, listener: (this: Context) => void): TDisposer;
export declare function subscribe<Data, Context>(evt: IParametrizedEvent<Data, Context>, listener: (this: Context, data: Data) => void): TDisposer;
export declare function unsubscribe<Context>(evt: IUnparametrizedEvent<Context>, listener: (this: Context) => void): void;
export declare function unsubscribe<Data, Context>(evt: IParametrizedEvent<Data, Context>, listener: (this: Context, data: Data) => void): void;
export declare function once<Context>(evt: IUnparametrizedEvent<Context>, listener: (this: Context) => void): TDisposer;
export declare function once<Data, Context>(evt: IParametrizedEvent<Data, Context>, listener: (this: Context, data: Data) => void): TDisposer;
export declare function clearEvent(evt: TEvent<any>): void;
export declare function hasListeners(evt: TEvent<any>): boolean;
export declare function fireEvent(evt: IUnparametrizedEvent): void;
export declare function fireEvent<Data>(evt: IParametrizedEvent<Data>, data: Data): void;
export declare function event<Data = void, Context = any>(context?: Context): TEvent<Data, Context>;
export declare function isEvent(value: any): value is TEvent<any>;
