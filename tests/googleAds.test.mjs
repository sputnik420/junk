import test from 'node:test';
import assert from 'node:assert/strict';
import { createGoogleAdsTracker, googleAds } from '../src/lib/googleAds.ts';

const leadId = '0123456789abcdef0123456789abcdef';

test('accepted forms emit once with only an opaque ID, never customer fields', () => {
  const events = [];
  const tracker = createGoogleAdsTracker('ansebjunk.com', (...args) => events.push(args));
  const result = { success: true, lead_id: leadId, name: 'Private', email: 'private@example.com' };
  assert.equal(tracker.formAccepted(result), true);
  assert.equal(tracker.formAccepted(result), false);
  assert.deepEqual(events, [['event', 'conversion', { send_to: googleAds.form, transaction_id: leadId }]]);
});

test('errors, antispam successes, malformed responses and IDs never count', () => {
  const tracker = createGoogleAdsTracker('ansebjunk.com', () => assert.fail('unexpected conversion'));
  for (const result of [null, {}, 'success', { success: false, lead_id: leadId },
    { success: true, message: 'Success' }, { success: true, lead_id: 'private@example.com' }]) {
    assert.equal(tracker.formAccepted(result), false);
  }
});

test('SMS is distinct from a lead and ignores phone/contact links', () => {
  const events = [];
  const tracker = createGoogleAdsTracker('www.ansebjunk.com', (...args) => events.push(args));
  assert.equal(tracker.smsClicked('tel:+13463515052'), false);
  assert.equal(tracker.smsClicked('/contact/'), false);
  assert.equal(tracker.smsClicked('sms:+13463515052'), true);
  assert.deepEqual(events, [['event', 'conversion', { send_to: googleAds.sms }]]);
});

test('development and preview hosts cannot emit production conversions', () => {
  for (const host of ['localhost', '127.0.0.1', 'preview.example.com']) {
    const tracker = createGoogleAdsTracker(host, () => assert.fail('unexpected conversion'));
    assert.equal(tracker.formAccepted({ success: true, lead_id: leadId }), false);
    assert.equal(tracker.smsClicked('sms:+13463515052'), false);
  }
});

test('tracking failures do not interrupt form success or SMS navigation', () => {
  const tracker = createGoogleAdsTracker('ansebjunk.com', () => { throw new Error('blocked'); });
  assert.equal(tracker.formAccepted({ success: true, lead_id: leadId }), false);
  assert.equal(tracker.smsClicked('sms:+13463515052'), false);
});
