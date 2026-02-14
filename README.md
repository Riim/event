# @riim/event

```typescript
import { event, fireEvent } from '@riim/event';

class Canvas {
	onClick = event<{ x: number; y: number }>();
}

const canvas = new Canvas();

const disposer = canvas.onClick((xy) => {
	console.log('Клик по точке с координатами:', xy);
});

fireEvent(canvas.onClick, { x: 100, y: 100 });

disposer();
```
