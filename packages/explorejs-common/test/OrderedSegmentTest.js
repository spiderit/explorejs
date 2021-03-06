var expect = require('chai').expect;
var OrderedSegmentArray = require("../src/OrderedSegmentArray");
var _ = require('underscore');
var gen = require('random-seed');
var TestUtil = require('./TestUtil');
var rng = TestUtil.rng;
const ll = TestUtil.rangesOnLevel.bind(TestUtil);
/**
 * @param leftBoundKey
 * @param rightBoundKey
 * @param leftBoundClosed
 * @param rightBoundClosed
 * @returns {OrderedSegmentArray}
 */
function getArray(leftBoundKey, rightBoundKey, leftBoundClosed, rightBoundClosed) {
    return new OrderedSegmentArray({leftBoundKey, rightBoundKey, leftBoundClosed, rightBoundClosed})
}

describe("OrderedSegment test", () => {
    var data;

    before(() => {
        data = [
            [3, 5],
            [5, 6],
            [8, 10],
            [10, 11],
            [11, 12],
            [12, 13],
            [100, 110],
            [200, 210],
            [300, 310],
            [400, 410],
            [500, 510],
            [600, 610],
            [700, 710]

        ];
    });

    // beforeEach(() => {
    // });
    describe("Basic test", () => {
        // it("get range by key should work", () => {
        //     list.insertRange([[]])
        // });
        it("getRange() without parameters should return whole array", () => {
            var list = getArray('0', '1', true, true);
            list._data = data;
            expect(list.getRange()).to.be.equal(data);
        });
        it("getRange() for empty array should return empty array", () => {
            var list = getArray('0', '1', true, true);
            list._data = [];
            expect(list.getRange(12, 155)).to.be.empty;
        });
        it("getRange() for for one element array should return proper value #1", () => {
            var list = getArray('0', '1', true, true);
            list._data = [[3, 4]];
            expect(list.getRange(0, 155)).to.deep.equal([[3, 4]])
        });
        it("getRange() for argument outside data should return empty array #1", () => {
            var list = getArray('0', '1', true, true);
            list._data =data;
            expect(list.getRange(1000, 2000)).to.be.empty;
        });
        it("getRange() for argument outside data should return empty array #1", () => {
            var list = getArray('0', '1', true, true);
            list._data = data;
            expect(list.getRange(0, 1)).to.be.empty;
        });
    });


    describe('Segment index search', ()=> {
        it('Comparator compilation for word fields', ()=> {
            var list = new OrderedSegmentArray({leftBoundKey: 'foo', rightBoundKey: 'bar'});
            var segment = {foo: 3, bar: 4};
            expect(list._leftBoundComparator(segment, 3)).to.be.equal(0);
            expect(list._rightBoundComparator(segment, 3)).to.be.equal(1);
            expect(list._leftBoundComparator(segment, 4)).to.be.equal(-1);
            expect(list._rightBoundComparator(segment, 4)).to.be.equal(0);
        });
        it('Comparator compilation for digit fields', ()=> {
            var list = new OrderedSegmentArray({leftBoundKey: '0', rightBoundKey: '1'});
            var segment = [3, 4];
            expect(list._leftBoundComparator(segment, 3)).to.be.equal(0);
            expect(list._rightBoundComparator(segment, 3)).to.be.equal(1);
            expect(list._leftBoundComparator(segment, 4)).to.be.equal(-1);
            expect(list._rightBoundComparator(segment, 4)).to.be.equal(0);
        });
    });

    describe('get range of segments', ()=> {
        /**
         * @type {OrderedSegmentArray}
         */
        var list;

        function init(leftClosed, rightClosed) {
            if (arguments.length == 1) {
                rightClosed = leftClosed;
            }
            list = getArray('0', '1', leftClosed, rightClosed);
            list._data = data;
        }

        function expectBounds(leftBound, rightBound) {
            var r = list.getRange(leftBound, rightBound);
            var range = [r[0][0], r[r.length - 1][1]];
            return {
                to: {
                    be: (left, right)=> {
                        expect(range).to.be.deep.equal([left, right]);
                    }
                }
            }
        }

        /*        300     510
         *         ┌───────┐
         *         ┗━━━━━━━┛
         */
        it('at segment, range closed', ()=> {
            init(true);
            expectBounds(300, 510).to.be(300, 510);
        });
        /*        300     510
         *         ┌───────┐
         *         *━━━━━━━*
         */
        it('at segment, range opened', ()=> {
            init(false);
            expectBounds(300, 510).to.be(300, 510);
        });
        /*    150 300     510
         *         ┌───────┐
         *     ┗━━━┛
         */
        it('touching before, range closed', ()=> {
            init(true);
            expectBounds(150, 300).to.be(200, 310);
        });
        /*    150 300     510
         *         ┌───────┐
         *     *━━━*
         */
        it('touching before, range opened', ()=> {
            init(false);
            expectBounds(150, 300).to.be(200, 210);
        });
        /*        300     510  650
         *         ┌───────┐
         *                 ┗━━━┛
         */
        it('touching after, range closed', ()=> {
            init(true);
            expectBounds(510, 650).to.be(500, 610);
        });
        /*        200     510 650
         *         ┌───────┐
         *                 *━━━*
         */
        it('touching after, range opened', ()=> {
            init(false);
            expectBounds(510, 650).to.be(600, 610);
        });
        /*        200     510
         *         ┌───────┐
         *            ┗━┛
         */
        it('inside segment, range closed', ()=> {
            init(true);
            expectBounds(201, 509).to.be(200, 510);
        });
        /*        200     510
         *         ┌───────┐
         *            *━*
         */
        it('inside segment, range opened', ()=> {
            init(false);
            expectBounds(201, 509).to.be(200, 510);
        });
        /*        200     510
         *         ┌───────┐
         *       ┗━━━━━━━━━━━┛
         */
        it('outside segment, range closed', ()=> {
            init(true);
            expectBounds(199, 511).to.be(200, 510);
        });
        /*        200     510
         *         ┌───────┐
         *       *━━━━━━━━━━━*
         */
        it('outside segment, range opened', ()=> {
            init(false);
            expectBounds(199, 511).to.be(200, 510);
        });

        /*     10    11    12    13
         *     ┌─────┐     ┌─────┐
         *           ┌─────┐
         *           ┗━━━━━*
         */
        it('touching 3 segments, range closed at left, opened at right', ()=> {
            init(true, false);
            expectBounds(11, 12).to.be(10, 12);
        });
        /*     10    11    12    13
         *     ┌─────┐     ┌─────┐
         *           ┌─────┐
         *           *━━━━━┛
         *   note! this is particular situation when raw points are queried
         *   if there are points {1,2,3,4,5,6,7,8,9,10}
         *   points are represented by /left bound = right bound/
         *   if you query points with time from 5 to 8,
         *   you want have 5,6,7
         */
        it('touching 3 segments, range opened at left, closed at right', ()=> {
            init(false, true);
            expectBounds(11, 12).to.be(11, 13);
        });
        /*     10    11    12    13
         *     ┌─────┐     ┌─────┐
         *           ┌─────┐
         *           ┗━━━━━┛
         */
        it('touching 3 segments, bounds closed', ()=> {
            init(true);
            expectBounds(11, 12).to.be(10, 13);
        });
        /*     10    11    12    13
         *     ┌─────┐     ┌─────┐
         *           ┌─────┐
         *           *━━━━━*
         */
        it('touching 3 segments, bounds opened', ()=> {
            init(false);
            expectBounds(11, 12).to.be(11, 12);
        });
        /*     10    11    12    13
         *     ┌─────┐     ┌─────┐
         *           ┌─────┐
         *         *━━━━━━━━━*
         */
        it('inside 3 segments, bounds opened', ()=> {
            init(false);
            expectBounds(10.5, 12.5).to.be(10, 13);
        });
    });

    describe('insert range into a gap', ()=> {
        it('insert into gap not touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [2, 4], [100, 104], [104, 110]];
            list.insertRange([[50, 51], [52, 55], [55, 58], [60, 61]]);
            expect(list._data).to.be.deep.equal([
                [0, 1], [2, 4],
                [50, 51], [52, 55], [55, 58], [60, 61],
                [100, 104], [104, 110]
            ]);
        });
        it('insert into gap touching both sides', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [2, 4], [100, 104], [104, 110]];
            list.insertRange([[4, 100]]);
            expect(list._data).to.be.deep.equal([
                [0, 1], [2, 4],
                [4, 100],
                [100, 104], [104, 110]
            ]);
        });
        it('insert into gap touching left side', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [2, 4], [100, 104], [104, 110]];
            list.insertRange([[4, 51], [52, 55], [55, 58], [60, 61]]);
            expect(list._data).to.be.deep.equal([
                [0, 1], [2, 4],
                [4, 51], [52, 55], [55, 58], [60, 61],
                [100, 104], [104, 110]
            ]);
        });
        it('insert into gap touching right side', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [2, 4], [100, 104], [104, 110]];
            list.insertRange([[50, 51], [52, 55], [55, 58], [60, 100]]);
            expect(list._data).to.be.deep.equal([
                [0, 1], [2, 4],
                [50, 51], [52, 55], [55, 58], [60, 100],
                [100, 104], [104, 110]
            ]);
        });
        it('insert a point into gap touching both sides', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[100, 104], [104, 110]];
            list.insertRange([[104, 104]]);
            expect(list._data).to.be.deep.equal([
                [100, 104],
                [104, 104],
                [104, 110]
            ]);
        });
        it('insert at the beginnig, not touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[100, 104], [104, 110]];
            list.insertRange([[1, 2]]);
            expect(list._data).to.be.deep.equal([
                [1, 2],
                [100, 104], [104, 110]
            ]);
        });
        it('insert at the beginnig, touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[100, 104], [104, 110]];
            list.insertRange([[1, 100]]);
            expect(list._data).to.be.deep.equal([
                [1, 100],
                [100, 104], [104, 110]
            ]);
        });
        it('insert at the end, not touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[100, 104], [104, 110]];
            list.insertRange([[200, 300]]);
            expect(list._data).to.be.deep.equal([
                [100, 104], [104, 110],
                [200, 300]
            ]);
        });
        it('insert at the end, touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[100, 104], [104, 110]];
            list.insertRange([[110, 300]]);
            expect(list._data).to.be.deep.equal([
                [100, 104], [104, 110],
                [110, 300]
            ]);
        });

        it('insert between segments', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [2, 4], [100, 104], [104, 110]];
            expect(()=>list.insertRange([[1.5, 1.6], [50, 60]])).to.throw(/You can insert/);
        });

    });
    describe('merge existing range', ()=> {
        it('test1', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 0], [1, 1], [2, 2], [3, 3]];
            list.mergeRange([[0, 0], [1, 1], [2, 2], [3, 3]]);
            expect(list._data).to.deep.equal([[0, 0], [1, 1], [2, 2], [3, 3]]);
        });
    });
    describe('merge range into a gap', ()=> {
        it('_mergeRanges test', ()=> {
            var list = getArray('0', '1', true, true);
            expect(list._mergeRanges([[2, 3], [6, 7]], [[4, 5]])).to.be.deep.equal([
                [2, 3],
                [4, 5],
                [6, 7]
            ]);
        });
        it('_mergeRanges test 2', ()=> {
            var list = getArray('0', '1', true, true);
            expect(list._mergeRanges([[2, 3], [6, 7], [10, 11]], [[4, 5], [8, 9]])).to.be.deep.equal([
                [2, 3],
                [4, 5],
                [6, 7],
                [8, 9],
                [10, 11]
            ]);
        });

        it('_mergeRanges test override', ()=> {
            var list = getArray('0', '1', true, true);
            expect(list._mergeRanges([[1, 2], [3, 4], [5, 6]], [[3, 4, 'new']])).to.be.deep.equal([
                [1, 2],
                [3, 4, 'new'],
                [5, 6]
            ]);
        });
        it('merge one segment into gap not touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [4, 5], [8, 9]];
            list.mergeRange([[2, 3]]);
            expect(list._data).to.be.deep.equal([
                [0, 1],
                [2, 3],
                [4, 5], [8, 9]
            ]);
        });
        it('merge one segment into gap touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [4, 5], [8, 9]];
            list.mergeRange([[1, 4]]);
            expect(list._data).to.be.deep.equal([
                [0, 1],
                [1, 4],
                [4, 5], [8, 9]
            ]);
        });
        it('merge more segments into gap, not touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [4, 5], [8, 9]];
            list.mergeRange([[2, 2.1], [2.2, 2.3], [2.3, 2.4], [2.5, 2.6]]);
            expect(list._data).to.be.deep.equal([
                [0, 1],
                [2, 2.1], [2.2, 2.3], [2.3, 2.4], [2.5, 2.6],
                [4, 5], [8, 9]
            ]);
        });
        it('merge more segments into gap, touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [4, 5], [8, 9]];
            list.mergeRange([[1, 2.1], [2.2, 2.3], [2.3, 2.4], [2.4, 4]]);
            expect(list._data).to.be.deep.equal([
                [0, 1],
                [1, 2.1], [2.2, 2.3], [2.3, 2.4], [2.4, 4],
                [4, 5], [8, 9]
            ]);
        });

        it('merge more segments overlapping, not touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[0, 1], [4, 5], [8, 9]];
            list.mergeRange([[2, 3], [6, 7]]);
            expect(list._data).to.be.deep.equal([
                [0, 1], [2, 3], [4, 5], [6, 7], [8, 9]
            ]);
        });
        it('merge one segment at the beginning, not touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[4, 5], [8, 9]];
            list.mergeRange([[2, 3]]);
            expect(list._data).to.be.deep.equal([
                [2, 3], [4, 5], [8, 9]
            ]);
        });
        it('merge one segment at the beginning, touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[4, 5], [8, 9]];
            list.mergeRange([[2, 4]]);
            expect(list._data).to.be.deep.equal([
                [2, 4], [4, 5], [8, 9]
            ]);
        });
        it('merge one segment at the end, not touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[4, 5], [8, 9]];
            list.mergeRange([[10, 11]]);
            expect(list._data).to.be.deep.equal([
                [4, 5], [8, 9], [10, 11]
            ]);
        });
        it('merge one segment at the end, touching', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[4, 5], [8, 9]];
            list.mergeRange([[9, 10]]);
            expect(list._data).to.be.deep.equal([
                [4, 5], [8, 9], [9, 10]
            ]);
        });


        it('merge one segment into empty array', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [];
            list.mergeRange([[2, 3]]);
            expect(list._data).to.be.deep.equal([
                [2, 3]
            ]);
        });
        it('merge more segments into empty array', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [];
            list.mergeRange([[2, 3], [3, 4], [4, 5]]);
            expect(list._data).to.be.deep.equal([
                [2, 3], [3, 4], [4, 5]
            ]);
        });
        it('merge empty range into empty array', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [];
            list.mergeRange([]);
            expect(list._data).to.be.deep.equal([]);
        });
        it('merge empty range into non-empty array', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[1, 2], [2, 4]];
            list.mergeRange([]);
            expect(list._data).to.be.deep.equal([
                [1, 2], [2, 4]
            ]);
        });


        var random = gen.create("orderedSegmentTests");

        for (var i of [1, 2, 3, 4, 6, 10, 50, 100, 1000]) {
            ((numSegments)=> {
                it(`randomized test for ${numSegments} segments`, ()=> {
                    var data = [];
                    var bound = 0;
                    var rnd = ()=>random.intBetween(0, 3);
                    for (var i = 0; i < numSegments; i++) {
                        var leftBound = bound + rnd();
                        var rightBound = leftBound + 1 + rnd();
                        bound = rightBound;
                        data.push([leftBound, rightBound]);
                    }


                    var parts = _.partition(data, (a)=>random.random() > 0.5);
                    // console.log('\n\nexisting segments: ', parts[0].join('|'));
                    // console.log('     new segments: ', parts[1].join('|'));
                    var list = getArray('0', '1', true, true);
                    list._data = parts[0];
                    list.mergeRange(parts[1]);

                    expect(list._data).to.be.deep.equal(data);


                })
            })(i);
        }

        it('merge one owerwriting segment', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[1, 2], [3, 4]];
            list.mergeRange([[3, 4, 'new']]);
            expect(list._data).to.be.deep.equal([
                [1, 2], [3, 4, 'new']
            ]);
        });
        it('merge two segments, one owerwriting', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[1, 2], [3, 4], [4, 5]];
            list.mergeRange([[3, 4, 'new'], [4, 5, 'new']]);
            expect(list._data).to.be.deep.equal([
                [1, 2], [3, 4, 'new'], [4, 5, 'new']
            ]);
        });
        it('merge segments, overwriting all', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[1, 2], [3, 4], [4, 5]];
            list.mergeRange([[1, 2, 'new'], [3, 4, 'new'], [4, 5, 'new']]);
            expect(list._data).to.be.deep.equal([[1, 2, 'new'], [3, 4, 'new'], [4, 5, 'new']]);
        });

        it('merge one segment, overwriting all', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[1, 2]];
            list.mergeRange([[1, 2, 'new']]);
            expect(list._data).to.be.deep.equal([[1, 2, 'new']]);
        });
        it('merge one segment, overwriting at the beginning', ()=> {
            var list = getArray('0', '1', true, true);
            list._data = [[1, 2], [3, 4]];
            list.mergeRange([[1, 2, 'new']]);
            expect(list._data).to.be.deep.equal([[1, 2, 'new'], [3, 4]]);
        });


    });
    describe('getOverlapBoundIndices() test', ()=> {
        it('adding to empty set', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng(''), 5, 6)).to.deep.equal({start: 0, end: 0});
        });
        it('adding after 1', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('0 1 2 3 4 5'), 5, 6)).to.deep.equal({
                start: 2,
                end: 3
            });
        });
        it('adding after 2', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('0 1 2 3 4 4.5'), 5, 6)).to.deep.equal({
                start: 3,
                end: 3
            });
        });
        it('adding after 3', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('2 3 4 4.5'), 100, 101)).to.deep.equal({
                start: 2,
                end: 2
            });
        });
        it('adding before 1', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('3.5 4 5 6 7 8'), 0, 3)).to.deep.equal({
                start: 0,
                end: 0
            });
        });
        it('adding before 2', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('3 4 7 8'), 0, 3)).to.deep.equal({
                start: 0,
                end: 1
            });
        });
        it('adding inside not overlapping', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('0 1 4 5 6 7'), 2, 3)).to.deep.equal({
                start: 1,
                end: 1
            });
        });
        it('adding inside, overlapping', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('0 1 4 5 6 7'), 2, 5)).to.deep.equal({
                start: 1,
                end: 2
            });
        });
        it('adding inside, overlapping all', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('0 1 4 5 6 7'), -1000, 1000)).to.deep.equal({
                start: 0,
                end: 3
            });
        });
        it('adding inside,touching and overlapping', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('0 1 4 5 6 7'), 1, 6)).to.deep.equal({
                start: 0,
                end: 3
            });
        });
        it('adding inside, cross-overlapping', ()=> {
            expect(OrderedSegmentArray.getOverlapBoundIndices(rng('0 1 4 5 6 7'), 0.5, 6.5)).to.deep.equal({
                start: 0,
                end: 3
            });
        });
    });
    describe('splitRangeSetOverlapping() test', ()=> {
        it('split empty set', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng(''), 5, 6)).to.deep.equal({
                start: 0,
                end: 0,
                before: [],
                overlap: [],
                after: []
            });
        });
        it('split after', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 1 2 2 3'), 5, 6)).to.deep.equal({
                start: 3,
                end: 3,
                before: rng('0 1 1 2 2 3'),
                overlap: [],
                after: []
            });
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 1 2 2 3'), 3, 6)).to.deep.equal({
                start: 2,
                end: 3,
                before: rng('0 1 1 2'),
                overlap: rng('2 3'),
                after: []
            });
        });
        it('split before', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('1 2 2 3 3 4'), 0, 0.5)).to.deep.equal({
                start: 0,
                end: 0,
                before: rng(''),
                overlap: rng(''),
                after: rng('1 2 2 3 3 4')
            });
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('1 2 2 3 3 4'), 0, 1)).to.deep.equal({
                start: 0,
                end: 1,
                before: rng(''),
                overlap: rng('1 2'),
                after: rng('2 3 3 4')
            });
        });
        it('adding inside not overlapping', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 4 5 6 7'), 2, 3)).to.deep.equal({
                start: 1,
                end: 1,
                before: rng('0 1'),
                overlap: rng(''),
                after: rng('4 5 6 7')
            });
        });
        it('adding inside, overlapping', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 4 5 6 7'), 2, 5)).to.deep.equal({
                start: 1,
                end: 2,
                before: rng('0 1'),
                overlap: rng('4 5'),
                after: rng('6 7')
            });
        });
        it('adding inside, overlapping all', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 4 5 6 7'), -1000, 1000)).to.deep.equal({
                start: 0,
                end: 3,
                before: [],
                overlap: rng('0 1 4 5 6 7'),
                after: []
            });
        });
        it('adding inside,touching and overlapping', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 4 5 6 7'), 1, 6)).to.deep.equal({
                start: 0,
                end: 3,
                before: [],
                overlap: rng('0 1 4 5 6 7'),
                after: rng('')
            });
        });
        it('adding inside, cross-overlapping', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 4 5 6 7'), 0.5, 6.5)).to.deep.equal({
                start: 0,
                end: 3,
                before: [],
                overlap: rng('0 1 4 5 6 7'),
                after: []
            });
        });
        it('adding first part, cross-overlapping', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 4 5 6 7'), -1, 5)).to.deep.equal({
                start: 0,
                end: 2,
                before: [],
                overlap: rng('0 1 4 5'),
                after: rng('6 7')
            });
        });
        it('adding last part, cross-overlapping', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1 4 5 6 7'), 4, 7)).to.deep.equal({
                start: 1,
                end: 3,
                before: rng('0 1'),
                overlap: rng('4 5 6 7'),
                after: rng('')
            });
        });
        it('test1', ()=> {
            expect(OrderedSegmentArray.splitRangeSetOverlapping(rng('0 1'), 1, 2)).to.deep.equal({
                start: 0,
                end: 1,
                before: rng(''),
                overlap: rng('0 1'),
                after: rng('')
            });
        });
    });
    describe('cutRangeSet() test', ()=> {
        it('cut empty set', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng(''), 5, 6)).to.deep.equal({
                start: 0,
                end: 0,
                before: [],
                overlap: [],
                after: []
            });
        });
        it('cut after 1', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 1 2 2 3'), 5, 6)).to.deep.equal({
                start: 3,
                end: 3,
                before: rng('0 1 1 2 2 3'),
                overlap: [],
                after: []
            });
        });
        it('cut after 2', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 1 2 2 3'), 3, 6)).to.deep.equal({
                start: 3,
                end: 3,
                before: rng('0 1 1 2 2 3'),
                overlap: [],
                after: []
            });
        });
        it('cut before 1', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('1 2 2 3 3 4'), 0, 0.5)).to.deep.equal({
                start: 0,
                end: 0,
                before: rng(''),
                overlap: rng(''),
                after: rng('1 2 2 3 3 4')
            });
        });
        it('cut before 2', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('1 2 2 3 3 4'), 0, 1)).to.deep.equal({
                start: 0,
                end: 0,
                before: rng(''),
                overlap: rng(''),
                after: rng('1 2 2 3 3 4')
            });
        });
        it('adding inside not overlapping', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 4 5 6 7'), 2, 3)).to.deep.equal({
                start: 1,
                end: 1,
                before: rng('0 1'),
                overlap: rng(''),
                after: rng('4 5 6 7')
            });
        });
        it('adding inside, overlapping', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 4 5 6 7'), 2, 5)).to.deep.equal({
                start: 1,
                end: 2,
                before: rng('0 1'),
                overlap: rng('4 5'),
                after: rng('6 7')
            });
        });
        it('adding inside, overlapping all', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 4 5 6 7'), -1000, 1000)).to.deep.equal({
                start: 0,
                end: 3,
                before: [],
                overlap: rng('0 1 4 5 6 7'),
                after: []
            });
        });
        it('adding inside,touching and overlapping', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 4 5 6 7'), 1, 6)).to.deep.equal({
                start: 1,
                end: 2,
                before: rng('0 1'),
                overlap: rng('4 5'),
                after: rng('6 7')
            });
        });
        it('adding inside, cross-overlapping', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 4 5 6 7'), 0.5, 6.5)).to.deep.equal({
                start: 0,
                end: 3,
                before: rng('0 0.5'),
                overlap: rng('0.5 1 4 5 6 6.5'),
                after: rng('6.5 7')
            });
        });
        it('adding first part, cross-overlapping', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 4 5 6 7'), -1, 5)).to.deep.equal({
                start: 0,
                end: 2,
                before: [],
                overlap: rng('0 1 4 5'),
                after: rng('6 7')
            });
        });
        it('adding last part, cross-overlapping', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 4 5 6 7'), 4, 7)).to.deep.equal({
                start: 1,
                end: 3,
                before: rng('0 1'),
                overlap: rng('4 5 6 7'),
                after: rng('')
            });
        });
        it('test1', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1'), 1, 2)).to.deep.equal({
                start: 1,
                end: 1,
                before: rng('0 1'),
                overlap: rng(''),
                after: rng('')
            });
        });
        it('test2', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 3 4 4 5'), 4.5, 5.5)).to.deep.equal({
                start: 2,
                end: 3,
                before: rng('0 1 3 4 4 4.5'),
                overlap: rng('4.5 5'),
                after: rng('')
            });
        });
        it('test3', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 3 4 4 5'), 4.25, 4.75)).to.deep.equal({
                start: 2,
                end: 3,
                before: rng('0 1 3 4 4 4.25'),
                overlap: rng('4.25 4.75'),
                after: rng('4.75 5')
            });
        });
        it('test4', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 1 3 4 4 5'),0.5, 4.5)).to.deep.equal({
                start: 0,
                end: 3,
                before: rng('0 0.5'),
                overlap: rng('0.5 1 3 4 4 4.5'),
                after: rng('4.5 5')
            });
        });
        it('test5', ()=> {
            expect(OrderedSegmentArray.cutRangeSet(rng('0 100'),20, 80)).to.deep.equal({
                start: 0,
                end: 1,
                before: rng('0 20'),
                overlap: rng('20 80'),
                after: rng('80 100')
            });
        });
    });
    describe('joinTouchingRangeArrays', ()=> {
        it('join touching compared ranges', ()=> {
            expect(OrderedSegmentArray.joinTouchingRangeArrays(ll('1h 0 1; 1d 3 4; 1h 4 5'), ll('1h 5 6; 2d 6 7'))).to.deep.equal(ll('1h 0 1; 1d 3 4; 1h 4 6; 2d 6 7'));
        });
        it('do not join touching not compared ranges', ()=> {
            expect(OrderedSegmentArray.joinTouchingRangeArrays(ll('1h 0 1; 1d 3 4; 1m 4 5'), ll('1h 5 6; 2d 6 7'))).to.deep.equal(ll('1h 0 1; 1d 3 4; 1m 4 5; 1h 5 6; 2d 6 7'));
        });
        it('empty first array', ()=> {
            expect(OrderedSegmentArray.joinTouchingRangeArrays(ll(''), ll('1h 5 6; 2d 6 7'))).to.deep.equal(ll('1h 5 6; 2d 6 7'));
        });
        it('empty second array', ()=> {
            expect(OrderedSegmentArray.joinTouchingRangeArrays(ll('1h 5 6; 2d 6 7'), ll(''))).to.deep.equal(ll('1h 5 6; 2d 6 7'));
        });

        it('empty both arrays', ()=> {
            expect(OrderedSegmentArray.joinTouchingRangeArrays(ll(''), ll(''))).to.deep.equal(ll(''));
        });
        it('do not join not touching ranges of same level id', ()=> {
            expect(OrderedSegmentArray.joinTouchingRangeArrays(ll('1h 0 1; 1d 1 2'), ll('1d 10 11; 1h 12 13'))).to.deep.equal(ll('1h 0 1; 1d 1 2; 1d 10 11; 1h 12 13'));
        });
        it('do not join not touching ranges of diffrent level id', ()=> {
            expect(OrderedSegmentArray.joinTouchingRangeArrays(ll('1h 0 1; 1m 1 2'), ll('1d 10 11; 1h 12 13'))).to.deep.equal(ll('1h 0 1; 1m 1 2; 1d 10 11; 1h 12 13'));
        });

    })
});