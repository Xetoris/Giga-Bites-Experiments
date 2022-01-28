import {expect} from 'chai';

import {
	getQueryFormattedString,
	getRelativeFutureDate,
	getRelativePreviousDate
} from '../utility/index.js';

describe('Date Functions', () => {
	describe('Relative Previous Date', () => {
		it('can return a date in the past', () => {
			const testAnchorDate = new Date('12/12/2021');
			const previousDate = getRelativePreviousDate(testAnchorDate, 1);

			expect(testAnchorDate.getDate()).to.equal(12);
			expect(testAnchorDate.getFullYear()).to.equal(2021);
			expect(testAnchorDate.getMonth()).to.equal(11);

			expect(previousDate.getDate()).to.equal(11);
			expect(previousDate.getFullYear()).to.equal(2021);
			expect(previousDate.getMonth()).to.equal(11);
		});

		it('can handle a null date', () => {
			expect(() => {
				getRelativePreviousDate(null, 1);
			}).to.throw();
		});

		it('can handle a number of days less than 1', () => {
			expect(() => {
				getRelativePreviousDate(new Date(), -1);
			});
		});
	});

	describe('Relative Future Date', () => {
		it('can return a date in the future', () => {
			const testAnchorDate = new Date('12/12/2021');
			const previousDate = getRelativeFutureDate(testAnchorDate, 1);

			expect(testAnchorDate.getDate()).to.equal(12);
			expect(testAnchorDate.getFullYear()).to.equal(2021);
			expect(testAnchorDate.getMonth()).to.equal(11);

			expect(previousDate.getDate()).to.equal(13);
			expect(previousDate.getFullYear()).to.equal(2021);
			expect(previousDate.getMonth()).to.equal(11);
		});

		it('can handle a null date', () => {
			expect(() => {
				getRelativeFutureDate(null, 1);
			}).to.throw();
		});

		it('can handle a number of days less than 1', () => {
			expect(() => {
				getRelativeFutureDate(new Date(), -1);
			});
		});
	});

	describe('Query Formatted String', () => {
		it('can return a formatted string', () => {
			const testAnchorDate = new Date('12/12/2021');
			const formattedString = getQueryFormattedString(testAnchorDate);

			expect(formattedString).to.equal('2021/12/12');
		});

		it('can handle a null date', () => {
			expect(() => {
				getRelativePreviousDate(null, 1);
			}).to.throw();
		});
	});
});