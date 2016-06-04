var DiffRangeSet = require('../DiffRangeSet');
module.exports = class MergeOperation {
    static execute(B, T, F, R) {

        //TODO: startpoint i endpoint dla add i subtract wyszukany binarnie


        // R - F1
        var R_sub_F1 = DiffRangeSet.subtract(R, F);
        // T2 = (R-F1)+T1
        var T2Diff = DiffRangeSet.add(T, R_sub_F1.result);
        // B2 = B1 - R
        var B2Diff = DiffRangeSet.subtract(B, R);

        return {
            T: T2Diff,
            B: B2Diff,
            R: R_sub_F1
        }
    }

    //TODO: wydzielenie zbioru warstw F, T, B z SerieCache (zrobić to w SerieCacheProjection czy jakos tam)

};