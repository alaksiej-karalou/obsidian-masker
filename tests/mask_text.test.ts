import {maskText, MaskTextSettings} from '../src/mask_text';

describe('testing maskText function', () => {
	test('positive test should return masked string', () => {
		expect(maskText('Hello, World!', setUpSettings({}))).toBe('H***o, W***d!');
	});
	test('start is over length should result the same string', () => {
		expect(maskText('Hello, World!', setUpSettings({start: 100}))).toBe('Hello, World!');
	});
	test('end is over length should result the same string', () => {
		expect(maskText('Hello, World!', setUpSettings({end: 100}))).toBe('Hello, World!');
	});
	test('0 at start should mask text fully at the beginning', () => {
		expect(maskText('Hello, World!', setUpSettings({start: 0}))).toBe('****o, ****d!');
	});
	test('0 at end should mask text fully at the beginning', () => {
		expect(maskText('Hello, World!', setUpSettings({end: 0}))).toBe('H****, W****!');
	});
	test('entire text should work properly', () => {
		expect(maskText('Hello, World!', setUpSettings({entireText: true}))).toBe('H****, ****d!');
	});
	test('entire text should work for several words', () => {
		expect(maskText('He llo, Wor ld!', setUpSettings({
			entireText: true,
			start: 3,
			end: 3
		}))).toBe('He l**, **r ld!');
	});
	test('mask symbol word should work properly', () => {
		expect(maskText('Hello, World!', setUpSettings({maskSymbol: '+'}))).toBe('H+++o, W+++d!');
	});
});

function setUpSettings({start = 1, end = 1, entireText = false, maskSymbol = '*'}): MaskTextSettings {
	return {
		start: start,
		end: end,
		entireText: entireText,
		maskSymbol: maskSymbol
	}
}
