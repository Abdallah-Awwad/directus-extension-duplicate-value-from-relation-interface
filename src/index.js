import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';
import OptionsComponent from './options.vue';

export default defineInterface({
	id: 'duplicate-value-from-relation',
	name: 'Duplicate Value From Relation',
	icon: 'content_copy',
	description: 'Automatically sync this field from a field on a related item.',
	component: InterfaceComponent,
	options: OptionsComponent,
	types: [
		'string',
		'text',
		'integer',
		'bigInteger',
		'float',
		'decimal',
		'boolean',
		'uuid',
		'date',
		'time',
		'datetime',
		'timestamp',
		'json',
	],
	group: 'standard',
});
