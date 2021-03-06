const moment = require('moment');

/**
 * @class Range
 * @property {Number} left
 * @property {Number} right
 * @property {Number} leftClosed
 * @property {Number} rightClosed
 */
class Range {
    constructor(left, right, leftClosed, rightClosed) {
        this.left = left;
        this.right = right;
        this.leftClosed = leftClosed;
        this.rightClosed = rightClosed;
    }

    /**
     *
     * @param left
     * @param right
     * @returns {Range}
     */
    static opened(left, right) {
        return new Range(left, right, false, false);
    }

    /**
     *
     * @param left
     * @param right
     * @returns {Range}
     */
    static closed(left, right) {
        return new Range(left, right, true, true);
    }

    /**
     *
     * @param left
     * @param right
     * @returns {Range}
     */
    static leftClosed(left, right) {
        return new Range(left, right, true, false);
    }

    /**
     *
     * @param left
     * @param right
     * @returns {Range}
     */
    static rightClosed(left, right) {
        return new Range(left, right, false, true);
    }

    /**
     *
     * @returns {Range}
     */
    static unbounded() {
        return new Range(-Infinity, Infinity, false, false);
    }

    leftTouches(v) {
        return this.leftClosed && this.left === v;
    }

    rightTouches(v) {
        return this.rightClosed && this.right === v;
    }

    containsPoint(v) {
    }

    static ofStartEnd(range, leftClosed = true, rightClosed = true) {
        return new Range(range.start, range.end, leftClosed, rightClosed);
    }

    /**
     * other right must be not before this left
     * and other left must be not after this right
     * @param other {Range}
     */
    hasCommon(other) {
        if (other.right > this.left && other.left < this.right) {
            return true;
        }
        return this.leftClosed && other.leftClosed && this.left === other.left ||
            this.rightClosed && other.rightClosed && this.right === other.right ||
            this.rightClosed && other.leftClosed && this.right === other.left ||
            this.leftClosed && other.rightClosed && this.left === other.right;
    }

    isBefore(other, touch = false) {
        if (this.right < other.left) {
            return true;
        }
        if (this.right === other.left) {
            if (touch && this.leftClosed && other.leftClosed) {
                return true;
            }
            if (!(this.rightClosed && other.leftClosed)) {
                return true;
            }
        }
        return false;
    }

    isAfter(other, touch = false) {
        if (this.left > other.right) {
            return true;
        }
        if (this.left === other.right) {
            if (touch && (this.leftClosed && other.rightClosed)) {
                return true;
            }
            if (!(this.leftClosed && other.rightClosed)) {
                return true;
            }
        }
        return false;
    }

    expandToFitPrecision(precision) {
        if (precision > 0) {
            this.left -= this.left % precision;
            const rightRemainder = this.right % precision;

            if (rightRemainder > 0) {
                this.right += precision - rightRemainder;
            }
        }
        return this;
    }

    round() {
        this.left = Math.round(this.left);
        this.right = Math.round(this.right);
        return this;
    }

    /**
     * Extends both bounds by given value
     * @param value
     */
    extend(value) {
        this.left -= value;
        this.right += value;
        return this;
    }

    length() {
        return this.right - this.left;
    }

    /**
     *
     * @param other {Range}
     * @return {boolean}
     */
    equals(other) {
        return this.leftClosed === other.leftClosed &&
            this.rightClosed === other.rightClosed &&
            this.left === other.left &&
            this.right === other.right;
    }

    toString() {
        const f = 'YYYY-MM-DD HH:mm:ss';

        /* eslint-disable max-len */
        return `${this.leftClosed ? '<' : '('}${moment(this.left).format(f)}; ${moment(this.right).format(f)}${this.rightClosed ? '>' : ')'}`;
        /* eslint-enable max-len */

    }

    clone() {
        return new Range(this.left, this.right, this.leftClosed, this.rightClosed);
    }

}
module.exports = Range;
