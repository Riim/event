export const LISTENERS = Symbol('listeners');
export const CONTEXT = Symbol('context');

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

export type TEvent<Data = void, Context = any> = Data extends void
	? IUnparametrizedEvent<Context>
	: IParametrizedEvent<Data, Context>;

export function subscribe<Context>(
	evt: IUnparametrizedEvent<Context>,
	listener: (this: Context) => void
): TDisposer;
export function subscribe<Data, Context>(
	evt: IParametrizedEvent<Data, Context>,
	listener: (this: Context, data: Data) => void
): TDisposer;
export function subscribe<Data>(evt: TEvent<Data>, listener: (data?: Data) => void) {
	(evt[LISTENERS] ??= new Set()).add(listener);

	return () => unsubscribe(evt as TEvent, listener);
}

export function unsubscribe<Context>(
	evt: IUnparametrizedEvent<Context>,
	listener: (this: Context) => void
): void;
export function unsubscribe<Data, Context>(
	evt: IParametrizedEvent<Data, Context>,
	listener: (this: Context, data: Data) => void
): void;
export function unsubscribe<Data>(evt: TEvent<Data>, listener: (data?: Data) => void) {
	evt[LISTENERS]?.delete(listener);
}

export function once<Context>(
	evt: IUnparametrizedEvent<Context>,
	listener: (this: Context) => void
): TDisposer;
export function once<Data, Context>(
	evt: IParametrizedEvent<Data, Context>,
	listener: (this: Context, data: Data) => void
): TDisposer;
export function once<Data>(evt: TEvent<Data>, listener: (data?: Data) => void) {
	let disposer = subscribe(evt as TEvent, (data?: Data) => {
		disposer();

		listener(data);
	});

	return disposer;
}

export function clearEvent(evt: TEvent<any>) {
	evt[LISTENERS]?.clear();
}

export function hasListeners(evt: TEvent<any>) {
	return (evt[LISTENERS]?.size ?? 0) != 0;
}

export function fireEvent(evt: IUnparametrizedEvent): void;
export function fireEvent<Data>(evt: IParametrizedEvent<Data>, data: Data): void;
export function fireEvent<Data>(evt: TEvent<Data>, data?: Data) {
	let context = evt[CONTEXT];

	// eslint-disable-next-line github/array-foreach
	evt[LISTENERS]?.forEach((listener) => listener.call(context, data!));
}

export function event<Data = void, Context = any>(context?: Context) {
	let evt = (listener: (data?: Data) => void) => subscribe(evt as TEvent, listener);

	evt[LISTENERS] = null;
	evt[CONTEXT] = (context ?? globalThis) as Context;

	return evt as TEvent<Data, Context>;
}

export function isEvent(value: any): value is TEvent<any> {
	return typeof value == 'function' && LISTENERS in value;
}
