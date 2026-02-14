import {
	CONTEXT,
	LISTENERS,
	clearEvent,
	event,
	fireEvent,
	hasListeners,
	isEvent,
	once,
	subscribe,
	unsubscribe
} from '../src/event';

describe('event()', () => {
	test('создаёт событие', () => {
		let evt = event();

		expect(evt[LISTENERS]).toBeNull();
	});

	test('контекст по умолчанию — globalThis', () => {
		let evt = event();

		expect(evt[CONTEXT]).toBe(globalThis);
	});

	test('использует переданный контекст', () => {
		let ctx = {};
		let evt = event(ctx);

		expect(evt[CONTEXT]).toBe(ctx);
	});
});

describe('subscribe()/unsubscribe()', () => {
	test('добавляет слушателя', () => {
		let evt = event();
		let listener = jest.fn();

		subscribe(evt, listener);

		expect(evt[LISTENERS]?.has(listener)).toBe(true);
	});

	test('возвращает disposer для отписки', () => {
		let evt = event();
		let listener = jest.fn();
		let disposer = subscribe(evt, listener);

		disposer();

		expect(evt[LISTENERS]?.size).toBe(0);
	});

	test('unsubscribe удаляет слушателя', () => {
		let evt = event();
		let listener = jest.fn();

		subscribe(evt, listener);
		unsubscribe(evt, listener);

		expect(evt[LISTENERS]?.size).toBe(0);
	});

	test('unsubscribe не падает, если слушателей нет', () => {
		let evt = event();
		let listener = jest.fn();

		expect(() => unsubscribe(evt, listener)).not.toThrow();
	});

	test('событие можно вызвать как функцию для подписки', () => {
		let evt = event<number>();
		let listener = jest.fn();
		let disposer = evt(listener);

		fireEvent(evt, 5);

		expect(listener).toHaveBeenCalledWith(5);

		disposer();
		fireEvent(evt, 10);

		expect(listener).toHaveBeenCalledTimes(1);
	});
});

describe('once()', () => {
	test('слушатель вызывается один раз', () => {
		let evt = event();
		let listener = jest.fn();

		once(evt, listener);
		fireEvent(evt);
		fireEvent(evt);

		expect(listener).toHaveBeenCalledTimes(1);
	});

	test('возвращает disposer для отмены до вызова', () => {
		let evt = event();
		let listener = jest.fn();
		let disposer = once(evt, listener);

		disposer();
		fireEvent(evt);

		expect(listener).not.toHaveBeenCalled();
	});
});

describe('clearEvent()', () => {
	test('удаляет всех подписчиков', () => {
		let evt = event();
		let listener1 = jest.fn();
		let listener2 = jest.fn();

		subscribe(evt, listener1);
		subscribe(evt, listener2);
		clearEvent(evt);
		fireEvent(evt);

		expect(listener1).not.toHaveBeenCalled();
		expect(listener2).not.toHaveBeenCalled();
		expect(evt[LISTENERS]?.size).toBe(0);
	});

	test('не падает на событии без подписчиков', () => {
		let evt = event();

		expect(() => clearEvent(evt)).not.toThrow();
	});
});

describe('hasListeners()', () => {
	test('false для нового события', () => {
		expect(hasListeners(event())).toBe(false);
	});

	test('true после подписки', () => {
		let evt = event();

		subscribe(evt, () => {});

		expect(hasListeners(evt)).toBe(true);
	});

	test('false после отписки', () => {
		let evt = event();
		let disposer = subscribe(evt, () => {});

		disposer();

		expect(hasListeners(evt)).toBe(false);
	});

	test('false после clearEvent', () => {
		let evt = event();

		subscribe(evt, () => {});
		clearEvent(evt);

		expect(hasListeners(evt)).toBe(false);
	});
});

describe('fireEvent()', () => {
	test('вызывает всех слушателей', () => {
		let evt = event();
		let listener1 = jest.fn();
		let listener2 = jest.fn();

		subscribe(evt, listener1);
		subscribe(evt, listener2);
		fireEvent(evt);

		expect(listener1).toHaveBeenCalledTimes(1);
		expect(listener2).toHaveBeenCalledTimes(1);
	});

	test('передаёт данные слушателям', () => {
		let evt = event<string>();
		let listener = jest.fn();

		subscribe(evt, listener);
		fireEvent(evt, 'Hello');

		expect(listener).toHaveBeenCalledWith('Hello');
	});

	test('передаёт контекст как this', () => {
		let ctx = {};
		let evt = event<void, typeof ctx>(ctx);
		let receivedThis: any;

		subscribe(evt, function (this: typeof ctx) {
			receivedThis = this;
		});
		fireEvent(evt);

		expect(receivedThis).toBe(ctx);
	});

	test('не падает, если подписчиков нет', () => {
		let evt = event();

		expect(() => fireEvent(evt)).not.toThrow();
	});

	test('не падает после clearEvent', () => {
		let evt = event();

		subscribe(evt, jest.fn());
		clearEvent(evt);

		expect(() => fireEvent(evt)).not.toThrow();
	});
});

describe('isEvent()', () => {
	test('true для события', () => {
		expect(isEvent(event())).toBe(true);
	});

	test('false для всего остального', () => {
		expect(isEvent(true)).toBe(false);
		expect(isEvent(1)).toBe(false);
		expect(isEvent('string')).toBe(false);
		expect(isEvent({})).toBe(false);
		expect(isEvent(() => {})).toBe(false);
		expect(isEvent(null)).toBe(false);
		expect(isEvent(undefined)).toBe(false);
	});
});

describe('множественные подписки и порядок вызовов', () => {
	test('один слушатель не добавляется дважды', () => {
		let evt = event();
		let listener = jest.fn();

		subscribe(evt, listener);
		subscribe(evt, listener);
		fireEvent(evt);

		expect(listener).toHaveBeenCalledTimes(1);
	});

	test('отписка одного не влияет на других', () => {
		let evt = event();
		let listener1 = jest.fn();
		let listener2 = jest.fn();
		let disposer1 = subscribe(evt, listener1);

		subscribe(evt, listener2);
		disposer1();
		fireEvent(evt);

		expect(listener1).not.toHaveBeenCalled();
		expect(listener2).toHaveBeenCalledTimes(1);
	});

	test('слушатели вызываются в порядке подписки', () => {
		let evt = event();
		let order: Array<number> = [];

		subscribe(evt, () => order.push(1));
		subscribe(evt, () => order.push(2));
		subscribe(evt, () => order.push(3));
		fireEvent(evt);

		expect(order).toEqual([1, 2, 3]);
	});
});
