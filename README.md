# duplicate-value-from-relation

Directus interface that copies a value from a related item into the current field.

Useful when you have a relation (e.g. `bank_account`) and want another field on the same item to stay in sync with something on the related record (e.g. `currency`).

## Install

Build the extension and make sure Directus can load it from your `extensions` folder:

```bash
npm install
npm run build
```

For local development:

```bash
npm run dev
```

Requires Directus `^10.10.0`.

## Usage

1. Add a field to your collection.
2. Set the interface to **Duplicate Value From Relation**.
3. Pick the **Relation Field** — the M2O field pointing at the other collection.
4. Pick the **Source Field** — the field on that related collection to copy from.

The field is read-only in the item editor. When the relation changes, the value updates automatically.

Match the field type to the source field (`string`, `uuid`, `integer`, etc.).

## Example

Collection: `invoices`

- Relation field: `bank_account` → `currency`
- Synced field: `currency`
- Interface options:
  - Relation Field: `bank_account`
  - Source Field: `currency`

Selecting an account on an invoice will fill `currency` with that account's currency.

## Supported types

`string`, `text`, `integer`, `bigInteger`, `float`, `decimal`, `boolean`, `uuid`, `date`, `time`, `datetime`, `timestamp`, `json`

Only many-to-one relations are supported for the relation field picker.
