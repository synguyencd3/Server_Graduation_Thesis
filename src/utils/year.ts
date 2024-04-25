type MonthInfo = {
    value: number;
    total: number;
};

type MonthlyValues = Record<string, MonthInfo>;

class Year {
    months: MonthlyValues;

    constructor() {
        this.months = this.initializeMonths();
    }

    private initializeMonths(): MonthlyValues {
        const months: MonthlyValues = {
            january: {
                value: 1,
                total: 0
            },
            february: {
                value: 2,
                total: 0
            },
            march: {
                value: 3,
                total: 0
            },
            april: {
                value: 4,
                total: 0
            },
            may: {
                value: 5,
                total: 0
            },
            june: {
                value: 6,
                total: 0
            },
            july: {
                value: 7,
                total: 0
            },
            august: {
                value: 8,
                total: 0
            },
            september: {
                value: 9,
                total: 0
            },
            october: {
                value: 10,
                total: 0
            },
            november: {
                value: 11,
                total: 0
            },
            december: {
                value: 12,
                total: 0
            }
        };

        return months;
    }
}

export default Year;
