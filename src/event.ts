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

// Tuple отключает распределение conditional type: без него boolean раскладывается
// на true | false и превращает TEvent<boolean> в union двух разных событий.
export type TEvent<Data = void, Context = any> = [Data] extends [void]
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
export function subscribe<Data>(evt: any, listener: (data?: Data) => void) {
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
export function unsubscribe<Data>(evt: any, listener: (data?: Data) => void) {
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
export function once<Data>(evt: any, listener: (data?: Data) => void) {
	let disposer = subscribe(evt, (data?: Data) => {
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
export function fireEvent<Data>(evt: any, data?: Data) {
	if (evt[LISTENERS]) {
		for (let listener of evt[LISTENERS]) {
			listener.call(evt[CONTEXT], data!);
		}
	}
}

export function event<Data = void, Context = any>(context?: Context) {
	let evt = (listener: (data?: Data) => void) => subscribe(evt as TEvent, listener);

	evt[LISTENERS] = null;
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	evt[CONTEXT] = (context === undefined ? globalThis : context) as Context;

	return evt as TEvent<Data, Context>;
}

export function isEvent(value: any): value is TEvent<any> {
	return typeof value == 'function' && LISTENERS in value;
}
