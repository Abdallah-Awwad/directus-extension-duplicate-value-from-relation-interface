<template>
	<div class="duplicate-value-from-relation">
		<v-notice v-if="!isConfigured" type="warning">
			Configure the relation field and source field in the interface settings.
		</v-notice>

		<v-notice v-else-if="!hasRelationValue" type="info">
			Select a related item in "{{ relationField }}" to sync this field.
		</v-notice>

		<template v-else>
			<v-skeleton-loader v-if="loading" type="input" />

			<v-checkbox v-else-if="type === 'boolean'" :model-value="Boolean(value)" disabled>
				<template #label>Synced value</template>
			</v-checkbox>

			<v-textarea v-else-if="type === 'json' || type === 'text'" :model-value="displayValue" disabled
				:placeholder="placeholder" />

			<v-input v-else :model-value="displayValue" disabled :placeholder="placeholder" />
		</template>
	</div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';

const props = defineProps({
	value: {
		default: null,
	},
	collection: {
		type: String,
		default: null,
	},
	type: {
		type: String,
		default: 'string',
	},
	relationField: {
		type: String,
		default: null,
	},
	sourceField: {
		type: String,
		default: null,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['input']);

const api = useApi();
const { useRelationsStore } = useStores();
const relationsStore = useRelationsStore();
const values = inject('values');

const loading = ref(false);

const isConfigured = computed(() => Boolean(props.relationField && props.sourceField));

const relationValue = computed(() => {
	if (!values?.value || !props.relationField) return null;
	return values.value[props.relationField];
});

const hasRelationValue = computed(() => {
	const current = relationValue.value;
	return current !== null && current !== undefined && current !== '';
});

const displayValue = computed(() => {
	if (props.value === null || props.value === undefined) return '';

	if (props.type === 'json' && typeof props.value === 'object') {
		return JSON.stringify(props.value, null, 2);
	}

	return String(props.value);
});

const placeholder = computed(() => {
	if (!props.sourceField) return '';
	return `Synced from ${props.sourceField}`;
});

watch(
	[relationValue, () => props.relationField, () => props.sourceField, () => props.collection],
	() => {
		if (!isConfigured.value || props.disabled) return;
		syncValue();
	},
	{ deep: true, immediate: true },
);

async function syncValue() {
	const currentRelationValue = relationValue.value;

	if (currentRelationValue === null || currentRelationValue === undefined || currentRelationValue === '') {
		if (props.value !== null && props.value !== undefined) {
			emit('input', null);
		}

		return;
	}

	const syncedValue = await resolveSourceValue(currentRelationValue);

	if (!valuesEqual(syncedValue, props.value)) {
		emit('input', syncedValue);
	}
}

async function resolveSourceValue(relationItem) {
	if (typeof relationItem === 'object' && relationItem !== null && props.sourceField in relationItem) {
		return relationItem[props.sourceField];
	}

	const relation = relationsStore.getRelationForField(props.collection, props.relationField);
	const relatedCollection = relation?.related_collection;

	if (!relatedCollection) return null;

	const primaryKey =
		typeof relationItem === 'object' && relationItem !== null
			? relationItem[relation.meta?.related_field || 'id']
			: relationItem;

	if (primaryKey === null || primaryKey === undefined || primaryKey === '') {
		return null;
	}

	loading.value = true;

	try {
		const response = await api.get(`/items/${relatedCollection}/${primaryKey}`, {
			params: {
				fields: [props.sourceField],
			},
		});

		return response.data.data?.[props.sourceField] ?? null;
	} catch {
		return null;
	} finally {
		loading.value = false;
	}
}

function valuesEqual(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
}
</script>

<style scoped>
.duplicate-value-from-relation {
	width: 100%;
}
</style>
