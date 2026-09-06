const test = require('node:test');
const assert = require('node:assert/strict');
const { validateResponses, calculateProgress } = require('../../utils/validateAgainstSchema');
const { validateApplicationRequest } = require('../../middleware/validateApplication');

const form = {
  fields: [
    { name: 'name', type: 'text', required: true, validation: { minLength: 3 } },
    { name: 'injured', type: 'checkbox' },
    { name: 'injuryDetails', type: 'textarea', required: true, showIf: { field: 'injured', operator: 'equals', value: true } }
  ]
};

test('validates response types and rejects fields outside the form schema', () => {
  assert.throws(
    () => validateResponses({ name: 'Jo', unknown: 'value' }, form, false),
    /Invalid response fields/
  );
  assert.deepEqual(validateResponses({ name: 'Jordan' }, form, false), { name: 'Jordan' });
});

test('requires visible conditional fields on submission', () => {
  assert.throws(
    () => validateResponses({ name: 'Jordan', injured: true }, form, true),
    /injuryDetails/
  );
  assert.deepEqual(validateResponses({ name: 'Jordan', injured: true, injuryDetails: 'Broken arm' }, form, true), {
    name: 'Jordan',
    injured: true,
    injuryDetails: 'Broken arm'
  });
});

test('calculates progress from visible fields only', () => {
  assert.equal(calculateProgress({ name: 'Jordan', injured: false }, form), 100);
});

test('rejects server-owned application fields', () => {
  let nextCalled = false;
  const response = { statusCode: 0, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
  validateApplicationRequest({ method: 'PUT', body: { progress: 100 } }, response, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /progress/);
});
