import { EventSchemas, Inngest } from 'inngest';
import type { Events } from './types.js';

export const inngest = new Inngest({
	id: 'template-backend',
	schemas: new EventSchemas().fromRecord<Events>(),
});
