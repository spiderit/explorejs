/**
 * logic-less model
 */
export default class DataRequest {
    constructor(serieId, level, openTime, closeTime, priority) {
        this.serieId = serieId;
        this.level = level;
        if (openTime > closeTime) {
            var tmp = openTime;

            openTime = closeTime;
            closeTime = tmp;
            console.warn('DataRequest: inverted openTime and closeTime');
        }
        this.openTime = openTime;
        this.closeTime = closeTime;
    }

    toServerFormat() {
        return {
            id: this.serieId,
            level: this.level,
            from: this.openTime,
            to: this.closeTime
        };
    }

    /**
     *
     * @param serverData
     * @returns {DataRequest}
     */
    static fromServerFormat(serverData) {
        return new DataRequest(serverData.id, serverData.level, serverData.from, serverData.to);
    }
}
