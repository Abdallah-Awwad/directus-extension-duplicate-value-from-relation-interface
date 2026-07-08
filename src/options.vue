<template>
	<div class="options">
		<v-select
			:model-value="relationField"
			:items="relationFieldChoices"
			:disabled="!collection"
			placeholder="Select a relation field"
			@update:model-value="setRelationField"
		>
			<template #label>Relation Field</template>
		</v-select>

		<v-select
			:model-value="sourceField"
			:items="sourceFieldChoices"
			:disabled="!relatedCollection"
			placeholder="Select a source field"
			@update:model-value="setSourceField"
		>
			<template #label>Source Field</template>
		</v-select>

		<v-notice v-if="!collection" type="warning">
			Save the field first to configure relation syncing.
		</v-notice>

		<v-notice v-else-if="relationField && !relatedCollection" type="warning">
			The selected field is not a many-to-one relation.
		</v-notice>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { getRelationType, useStores } from '@directus/extensions-sdk';

const props = defineProps({
	value: {
		type: Object,
		default: () => ({}),
	},
	collection: {
		type: String,
		default: null,
	},
});

const emit = defineEmits(['input']);

const { useFieldsStore, useRelationsStore } = useStores();
const fieldsStore = useFieldsStore();
const relationsStore = useRelationsStore();

const relationField = computed(() => props.value?.relationField ?? null);
const sourceField = computed(() => props.value?.sourceField ?? null);

const relatedCollection = computed(() => {
	if (!props.collection || !relationField.value) return null;

	const relation = relationsStore.getRelationForField(props.collection, relationField.value);
	if (!relation) return null;

	const type = getRelationType({
		relation,
		collection: props.collection,
		field: relationField.value,
	});

	return type === 'm2o' ? relation.related_collection : null;
});

const relationFieldChoices = computed(() => {
	if (!props.collection) return [];

	return fieldsStore
		.getFieldsForCollection(props.collection)
		.filter((field) => {
			if (field.meta?.hidden) return false;

			const relation = relationsStore.getRelationForField(props.collection, field.field);
			if (!relation) return false;

			return (
				getRelationType({
					relation,
					collection: props.collection,
					field: field.field,
				}) === 'm2o'
			);
		})
		.map((field) => ({
			text: field.name || field.field,
			value: field.field,
		}));
});

const sourceFieldChoices = computed(() => {
	if (!relatedCollection.value) return [];

	return fieldsStore
		.getFieldsForCollection(relatedCollection.value)
		.filter((field) => {
			if (field.meta?.hidden) return false;
			if (field.type === 'alias') return false;
			if (field.meta?.special?.includes('group')) return false;
			return true;
		})
		.map((field) => ({
			text: field.name || field.field,
			value: field.field,
		}));
});

function setRelationField(field) {
	emit('input', {
		...(props.value || {}),
		relationField: field,
		sourceField: null,
	});
}

function setSourceField(field) {
	emit('input', {
		...(props.value || {}),
		sourceField: field,
	});
}
</script>

<style scoped>
.options {
	display: grid;
	gap: 20px;
}
</style>
