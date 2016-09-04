import PredictionModel from "../modules/PredictionModel";
import Range from "explorejs-common/src/Range";
export default class BasicViewportModel extends PredictionModel {

    constructor(contextPaddingRatio=0.5) {
        super();
        this.contextPaddingRatio = contextPaddingRatio;
    }

    update() {
        var currentLevelId = this.viewState.getCurentLevelId();
        var start = this.viewState.getStart();
        var end = this.viewState.getEnd();
        const contextPadding = (end - start) * this.contextPaddingRatio;
        this.SerieCache.getLevelCache(currentLevelId).requestDataForRange(Range.leftClosed(start - contextPadding, end + contextPadding));
    }
}